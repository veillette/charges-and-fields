//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsScreen = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsColors' );
  var ChargesAndFieldsGlobals = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsGlobals' );
  var GlobalOptionsNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/GlobalOptionsNode' );
  var CanvasWarningNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/CanvasWarningNode' );

  // strings
  var simTitle = require( 'string!CHARGES_AND_FIELDS/charges-and-fields.name' );

  var isBasicsVersion = false;

  var simOptions = {
    credits: {

      // all credits fields are optional
      leadDesign: 'Michael Dubson',
      softwareDevelopment: 'Michael Dubson',
      designTeam: 'Curly, Larry, Moe',
      interviews: 'Wile E. Coyote',
      thanks: 'Thanks to the ACME Dynamite Company for funding this sim!'
    },
    optionsNode: new GlobalOptionsNode( isBasicsVersion ),
    homeScreenWarningNode: ChargesAndFieldsGlobals.useWebGL ? null : new CanvasWarningNode()
  };

  ChargesAndFieldsGlobals.projectorColorsProperty.link( function( useProjectorColors ) {
    if ( useProjectorColors ) {
      ChargesAndFieldsColors.applyProfile( 'projector' );
    }
    else {
      ChargesAndFieldsColors.applyProfile( 'default' );
    }
  } );

  // Appending '?dev' to the URL will enable developer-only features.
  if ( window.phetcommon.getQueryParameter( 'dev' ) ) {
    simOptions = _.extend( {
      // add dev-specific options here
    }, simOptions );
  }

  SimLauncher.launch( function() {
    var sim = new Sim( simTitle, [ new ChargesAndFieldsScreen() ], simOptions );
    sim.start();
  } );
} );