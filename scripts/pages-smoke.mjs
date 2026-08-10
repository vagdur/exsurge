#!/usr/bin/env node
//
// Smoke-test the GitHub Pages demo the way a browser hits it.
//
// Pages publishes master from / as a project site at
// https://vagdur.github.io/exsurge/, so every local URL is under the
// /exsurge/ prefix. Serving from the repo root at / would let a root-absolute
// href="/src/..." look fine here and 404 in production — the server below
// mounts the tree at that prefix on purpose.
//
// The vitest suite and the rollup build already catch a missing .js extension
// on a relative import; this is the check that loads index.html,
// test/index.html and test/playback.html as real documents, follows their
// native ES module graph, and asserts each demo actually draws a score.

import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const basePath = "/exsurge";
const port = 4173;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".json": "application/json",
  ".map": "application/json",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

function assertNojekyll() {
  if (!existsSync(join(root, ".nojekyll"))) {
    throw new Error(
      "Missing .nojekyll at repo root — GitHub Pages would run Jekyll and can break the demo"
    );
  }
}

function resolveUnderRoot(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const rel = decoded === "/" ? "index.html" : decoded.replace(/^\//, "");
  const candidate = normalize(join(root, rel));
  const rootWithSep = root.endsWith(sep) ? root : root + sep;
  if (candidate !== root && !candidate.startsWith(rootWithSep)) {
    return null;
  }
  return candidate;
}

function startServer() {
  const server = createServer((req, res) => {
    const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
    let pathname = url.pathname;

    if (pathname === basePath || pathname === basePath + "/") {
      pathname = basePath + "/index.html";
    }

    if (!pathname.startsWith(basePath + "/")) {
      res.writeHead(404).end("not under /exsurge/");
      return;
    }

    const filePath = resolveUnderRoot(pathname.slice(basePath.length));
    if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
      res.writeHead(404).end("not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": mime[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(readFileSync(filePath));
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    throw new Error(
      "pages-smoke requires the playwright package. In CI the pages job installs it; locally run:\n" +
        "  npm install -D playwright && npx playwright install chromium"
    );
  }
}

/**
 * @param {import('playwright').Page} page
 * @param {string} path
 */
async function openPage(page, path) {
  const errors = [];
  const failedLocal = [];

  const onPageError = (err) => errors.push(String(err));
  const onRequestFailed = (request) => {
    const u = new URL(request.url());
    if (u.origin === `http://127.0.0.1:${port}`) {
      failedLocal.push(
        `${request.failure()?.errorText || "failed"} ${u.pathname}`
      );
    }
  };
  const onResponse = (response) => {
    const u = new URL(response.url());
    if (u.origin === `http://127.0.0.1:${port}` && response.status() >= 400) {
      failedLocal.push(`${response.status()} ${u.pathname}`);
    }
  };

  page.on("pageerror", onPageError);
  page.on("requestfailed", onRequestFailed);
  page.on("response", onResponse);

  const response = await page.goto(
    `http://127.0.0.1:${port}${basePath}${path}`,
    {
      waitUntil: "networkidle"
    }
  );

  return {
    status: response ? response.status() : 0,
    errors,
    failedLocal,
    dispose() {
      page.off("pageerror", onPageError);
      page.off("requestfailed", onRequestFailed);
      page.off("response", onResponse);
    }
  };
}

function assertOk(label, result) {
  if (result.status !== 200) {
    throw new Error(`${label}: expected HTTP 200, got ${result.status}`);
  }
  if (result.errors.length) {
    throw new Error(
      `${label}: page errors:\n  - ${result.errors.join("\n  - ")}`
    );
  }
  if (result.failedLocal.length) {
    throw new Error(
      `${label}: local asset failures:\n  - ${result.failedLocal.join("\n  - ")}`
    );
  }
}

async function main() {
  assertNojekyll();

  const { chromium } = await loadPlaywright();
  const server = await startServer();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    const landing = await openPage(page, "/");
    assertOk("landing page", landing);
    const demoHrefs = await page.$$eval("ul.demos a", (as) =>
      as.map((a) => a.getAttribute("href"))
    );
    for (const href of ["test/playback.html", "test/index.html"]) {
      if (!demoHrefs.includes(href)) {
        throw new Error(`landing page missing relative link to ${href}`);
      }
    }
    landing.dispose();

    for (const demoPath of ["/test/index.html", "/test/playback.html"]) {
      const result = await openPage(page, demoPath);
      assertOk(demoPath, result);
      await page.waitForSelector("#chant-container svg", { timeout: 15000 });
      const svgCount = await page.locator("#chant-container svg").count();
      if (svgCount < 1) {
        throw new Error(`${demoPath}: expected a rendered SVG score`);
      }
      result.dispose();
    }

    console.log("pages-smoke ok: landing + both demos render under /exsurge/");
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
