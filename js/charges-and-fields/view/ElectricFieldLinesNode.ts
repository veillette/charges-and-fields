// Copyright 2015-2026, University of Colorado Boulder

/**
 * Draws the fork's electric field lines and releases paths as lines are cleared.
 *
 * @author Martin Veillette (Berea College)
 */

import { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import ElectricFieldLine from '../model/ElectricFieldLine.js';

export default class ElectricFieldLinesNode extends Node {

  private readonly disposeElectricFieldLinesNode: () => void;

  public constructor( lines: ObservableArray<ElectricFieldLine>, modelViewTransform: ModelViewTransform2 ) {
    super( { pickable: false } );

    const paths = new Map<ElectricFieldLine, Path>();
    const addLine = ( line: ElectricFieldLine ) => {
      const path = new Path( modelViewTransform.modelToViewShape( line.getShape() ), {
        stroke: 'orange',
        lineWidth: 2
      } );
      paths.set( line, path );
      this.addChild( path );
    };
    const removeLine = ( line: ElectricFieldLine ) => {
      const path = paths.get( line )!;
      this.removeChild( path );
      path.dispose();
      paths.delete( line );
    };

    lines.forEach( addLine );
    lines.addItemAddedListener( addLine );
    lines.addItemRemovedListener( removeLine );

    this.disposeElectricFieldLinesNode = () => {
      lines.removeItemAddedListener( addLine );
      lines.removeItemRemovedListener( removeLine );
      paths.forEach( path => {
        this.removeChild( path );
        path.dispose();
      } );
      paths.clear();
    };
  }

  public override dispose(): void {
    this.disposeElectricFieldLinesNode();
    super.dispose();
  }
}
