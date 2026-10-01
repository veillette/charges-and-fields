// Copyright 2015-2026, University of Colorado Boulder

/**
 * An electric field line traced in both directions using adaptive fourth-order Runge-Kutta integration.
 * Points are ordered along the field so the arrowheads point from positive to negative charges.
 *
 * @author Martin Veillette (Berea College)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import { clamp } from '../../../../dot/js/util/clamp.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import ChargedParticle from './ChargedParticle.js';

const MAX_STEPS = 2000;
const MIN_STEP_DISTANCE = 0.01; // meters
const MAX_STEP_DISTANCE = 0.10;
const ARROW_SPACING = 0.4; // meters along the path
const ARROW_HEAD_LENGTH = 0.05;

export default class ElectricFieldLine {

  public readonly positionArray: Vector2[];
  public readonly isLinePresent: boolean;

  public constructor( position: Vector2,
                      private readonly bounds: Bounds2,
                      private readonly chargedParticles: ChargedParticle[],
                      private readonly getElectricField: ( position: Vector2 ) => Vector2 ) {

    const canTrace = chargedParticles.length > 0 && position.isFinite() &&
                     this.getClosestChargePosition( position ).distance( position ) >= MIN_STEP_DISTANCE &&
                     this.getDirection( position ) !== null;
    this.positionArray = canTrace ? [
      ...this.trace( position, -1 ).reverse(), position.copy(), ...this.trace( position, 1 )
    ] : [];
    this.isLinePresent = this.positionArray.length > 1;
  }

  // Copy the field before normalizing: the callback may return a shared vector.
  private getDirection( position: Vector2 ): Vector2 | null {
    const field = this.getElectricField( position );
    return field.isFinite() && field.magnitude > 0 ? field.normalized() : null;
  }

  private getNextPosition( position: Vector2, step: number ): Vector2 | null {
    const k1 = this.getDirection( position );
    const k2 = k1 && this.getDirection( position.plus( k1.timesScalar( step / 2 ) ) );
    const k3 = k2 && this.getDirection( position.plus( k2.timesScalar( step / 2 ) ) );
    const k4 = k3 && this.getDirection( position.plus( k3.timesScalar( step ) ) );
    return k1 && k2 && k3 && k4 ? position.plus( new Vector2(
      step * ( k1.x + 2 * k2.x + 2 * k3.x + k4.x ) / 6,
      step * ( k1.y + 2 * k2.y + 2 * k3.y + k4.y ) / 6
    ) ) : null;
  }

  private getClosestChargePosition( position: Vector2 ): Vector2 {
    let closestPosition = this.chargedParticles[ 0 ].positionProperty.value;
    this.chargedParticles.forEach( particle => {
      const chargePosition = particle.positionProperty.value;
      if ( chargePosition.distanceSquared( position ) < closestPosition.distanceSquared( position ) ) {
        closestPosition = chargePosition;
      }
    } );
    return closestPosition;
  }

  private trace( position: Vector2, sign: number ): Vector2[] {
    const points: Vector2[] = [];
    const traceBounds = this.bounds.dilated( MAX_STEP_DISTANCE );
    let currentPosition = position;
    let stepDistance = MIN_STEP_DISTANCE;

    for ( let i = 0; i < MAX_STEPS && traceBounds.containsPoint( currentPosition ); i++ ) {
      const closestCharge = this.getClosestChargePosition( currentPosition );
      const chargeDistance = closestCharge.distance( currentPosition );
      if ( chargeDistance < MIN_STEP_DISTANCE ) {
        points.push( closestCharge.copy() );
        break;
      }

      // Slow down near charges to avoid crossing a singularity in an integration step.
      const step = sign * Math.min( stepDistance, chargeDistance / 2 );
      const nextPosition = this.getNextPosition( currentPosition, step );
      if ( !nextPosition || !nextPosition.isFinite() || nextPosition.distance( currentPosition ) < 1e-9 ) {
        break;
      }
      points.push( nextPosition );
      currentPosition = nextPosition;

      if ( points.length > 2 ) {
        const length = points.length;
        const previousStep = points[ length - 2 ].minus( points[ length - 3 ] );
        const nextStep = points[ length - 1 ].minus( points[ length - 2 ] );
        const angle = nextStep.angleBetween( previousStep );
        stepDistance = angle === 0 ? MAX_STEP_DISTANCE :
                       clamp( Math.abs( step ) * ( Math.PI / 180 ) / angle, MIN_STEP_DISTANCE, MAX_STEP_DISTANCE );
      }
    }
    return points;
  }

  public getShape(): Shape {
    const shape = new Shape();
    if ( !this.isLinePresent ) {
      return shape;
    }

    shape.moveToPoint( this.positionArray[ 0 ] );
    let distanceSinceArrow = 0;
    for ( let i = 1; i < this.positionArray.length; i++ ) {
      const previous = this.positionArray[ i - 1 ];
      const point = this.positionArray[ i ];
      const displacement = point.minus( previous );
      shape.lineToPoint( point );
      distanceSinceArrow += displacement.magnitude;
      if ( distanceSinceArrow >= ARROW_SPACING && displacement.magnitude > 0 ) {
        const angle = displacement.angle;
        shape.moveTo( point.x - ARROW_HEAD_LENGTH * Math.cos( angle - Math.PI / 6 ),
          point.y - ARROW_HEAD_LENGTH * Math.sin( angle - Math.PI / 6 ) );
        shape.lineToPoint( point );
        shape.lineTo( point.x - ARROW_HEAD_LENGTH * Math.cos( angle + Math.PI / 6 ),
          point.y - ARROW_HEAD_LENGTH * Math.sin( angle + Math.PI / 6 ) );
        shape.moveToPoint( point );
        distanceSinceArrow = 0;
      }
    }
    return shape;
  }
}
