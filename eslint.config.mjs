import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";

// Replaces a 213-line .eslintrc written for ESLint 1. That file could not be
// ported rule by rule: ten of the rules it named no longer exist and modern
// ESLint refuses to start on an unknown rule name (no-negated-in-lhs,
// no-empty-label, space-after-keywords, space-before-keywords,
// space-return-throw-case, no-arrow-condition, prefer-reflect,
// no-native-reassign, no-catch-shadow, plus no-magic-number, which was a typo
// for no-magic-numbers and had therefore never done anything). Five more moved
// out of core into eslint-plugin-n; src/ contains no node code, so they are
// dropped rather than replaced. The rest were formatting rules that Prettier
// now owns.
export default [
  {
    ignores: ["dist/**", "node_modules/**"]
  },

  js.configs.recommended,

  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2019,
      sourceType: "module",
      globals: {
        ...globals.browser,
        // src/Exsurge.Playback.js falls back to the prefixed constructor.
        webkitAudioContext: "readonly"
      }
    },
    rules: {
      // Carried forward from .eslintrc: rules it enabled that still exist,
      // are not already in js.configs.recommended, and are not formatting.
      "accessor-pairs": "error",
      eqeqeq: "error",
      "guard-for-in": "error",
      "no-alert": "error",
      "no-caller": "error",
      "no-div-regex": "error",
      "no-eq-null": "error",
      "no-eval": "error",
      "no-extend-native": "error",
      "no-extra-bind": "error",
      "no-implied-eval": "error",
      "no-iterator": "error",
      "no-label-var": "error",
      "no-lone-blocks": "error",
      "no-new": "error",
      "no-new-func": "error",
      "no-new-wrappers": "error",
      "no-octal-escape": "error",
      "no-proto": "error",
      "no-return-assign": "error",
      "no-script-url": "error",
      "no-self-compare": "error",
      "no-undef-init": "error",
      "no-unused-expressions": "error",
      "no-useless-call": "error",
      "no-useless-concat": "error",
      "no-void": "error",

      // The old config switched this off, so it had never run against this
      // source. It reports nothing, which is why it goes straight to error.
      "no-undef": "error",

      // Also switched off before. 40 findings, all unused function
      // parameters; cleared and promoted to error in the next commit.
      "no-unused-vars": ["warn", { args: "after-used", caughtErrors: "none" }]
    }
  },

  {
    // Rules that arrive with js.configs.recommended and have never run against
    // this source either. Downgraded to warn only so that this commit leaves
    // `npm run lint` green and reviewable; the next commit fixes every one of
    // them and removes this block.
    files: ["src/**/*.js"],
    rules: {
      "no-useless-assignment": "warn",
      "no-prototype-builtins": "warn",
      "no-useless-escape": "warn",
      "no-misleading-character-class": "warn"
    }
  },

  {
    files: ["test/**/*.js", "*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.node }
    }
  },

  // Last, so it can switch off anything that would fight the formatter.
  prettier
];
