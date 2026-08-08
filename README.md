# exsurge

A JavaScript library for rendering Gregorian chant in square note notation. It takes [gabc](http://gregorio-project.github.io/gabc/) as input and produces SVG (or canvas) output that you can drop into a page, an editor, or a print pipeline.

**Live demos:** [playback](https://vagdur.github.io/exsurge/test/playback.html) (a rendered score you can click to hear) and the [rendering sandbox](https://vagdur.github.io/exsurge/test/index.html) (paste gabc, watch it lay out). Both are the `test/` pages served straight from `master` by GitHub Pages, importing `src/` as native ES modules — so they show this repository's current source, not a built bundle.

## Which exsurge is this?

**This is a third fork in a chain, and it is neither of the two repositories you are likely to find by searching.** There are three:

| | Repository | Status |
| --- | --- | --- |
| **Original** | [frmatthew/exsurge](https://github.com/frmatthew/exsurge) — Fr. Matthew Spencer, O.S.J. | Dormant since April 2017 |
| **Fork** | [bbloomf/exsurge](https://github.com/bbloomf/exsurge) — Benjamin Bloomfield | Active; the de facto mainline |
| **This repo** | [vagdur/exsurge](https://github.com/vagdur/exsurge) — Vilhelm Agdur | Newly branched from the above |

Fr. Spencer wrote the original and stopped committing in July 2016; that repository has seen no activity since April 2017 and has 191 commits. Benjamin Bloomfield forked it and has maintained it single-handedly for the decade since, authoring 703 of its 832 commits across 101 tagged releases from `v0.0.1` to `v1.25.2`. Essentially all of the neume shaping, layout, text handling, and rendering-backend work exists only in that fork.

**This repository is a new fork of Bloomfield's fork.** It branches from `bbloomf/exsurge` at tag `v1.25.2` (commit `0c39f61`) and has diverged since: Web Audio playback (`Exsurge.Playback*.js`, entirely new here), a fix giving notes nudged by the gabc `0` and `9` modifiers a real pitch, and a rebuilt toolchain — Rollup, Vitest, ESLint 10, Prettier and TypeScript `checkJs` in place of webpack, Babel and Mocha. For anything outside those areas, Bloomfield's repository remains the source of truth for behaviour.

GitHub records the two-hop chain explicitly: this repository's `parent` is `bbloomf/exsurge` and its `source` — the root of the fork tree — is `frmatthew/exsurge`. If you are reading a copy of this file somewhere else, that pair is the quickest way to tell which of the three you actually have.

> **Remotes.** There are three of them but only two repositories: `bbloomf` and `upstream` are two names for the same URL. `upstream` here means the *parent fork*, not the root of the lineage — there is no remote for the dormant original at all.
>
> | Remote | Points at | Use |
> | --- | --- | --- |
> | `origin` | `vagdur/exsurge` | this fork; push here |
> | `bbloomf` | `bbloomf/exsurge` | mainline; pull ongoing work from here |
> | `upstream` | `bbloomf/exsurge` | the same repository under a second name |
>
> To pick up Bloomfield's later work: `git fetch bbloomf && git merge bbloomf/master`. Note that this fork was created with the default branch only, so his topic branches exist under `bbloomf/*` rather than `origin/*`.

### Three things that follow from that

**Do not `npm install exsurge`.** The unscoped `exsurge` package is still at version 0.0.0, published in February 2016, owned by the original author, and pointing at the original repository. It predates essentially everything described here, and neither fork controls it. **This fork publishes as [`@vagdur/exsurge`](https://www.npmjs.com/package/@vagdur/exsurge)** — the scope is what distinguishes it. Bloomfield's mainline is not on the registry at all; install it from git if you want his work without this fork's changes.

**The version number is continuous with Bloomfield's tags, not with the registry.** This package starts on npm at `1.25.2` because that is the upstream tag it branches from; there are no `@vagdur/exsurge` versions below it. That number is inherited, not a claim of equivalence — `src/` has diverged since the branch point (see below), and the first release published from this fork will bump it.

**The old live demo is not this code.** The original README linked to `frmatthew.github.io/exsurge/chant.html`, a GitHub Pages build from the *original* repository — it serves a 2016/2017 bundle and describes itself as "the simplest of test pages." It reflects neither fork. This fork publishes its own demos at [vagdur.github.io/exsurge](https://vagdur.github.io/exsurge/), which do track this code. For a substantial application built on this library, see **[jgabc](http://bbloomf.github.io/jgabc/)** ([source](https://github.com/bbloomf/jgabc)), a full gabc transcriber and chant editor by Bloomfield, which vendors the bundle from his fork.

## Installation

```
npm install @vagdur/exsurge
```

Note the scope. The unscoped `exsurge` on npm is the abandoned 2016 package and is not this code.

Installing from git also works and gives you the same files. `dist/` is not committed, but npm runs the `prepare` script for a git dependency, so the bundle is built during install:

```
npm install github:vagdur/exsurge      # this fork
npm install github:bbloomf/exsurge     # the fork this one is based on, not on npm
```

The built bundle `dist/exsurge.min.js` is UMD, so it works as a CommonJS/AMD module or as a browser global. **The global is named `exsurge`** — the scope is part of the package name, not the namespace.

`import` and `require` both give you the full public export surface:

```javascript
import { ChantContext, Gabc, ChantScore } from "@vagdur/exsurge";  // dist/exsurge.mjs
const exsurge = require("@vagdur/exsurge");                        // dist/exsurge.min.js
```

An `exports` map routes those two conditions to the ESM and UMD bundles respectively, with `types` pointing at `src/exsurge.d.ts`. This matters more than it looks: `module` is a bundler convention that Node ignores, so without the map Node resolves `import` to the *CommonJS* bundle, and `cjs-module-lexer` cannot recover named exports from minified UMD — you would get a single `default` and `ChantContext is not a constructor`. `main`, `module` and a top-level `types` are all still declared for older bundlers and for TypeScript's legacy resolution.

Subpaths stay reachable for the cases that need a concrete file — `@vagdur/exsurge/assets/fonts/ExsurgeChar.otf`, `@vagdur/exsurge/dist/*` and `@vagdur/exsurge/src/*`.

The bundle is not transpiled to ES5. `src/` is shipped as authored: ES2015 syntax, and ES2019 library calls such as `Array.prototype.flatMap`. The effective browser floor is roughly 2019.

To work on the library itself:

```
npm install
npm run build
```

## Usage

Create a `ChantContext` holding your render settings, parse gabc into mappings, build a `ChantScore`, lay it out, then emit SVG. In a browser the bundle exposes a global named `exsurge`; under Node or a bundler, `const exsurge = require("@vagdur/exsurge")`.

```javascript
const gabc = "(f3) EC(ce!fg)CE(f) *(,) ad(fe~)vé(f!gwhf)nit(f) (,)";

const ctxt = new exsurge.ChantContext();
const mappings = exsurge.Gabc.createMappingsFromSource(ctxt, gabc);
const score = new exsurge.ChantScore(ctxt, mappings, /* useDropCap */ true);

score.performLayout(ctxt);
score.layoutChantLines(ctxt, 1000, () => {
  const svg = score.createSvgNode(ctxt); // an <svg> DOM node
  document.body.appendChild(svg);
});
```

In a browser, prefer the asynchronous layout call, which chunks its work across timeouts instead of blocking the main thread. Pass a third callback if you need to hear about failures (for example, lyric font metrics that never become usable):

```javascript
score.performLayoutAsync(ctxt, () => {
  score.layoutChantLines(ctxt, containerWidth, () => {
    container.appendChild(score.createSvgNode(ctxt));
  });
}, (error) => {
  console.error(error);
});
```

### Layout is two phases

`performLayout` positions each notation in isolation — its glyphs, lyrics, and markings — with no knowledge of page width. `layoutChantLines(ctxt, width, callback)` then packs those notations into staff systems for a concrete width, which is where line breaking, justification, and custos placement happen. When only the available width changes, such as on a window resize, re-run just the second phase.

### Output backends

A laid-out `ChantScore` can be emitted three ways:

- `score.createSvgNode(ctxt)` — real DOM `<svg>` nodes. The usual browser choice.
- `score.createSvgTree(ctxt, zoom)` — plain `{ name, props, children }` objects, for environments without a DOM (server-side rendering, React, React Native).
- `score.draw(ctxt, scale)` — renders to an HTML canvas via `ctxt.canvasCtxt`.

`ChantContext` measures text using the DOM canvas when one is available and falls back to [opentype.js](https://opentype.js.org/) otherwise; you can force a strategy by passing a `TextMeasuringStrategy` value to the constructor.

The whole pipeline runs headless, which is useful for build-time or server-side rendering:

```javascript
const exsurge = require("@vagdur/exsurge");

const ctxt = new exsurge.ChantContext(); // falls back to opentype.js measuring
const mappings = exsurge.Gabc.createMappingsFromSource(ctxt, gabc);
const score = new exsurge.ChantScore(ctxt, mappings, true);

score.performLayout(ctxt);
score.layoutChantLines(ctxt, 1000, () => {
  const tree = score.createSvgTree(ctxt); // { name: "svg", props, children }
});
```

Note that tree nodes carry back-references to the model objects that produced them, so they are not directly `JSON.stringify`-able; walk the `name`/`props`/`children` fields when serializing.

### Playback

A rendered score can be made playable. `createPlayableChant` does the whole pipeline — parse, lay out, render, and wire up a player. The callback receives both the player and the score:

```javascript
exsurge.createPlayableChant(ctxt, gabc, document.getElementById("chant"), {
  speed: 100,      // percent of the base speed; higher is faster
  tuning: 261.63,  // Hz of Do — see below
  instrument: "piano"
}, (player, score) => {
  mySpeedSlider.oninput = () => player.setSpeed(Number(mySpeedSlider.value));
});
```

Anything that must be set *before* layout (an annotation above the clef, titles, …) needs a score you own. Pass a prebuilt `ChantScore` instead of a gabc string — `createPlayableChant` still handles layout, SVG, player and resize:

```javascript
const mappings = exsurge.Gabc.createMappingsFromSource(ctxt, gabc);
const score = new exsurge.ChantScore(ctxt, mappings, true);
score.annotation = new exsurge.Annotation(ctxt, "%V%");
exsurge.createPlayableChant(ctxt, score, document.getElementById("chant"), options, (player) => {
  // …
});
```

Clicking a note plays from that note onward, highlighting whichever note is sounding; clicking again stops. **The player deliberately has no interface of its own** — settings are options, and hosts build their own controls on top of `setSpeed`, `setTuning`, `setTranspose`, `setTemperament`, `setInstrument` and `setVolume`, all of which are safe to call mid-playback. `test/playback.html` is a worked example, [live here](https://vagdur.github.io/exsurge/test/playback.html).

`autoResize` defaults to `true` and installs a `window` resize listener that re-lays out into the same container. Call `player.destroy()` when you are done with the player — or before replacing the container element — so that listener is released. Rendering into a detached container is skipped with a console warning rather than drawing into a node nobody can see.

To attach to a score you rendered yourself, construct the player directly:

```javascript
const player = new exsurge.ChantPlayer(score, score.createSvgNode(ctxt), options);
```

| Option | Default | Meaning |
| --- | --- | --- |
| `speed` | `100` | percentage of `basePulseSeconds`; higher is faster |
| `basePulseSeconds` | `0.4` | seconds per pulse at `speed: 100` (150 pulses/min) |
| `tuning` | `261.6255653` | frequency of Do, in hertz |
| `transpose` | `0` | extra semitones; shifts the piece without altering its intervals |
| `temperament` | `"equal"` | `"equal"`, `"pythagorean"`, or your own ratio function |
| `instrument` | `"piano"` | a key in `exsurge.Instruments`, or your own object |
| `volume` | `1.0` | scales the master gain |
| `loop` | `false` | restart at the end instead of stopping |
| `highlightClass` / `highlightColor` | `"playing"` / `"#cc0000"` | how the sounding note is marked |
| `injectStyle` | `true` | inject scoped css for the highlight; set `false` to supply your own |
| `audioContext` | `null` | share an existing context; the player then never closes it |
| `autoResize` | `true` | (`createPlayableChant` only) re-layout on window resize; call `destroy()` to release the listener |
| `useDropCap` | `true` | (`createPlayableChant` only) whether the score gets a drop capital |
| `onStart` / `onStop` / `onEnd` / `onNoteChange` / `onError` | `null` | callbacks; `onError` also reports layout/render failures from `createPlayableChant` (with `player` null if the player was never created) |

**Tuning.** Every gabc clef is built at octave 2 whatever staff line it sits on, so `tuning` is the frequency of the Do that the clef itself names — literally "what pitch is C played at". A `c4` chant then spans roughly C3–C4 at the default; a `c1` chant sits nearly an octave higher, which is the clef doing its job. Use `transpose` to move a piece into a comfortable range. Note that on an **f-clef** the note sitting *on the clef line* is Fa, so it sounds a perfect fourth above `tuning`. Mid-score clef changes and accidentals are handled automatically, because gabc bakes the active clef into each note's pitch at parse time.

**Temperament.** The default is twelve-tone equal temperament, because that is what a listener arriving from other software expects. Chant predates it by centuries, so `temperament: "pythagorean"` is on offer as the historically apt alternative: every interval is built from pure 3:2 fifths, which leaves fifths and fourths beatless and the thirds noticeably wider than tempered ones — the ditone comes out at 408 cents rather than 400. The twelve ratios are exported as `PythagoreanRatios`, and `temperament` also accepts your own function from signed semitones relative to Do to a frequency ratio, so any other tuning is a few lines away:

```javascript
player.setTemperament((semitones) => Math.pow(2, semitones / 12)); // back to equal
```

`transpose` composes with all of this as a second ratio rather than as a shift applied before the lookup, so moving a piece into a comfortable range never disturbs the intervals inside it.

**Rhythm.** Chant notates no durations, so playback has to interpret. The default is an equal pulse with the usual Solesmes nuances: a mora dot adds a pulse, a horizontal episema lengthens slightly, an ictus accents without lengthening, a quilisma is light and broadens the note before it, liquescents are clipped, and bar lines produce rests scaled by type. All of it lives in three exported tables — `PlaybackDurations`, `PlaybackRests` and `PlaybackVelocities` — and any of them can be overridden per player via the `durations`, `restWeights` and `velocities` options.

**Browsers only start audio inside a user gesture.** Clicking a note satisfies that by itself. If you drive playback from your own button, call `player.unlock()` from the click handler first.

`createPlaybackEvents(score, options)` is exported separately and is pure — no DOM, no Web Audio — if you want the timeline without the playback.

### Fonts

Special characters (℣, ℟, and similar) are rendered in a font family named `Exsurge Characters`. Ship `ExsurgeChar.otf` with your application and declare a matching `@font-face`, or those glyphs will fall back to whatever the browser picks. The font is included in the published package at `node_modules/@vagdur/exsurge/assets/fonts/ExsurgeChar.otf`.

## Repository layout

Everything is in `src/`, re-exported flat from `src/index.js` onto a single namespace.

| Path | Contents |
| --- | --- |
| `Exsurge.Gabc.js` | gabc parser; produces `ChantMapping` objects |
| `Exsurge.Chant.js` | `ChantScore`, `Note`, clefs, the top-level model |
| `Exsurge.Chant.Neumes.js` | neume classes (`Punctum`, `Podatus`, `Clivis`, `Torculus`, …) |
| `Exsurge.Chant.Signs.js` | bars, dividers, custos, accidentals |
| `Exsurge.Chant.Markings.js` | episemata, ictus, mora, braces |
| `Exsurge.Chant.ChantLine.js` | staff systems, line breaking, justification |
| `Exsurge.Drawing.js` | `ChantContext`, visualizers, text elements, `QuickSvg` |
| `Exsurge.Glyphs.js` | generated SVG path data per glyph |
| `Exsurge.Text.js` | syllabification (Latin, English, Spanish, Swedish) |
| `Exsurge.Core.js` | geometry and unit primitives |
| `Exsurge.Playback.js` | `ChantPlayer`, `createPlayableChant` |
| `Exsurge.Playback.Timeline.js` | note → pulse extraction and the rhythm tables (pure) |
| `Exsurge.Playback.Instruments.js` | Web Audio instruments (`PianoInstrument`) |

TypeScript declarations are hand-maintained in `src/exsurge.d.ts`. They are checked by `npm run typecheck`, but they still cover only a fraction of the runtime exports — an undeclared export is an omission, not a signal that it is private.

## Development

```
npm run dev          # rollup watch, rebuilds on save
npm run build-dev    # one-off build, minified bundle included
npm run build        # same, and fails on any rollup warning
npm run lint         # eslint
npm run format       # prettier --write
npm run typecheck    # tsc over src/ and over the declarations
```

The toolchain is Rollup, ESLint 10 (flat config), Prettier and TypeScript in `checkJs` mode. There is no transpilation step: `src/` is bundled as authored.

`npm run build` writes `dist/exsurge.min.js` (UMD, minified), `dist/exsurge.mjs` (ES modules) and `dist/exsurge.js` (unminified UMD, for debugging).

**`dist/` is not tracked in git.** It used to be, and the whole directory is now gitignored — you never need to rebuild-and-commit alongside a `src/` change. A `prepare` script covers every case that previously required it: npm runs `prepare` on `npm install`, on installing this repo as a git dependency, and before `npm pack`/`npm publish`. Committing a 200 KB single-line minified bundle bought nothing that `prepare` does not, and cost a guaranteed merge conflict on any two branches that both touched `src/` — unresolvable by hand, since the only sane resolution is to discard both sides and rebuild.

If you need a prebuilt bundle without installing from npm — vendoring it into a page, say — take it from a [GitHub release](https://github.com/vagdur/exsurge/releases) rather than from the tree. That gives a stable URL pinned to a version, instead of one that moves under you whenever `master` does.

One constraint the build enforces deliberately: `rollup.config.mjs` has **no** `@rollup/plugin-node-resolve`, so every relative import in `src/` must keep its explicit `.js` extension. That is what the browser sandboxes below depend on, and leaving the plugin out turns a missing extension into a build failure rather than a demo that breaks after deploy.

`tsconfig.json` spells out the strictness flags that are still off, in the order they are worth turning on.

### Tests

```
npm test          # runs once and exits
npm run test:watch
```

Vitest specs live in `test/`, named `*.test.js`. They import `../src/index.js` directly, so a source change is visible without rebuilding.

The exception is `test/dist.test.js`, which loads the built `dist/exsurge.min.js` through `createRequire` on purpose. It needs `dist/` to exist, which `prepare` guarantees after any `npm install` or `npm ci`; run `npm run build` first if you have cleaned the directory by hand. It is the tripwire for any module-scope DOM access — if some module ever touches `document`, `window` or `AudioContext` while being loaded, requiring the bundle in a DOM-free node process breaks and nothing else in the suite would notice. Vitest runs with `environment: "node"` for the same reason; switching it to jsdom would silently disarm that.

To run a subset:

```
npx vitest run test/core.test.js -t "Latin"
```

### Browser sandboxes

`test/index.html` (layout and editing) and `test/playback.html` (playback, with settings controls) import `../src/index.js` as native ES modules, so **they need no build at all** — just a server, since module imports do not work over `file://`:

```
npx http-server -p 8080 -c-1 .
```

Then open `http://localhost:8080/test/playback.html`.

Because those pages need nothing but a static server, GitHub Pages serves them as they are: Pages is configured to publish `master` at `/`, so `test/playback.html` and `test/index.html` are live at [vagdur.github.io/exsurge](https://vagdur.github.io/exsurge/) (root `index.html` is a small landing page linking to both). Every push to `master` redeploys them, which also means a commit that breaks the sandbox pages breaks the public demo — there is no separate built artifact standing between the two. `.nojekyll` at the root keeps Pages from running the files through Jekyll.

### Releasing

`npm version <patch|minor|major>` validates, regenerates `CHANGELOG.md`, and pushes with tags. The changelog is generated from commit messages using the Angular convention, so commits should be written as `feat:`, `fix:`, and so on.

The release commit no longer carries a rebuilt bundle, which removes a trap worth knowing about if you ever reintroduce one: the rollup banner interpolates `pkg.version`, and `preversion` runs *before* npm rewrites `package.json`. A build in that hook is stamped with the outgoing version.

To attach bundles to the GitHub release, for anyone vendoring rather than installing:

```
npm run build && gh release create v1.26.0 dist/exsurge.min.js dist/exsurge.mjs --repo vagdur/exsurge --generate-notes
```

Publishing to npm is a separate, deliberate step — there is no `postpublish` automation:

```
npm publish
```

`publishConfig.access` is set to `public`, so a scoped package does not need `--access public` and cannot be published private by accident. `files` in `package.json` restricts the tarball to the two shipped bundles and their maps, `src/`, `assets/` and `CHANGELOG.md` (npm always adds `README.md`, `LICENSE` and `package.json`). Two things about that list are deliberate: `src/` has to stay in it because `types` points into it, and the bundles are named individually rather than as `dist` so that the unminified `dist/exsurge.js` debug build is not published. Check the contents before releasing:

```
npm pack --dry-run
```

## Credits and license

Originally written by Fr. Matthew Spencer, O.S.J. Maintained and substantially extended from 2016 onward by Benjamin Bloomfield, whose fork this one is based on, with contributions from Jacob Spizziri, Jenna Smith, and others. Anything in this repository beyond commit `0c39f61` is new work on top of theirs.

MIT — see [LICENSE](LICENSE).
