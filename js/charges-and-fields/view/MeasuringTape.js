// Copyright 2002-2014, University of Colorado Boulder

/**
 * A scenery node that is used to represent a draggable Measuring Tape.
 * It contains a tip and a base that can be dragged separately,
 * with a text indicating the measurement.
 * The motion of the measuring tape can be confined by drag bounds.
 *
 * @author Vasily Shakhov (Mlearner)
 * @author Siddhartha Chinthapally (ActualConcepts)
 * @author Aaron Davis (PhET)
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var measuringTapeImage = require( 'image!SCENERY_PHET/measuringTape.png' );

  /**
   * Constructor for the measuring Tape
   * @param {Property.<Object>} unitsProperty - it has two fields, (1) name <string> and (2) multiplier <number>, eg. {name: 'cm', multiplier: 100},
   * @param {Property.<boolean>} isVisibleProperty
   * @param {Object} [options]
   * @constructor
   */
  function MeasuringTape( unitsProperty, isVisibleProperty, options ) {
    var measuringTape = this;

    Node.call( this );
    options = _.extend( {
      basePositionProperty: new Property( new Vector2( 0, 0 ) ), // base Position in model coordinate reference frame (rightBottom position of the measuring tape image)
      tipPositionProperty: new Property( new Vector2( 1, 0 ) ), // tip Position in model coordinate reference frame (center position of the tip)
      dragBounds: Bounds2.EVERYTHING,// bounds for the measuring tape (in model coordinate reference frame), default value is everything, effectively no bounds
      textPosition: new Vector2( 0, 30 ), // position of the text relative to center of the base image in view units
      modelViewTransform: ModelViewTransform2.createIdentity(),
      scaleProperty: new Property( 1 ), // scale the apparent length of the unrolled Tape, without changing the measurement, analogous to a zoom factor
      significantFigures: 1, // number of significant figures in the length measurement
      textColor: 'white', // color of the length measurement and unit
      textFont: new PhetFont( { size: 16, weight: 'bold' } ), // font for the measurement text
      baseScale: 0.8, // control the size of the measuringTape Image (the base)
      lineColor: 'gray', // color of the tapeline itself
      tapeLineWidth: 2, // linewidth of the tape line
      tipCircleColor: 'rgba(0,0,0,0.1)', // color of the circle at the tip
      tipCircleRadius: 10, // radius of the circle on the tip
      crosshairColor: 'rgb(224, 95, 32)', // orange, color of the two crosshairs
      crosshairSize: 5, // size of the crosshairs in scenery coordinates ( measured from center)
      crosshairLineWidth: 2, // linewidth of the crosshairs
      isBaseCrosshairRotating: true, // do crosshairs rotate around their own axis to line up with the tapeline
      isTipCrosshairRotating: true // do crosshairs rotate around their own axis to line up with the tapeline
    }, options );


    assert && assert( Math.abs( options.modelViewTransform.modelToViewDeltaX( 1 ) ) === Math.abs( options.modelViewTransform.modelToViewDeltaY( 1 ) ), 'The y and x scale factor are not identical' );

    this.significantFigures = options.significantFigures; // @private
    this.unitsProperty = unitsProperty; // @private
    this.isVisibleProperty = isVisibleProperty; // @private
    this.scaleProperty = options.scaleProperty; // @private
    this._dragBounds = options.dragBounds; // @private
    this._modelViewTransform = options.modelViewTransform; // @private
    this.basePositionProperty = options.basePositionProperty;
    this.tipPositionProperty = options.tipPositionProperty;

    this._isTipUserControlledProperty = new Property( false );// @private
    this._isBaseUserControlledProperty = new Property( false ); // @private

    //this.tipPositionProperty = new Property( options.basePositionProperty.value.plus( Vector2.createPolar( options.unrolledTapeDistance, options.angle ) ) );


    this.tipToBaseDistance = (this.basePositionProperty.value).distance( this.tipPositionProperty.value ); // @private

    var crosshairShape = new Shape().
      moveTo( -options.crosshairSize, 0 ).
      moveTo( -options.crosshairSize, 0 ).
      lineTo( options.crosshairSize, 0 ).
      moveTo( 0, -options.crosshairSize ).
      lineTo( 0, options.crosshairSize );

    var baseCrosshair = new Path( crosshairShape, {
      stroke: options.crosshairColor,
      lineWidth: options.crosshairLineWidth
    } );

    var tipCrosshair = new Path( crosshairShape, {
      stroke: options.crosshairColor,
      lineWidth: options.crosshairLineWidth
    } );

    var tipCircle = new Circle( options.tipCircleRadius, { fill: options.tipCircleColor } );

    var baseImage = new Image( measuringTapeImage, {
      scale: options.baseScale,
      cursor: 'pointer'
    } );

    // create tapeline (running from one crosshair to the other)
    var tapeLine = new Line( this.basePositionProperty.value, this.tipPositionProperty.value, {
      stroke: options.lineColor,
      lineWidth: options.tapeLineWidth
    } );

    // add tipCrosshair and tipCircle to the tip
    var tip = new Node( { children: [ tipCircle, tipCrosshair ], cursor: 'pointer' } );

    // create text
    // @public
    this.labelText = new Text( measuringTape.getText(), {
      font: options.textFont,
      fill: options.textColor
    } );

    // expand the area for touch
    tip.touchArea = tip.localBounds.dilated( 15 );
    baseImage.touchArea = baseImage.localBounds.dilated( 20 );
    baseImage.mouseArea = baseImage.localBounds.dilated( 10 );

    this.addChild( tapeLine ); // tapeline going from one crosshair to the other
    this.addChild( baseCrosshair ); // crosshair near the base, (set at basePosition)
    this.addChild( baseImage ); // base of the measuring tape
    this.addChild( this.labelText ); // text
    this.addChild( tip ); // crosshair and circle at the tip (set at tipPosition)

    baseImage.addInputListener( new SimpleDragHandler( {
        startOffset: 0,
        allowTouchSnag: true,
        start: function( event, trail ) {
          measuringTape._isBaseUserControlledProperty.set( true );
          var location = measuringTape._modelViewTransform.modelToViewPosition( options.basePositionProperty.value );
          this.startOffset = event.currentTarget.globalToParentPoint( event.pointer.point ).minus( location );
        },

        drag: function( event ) {
          var parentPoint = event.currentTarget.globalToParentPoint( event.pointer.point ).minus( this.startOffset );
          var unconstrainedBaseLocation = measuringTape._modelViewTransform.viewToModelPosition( parentPoint );
          var constrainedBaseLocation = constrainToBoundsLocation( unconstrainedBaseLocation, measuringTape._dragBounds );

          // the basePosition value has not been updated yet, hence it is the old value of the basePosition;
          var translationDelta = constrainedBaseLocation.minus( options.basePositionProperty.value ); // in model reference frame

          // translation of the basePosition (subject to the constraining drag bounds)
          options.basePositionProperty.set( constrainedBaseLocation );

          // translate the position of the tip if it is not being dragged
          // when the user is not holding onto the tip, dragging the body will also drag the tip
          if ( !measuringTape._isTipUserControlled ) {
            var unconstrainedTipLocation = translationDelta.add( measuringTape.tipPositionProperty.value );
            var constrainedTipLocation = constrainToBoundsLocation( unconstrainedTipLocation, measuringTape._dragBounds );
            measuringTape.tipPositionProperty.set( constrainedTipLocation );
          }
        },
        end: function( event, trail ) {
          measuringTape._isBaseUserControlledProperty.set( false );
        }
      } )
    );


    // init drag and drop for tip
    tip.addInputListener( new SimpleDragHandler( {
      startOffset: 0,
      allowTouchSnag: true,
      start: function( event, trail ) {
        measuringTape._isTipUserControlledProperty.set( true );
        var location = measuringTape._modelViewTransform.modelToViewPosition( measuringTape.tipPositionProperty.value );
        this.startOffset = event.currentTarget.globalToParentPoint( event.pointer.point ).minus( location );
      },

      drag: function( event ) {
        var parentPoint = event.currentTarget.globalToParentPoint( event.pointer.point ).minus( this.startOffset );
        var unconstrainedTipLocation = measuringTape._modelViewTransform.viewToModelPosition( parentPoint );
        var constrainedTipLocation = constrainToBoundsLocation( unconstrainedTipLocation, measuringTape._dragBounds );
        // translation of the tipPosition (subject to the constraining drag bounds)
        measuringTape.tipPositionProperty.set( constrainedTipLocation );
      },

      end: function( event, trail ) {
        measuringTape._isTipUserControlledProperty.set( false );
      }
    } ) );

    // link the positions of base and tip to the scenery nodes such as crosshair, tip, labelText, tapeLine, baseImage
    Property.multilink( [ this.basePositionProperty, this.tipPositionProperty ], function( basePosition, tipPosition ) {

      var viewTipPosition = measuringTape._modelViewTransform.modelToViewPosition( tipPosition );
      var viewBasePosition = measuringTape._modelViewTransform.modelToViewPosition( basePosition );

      // calculate the orientation and change of orientation of the Measuring tape
      var oldAngle = baseImage.getRotation();
      var angle = Math.atan2( viewTipPosition.y - viewBasePosition.y, viewTipPosition.x - viewBasePosition.x );
      var deltaAngle = angle - oldAngle;

      // set position of the tip and the base crosshair
      baseCrosshair.center = viewBasePosition;
      tip.center = viewTipPosition;

      // in order to avoid all kind of geometrical issues with position, let's reset the baseImage upright and then set its position and rotation
      baseImage.setRotation( 0 );
      baseImage.rightBottom = viewBasePosition;
      baseImage.rotateAround( baseImage.rightBottom, angle );

      // reset the text
      measuringTape.tipToBaseDistance = tipPosition.distance( basePosition );
      measuringTape.labelText.setText( measuringTape.getText() );
      measuringTape.labelText.centerTop = baseImage.center.plus( options.textPosition.times( options.baseScale ) );

      // reposition the tapeline
      tapeLine.setLine( viewBasePosition.x, viewBasePosition.y, viewTipPosition.x, viewTipPosition.y );

      // rotate the crosshairs
      if ( options.isTipCrosshairRotating ) {
        tip.rotateAround( viewTipPosition, deltaAngle );
      }
      if ( options.isBaseCrosshairRotating ) {
        baseCrosshair.rotateAround( viewBasePosition, deltaAngle );
      }

    } );

    // @private
    this.isVisiblePropertyObserver = function( isVisible ) {
      measuringTape.visible = isVisible;
    };
    this.isVisibleProperty.link( this.isVisiblePropertyObserver ); // must be unlinked in dispose

    // @private set Text on on labelText
    this.unitsPropertyObserver = function() {
      measuringTape.labelText.setText( measuringTape.getText() );
    };
    // link change of units to the text
    this.unitsProperty.link( this.unitsPropertyObserver ); // must be unlinked in dispose

    // @private length of the unfurled tape scales with the scaleProperty (but text stays the same).
    this.scalePropertyObserver = function( scale, oldScale ) {
      // make sure that the oldScale exists, if this is not the case then set to 1.
      if ( oldScale === null ) {
        oldScale = 1;
      }
      // update the position of the tip
      var displacementVector = measuringTape.tipPositionProperty.value.minus( measuringTape.basePositionProperty.value );
      var scaledDisplacementVector = displacementVector.timesScalar( scale / oldScale );
      measuringTape.tipPositionProperty.set( measuringTape.basePositionProperty.value.plus( scaledDisplacementVector ) );
    };
    // scaleProperty is analogous to a zoom in/zoom out function
    this.scaleProperty.link( this.scalePropertyObserver ); // must be unlinked in dispose

    this.mutate( options );
  }

  /**
   * Constrains a point to some bounds. Returns a vector within the bounds
   *
   * @param {Vector2} point
   * @param {Bounds2} bounds
   * @returns {Vector2}
   */
  function constrainToBoundsLocation( point, bounds ) {
    if ( _.isUndefined( bounds ) || bounds.containsPoint( point ) ) {
      return point;
    }
    else {
      var xConstrained = Math.max( Math.min( point.x, bounds.maxX ), bounds.minX );
      var yConstrained = Math.max( Math.min( point.y, bounds.maxY ), bounds.minY );
      return new Vector2( xConstrained, yConstrained );
    }
  }

  return inherit( Node, MeasuringTape, {
    /**
     * Resets the MeasuringTape to its initial configuration
     * @public
     */
    reset: function() {
      this.basePositionProperty.reset();
      this.tipPositionProperty.reset();
    },

    /**
     * Ensures that this node is subject to garbage collection
     * @public
     */
    dispose: function() {
      this.isVisibleProperty.unlink( this.isVisiblePropertyObserver );
      this.unitsProperty.unlink( this.unitsPropertyObserver );
      this.scaleProperty.unlink( this.scalePropertyObserver );
    },

    /**
     * Returns a readout of the current measurement
     * @public
     * @returns {string}
     */
    getText: function() {
      return Util.toFixed( this.unitsProperty.value.multiplier * this.tipToBaseDistance / this.scaleProperty.value,
          this.significantFigures ) + ' ' + this.unitsProperty.value.name;
    },

    /**
     * Sets the color of the text label
     * @public
     * @param {string||Color} color
     */
    setTextColor: function( color ) {
      this.labelText.fill = color;
    },

    /**
     * Sets the visibility of the text label
     * @public
     * @param {boolean} visible
     */
    setTextVisibility: function( visible ) {
      this.labelText.visible = visible;
    },

    /**
     * Returns a property indicating if the tip of the measuring tape is being dragged or not
     * @public
     * @returns {Property.<boolean>}
     */
    getIsTipUserControlledProperty: function() {
      return this._isTipUserControlledProperty;
    },

    /**
     * Returns a property indicating if the baseImage of the measuring tape is being dragged or not
     * @public
     * @returns {Property.<boolean>}
     */
    getIsBaseUserControlledProperty: function() {
      return this._isBaseUserControlledProperty;
    },

    /**
     * Sets the property indicating if the tip of the measuring tape is being dragged or not.
     * (Useful to set externally if using a creator node to generate the measuringTape)
     * @public
     * @param {boolean} value
     */
    setIsBaseUserControlledProperty: function( value ) {
      this._isBaseUserControlledProperty.set( value );
    },

    /**
     * Sets the property indicating if the tip of the measuring tape is being dragged or not
     * @public
     * @param {boolean} value
     */
    setIsTipUserControlledProperty: function( value ) {
      this._isBaseUserControlledProperty.set( value );
    },

    /**
     * Sets the dragBounds of the of the measuringTape.
     * In addition, it forces the tip and base of the measuring tape to be within the new bounds.
     * @public
     * @param {Bounds2} dragBounds
     */
    setDragBounds: function( dragBounds ) {
      this._dragBounds = dragBounds.copy();
      this.tipPositionProperty.set( constrainToBoundsLocation( this.tipPositionProperty.value, this._dragBounds ) );
      this.basePositionProperty.set( constrainToBoundsLocation( this.basePositionProperty.value, this._dragBounds ) );
    },

    /**
     * Returns the dragBounds of the sim.
     * @public
     * @returns {Bounds2}
     */
    getDragBounds: function() {
      return this._dragBounds;
    },

    /**
     * Sets the modelViewTransform.
     * @public
     * @param {ModelViewTransform2} modelViewTransform
     */
    setModelViewTransform: function( modelViewTransform ) {
      this._modelViewTransform = modelViewTransform;
    },

    /**
     * Gets the modelViewTransform.
     * @public
     * @returns {ModelViewTransform2}
     */
    getModelViewTransform: function() {
      return this._modelViewTransform;
    },

    // ES5 getter and setter for the textColor
    set textColor( value ) { this.setTextColor( value ); },
    get textColor() { return this.labelText.fill; },

    // ES5 getter and setter for the modelViewTransform
    set modelViewTransform( modelViewTransform ) { this._modelViewTransform = modelViewTransform; },
    get modelViewTransform() { return this._modelViewTransform; },

    // ES5 getter and setter for the dragBounds
    set dragBounds( value ) { this.setDragBounds( value ); },
    get dragBounds() { return this.getDragBounds(); },

    // ES5 getters and setters
    get isBaseUserControlledProperty() { return this.getIsBaseUserControlledProperty(); },
    get isTipUserControlledProperty() { return this.getIsTipUserControlledProperty(); },

    set isBaseUserControlledProperty( value ) { return this.setIsBaseUserControlledProperty( value ); },
    set isTipUserControlledProperty( value ) { return this.setIsTipUserControlledProperty( value ); }
  } );
} )
;

