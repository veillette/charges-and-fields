Charges and Fields with Electric Field Lines
=============
"Charges and Fields" is an educational simulation in HTML5, by <a href="https://phet.colorado.edu/" target="_blank">PhET
Interactive Simulations</a>
at the University of Colorado Boulder. For a description of this simulation, associated resources, and a link to the
published version,
<a href="https://phet.colorado.edu/en/simulation/charges-and-fields" target="_blank">visit the simulation's web page</a>.

This fork adds electric field lines to the upstream simulation. Double-click or double-tap an active electric field
sensor to draw an orange field line through its position, with arrows showing the field direction. Lines clear when
charges move, are added or removed, or when Reset All is pressed.

<img src="https://raw.githubusercontent.com/veillette/charges-and-fields/main/assets/Charges-And-Fields-Screenshot-With-E-Lines.png" alt="Electric field lines screenshot" style="width: 400px;"/>

### Try it

[Run the simulation with electric field lines](https://veillette.github.io/charges-and-fields/).
Double-click or double-tap a sensor to draw a field line.

### Documentation

The <a href="https://github.com/phetsims/phet-info/blob/main/doc/phet-development-overview.md" target="_blank">PhET
Development Overview</a> is the most complete guide to PhET Simulation Development. This guide includes how to obtain
simulation code and its dependencies, notes about architecture & design, how to test and build the sims, as well as
other important information.

### Quick Start

(1) Clone the simulation and its dependencies:

```
git clone https://github.com/phetsims/assert.git
git clone https://github.com/phetsims/axon.git
git clone https://github.com/phetsims/babel.git
git clone https://github.com/phetsims/brand.git
git clone https://github.com/veillette/charges-and-fields.git
git clone https://github.com/phetsims/chipper.git
git clone https://github.com/phetsims/dot.git
git clone https://github.com/phetsims/joist.git
git clone https://github.com/phetsims/kite.git
git clone https://github.com/phetsims/perennial.git perennial-alias
git clone https://github.com/phetsims/phet-core.git
git clone https://github.com/phetsims/phetcommon.git
git clone https://github.com/phetsims/phetmarks.git
git clone https://github.com/phetsims/query-string-machine.git
git clone https://github.com/phetsims/scenery.git
git clone https://github.com/phetsims/scenery-phet.git
git clone https://github.com/phetsims/sherpa.git
git clone https://github.com/phetsims/sun.git
git clone https://github.com/phetsims/tambo.git
git clone https://github.com/phetsims/tandem.git
git clone https://github.com/phetsims/twixt.git
git clone https://github.com/phetsims/utterance-queue.git
```

(2) Install dev dependencies:

```
cd chipper
npm install
cd ../perennial-alias
npm install
cd ../charges-and-fields
npm install
```

(3) Run `grunt dev-server` to start a local development server that will serve the simulation.

(4) Open the simulation using the URL printed by the development server.

#### Optional: Build the simulation into a single file

(1) Change directory to the simulation directory: `cd ../charges-and-fields`

(2) Build the sim: `grunt --brands=adapted-from-phet`. It is safe to ignore warnings
like `>> WARNING404: Skipping potentially non-public dependency`, which indicate that non-public PhET-iO code is not
being included in the build.

(3) Open in the
browser: `http://localhost/charges-and-fields/build/adapted-from-phet/charges-and-fields_en_adapted-from-phet.html`

### GitHub Pages build

The standalone simulation is published from `docs/index.html` on `main`. It contains the simulation code,
images, sounds, and English strings in one file, so visitors do not need the PhET development dependencies.

To refresh the published build after changing the simulation, first build it with the command above, then run:

```sh
node scripts/prepare-pages.mjs
git add docs
git commit -m "Refresh GitHub Pages build"
git push origin main
```

GitHub Pages is configured to deploy the `/docs` folder from `main`. The `.nojekyll` file keeps the generated
HTML intact. `docs/LICENSE.txt` contains the source license; the standalone simulation also includes PhET's
attribution and third-party license information.

### Checking electric field lines

With `grunt dev-server` running, run the browser regression checks (replace the URL with the server's URL):

```sh
node tests/electric-field-lines.cjs http://localhost:8080
```

This uses Playwright from `perennial-alias`; install its Chromium browser with
`../perennial-alias/node_modules/.bin/playwright install chromium` if needed. The checks cover line direction,
double-click/tap, ordinary dragging, zero-field points, charge changes, path disposal, and Reset All.

### Syncing with upstream

The upstream remote is `https://github.com/phetsims/charges-and-fields.git`, branch `main`:

```sh
git remote add upstream https://github.com/phetsims/charges-and-fields.git # once per clone
git fetch upstream
git merge upstream/main
```

Keep the electric field line model and view, their wiring in `ChargesAndFieldsModel` and `ChargesAndFieldsScreenView`,
and the double-click/tap handling in `ElectricFieldSensorNode` when resolving conflicts. The historical 2016 standalone
build has been removed; use the build command above to generate a current version with field lines.

### Get Involved

Join us at the <a href="https://scenerystack.org/community/join/" target="_blank">SceneryStack Community</a>

Help us improve, create a <a href="http://github.com/phetsims/charges-and-fields/issues/new" target="_blank">New Issue</a>

### License

See the <a href="https://github.com/phetsims/charges-and-fields/blob/main/LICENSE" target="_blank">LICENSE</a>
