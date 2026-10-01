// Copyright 2026, University of Colorado Boulder

/**
 * Browser regression tests for the fork's field lines.
 * @author Martin Veillette (Berea College)
 */
/* global process */
'use strict';

// Run against `grunt dev-server` using the Playwright installed by perennial-alias:
// node tests/electric-field-lines.cjs http://localhost:8080
const nodeAssert = require( 'node:assert/strict' );
const { chromium } = require( '../../perennial-alias/node_modules/playwright' );

( async () => {
  const browser = await chromium.launch( {
    headless: true,
    ...( process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {} )
  } );
  try {
    const context = await browser.newContext( { viewport: { width: 1024, height: 768 }, hasTouch: true } );
    const page = await context.newPage();
    const errors = [];
    page.on( 'pageerror', error => errors.push( error.message ) );
    const baseURL = process.argv[ 2 ] || 'http://localhost:8080';
    await page.goto( `${baseURL}/charges-and-fields/charges-and-fields_en.html?brand=adapted-from-phet&ea` );
    await page.waitForFunction( () => window.phet?.joist?.sim?.isConstructionCompleteProperty?.value );

    const modelChecks = await page.evaluate( () => {
      const model = phet.joist.sim.screens[ 0 ].model;
      const view = phet.joist.sim.screens[ 0 ].view;
      const Vector2 = model.bounds.center.constructor;
      const check = ( condition, message ) => {
        if ( !condition ) {
          throw new Error( message );
        }
      };
      const lineNode = view.children.find( child => child.constructor.name === 'ElectricFieldLinesNode' );
      const addCharge = ( sign, x, y ) => {
        const charge = sign > 0 ? model.addPositiveCharge( new Vector2( x, y ) ) :
                       model.addNegativeCharge( new Vector2( x, y ) );
        charge.positionProperty.value = new Vector2( x, y );
        charge.isActiveProperty.value = true;
        return charge;
      };
      const addLine = ( x, y ) => model.addElectricFieldLine( new Vector2( x, y ) );
      const checkLine = () => {
        check( model.electricFieldLinesArray.length === 1, 'one traced line' );
        check( lineNode.children.length === 1, 'one rendered path' );
        const points = model.electricFieldLinesArray[ 0 ].positionArray;
        check( points.length > 2 && points.length <= 4001, 'bounded tracing' );
        check( points.every( point => point.isFinite() ), 'finite trace points' );
        for ( let i = 1; i < points.length - 1; i++ ) {
          // Upstream substitutes an arbitrary horizontal field at charge centers; direction is undefined there.
          if ( model.activeChargedParticles.some( charge => charge.positionProperty.value.distance( points[ i - 1 ] ) < 1e-4 ) ) {
            continue;
          }
          const displacement = points[ i ].minus( points[ i - 1 ] );
          const field = model.getElectricField( points[ i - 1 ] );
          check( displacement.dot( field ) >= -1e-9, `points follow the electric field at ${i}: ${points[ i - 1 ]} -> ${points[ i ]}, dot=${displacement.dot( field )}` );
        }
      };
      model.reset();
      addLine( 1, 0 );
      check( model.electricFieldLinesArray.length === 0, 'empty play area' );
      const positive = addCharge( 1, 0, 0 );
      addLine( 1, 0 );
      checkLine();
      const positivePoints = model.electricFieldLinesArray[ 0 ].positionArray;
      check( positivePoints[ 0 ].distance( Vector2.ZERO ) < 0.02, 'line begins at positive charge' );
      const removedPath = lineNode.children[ 0 ];
      positive.positionProperty.value = new Vector2( -1, 0 );
      check( model.electricFieldLinesArray.length === 0 && lineNode.children.length === 0 && removedPath.isDisposed,
        'moving a charge clears and disposes its paths' );
      addLine( 1, 0 );
      positive.isActiveProperty.value = false;
      check( model.electricFieldLinesArray.length === 0, 'deactivating a charge clears lines' );
      positive.isActiveProperty.value = true;
      addLine( 0, 0.5 );
      addCharge( -1, 1, 0 );
      check( model.electricFieldLinesArray.length === 0, 'adding a charge clears lines' );
      addLine( 0, 0.5 );
      checkLine();
      const dipolePoints = model.electricFieldLinesArray[ 0 ].positionArray;
      check( dipolePoints[ 0 ].distance( new Vector2( -1, 0 ) ) < 0.02, 'dipole starts at positive charge' );
      check( dipolePoints[ dipolePoints.length - 1 ].distance( new Vector2( 1, 0 ) ) < 0.02,
        `dipole ends at negative charge: ${dipolePoints[ dipolePoints.length - 1 ]}, ${dipolePoints.length} points` );
      model.chargedParticleGroup.disposeElement( positive );
      check( model.electricFieldLinesArray.length === 0, 'removing a charge clears lines' );
      addLine( 0, 0.5 );
      checkLine();
      model.reset();
      check( model.electricFieldLinesArray.length === 0 && lineNode.children.length === 0, 'reset clears lines' );
      addCharge( 1, -1, 0 );
      addCharge( 1, 1, 0 );
      addLine( 0, 0 );
      addLine( 1, 0 );
      check( model.electricFieldLinesArray.length === 0, 'zero-field point and charge center do not trace' );
      addLine( 0, 0.5 );
      checkLine();
      model.reset();
      addCharge( 1, 0, 0 );
      addCharge( -1, 0, 0 );
      addLine( 1, 0 );
      check( model.electricFieldLinesArray.length === 0, 'compensated charges do not trace' );
      model.reset();
      addCharge( 1, -1, 0 );
      const sensor = model.addElectricFieldSensor( new Vector2( 0, 0.5 ) );
      sensor.positionProperty.value = new Vector2( 0, 0.5 );
      sensor.isActiveProperty.value = true;
      return 'model tracing, direction, singularities, clearing, path disposal and reset passed';
    } );
    console.log( modelChecks );

    const sensorPoint = () => page.evaluate( () => {
      const screen = phet.joist.sim.screens[ 0 ];
      const sensor = screen.model.electricFieldSensorGroup.getElement( 0 );
      const point = screen.view.localToGlobalPoint( screen.view.modelViewTransform.modelToViewPosition( sensor.positionProperty.value ) );
      return { x: point.x, y: point.y };
    } );
    const lineCount = () => page.evaluate( () => phet.joist.sim.screens[ 0 ].model.electricFieldLinesArray.length );
    let point = await sensorPoint();
    await page.mouse.click( point.x, point.y );
    nodeAssert.equal( await lineCount(), 0, 'single click does not draw a line' );
    await page.mouse.click( point.x, point.y );
    nodeAssert.equal( await lineCount(), 1, 'double click draws a line' );
    await page.evaluate( () => phet.joist.sim.screens[ 0 ].model.clearElectricFieldLines() );
    await page.mouse.move( point.x, point.y );
    await page.mouse.down();
    await page.mouse.move( point.x + 40, point.y + 40, { steps: 5 } );
    await page.mouse.up();
    point = await sensorPoint();
    await page.mouse.click( point.x, point.y );
    nodeAssert.equal( await lineCount(), 0, 'drag then click does not draw a line' );
    // A completed double-click resets the recognizer before testing touch input.
    await page.mouse.click( point.x, point.y );
    nodeAssert.equal( await lineCount(), 1 );
    await page.evaluate( () => phet.joist.sim.screens[ 0 ].model.clearElectricFieldLines() );
    point = await sensorPoint();
    await page.touchscreen.tap( point.x, point.y );
    point = await sensorPoint();
    await page.touchscreen.tap( point.x, point.y );
    nodeAssert.equal( await lineCount(), 1, 'double tap draws a line with touch offsets' );
    nodeAssert.deepEqual( errors, [], 'no browser errors with assertions enabled' );
    console.log( 'single click, double click, drag rejection and double tap passed' );
  }
  finally {
    await browser.close();
  }
} )().catch( error => {
  console.error( error );
  process.exitCode = 1;
} );
