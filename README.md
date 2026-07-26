# exsurge

A JavaScript library for rendering Gregorian chant in square note notation. It takes [gabc](http://gregorio-project.github.io/gabc/) as input and produces SVG (or canvas) output that you can drop into a page, an editor, or a print pipeline.

## Which exsurge is this?

**This is a third fork in a chain, and it is neither of the two repositories you are likely to find by searching.** There are three:

| | Repository | Status |
| --- | --- | --- |
| **Original** | [frmatthew/exsurge](https://github.com/frmatthew/exsurge) — Fr. Matthew Spencer, O.S.J. | Dormant since April 2017 |
| **Fork** | [bbloomf/exsurge](https://github.com/bbloomf/exsurge) — Benjamin Bloomfield | Active; the de facto mainline |
| **This repo** | [vagdur/exsurge](https://github.com/vagdur/exsurge) — Vilhelm Agdur | Newly branched from the above |

Fr. Spencer wrote the original and stopped committing in July 2016; that repository has seen no activity since April 2017 and has 191 commits. Benjamin Bloomfield forked it and has maintained it single-handedly for the decade since, authoring 703 of its 832 commits across 101 tagged releases from `v0.0.1` to `v1.25.2`. Essentially all of the neume shaping, layout, text handling, and rendering-backend work exists only in that fork.

**This repository is a new fork of Bloomfield's fork.** It branches from `bbloomf/exsurge` at tag `v1.25.2` (commit `0c39f61`) and, at the time of writing, is identical to it — zero commits ahead. That will change as work lands here; until it does, treat Bloomfield's repository as the source of truth for behaviour, and expect the two to diverge from this point forward.

GitHub records the two-hop chain explicitly: this repository's `parent` is `bbloomf/exsurge` and its `source` — the root of the fork tree — is `frmatthew/exsurge`. If you are reading a copy of this file somewhere else, that pair is the quickest way to tell which of the three you actually have.

> **Remotes.** One name here is a trap: `upstream` points at `frmatthew/exsurge`, the dormant *original* two hops up — **not** at the fork this one is based on. That naming was inherited from the clone and is easy to misread. The three remotes are:
>
> | Remote | Points at | Use |
> | --- | --- | --- |
> | `origin` | `vagdur/exsurge` | this fork; push here |
> | `bbloomf` | `bbloomf/exsurge` | mainline; pull ongoing work from here |
> | `upstream` | `frmatthew/exsurge` | the dormant original; historical interest only |
>
> To pick up Bloomfield's later work: `git fetch bbloomf && git merge bbloomf/master`. Note that this fork was created with the default branch only, so his topic branches exist under `bbloomf/*` rather than `origin/*`.

### Three things that follow from that

**Do not `npm install exsurge`.** That package is still at version 0.0.0, published in February 2016, owned by the original author, and pointing at the original repository. It predates essentially everything described here. Neither Bloomfield's fork nor this one is published to npm — `package.json` says `1.25.2`, but no such version exists on the registry. Install from git instead (see below).

**`package.json` metadata is inherited and wrong.** Its `repository`, `author`, `homepage`, and `bugs` fields still point at `frmatthew/exsurge`, two forks up. They survived Bloomfield's fork unchanged and they are not a statement about where this code lives or where issues should go. Updating them is a reasonable early commit for this fork.

**The old live demo is not this code.** The original README linked to `frmatthew.github.io/exsurge/chant.html`, a GitHub Pages build from the *original* repository — it serves a 2016/2017 bundle and describes itself as "the simplest of test pages." It reflects neither fork. For a substantial application built on this library, see **[jgabc](http://bbloomf.github.io/jgabc/)** ([source](https://github.com/bbloomf/jgabc)), a full gabc transcriber and chant editor by Bloomfield, which vendors the bundle from his fork.

## Installation

Because the npm package is stale, depend on a git repository directly — this fork once it has a home, or Bloomfield's mainline if you want his work without this fork's changes:

```
npm install github:vagdur/exsurge      # this fork
npm install github:bbloomf/exsurge     # the fork this one is based on
```

The built bundle `dist/exsurge.min.js` is committed to the repository, so a git install needs no build step. It is UMD, so it works as a CommonJS/AMD module or as a browser global named `exsurge`.

Be aware that `package.json` declares both `main` (`dist/exsurge.min.js`) and `module` (`src/index.js`). Bundlers that honour `module` will pull in the raw, untranspiled ES2015 source rather than the built bundle, so make sure `node_modules/exsurge/src` is within your transpilation scope — or import `dist/exsurge.min.js` explicitly. TypeScript declarations ship at `src/index.d.ts`.

To work on the library itself:

```
npm install
npm run build
```

## Usage

Create a `ChantContext` holding your render settings, parse gabc into mappings, build a `ChantScore`, lay it out, then emit SVG. In a browser the bundle exposes a global named `exsurge`; under Node or a bundler, `const exsurge = require("exsurge")`.

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

In a browser, prefer the asynchronous layout call, which chunks its work across timeouts instead of blocking the main thread:

```javascript
score.performLayoutAsync(ctxt, () => {
  score.layoutChantLines(ctxt, containerWidth, () => {
    container.appendChild(score.createSvgNode(ctxt));
  });
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
const exsurge = require("exsurge");

const ctxt = new exsurge.ChantContext(); // falls back to opentype.js measuring
const mappings = exsurge.Gabc.createMappingsFromSource(ctxt, gabc);
const score = new exsurge.ChantScore(ctxt, mappings, true);

score.performLayout(ctxt);
score.layoutChantLines(ctxt, 1000, () => {
  const tree = score.createSvgTree(ctxt); // { name: "svg", props, children }
});
```

Note that tree nodes carry back-references to the model objects that produced them, so they are not directly `JSON.stringify`-able; walk the `name`/`props`/`children` fields when serializing.

### Fonts

Special characters (℣, ℟, and similar) are rendered in a font family named `Exsurge Characters`. Ship `assets/fonts/ExsurgeChar.otf` with your application and declare a matching `@font-face`, or those glyphs will fall back to whatever the browser picks.

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
| `Exsurge.Text.js` | syllabification (Latin, English, Spanish) |
| `Exsurge.Core.js` | geometry and unit primitives |

TypeScript declarations are hand-maintained in `src/index.d.ts`.

## Development

```
npm run dev        # webpack watch, rebuilds dist/exsurge.js on save
npm run build-dev  # one-off unminified build
npm run build      # minified dist/exsurge.min.js
```

The toolchain is deliberately old — webpack 1, Babel 6 (`es2015` preset), and ESLint 1 run as a webpack loader. Source stays within what Babel 6 accepts: array spread and default parameters are fine, but there is no object spread, optional chaining, or async/await anywhere in `src/`.

### Tests

```
npm test
```

Mocha specs live in `test/`. Two things to know: the script runs mocha with `-w`, so it stays in watch mode rather than exiting, and the specs load `dist/exsurge.min.js` rather than `src/`, so **build before testing** or you will be testing a stale bundle. To run a subset once:

```
npx mocha --compilers js:babel-core/register ./test/index.js --grep "Latin"
```

### Releasing

`npm version <patch|minor|major>` builds, regenerates `CHANGELOG.md`, commits `dist/`, and pushes with tags. The changelog is generated from commit messages using the Angular convention, so commits should be written as `feat:`, `fix:`, and so on.

## Credits and license

Originally written by Fr. Matthew Spencer, O.S.J. Maintained and substantially extended from 2016 onward by Benjamin Bloomfield, whose fork this one is based on, with contributions from Jacob Spizziri, Jenna Smith, and others. Anything in this repository beyond commit `0c39f61` is new work on top of theirs.

MIT — see [LICENSE](LICENSE).
