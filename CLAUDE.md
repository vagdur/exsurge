# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

exsurge is a JavaScript library that renders Gregorian chant in square note notation, taking [gabc](http://gregorio-project.github.io/gabc/) notation as input and emitting SVG or canvas output.

**Lineage — three repos, and this is the third.** `frmatthew/exsurge` is the original (Fr. Matthew Spencer, dormant since April 2017, 191 commits). `bbloomf/exsurge` is Benjamin Bloomfield's fork of it — the de facto mainline, 703 of its 832 commits his, 101 tagged releases, and where essentially all current functionality lives. **This repo is `vagdur/exsurge`, a new fork of Bloomfield's fork**, branched at tag `v1.25.2` (commit `0c39f61`).

Three remotes are configured but they point at only two repos: `origin` → `vagdur/exsurge` (this fork), and **both** `bbloomf` and `upstream` → `bbloomf/exsurge` (the mainline this is based on; fetch from either to pick up Bloomfield's ongoing work). There is no remote for the dormant original `frmatthew/exsurge` at all, so `upstream` here means the *parent fork*, not the root of the lineage. Bloomfield's topic branches live under `bbloomf/*`; `origin/*` has only `master`, since the fork was created with the default branch only.

**Pass `--repo vagdur/exsurge` to every `gh` command.** GitHub records `vagdur/exsurge` as a fork of `bbloomf/exsurge`, and no default repo is configured, so bare `gh` commands resolve against *Bloomfield's* repo instead of this one. The failure is confusing rather than obvious: `gh pr create` rejects a perfectly good branch with `No commits between master and <branch>`, and `gh pr list` / `gh pr view` quietly report on Bloomfield's PRs, so a PR that exists here looks like it does not.

```bash
gh pr create --repo vagdur/exsurge --base master --head <branch>
```

Running `gh repo set-default vagdur/exsurge` once would record the choice in git config and make the bare commands work, but it has not been done — don't assume it has.

If the working tree is at or near `0c39f61` with no local commits, this fork has not diverged yet and Bloomfield's repo is still the behavioural source of truth.

**Not published to npm.** The `exsurge` package on npm is still version 0.0.0 from February 2016, owned by the original author — neither fork publishes. `package.json` here says `1.25.2`, but that version has never been on the registry, and its `repository`, `author`, `homepage`, and `bugs` fields still point at `frmatthew/exsurge` two hops up; they are inherited metadata, not provenance. Consumers install from git or vendor the committed `dist/exsurge.min.js`. The main downstream consumer is `bbloomf/jgabc` (live at bbloomf.github.io/jgabc), which vendors the bundle rather than depending on it via npm.

## Commands

- `npm run build` — production build (webpack + uglify → `dist/exsurge.min.js`)
- `npm run build-dev` — unminified build → `dist/exsurge.js`
- `npm run dev` — watch mode, rebuilds on save
- `npm test` — mocha tests in `test/`. Note: the script runs mocha with `-w` (watch mode), so it does not exit on its own. Tests require `dist/exsurge.min.js` to exist (they `require('../dist/exsurge.min.js')`), so build first if the dist is stale.
- Releases: `npm version <patch|minor|major>` — the preversion/version/postversion hooks build, regenerate `CHANGELOG.md` (conventional-changelog, angular preset), commit `dist/`, and push with tags. Commit messages follow Conventional Commits (`feat:`, `fix:`) since the changelog is generated from them.

**GitHub Pages publishes `master` at `/`, so `test/` is public.** The demo site is [vagdur.github.io/exsurge](https://vagdur.github.io/exsurge/) — root `index.html` is a landing page linking to `test/playback.html` and `test/index.html`, and those pages are served exactly as they sit in the tree, importing `src/index.js` as native ES modules with no build step. Consequences: any push to `master` redeploys the demo within a minute or two, a commit that breaks the sandbox pages breaks the public demo, and every relative import in `src/` must keep its explicit `.js` extension or the browser's module loader (unlike webpack) will fail to resolve it. `.nojekyll` at the root disables Jekyll processing. There is no Pages workflow in `.github/`; the branch-and-path setting on the repository is the whole mechanism, and the stale `gh-pages` branch on `bbloomf`/`upstream` is unrelated to it.

Toolchain is old: webpack 1, Babel 6 (`es2015` preset + `add-module-exports`), ESLint 1 run as a webpack loader during builds. Source is ES2015 modules and stays within what Babel 6 handles — array spread and default parameters appear, but there is no object spread, optional chaining, or async/await anywhere in `src/`. Don't introduce those without verifying the build. Formatting follows `.prettierrc` (2 spaces, no trailing commas), though most files predate it and are only partially formatted.

## Architecture

All source is in `src/`, re-exported flat from `src/index.js` (so everything is on the single `exsurge` UMD namespace). TypeScript declarations are hand-maintained in `src/index.d.ts` — update them when changing public APIs.

The rendering pipeline is: **gabc text → parse → notation elements → layout → SVG**.

1. **Parsing** (`Exsurge.Gabc.js`): the `Gabc` class statically parses gabc source into words/syllables/notation atoms and produces an array of `ChantMapping` objects (source text ↔ notation elements). `GabcHeader` handles gabc headers. Entry point: `Gabc.createMappingsFromSource(ctxt, gabcSource)`.

2. **Chant model** (`Exsurge.Chant.js`): `ChantScore` holds the mappings and drives everything; `Note`, `Clef` variants (`DoClef`, `FaClef`, ...), `TextOnly`, `ChantLineBreak`. `ChantScore.updateNotations(ctxt)` flattens mappings into a notation list and finds the starting clef.
   - `Exsurge.Chant.Neumes.js`: all neume classes (`Punctum`, `Podatus`, `Clivis`, `Torculus`, `Salicus`, ...) extending `Neume`, each knowing how to position its notes/glyphs.
   - `Exsurge.Chant.Signs.js`: dividers/bars, `Custos`, `Accidental`, `InsertionCursor`.
   - `Exsurge.Chant.Markings.js`: episemata, ictus, mora, braces.
   - `Exsurge.Chant.ChantLine.js`: `ChantLine` — a single rendered system/staff line; contains the line-breaking and justification logic.
   - `Exsurge.Titles.js`: title/subtitle block above the score.

3. **Drawing** (`Exsurge.Drawing.js`, the largest file): `ChantContext` is the god object holding all rendering settings (fonts, staff height, glyph scaling, colors, `TextMeasuringStrategy`); nearly every method in the codebase takes `ctxt` as first argument. `ChantLayoutElement` is the base class for everything drawable; `ChantNotationElement` extends it for on-staff elements. Visualizer classes (`GlyphVisualizer`, `NeumeLineVisualizer`, ...) and text elements (`Lyric`, `DropCap`, `Annotation`, `TranslationText`, ...) live here. `QuickSvg` is the low-level SVG factory.

   Drawable classes implement a parallel set of output methods, and adding a new element type generally means implementing all of them: `createSvgNode(ctxt)` builds real DOM SVG nodes, `createSvgTree(ctxt)` builds plain `{name, props, children}` objects (what non-DOM consumers like React, React Native, or server-side rendering use), `createSvgFragment(ctxt)` returns SVG source strings, and `draw(ctxt)` renders to an HTML canvas via `ctxt.canvasCtxt`. Canvas output is a real second backend, not a leftover.

   The set is not uniform at the top level: `ChantScore` itself implements only `createSvgNode`, `createSvgTree`, and `draw` — it has no `createSvgFragment` (verified at runtime against `dist/`). `createSvgFragment` is implemented on the leaf visualizers and text elements, where `QuickSvg.createFragment` builds the string. Check the specific class rather than assuming all four exist.

   `createSvgTree` output is not directly `JSON.stringify`-able: nodes carry back-references to the model objects that produced them, so a naive stringify hits a circular structure.

4. **Glyphs** (`Exsurge.Glyphs.js`, `greextraGlyphs.js`): generated tables of SVG path data + bounds/origin per glyph (from the ExsurgeChar font in `assets/fonts/`). Treat these as data; hand-edits are rare and deliberate.

Supporting modules: `Exsurge.Core.js` (geometry primitives `Point`/`Rect`/`Margins`/`Size`, `Units`, `Pitch`/`Step`), `Exsurge.Text.js` (per-language syllabification: `Latin`, `English`, `Spanish`), `addAccent.js`/`makeLigature.js` (small vowel helpers).

Typical client flow: create a `ChantContext` → `Gabc.createMappingsFromSource(ctxt, gabc)` → `new ChantScore(ctxt, mappings, useDropCap)` → lay out → emit SVG with `score.createSvgNode(ctxt)` or `score.createSvgTree(ctxt, zoom)`.

Layout is two-phase and worth understanding before touching either half. `performLayout(ctxt, force)` positions each notation in isolation (its own glyphs, lyrics, and markings) with no knowledge of page width; `layoutChantLines(ctxt, width, finishedCallback)` then packs those notations into `ChantLine` systems for a concrete width, which is where line breaking, justification, and custos placement happen. On a width change (e.g. a window resize) only the second phase needs to re-run.

`performLayout` is synchronous and blocks; `performLayoutAsync(ctxt, finishedCallback)` chunks work across timeouts and is the right choice in a browser.

The README was rewritten in July 2026 and its examples are verified to run; earlier copies of it (and anything derived from upstream's README) documented `score.performLayout(ctxt, callback)` and `score.createDrawable(ctxt)`, neither of which is real — `createDrawable` does not exist anywhere in the codebase.

The score also carries editor-oriented state (element selection, insertion cursor via `ChantScore.updateSelection`) used by downstream editor apps (e.g. bbloomf's chant editor) — preserve this API when refactoring.
