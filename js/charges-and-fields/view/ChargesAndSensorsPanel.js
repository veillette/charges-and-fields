// Copyright 2015, University of Colorado Boulder

/**
 * Scenery Node that contains an enclosure for a positive, a negative electric charge and an electric sensor.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var ChargedParticleRepresentationNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargedParticleRepresentationNode' );
  var ElectricFieldSensorRepresentationNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldSensorRepresentationNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Panel = require( 'SUN/Panel' );
  var Vector2 = require( 'DOT/Vector2' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  // strings
  var minusOneNanoCString = require( 'string!CHARGES_AND_FIELDS/minusOneNanoC' );
  var plusOneNanoCString = require( 'string!CHARGES_AND_FIELDS/plusOneNanoC' );
  var sensorsString = require( 'string!CHARGES_AND_FIELDS/sensors' );

  var HORIZONTAL_SPACING = 60;
  var VERTICAL_SPACING = 25;
  var Y_MARGIN = 10;

  /**
   * Enclosure that contains the charges and sensor
   *
   * @param {ChargesAndFieldsModel} model
   * @param {ChargesAndFieldsScreenView} screenView
   * @param {Function} hookDragHandler - function(modelElement,event) Called when the element is dropped into the play
   *                                     area, hooks up the provided event to the modelElement's corresponding view's
   *                                     drag handler (starts the drag).
   * @param {Property.<boolean>} canAddMoreChargedParticlesProperty - Whether more charged particles can be added.
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Tandem} tandem
   * @constructor
   */
  function ChargesAndSensorsPanel( model,
                                   screenView,
                                   hookDragHandler,
                                   canAddMoreChargedParticlesProperty,
                                   modelViewTransform,
                                   tandem ) {
    var self = this;

    // @private {Array.<Node>}
    this.draggableItems = [];

    /**
     * @param {Tandem} itemTandem
     * @param {stirng} label
     * @param {Function} createModelElement - Adds one of these items to the model, and returns the model object.
     * @param {Node} previewNode
     * @param {Property.<boolean>} isVisibleProperty
     */
    function createDraggableItem( itemTandem, label, createModelElement, previewNode, isVisibleProperty ) {
      var labelText = new Text( label, {
        font: ChargesAndFieldsConstants.ENCLOSURE_LABEL_FONT,
        fill: ChargesAndFieldsColors.enclosureTextProperty,
        centerX: 0,
        maxWidth: 200
      } );

      var node = new Node( {
        children: [
          previewNode,
          labelText
        ],
        cursor: 'pointer'
      } );

      // layout
      labelText.top = 0;
      previewNode.centerY = -VERTICAL_SPACING;

      // Hook up the tandem
      itemTandem.addInstance( node );

      // When pressed, creates a model element and triggers startDrag() on the corresponding view
      node.addInputListener( {
        down: function( event ) {
          // Ignore non-left-mouse-button
          if ( event.pointer.isMouse && event.domEvent.button !== 0 ) {
            return;
          }

          // Representation node location, so that when being "disposed" it will animate back towards the the right place.
          var initialViewPosition = previewNode.getUniqueTrailTo( screenView ).getAncestorMatrix().timesVector2( Vector2.ZERO );

          // Create the new model element.
          var modelElement = createModelElement();
          modelElement.initialPosition = modelViewTransform.viewToModelPosition( initialViewPosition );
          modelElement.isActive = false;

          // Hook up the initial drag to the corresponding view element
          hookDragHandler( modelElement, event );
        }
      } );

      node.mouseArea = node.localBounds;
      node.touchArea = node.localBounds.dilatedXY( HORIZONTAL_SPACING / 2, Y_MARGIN );

      isVisibleProperty.linkAttribute( node, 'visible' );

      self.draggableItems.push( node );

      return node;
    }

    // {Property.<boolean>}
    var positiveVisibleProperty = new DerivedProperty( [ canAddMoreChargedParticlesProperty, model.allowNewPositiveChargesProperty ], function( canAdd, allowNew ) {
      return canAdd && allowNew;
    } );

    // {Property.<boolean>}
    var negativeVisibleProperty = new DerivedProperty( [ canAddMoreChargedParticlesProperty, model.allowNewNegativeChargesProperty ], function( canAdd, allowNew ) {
      return canAdd && allowNew;
    } );

    // {Property.<boolean>}
    var electricFieldSensorVisibleProperty = model.allowNewElectricFieldSensorsProperty;

    this.hboxContent = new HBox( {
      align: 'bottom',
      spacing: HORIZONTAL_SPACING,
      children: [
        createDraggableItem( tandem.createTandem( 'positiveCharge' ),
          plusOneNanoCString,
          function() {
            return model.addPositiveCharge( model.chargedParticleGroupTandem.createNextTandem() );
          },
          new ChargedParticleRepresentationNode( 1 ),
          positiveVisibleProperty ),

        createDraggableItem( tandem.createTandem( 'negativeCharge' ),
          minusOneNanoCString,
          function() {
            return model.addNegativeCharge( model.chargedParticleGroupTandem.createNextTandem() );
          },
          new ChargedParticleRepresentationNode( -1 ),
          negativeVisibleProperty ),

        createDraggableItem( tandem.createTandem( 'electricFieldSensor' ),
          sensorsString,
          function() {
            return model.addElectricFieldSensor( model.electricFieldSensorGroupTandem.createNextTandem() );
          },

          new ElectricFieldSensorRepresentationNode(),
          electricFieldSensorVisibleProperty )
      ]
    } );

    Panel.call( this, this.hboxContent, {
      lineWidth: ChargesAndFieldsConstants.PANEL_LINE_WIDTH,
      cornerRadius: 5,
      stroke: ChargesAndFieldsColors.enclosureBorderProperty,
      fill: ChargesAndFieldsColors.enclosureFillProperty,
      xMargin: HORIZONTAL_SPACING / 2,
      yMargin: Y_MARGIN
    } );

    this.draggableItems.forEach( function( draggableItem ) {
      draggableItem.on( 'visibility', self.updateChildrenWithVisibility.bind( self ) );
    } );
    this.updateChildrenWithVisibility();

    tandem.addInstance( this );
  }

  chargesAndFields.register( 'ChargesAndSensorsPanel', ChargesAndSensorsPanel );

  return inherit( Panel, ChargesAndSensorsPanel, {
    /**
     * Ensures visible items are children, and invisible items are removed.
     * @private
     */
    updateChildrenWithVisibility: function() {
      this.hboxContent.children = this.draggableItems.filter( function( draggableItem ) {
        return draggableItem.visible;
      } );
    }
  } );

} );
