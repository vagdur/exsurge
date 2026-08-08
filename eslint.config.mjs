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
    // .claude/worktrees/ is a full nested checkout (Claude Code); without this,
    // `eslint .` walks it and reports hundreds of errors from the copy's src/
    // and dist/. Already in .git/info/exclude, but flat config does not read
    // gitignore / exclude — only this list.
    ignores: ["dist/**", "node_modules/**", ".claude/worktrees/**"]
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

      // Both were switched off in the old config and had never run against
      // this source.
      "no-undef": "error",
      "no-unused-vars": [
        "error",
        {
          args: "after-used",
          caughtErrors: "none",
          // A leading underscore marks a parameter that is deliberately
          // unused: it is part of a signature the caller or an overriding
          // subclass relies on, so it is documented rather than deleted.
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ]
    }
  },

  {
    files: ["test/**/*.js", "*.mjs", "scripts/**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.node }
    }
  },

  // Last, so it can switch off anything that would fight the formatter.
  prettier
];
