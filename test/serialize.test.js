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
import * as Exsurge from "../src/index.js";

var should = chai.should();

var GABC = "(c4) Ky(e)ri(e)e(e) e(e)le(e)i(e)son(e.)";

describe("ChantScore.unserializeFromJson", function () {
  it("populates mappings and notations from gabc in the payload", function () {
    var ctxt = new Exsurge.ChantContext();
    var score = new Exsurge.ChantScore();

    score.unserializeFromJson(
      {
        "auto-coloring": true,
        annotation: "",
        notations: GABC
      },
      ctxt
    );

    score.mappings.length.should.be.above(0);
    score.notations.length.should.be.above(0);
    score.hasLyrics.should.equal(true);
    score.startingClef.should.be.instanceof(Exsurge.DoClef);
  });

  it("applies drop-cap from the payload", function () {
    var ctxt = new Exsurge.ChantContext();
    var score = new Exsurge.ChantScore();

    score.unserializeFromJson(
      {
        "auto-coloring": true,
        annotation: "",
        "drop-cap": "auto",
        notations: GABC
      },
      ctxt
    );

    score.useDropCap.should.equal(true);
    should.exist(score.dropCap);
  });

  it("leaves drop-cap off when the payload does not request it", function () {
    var ctxt = new Exsurge.ChantContext();
    var score = new Exsurge.ChantScore();

    score.unserializeFromJson(
      {
        "auto-coloring": true,
        annotation: "",
        notations: GABC
      },
      ctxt
    );

    score.useDropCap.should.equal(false);
    should.equal(score.dropCap, null);
  });
});
