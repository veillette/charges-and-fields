// Copyright 2014-2015, University of Colorado Boulder

/**
 * Tracks movement of particles, so that efficient deltas can be computed for Canvas/WebGL display of the electric
 * potential.
 *
 * We add queue entries for particles that have changed, and queue items are in one of three states:
 * - New and old positions: The charge moved from the old position to the new position.
 * - New position: The charge was added, and is now at the new position.
 * - Old position: The charge has been removed, and was last at the old position.
 *
 * ChargeTracker will ensure there is only one queue element per particle that has changed (collapses together multiple
 * moves before things are updated, etc.)
 *
 * Generally create it, and to handle updates:
 * 1. Iterate through the queue, applying changes
 * 2. Call clear()
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  /**
   * @constructor
   *
   * @param {ObservableArray.<ChargedParticle>} chargedParticles - only chargedParticles that active are in this array
   */
  function ChargeTracker( chargedParticles ) {
    this.chargedParticles = chargedParticles;

    // @private functions to be called back when particle positions change, tagged with listener.particle = particle
    this.positionListeners = [];

    // @private
    this.particleAddedListener = this.onParticleAdded.bind( this );
    this.particleRemovedListener = this.onParticleRemoved.bind( this );

    // Listen to the charged particles individually
    this.chargedParticles.addItemAddedListener( this.particleAddedListener );
    this.chargedParticles.addItemRemovedListener( this.particleRemovedListener );

    // @public
    // Queued changes of type { charge: {number}, oldPosition: {Vector2}, newPosition: {Vector2} } that will
    // accumulate. oldPosition === null means "add it", newPosition === null means "remove it". We'll apply these
    // graphical deltas at the next rendering.
    this.queue = [];

    // Queue up changes that will initialize things properly.
    this.rebuild();
  }

  chargesAndFields.register( 'ChargeTracker', ChargeTracker );

  inherit( Object, ChargeTracker, {

    /**
     * Clears the queue, essentially saying "the external state is now up-to-date with the changes"
     * @public
     */
    clear: function() {
      while ( this.queue.length ) {
        this.queue.pop();
      }
    },

    /**
     * Clears the queue and adds all current particle positions, as if our external state has been reset to neutral.
     * @public
     */
    rebuild: function() {
      this.clear();

      for ( var i = 0; i < this.chargedParticles.length; i++ ) {
        this.addParticle( this.chargedParticles.get( i ) );
      }
    },

    /**
     * Called when this ChargeTracker won't be used anymore. Removes all listeners.
     * @public
     */
    dispose: function() {
      // Remove add/remove listeners
      this.chargedParticles.removeItemAddedListener( this.particleAddedListener );
      this.chargedParticles.removeItemRemovedListener( this.particleRemovedListener );

      // Remove position listeners
      while ( this.positionListeners.length ) {
        var positionListener = this.positionListeners.pop();
        positionListener.particle.positionProperty.unlink( positionListener );
      }
    },

    /**
     * Handle adding a particle with the queue.
     * @private
     *
     * @param {ChargedParticle} particle
     */
    addParticle: function( particle ) {
      this.queue.push( {
        charge: particle.charge,
        oldPosition: null,
        newPosition: particle.position.copy()
      } );
    },

    /**
     * Called when the particle is added to the model's list of charged particles. Hooks up listeners and the queue.
     * @private
     *
     * @param {ChargedParticle}
     */
    onParticleAdded: function( particle ) {
      this.addParticle( particle );

      // add the position listener (need a reference to the particle with the listener, so we can't use the same one)
      var positionListener = this.onParticleMoved.bind( this, particle );
      positionListener.particle = particle;
      this.positionListeners.push( positionListener );
      particle.positionProperty.lazyLink( positionListener );
    },

    /**
     * Called when our listener to the particle's position is fired. We see if we can reposition it, or create a new
     * entry.
     * @private
     *
     * @param {ChargedParticle} particle
     * @param {Vector2} newPosition
     * @param {Vector2} oldPosition
     */
    onParticleMoved: function( particle, newPosition, oldPosition ) {
      // Check to see if we can update an add/move for the same particle to a new position instead of creating
      // multiple queue entries for a single particle. This will help collapse multiple moves of the same particle in
      // one frame.
      var modified = false;
      for ( var i = 0; i < this.queue.length; i++ ) {
        var item = this.queue[ i ];
        if ( item.newPosition && item.newPosition.equals( oldPosition ) && item.charge === particle.charge ) {
          item.newPosition = newPosition;
          // console.log( 'update ' + particle.charge + ' ' + newPosition.toString() );
          modified = true;
          break;
        }
      }

      if ( !modified ) {
        this.queue.push( {
          charge: particle.charge,
          oldPosition: oldPosition.copy(),
          newPosition: newPosition.copy()
        } );
        // console.log( 'move ' + particle.charge + ' ' + oldPosition.toString() + ' to ' + newPosition.toString() );
      }
    },

    /**
     * Called when the particle is removed from the model's list of charged particles. Removes listeners, etc.
     * @private
     *
     * @param {ChargedParticle}
     */
    onParticleRemoved: function( particle ) {
      // See if we can update an already-in-queue item with a null location.
      var modified = false;
      for ( var i = 0; i < this.queue.length; i++ ) {
        var item = this.queue[ i ];
        if ( item.newPosition && item.newPosition.equals( particle.position ) && item.charge === particle.charge ) {
          item.newPosition = null;
          // console.log( 'update ' + particle.charge + ' null' );
          // remove the item from the list if we would add-remove it
          if ( item.oldPosition === null && item.newPosition === null ) {
            this.queue.splice( i, 1 );
            // console.log( 'remove ' + particle.charge + ' ' + particle.position.toString() );
          }
          modified = true;
          break;
        }
      }

      if ( !modified ) {
        this.queue.push( {
          charge: particle.charge,
          oldPosition: particle.position.copy(),
          newPosition: null
        } );
        // console.log( 'remove ' + particle.charge + ' ' + particle.position.toString() );
      }

      // remove the position listener
      for ( var k = 0; k < this.positionListeners.length; k++ ) {
        if ( this.positionListeners[ k ].particle === particle ) {
          particle.positionProperty.unlink( this.positionListeners[ k ] );
          this.positionListeners.splice( k, 1 );
          break;
        }
      }
    }
  } );

  return ChargeTracker;
} );