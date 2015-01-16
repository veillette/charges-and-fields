// Copyright 2002-2015, University of Colorado Boulder

/**
 * Constants used throughout the simulation.
 * @author Martin Veillette (Berea College)
 */
define(function (require) {
    'use strict';

    var Color = require('SCENERY/util/Color');
    //var Dimension2 = require( 'DOT/Dimension2' );
    var PhetFont = require('SCENERY_PHET/PhetFont');

    return {
        SATURATION_POSITIVE_COLOR: new Color('red'),
        SATURATION_NEGATIVE_COLOR: new Color('blue'),
        BACKGROUND_COLOR: new Color('#FFFFB7'),

        POSITIVE_CHARGE_COLOR: new Color('red'),
        NEGATIVE_CHARGE_COLOR: new Color('red'),
        CHARGE_RADIUS: 17,

        MOVABLE_SENSOR_COLOR: new Color('orange'),
        MOVABLE_SENSOR_STROKE: 2,
        MOVABLE_SENSOR_RADIUS: 7,
        MOVABLE_SENSOR_ARROW_COLOR: new Color('red'),

        DEFAULT_FONT: new PhetFont({size: 12}),
        VOLTAGE_LABEL_FONT: new PhetFont({size: 14}),
        CHECK_BOX_FONT: new PhetFont({size: 16}),
        CHECK_BOX_TEXT_FILL: 'yellow',
        PANEL_FILL: 'black',
        PANEL_STROKE: 'white',
        PANEL_LINE_WIDTH: 2

        //CIRCLE_COLOR = 'black';
        //  ARROW_COLOR = 'pink';
        //var ARROW_LENGTH = 20; //in pixels

    };
});