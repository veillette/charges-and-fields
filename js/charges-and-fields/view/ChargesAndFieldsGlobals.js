// Copyright 2015, University of Colorado Boulder

/**
 * Global settings
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var PropertySet = require( 'AXON/PropertySet' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  var ChargesAndFieldsGlobals = new PropertySet( {
    projectorColors: !!phet.chipper.getQueryParameter( 'projector' ) || false
  } );

  chargesAndFields.register( 'ChargesAndFieldsGlobals', ChargesAndFieldsGlobals );

  return _.extend( ChargesAndFieldsGlobals, {
    disallowWebGL: phet.chipper.getQueryParameter( 'webgl' ) === 'false'
  } );
} );