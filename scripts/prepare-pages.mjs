// Copyright 2026, University of Colorado Boulder

/**
 * Copy the standalone adapted-from-phet build into the GitHub Pages publishing directory.
 * @author Martin Veillette (Berea College)
 */

import { copyFile, mkdir, writeFile } from 'node:fs/promises';

const repoRoot = new URL( '../', import.meta.url );
const buildFile = new URL( 'build/adapted-from-phet/charges-and-fields_en_adapted-from-phet.html', repoRoot );
const pagesDirectory = new URL( 'docs/', repoRoot );

await mkdir( pagesDirectory, { recursive: true } );
await copyFile( buildFile, new URL( 'index.html', pagesDirectory ) );
await Promise.all( [
  copyFile( new URL( 'LICENSE', repoRoot ), new URL( 'LICENSE.txt', pagesDirectory ) ),
  writeFile( new URL( '.nojekyll', pagesDirectory ), '' )
] );

console.log( 'GitHub Pages build prepared in docs/index.html' );
