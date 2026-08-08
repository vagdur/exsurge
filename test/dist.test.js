//
// Author(s):
// Fr. Matthew Spencer, OSJ <mspencer@osjusa.org>
//
// Copyright (c) 2008-2016 Fr. Matthew Spencer, OSJ
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

import { describe, it, chai } from "vitest";
import { createRequire } from "node:module";

chai.should();

// Every other spec imports src/ directly, which is what makes them useful
// while developing. This one is the exception on purpose: it loads the built
// UMD bundle the way a consumer does.
//
// createRequire rather than a plain import, so the bundle goes through node's
// CommonJS loader untouched instead of through vite's transform pipeline. That
// is the environment bbloomf/jgabc and any node consumer actually sees.
const require = createRequire(import.meta.url);

// The specifier is held in a variable so that it stays a runtime load. Written
// as a literal, tsc resolves it and pulls 200 KB of one-line minified output
// into the checkJs program, reporting every finding a second time against
// generated code that nobody edits. tsconfig's "exclude" does not help: it
// filters the include globs, not files reached by an import.
const distBundle = "../dist/exsurge.min.js";
const Exsurge = require(distBundle);

describe("dist bundle", function () {
  // If any module ever touches document, window or AudioContext at module
  // scope, requiring the bundle in a DOM-free node process breaks -- and
  // nothing else in the suite would notice, because vitest runs with
  // environment: "node" but the src/ specs never reach the DOM paths anyway.
  it("exposes the playback API without needing a browser", function () {
    Exsurge.ChantPlayer.should.be.a("function");
    Exsurge.createPlayableChant.should.be.a("function");
    Exsurge.createPlaybackEvents.should.be.a("function");
    Exsurge.PianoInstrument.should.be.a("function");
    Exsurge.resolveInstrument.should.be.a("function");
    Exsurge.PlaybackDefaults.should.be.an("object");
    Exsurge.PlaybackDurations.should.be.an("object");
    Exsurge.PlaybackRests.should.be.an("object");
    Exsurge.PlaybackVelocities.should.be.an("object");
    // Annotation ships in the bundle (and always has); the d.ts used to
    // declare it as a structural type, so this guards the runtime half of
    // that fix independently of the typecheck.
    Exsurge.Annotation.should.be.a("function");
  });

  // The bundle is committed and vendored downstream, so a silent change to its
  // shape matters. These are the properties the UMD wrapper is supposed to
  // guarantee, independent of which bundler produced it.
  it("keeps the whole public surface", function () {
    Object.keys(Exsurge).length.should.equal(139);
  });

  it("still renders without a DOM", function () {
    // No document, so ChantContext falls back to the OpenTypeJS text measuring
    // strategy. Parsing and updateNotations must work regardless.
    const ctxt = new Exsurge.ChantContext();
    const gabc = "(c4) Chris(ffg)tus(f.) *(,) fac(fg)tus(f) est(f) (::)";
    const mappings = Exsurge.Gabc.createMappingsFromSource(ctxt, gabc);
    const score = new Exsurge.ChantScore(ctxt, mappings, false);

    score.notes.length.should.be.above(0);
    Exsurge.createPlaybackEvents(score).events.length.should.be.above(0);
  });
});
