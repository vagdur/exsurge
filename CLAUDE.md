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

**Published to npm as `@vagdur/exsurge`.** The scope matters: unscoped `exsurge` is a different package — version 0.0.0 from February 2016, owned by the original author, not controlled by either fork. Bloomfield's mainline is not on the registry at all, so there is no unscoped package anywhere that corresponds to current code.

Two consequences for editing:

- **The package name is written into `src/exsurge.d.ts`**, which wraps every declaration in `declare module "@vagdur/exsurge"`. `types` points at that file, so if the package is ever renamed the string has to move with it or consumers silently get no types at all.
- **`package.json` has a `files` allowlist.** A new top-level directory that consumers need at runtime will not be published unless it is added there. `src/` is in the list only because `types` resolves into it. The bundles are listed as four individual paths rather than as `dist`, so that the unminified `dist/exsurge.js` debug build stays out of the tarball — with `dist/` gitignored wholesale, a bare `dist` entry sweeps it in.
- **There is an `exports` map, and it is load-bearing.** `import` must resolve to `dist/exsurge.mjs` and `require` to `dist/exsurge.min.js`. Node ignores `module`, so if the map is removed, `import` falls back to `main` — the minified UMD — and `cjs-module-lexer` cannot recover named exports from it, leaving consumers with a bare `default` and a confusing `ChantContext is not a constructor`. The map also gates subpaths: `./assets/*`, `./dist/*`, `./src/*` and `./package.json` are listed explicitly, and anything not listed becomes unreachable to consumers.

Neither of these is exercised by `npm test`, which imports `src/` directly. The check that catches them is `npm run test:pack` (`scripts/pack-smoke.mjs`): it packs, installs the tarball into a throwaway project, and asserts that CJS and ESM expose the same named surface through the exports map.

Version numbering is continuous with Bloomfield's tags rather than with the registry: the fork branched at his `v1.25.2` and kept the number, so the first npm release starts there despite being the package's first version. Publishing is manual (`npm publish`) and deliberately not wired into the `npm version` hooks. `publishConfig.access` is `public`.

Consumers can equally install from git — npm runs `prepare`, so the bundle is built during install — or vendor a bundle from a GitHub release. The main downstream consumer is `bbloomf/jgabc` (live at bbloomf.github.io/jgabc), which vendors the bundle from *Bloomfield's* fork rather than depending on it via npm, so nothing downstream of this repository is affected by `dist/` no longer being tracked here.

## Commands

- `npm run build` — rollup, writes `dist/exsurge.min.js` (UMD, minified), `dist/exsurge.mjs` (ESM) and `dist/exsurge.js` (unminified UMD). Fails on any rollup warning.
- `npm run build-dev` — same without `--failAfterWarnings`; `npm run dev` — watch mode.
- `npm test` — vitest, runs once and exits. `npm run test:watch` to watch. Specs import `src/` directly, so no build is needed first — except `test/dist.test.js`, which loads the built bundle on purpose and therefore needs `dist/` to exist (`prepare` guarantees that after any install). `test/dist.test.js` compares the bundle's export names to `src/index.js` rather than pinning a count.
- `npm run test:pack` — pack, install into a throwaway project, and assert CJS/ESM resolve through the exports map with the same named surface. This is what the CI `pack` job runs.
- `npm run lint` / `npm run format` / `npm run typecheck` — eslint, prettier, tsc. CI runs these once in a `static` job; the Node 20/22 matrix only runs `npm test`.
- **`dist/` is gitignored — do not commit it, and do not add build output to a `src/` change.** It was tracked until the change that added this line, which is why older commits pair every `src/` edit with a rebuilt bundle and why the history is full of conflicts in `dist/exsurge.min.js`. A `prepare` script (`npm run build`) now covers the three cases that mattered: npm runs it on `npm install`/`npm ci`, on installing this repo as a git dependency, and before `npm pack`/`npm publish`. There is no longer a `dist-freshness` CI job, because there is no stored copy that can go stale.
- Releases: `npm version <patch|minor|major>` — the preversion/version/postversion hooks validate, regenerate `CHANGELOG.md` (conventional-changelog, angular preset), and push with tags. Commit messages follow Conventional Commits (`feat:`, `fix:`) since the changelog is generated from them. Bundles are attached to GitHub releases by hand (`gh release create <tag> dist/exsurge.min.js dist/exsurge.mjs`) for anyone vendoring rather than installing.

  If you ever put a build back into a version hook, note that the rollup banner interpolates `pkg.version` and `preversion` runs *before* npm rewrites `package.json` — a build there is stamped with the outgoing version and the release ships a bundle one version behind.

**GitHub Pages publishes `master` at `/`, so `test/` is public.** The demo site is [vagdur.github.io/exsurge](https://vagdur.github.io/exsurge/) — root `index.html` is a landing page linking to `test/playback.html` and `test/index.html`, and those pages are served exactly as they sit in the tree, importing `src/index.js` as native ES modules with no build step. Consequences: any push to `master` redeploys the demo within a minute or two, a commit that breaks the sandbox pages breaks the public demo, and every relative import in `src/` must keep its explicit `.js` extension or the browser's module loader will fail to resolve it (the rollup config is set up so this fails the build too). `.nojekyll` at the root disables Jekyll processing. There is no Pages workflow in `.github/`; the branch-and-path setting on the repository is the whole mechanism, and the stale `gh-pages` branch on `bbloomf`/`upstream` is unrelated to it.

Toolchain: Rollup, ESLint 10 (flat config in `eslint.config.mjs`), Prettier, TypeScript in `checkJs` mode, Vitest. **There is no transpilation step** — `src/` is bundled as authored, so whatever syntax you write ships. The real floor is ES2019, set by `Array.prototype.flatMap` in `Exsurge.Chant.ChantLine.js` and by the demo pages loading `src/` as native ES modules.

`rollup.config.mjs` deliberately omits `@rollup/plugin-node-resolve` so that a relative import missing its `.js` extension fails the build instead of breaking the Pages demo silently. Don't add it.

The whole tree is Prettier-formatted and `npm run format:check` runs in CI; markdown is excluded in `.prettierignore` because Prettier reflows fenced code blocks. A whole-tree reformat sits in history and is listed in `.git-blame-ignore-revs` — run `git config blame.ignoreRevsFile .git-blame-ignore-revs` once locally.

`npm run typecheck` must stay green. Eight files carry `// @ts-nocheck` with a note giving the finding count and reason (`grep -rl "@ts-nocheck" src/ test/`); almost all of it is properties assigned to instances outside the constructor, which JS cannot declare without changing runtime behaviour. `tsconfig.json` lists the strictness flags still switched off, in the order they are worth enabling.

## Architecture

All source is in `src/`, re-exported flat from `src/index.js` (so everything is on the single `exsurge` UMD namespace). TypeScript declarations are hand-maintained in `src/exsurge.d.ts` — update them when changing public APIs. The filename matters: as `src/index.d.ts` it shadowed `src/index.js` in TypeScript's resolution order, so the declarations and the implementation were never checked against each other, which is how they came to declare members that did not exist. They cover roughly 25 of the runtime exports, so an undeclared export is an omission rather than a signal that it is private.

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

Supporting modules: `Exsurge.Core.js` (geometry primitives `Point`/`Rect`/`Margins`/`Size`, `Units`, `Pitch`/`Step`), `Exsurge.Text.js` (per-language syllabification: `Latin`, `English`, `Spanish`, `Swedish`), `addAccent.js`/`makeLigature.js` (small vowel helpers).

Typical client flow: create a `ChantContext` → `Gabc.createMappingsFromSource(ctxt, gabc)` → `new ChantScore(ctxt, mappings, useDropCap)` → lay out → emit SVG with `score.createSvgNode(ctxt)` or `score.createSvgTree(ctxt, zoom)`.

Layout is two-phase and worth understanding before touching either half. `performLayout(ctxt, force)` positions each notation in isolation (its own glyphs, lyrics, and markings) with no knowledge of page width; `layoutChantLines(ctxt, width, finishedCallback)` then packs those notations into `ChantLine` systems for a concrete width, which is where line breaking, justification, and custos placement happen. On a width change (e.g. a window resize) only the second phase needs to re-run.

`performLayout` is synchronous and blocks; `performLayoutAsync(ctxt, finishedCallback)` chunks work across timeouts and is the right choice in a browser.

The README was rewritten in July 2026 and its examples are verified to run; earlier copies of it (and anything derived from upstream's README) documented `score.performLayout(ctxt, callback)` and `score.createDrawable(ctxt)`, neither of which is real — `createDrawable` does not exist anywhere in the codebase.

The score also carries editor-oriented state (element selection, insertion cursor via `ChantScore.updateSelection`) used by downstream editor apps (e.g. bbloomf's chant editor) — preserve this API when refactoring.
