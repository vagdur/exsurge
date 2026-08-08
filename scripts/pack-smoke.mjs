#!/usr/bin/env node
//
// Installs the packed tarball into a throwaway project and checks that a real
// consumer can load it. The vitest suite imports src/ directly, so nothing
// there exercises the "exports" map, the "files" allowlist, or the published
// declarations — this is the check that does.
//
// CJS and ESM surfaces are compared to each other (not to a hardcoded count):
// a broken exports map that resolves import to the minified UMD typically
// yields a bare `default` under ESM, which shows up here as a key mismatch.

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    ...opts
  });
}

function sortedKeys(obj) {
  return Object.keys(obj).sort();
}

function assertSameKeys(a, b, labelA, labelB) {
  const onlyA = a.filter((k) => !b.includes(k));
  const onlyB = b.filter((k) => !a.includes(k));
  if (onlyA.length || onlyB.length) {
    const parts = [];
    if (onlyA.length) parts.push(`only in ${labelA}: ${onlyA.join(", ")}`);
    if (onlyB.length) parts.push(`only in ${labelB}: ${onlyB.join(", ")}`);
    throw new Error(`Export surface mismatch — ${parts.join("; ")}`);
  }
}

const tarballName = run(npm, ["pack", "--silent"]).trim();
const tarball = join(root, tarballName);
const consumer = mkdtempSync(join(tmpdir(), "exsurge-pack-"));

try {
  run(npm, ["init", "-y"], {
    cwd: consumer,
    stdio: ["ignore", "ignore", "inherit"]
  });
  run(npm, ["install", tarball], {
    cwd: consumer,
    stdio: ["ignore", "ignore", "inherit"]
  });

  const require = createRequire(join(consumer, "package.json"));
  const cjs = require("@vagdur/exsurge");
  if (typeof cjs.ChantContext !== "function") {
    throw new Error("CJS: ChantContext is not a constructor");
  }

  // Load ESM through a tiny module inside the consumer project so the bare
  // specifier goes through that project's node_modules and the package exports
  // map (the failure mode this script exists to catch).
  const loader = join(consumer, "load-esm.mjs");
  writeFileSync(
    loader,
    'import * as e from "@vagdur/exsurge";\nexport default e;\n'
  );
  const { default: esm } = await import(pathToFileURL(loader).href);
  if (typeof esm.ChantContext !== "function") {
    throw new Error(
      "ESM: named exports missing — check the package exports map"
    );
  }

  assertSameKeys(sortedKeys(cjs), sortedKeys(esm), "CJS", "ESM");

  require.resolve("@vagdur/exsurge/assets/fonts/ExsurgeChar.otf");

  console.log(
    `pack-smoke ok: ${sortedKeys(cjs).length} exports via CJS and ESM`
  );
} finally {
  rmSync(consumer, { recursive: true, force: true });
  rmSync(tarball, { force: true });
}
