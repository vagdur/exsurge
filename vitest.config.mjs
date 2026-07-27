import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Set explicitly rather than left to the default, because the DOM-free
    // environment is load bearing. Exsurge.Drawing.js keys off
    //   const canAccessDOM = typeof document !== "undefined";
    // and ChantContext's constructor uses it to pick a text measuring
    // strategy. Switching this to jsdom would silently disarm the module-scope
    // DOM tripwire in dist.test.js and change which code path the specs
    // exercise.
    environment: "node",

    // test/ is served publicly by GitHub Pages and holds the two demo HTML
    // pages alongside the specs, so match the suffix rather than everything.
    include: ["test/**/*.test.js"]
  }
});
