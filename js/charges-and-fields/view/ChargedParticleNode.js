// Copyright 2014-2015, University of Colorado Boulder

/**
 * View for the charged particle, which can be dragged to translate.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var ChargedParticleRepresentationNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargedParticleRepresentationNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  // constants
  var CIRCLE_RADIUS = ChargesAndFieldsConstants.CHARGE_RADIUS; // radius of a charged particle

  /**
   * Constructor for the ChargedParticleNode which renders the charge as a scenery node.
   * @param {ChargedParticle} chargedParticle - the model of the charged particle
   * @param {ModelViewTransform2} modelViewTransform - the coordinate transform between model coordinates and view coordinates
   * @param {Property.<Bounds2>} availableModelBoundsProperty - dragBounds for the charged particle
   * @param {Bounds2} enclosureBounds - bounds in the model coordinate frame of the charge and sensor enclosure
   * @param {Tandem} tandem
   * @constructor
   */
  function ChargedParticleNode( chargedParticle, modelViewTransform, availableModelBoundsProperty, enclosureBounds, tandem ) {

    var self = this;

    this.modelElement = chargedParticle;

    ChargedParticleRepresentationNode.call( this, chargedParticle.charge );

    // Set up the mouse areas for this node so that this can still be grabbed when invisible.
    this.touchArea = this.localBounds.dilated( 10 );

    // Register for synchronization with model.
    var positionListener = function( position ) {
      self.translation = modelViewTransform.modelToViewPosition( position );
    };
    chargedParticle.positionProperty.link( positionListener );

    this.movableDragHandler = new MovableDragHandler(
      chargedParticle.positionProperty, {
        tandem: tandem.createTandem( 'movableDragHandler' ),
        dragBounds: availableModelBoundsProperty.value,
        modelViewTransform: modelViewTransform,
        startDrag: function( event ) {
          if ( !chargedParticle.isAnimated ) // you can't drag an animated particle
          {
            chargedParticle.isUserControlledProperty.set( true );

            // Move the chargedParticle to the front of this layer when grabbed by the user.
            self.moveToFront();
            var globalPoint = self.globalToParentPoint( event.pointer.point );

            if ( event.pointer.isTouch ) {
              globalPoint.addXY( 0, -2 * CIRCLE_RADIUS );
            }

            // move this node upward so that the cursor touches the bottom of the chargedParticle
            chargedParticle.position = modelViewTransform.viewToModelPosition( globalPoint );
          }
        },

        endDrag: function( event ) {
          chargedParticle.isUserControlled = false;

          if ( !enclosureBounds.containsPoint( chargedParticle.position ) ) {
            chargedParticle.isActive = true;
          }
        }
      } );

    // readjust the dragBounds of the movable drag handler when the screen is resized
    var availableModelBoundsPropertyListener = function( bounds ) {
      self.movableDragHandler.setDragBounds( bounds );
    };

    availableModelBoundsProperty.link( availableModelBoundsPropertyListener );

    // Conditionally hook up the input handling (and cursor) when the charged particle is interactive.
    var isDragListenerAttached = false;

    var isInteractiveListener = function() {

      var isInteractive = chargedParticle.isInteractive;

      if ( isDragListenerAttached !== isInteractive ) {
        if ( isInteractive ) {
          self.cursor = 'pointer';
          self.addInputListener( self.movableDragHandler );
        } else {
          self.cursor = null;
          self.removeInputListener( self.movableDragHandler );
        }

        isDragListenerAttached = isInteractive;
      }
    };
    chargedParticle.isInteractiveProperty.link( isInteractiveListener );

    this.disposeChargedParticleNode = function() {
      availableModelBoundsProperty.unlink( availableModelBoundsPropertyListener );
      chargedParticle.positionProperty.unlink( positionListener );
      chargedParticle.isInteractiveProperty.unlink( isInteractiveListener );
      tandem.removeInstance( self );
    };

    tandem.addInstance( this );
  }

  chargesAndFields.register( 'ChargedParticleNode', ChargedParticleNode );

  return inherit( ChargedParticleRepresentationNode, ChargedParticleNode, {
    dispose: function() {
      this.disposeChargedParticleNode();
    }

  } );
} );