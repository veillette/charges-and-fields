//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Main screen View of the Charges and Fields simulation
 *
 * @author MYV
 */
define( function( require ) {
  'use strict';

  // modules

  var BucketFront = require( 'SCENERY_PHET/bucket/BucketFront' );
  var BucketHole = require( 'SCENERY_PHET/bucket/BucketHole' );
  var ChargedParticleNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargedParticleNode' );
  var ChargedParticleCreatorNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargedParticleCreatorNode' );
  var ControlPanel = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ControlPanel' );
  var ElectricFieldSensorNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldSensorNode' );
  var ElectricPotentialSensorNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialSensorNode' );
  var ElectricPotentialFieldNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialFieldNode' );
  //var ElectricPotentialFieldWebGLNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialFieldWebGLNode' );
  var ElectricFieldGridNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldGridNode' );
  var EquipotentialLineNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/EquipotentialLineNode' );
  var ElectricFieldLineNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldLineNode' );
  var Grid = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/Grid' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MeasuringTape = require( 'SCENERY_PHET/MeasuringTape' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Node = require( 'SCENERY/nodes/Node' );
//  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  // var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
//  var Shape = require( 'KITE/Shape' );
//  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
//  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'SCENERY/util/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var IDENTITY_TRANSFORM = ModelViewTransform2.createIdentity();
  var DATA_POINT_CREATOR_OFFSET_POSITIONS = [
    // Offsets used for initial position of point, relative to bucket hole center. Empirically determined.
    new Vector2( -28, -9 ),
    new Vector2( -15, -10 ),
    new Vector2( -1, -8 ),
    new Vector2( 8, -9 ),
    new Vector2( 17, -10 )];

  //constants

//  var LABEL_COLOR = 'brown';
//  var LABEL_FONT = new PhetFont( { size: 18, weight: 'bold' } );

  //strings

//  var pattern_0value_1units = require( 'string!CHARGES_AND_FIELDS/pattern.0value.1units' );
//  var voltageUnitString = require( 'string!CHARGES_AND_FIELDS/voltageUnit' );

  /**
   *
   * @param {model} model of the simulation
   * @constructor
   */
  function ChargesAndFieldsScreenView( model ) {


    ScreenView.call( this, { renderer: 'svg' } );
    var thisView = this;

    //model View transform : The origin of the model is sets in the middle of the screen
    //The height of the screen corresponds to 4 meters in the model.
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      new Vector2( thisView.layoutBounds.width / 2, thisView.layoutBounds.height / 2 ),
        thisView.layoutBounds.height / 4 );
    thisView.modelViewTransform = modelViewTransform; // Make the modelViewTransform available to descendant types.


    // Check to see if WebGL was prevented by a query parameter
    var allowWebGL = window.phetcommon.getQueryParameter( 'webgl' ) !== 'false';
    var webGLSupported = Util.isWebGLSupported && allowWebGL;
    var renderer = webGLSupported ? 'webgl' : 'svg';
    // create and add the electric Potential field Node responsible for the electric potential field
    var electricPotentialFieldNode = (renderer === 'webgl') ? new ElectricPotentialFieldNode( model, modelViewTransform, model.showResolutionProperty ) :
                                     new ElectricPotentialFieldNode( model, modelViewTransform, model.showResolutionProperty );

    // var electricPotentialFieldNode = new ElectricPotentialFieldNode( model, modelViewTransform, model.showResolutionProperty );
    this.addChild( electricPotentialFieldNode );

    // Create and add the visual grid on the view
    var grid = new Grid( thisView.layoutBounds, model.gridIsVisibleProperty );
    this.addChild( grid );

    // create and add the grid with electric field arrow sensors
    var electricFieldGridNode = new ElectricFieldGridNode( model, modelViewTransform, model.eFieldIsVisibleProperty );
    this.addChild( electricFieldGridNode );


    // Create
    var equipotentialLineNode = new EquipotentialLineNode( model, modelViewTransform );
    this.addChild( equipotentialLineNode );

    // Create
    var electricFieldLineNode = new ElectricFieldLineNode( model, modelViewTransform );
    this.addChild( electricFieldLineNode );

    // create and add the Measuring Tape
    var tape_options = {
      textColor: 'white'
    };
    var measuringTape = new MeasuringTape( thisView.layoutBounds, model.tapeMeasureScaleProperty, model.tapeMeasureUnitsProperty, model.tapeMeasureIsVisibleProperty,
      tape_options );
    //measuringTape.text.fill = 'black';
    this.addChild( measuringTape );

    //model.tapeMeasureIsVisibleProperty.link( function( isVisible ) {
    //  measuringTape.visible = isVisible;
    //} );


    // Create and add the Reset All Button in the bottom right, which resets the model
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        thisView.reset();
        model.reset();
        measuringTape.reset();
        equipotentialLineNode.removeAllChildren();
        electricFieldLineNode.removeAllChildren();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    } );
    this.addChild( resetAllButton );

    // Create the nodes that will be used to layer things visually.
    var backLayer = new Node();
    this.addChild( backLayer );
//    Create the layer where the points will be placed. They are maintained in a separate layer so that they are over
//     all of the point placement graphs in the z-order.
    var chargedParticlesLayer = new Node( {layerSplit: true} ); // Force the moving dataPoint into a separate layer for performance reasons.

    var bucketFrontLayer = new Node();
    this.addChild( bucketFrontLayer );

    // Add the bucket view elements
    var positiveChargeBucketFront = new BucketFront( model.positiveChargeBucket, IDENTITY_TRANSFORM );
    var negativeChargeBucketFront = new BucketFront( model.negativeChargeBucket, IDENTITY_TRANSFORM );
    bucketFrontLayer.addChild( positiveChargeBucketFront );
    bucketFrontLayer.addChild( negativeChargeBucketFront );
    var positiveChargeBucketHole = new BucketHole( model.positiveChargeBucket, IDENTITY_TRANSFORM );
    var negativeChargeBucketHole = new BucketHole( model.negativeChargeBucket, IDENTITY_TRANSFORM );
    backLayer.addChild( positiveChargeBucketHole );
    backLayer.addChild( negativeChargeBucketHole );

    // Add the dataPoint creator nodes. These must be added after the bucket hole for proper layering.
    DATA_POINT_CREATOR_OFFSET_POSITIONS.forEach( function( offset ) {
      backLayer.addChild( new ChargedParticleCreatorNode(
        model.addUserCreatedChargedParticle.bind( model ), 1,
        modelViewTransform, {
          left: positiveChargeBucketHole.centerX + offset.x,
          top:  positiveChargeBucketHole.centerY + offset.y
        } ) );
      backLayer.addChild( new ChargedParticleCreatorNode(
        model.addUserCreatedChargedParticle.bind( model ), -1,
        modelViewTransform, {
          left: negativeChargeBucketHole.centerX + offset.x,
          top:  negativeChargeBucketHole.centerY + offset.y
        } ) );
    } );


    // Handle the comings and goings of  dataPoints.
    model.chargedParticles.addItemAddedListener( function( addedChargedParticle ) {

      // Create and add the view representation for this chargedParticle.
      var chargedParticleNode = new ChargedParticleNode( model, addedChargedParticle, modelViewTransform );
      chargedParticlesLayer.addChild( chargedParticleNode );

      addedChargedParticle.positionProperty.link( function() {

      } );
      // Move the chargedParticle to the front of this layer when grabbed by the user.
      addedChargedParticle.userControlledProperty.link( function( userControlled ) {
        if ( userControlled ) {
          chargedParticleNode.moveToFront();
        }
      } );

      // Add the removal listener for if and when this chargedParticle is removed from the model.
      model.chargedParticles.addItemRemovedListener( function removalListener( removedChargedParticle ) {
        if ( removedChargedParticle === addedChargedParticle ) {
          chargedParticlesLayer.removeChild( chargedParticleNode );
          model.chargedParticles.removeItemRemovedListener( removalListener );
        }
      } );
    } );

    // Create and add the control panel
    var controlPanel = new ControlPanel( model );
    this.addChild( controlPanel );

    // Create and add the electric potential sensor node (with panel)
    this.electricPotentialSensorNode = new ElectricPotentialSensorNode( model, model.electricPotentialSensor, modelViewTransform );
    this.addChild( this.electricPotentialSensorNode );


    // create and add the charged particles to the view
    //var parentChargesNode = new Node();
    //model.chargedParticles.forEach( function( charge ) {
    //  parentChargesNode.addChild( new ChargedParticleNode( model, charge, modelViewTransform ) );
    //} );
    //this.addChild( parentChargesNode );

    // create and add the electric Field sensors
    var parentElectricFieldSensorsNode = new Node();
    model.electricFieldSensors.forEach( function( electricFieldSensor ) {
      parentElectricFieldSensorsNode.addChild( new ElectricFieldSensorNode( model, electricFieldSensor, modelViewTransform, model.eFieldIsVisibleProperty ) );
    } );
    this.addChild( parentElectricFieldSensorsNode );
    this.addChild( chargedParticlesLayer );

    // Create and add the control panel
    controlPanel.right = thisView.layoutBounds.maxX - 20;
    controlPanel.bottom = resetAllButton.top - 20;

    grid.centerX = thisView.layoutBounds.centerX;
    grid.centerY = thisView.layoutBounds.centerY;
  }

  return inherit( ScreenView, ChargesAndFieldsScreenView, {
    reset: function() {
    }
  } );
} );