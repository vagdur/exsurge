import { readFileSync } from "node:fs";
import terser from "@rollup/plugin-terser";

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));

// pkg.version is read at build time, so this banner is why dist/ has to be
// rebuilt *after* npm rewrites package.json during a release -- see the
// "version" script, not "preversion".
//
// The copyright line mirrors LICENSE. For a vendored copy of this bundle the
// banner is the only notice that travels with the code, which is what MIT
// actually requires be preserved, so keep the two in step.
const banner =
  `/*! @vagdur/exsurge ${pkg.version} | ` +
  `(c) 2016 Fr. Matthew Spencer, OSJ; (c) 2026 Vilhelm Agdur | MIT | ` +
  `https://github.com/vagdur/exsurge */`;

// The UMD shape downstream depends on. bbloomf/jgabc vendors
// dist/exsurge.min.js and reads it as a global, so the name and the named AMD
// define both have to survive any bundler change.
const umd = {
  format: "umd",
  name: "exsurge",
  amd: { id: "exsurge" },
  exports: "named",
  sourcemap: true,
  banner
};

export default {
  input: "src/index.js",

  // There is deliberately no @rollup/plugin-node-resolve here, and it is not
  // only because src/ has zero runtime dependencies.
  //
  // test/index.html and test/playback.html are the public GitHub Pages demo
  // and they load src/index.js as native ES modules with no build step, so
  // every relative import in src/ must keep its explicit .js extension or the
  // browser's module loader cannot resolve it. Rollup's built-in resolver,
  // unlike webpack's and unlike node-resolve, refuses to guess a missing
  // extension -- so leaving it out turns that invariant into a build error
  // instead of a demo that silently breaks after deploy.
  //
  // Don't add node-resolve to "fix" an unresolved relative import. Add the
  // .js.
  plugins: [],

  onwarn(warning, warn) {
    // Exsurge.Chant.js is in a deliberate cycle with ChantLine, Gabc, Signs,
    // Markings and Neumes, and the export order in src/index.js is arranged
    // around it. The demo pages already load src/ as native ES modules, so
    // this evaluation order is proven under the same strict-ESM semantics
    // rollup preserves.
    if (warning.code === "CIRCULAR_DEPENDENCY") return;
    warn(warning);
  },

  output: [
    {
      ...umd,
      file: "dist/exsurge.min.js",
      plugins: [
        terser({
          // Exsurge.Drawing.js writes this.constructor.name into the class
          // attribute of every notation <g>. Under the old uglify build those
          // were mangled to single letters, which the source comment there
          // notes; keeping them makes the rendered SVG debuggable and makes
          // the bundle agree with the unminified demo pages for the first
          // time.
          keep_classnames: true,
          format: { comments: /^!/ }
        })
      ]
    },
    { ...umd, file: "dist/exsurge.js" },
    {
      // .mjs rather than .esm.js: package.json has no "type": "module", so a
      // .js file here is ambiguous and node parses it as CommonJS, fails, and
      // reparses it as ESM with a MODULE_TYPELESS_PACKAGE_JSON warning. The
      // .mjs extension settles it without needing "type": "module", which
      // would break the UMD bundle beside it.
      file: "dist/exsurge.mjs",
      format: "es",
      sourcemap: true,
      banner
    }
  ]
};
