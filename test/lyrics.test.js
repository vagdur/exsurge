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

// The specs run without a DOM, so ChantContext picks the OpenTypeJS measuring
// strategy and needs a font dictionary. A real font would make the expected
// coordinates depend on its metrics; this stub is shaped like the slice of
// opentype.js that measureSubstringBBox uses and gives every glyph the same
// half-em advance, so a substring's width is proportional to its length.
function stubFontDictionary() {
  var advanceWidth = (text, fontSize) => text.length * fontSize * 0.5;

  return {
    Regular: {
      getAdvanceWidth: advanceWidth,
      getPath: (text, x, y, fontSize) => ({
        getBoundingBox: () => ({
          x1: x,
          y1: y - fontSize * 0.75,
          x2: x + advanceWidth(text, fontSize),
          y2: y + fontSize * 0.2
        })
      })
    }
  };
}

// lays a score out on a single line wide enough that nothing wraps, and
// returns the notations of that line in reading order
function layoutNotations(gabc, width = 800) {
  var ctxt = new Exsurge.ChantContext();
  // the stub implements only the two methods that get called, not all of
  // opentype.js's Font, so it cannot satisfy the declared dictionary type
  ctxt.fontDictionary = /** @type {any} */ (stubFontDictionary());

  var mappings = Exsurge.Gabc.createMappingsFromSource(ctxt, gabc);
  var score = new Exsurge.ChantScore(ctxt, mappings, false);

  score.performLayout(ctxt);
  score.layoutChantLines(ctxt, width, () => {});

  score.lines.length.should.equal(1);

  var line = score.lines[0];

  return {
    ctxt: ctxt,
    notations: score.notations.slice(
      line.notationsStartIndex,
      line.notationsStartIndex + line.numNotationsOnLine
    )
  };
}

function findByLyric(notations, text) {
  var found = notations.find(
    (notation) => notation.hasLyrics() && notation.lyrics[0].text === text
  );

  should.exist(found);

  return found;
}

describe("Lyric alignment", function () {
  // A syllable whose text runs over several words is a recitation: gabc hangs
  // all of the recited text off the single note carrying the reciting tone.
  // Gregorio centers such a syllable on the first vowel segment of the whole
  // text, which puts the note over the first word, so exsurge does too.
  var recitation =
    "(c3) Väl(d)sig(f)nad(e) är(d) Her(fh)ren,(h) Is(h)ra(h)els(h) Gud,(i) (:) som besöker sitt(hr0) folk(i) och(g) ger(g) det(g) fri(h)het.(f)";

  it("puts a reciting tone over the first word of its syllable", function () {
    var { ctxt, notations } = layoutNotations(recitation);

    var neume = findByLyric(notations, "som besöker sitt");
    var lyric = neume.lyrics[0];

    // the note sits inside "som" rather than out at "sitt"
    var firstWordRight = lyric.getLeft() + lyric.measureSubstring(ctxt, 3);

    neume.bounds.x.should.be.at.least(lyric.getLeft());
    neume.bounds.right().should.be.at.most(firstWordRight);
  });

  it("keeps a divider before a recitation out of the recited text", function () {
    var { notations } = layoutNotations(recitation);

    var before = findByLyric(notations, "Gud,");
    var recited = findByLyric(notations, "som besöker sitt");
    var divider = notations.find((notation) => notation.isDivider);

    should.exist(divider);

    // the divider belongs between the two syllables, not somewhere out in the
    // middle of "som besöker sitt"
    divider.bounds.x.should.be.above(before.bounds.right());
    divider.bounds.right().should.be.at.most(recited.lyrics[0].getLeft());
    divider.bounds.right().should.be.at.most(recited.bounds.x);
  });

  it("still centers a single word on its own vowel segment", function () {
    var { notations } = layoutNotations(recitation);

    var neume = findByLyric(notations, "Her");
    var lyric = neume.lyrics[0];

    neume.bounds.x.should.be.above(lyric.getLeft());
    neume.bounds.right().should.be.below(lyric.getRight());
  });
});
