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

function buildScore(gabc) {
  var ctxt = new Exsurge.ChantContext();
  // the stub implements only the two methods that get called, not all of
  // opentype.js's Font, so it cannot satisfy the declared dictionary type
  ctxt.fontDictionary = /** @type {any} */ (stubFontDictionary());

  var mappings = Exsurge.Gabc.createMappingsFromSource(ctxt, gabc);
  var score = new Exsurge.ChantScore(ctxt, mappings, false);

  score.performLayout(ctxt);

  return { ctxt: ctxt, score: score };
}

function notationsOnLine(score, line) {
  return score.notations.slice(
    line.notationsStartIndex,
    line.notationsStartIndex + line.numNotationsOnLine
  );
}

// lays a score out on a single line wide enough that nothing wraps, and
// returns the notations of that line in reading order
function layoutNotations(gabc, width = 800) {
  var { ctxt, score } = buildScore(gabc);

  score.layoutChantLines(ctxt, width, () => {});

  score.lines.length.should.equal(1);

  return { ctxt: ctxt, notations: notationsOnLine(score, score.lines[0]) };
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

describe("Recitation line breaking", function () {
  // Three long recitations. On a wide enough staff each is one syllable on one
  // reciting tone; narrow the staff and the recited text has to break, which
  // is where exsurge parts company with Gregorio and supplies a reciting tone
  // of its own at the start of each continuation.
  var gabc =
    "(c4) Ä(f)ra(g) vare Fadern, och Sonen, och den Helige Ande,(hr0) (,) " +
    "såsom det var av begynnelsen, nu är, och skall vara,(hr0) " +
    "från evighet till evighet(hr0) A(g)men.(h)";

  var recitedText = [
    "vare Fadern, och Sonen, och den Helige Ande,",
    "såsom det var av begynnelsen, nu är, och skall vara,",
    "från evighet till evighet"
  ];

  function layoutAt(width) {
    var { ctxt, score } = buildScore(gabc);

    score.layoutChantLines(ctxt, width, () => {});

    return { ctxt: ctxt, score: score };
  }

  // every notation on every line, tagged with the line it landed on, so a
  // whole layout can be compared with another one
  function snapshot(score) {
    return score.lines
      .map((line, index) =>
        notationsOnLine(score, line)
          .map((notation) =>
            [
              index,
              notation.constructor.name,
              notation.bounds.x.toFixed(3),
              notation.hasLyrics() ? notation.lyrics[0].text : ""
            ].join("|")
          )
          .join("\n")
      )
      .join("\n");
  }

  function recitationTones(score) {
    return score.notations.filter((notation) => notation.isRecitationTone);
  }

  it("leaves a recitation alone when it fits on the line", function () {
    var { score } = layoutAt(1200);

    score.lines.length.should.equal(1);
    recitationTones(score).length.should.equal(3);
    score.notations
      .filter((notation) => notation.isRecitationContinuation)
      .length.should.equal(0);
    recitationTones(score)
      .map((notation) => notation.lyrics[0].text)
      .should.deep.equal(recitedText);
  });

  it("breaks the recited text and repeats the reciting tone", function () {
    var { score } = layoutAt(220);

    var continuations = score.notations.filter(
      (notation) => notation.isRecitationContinuation
    );

    continuations.length.should.be.above(0);

    // every continuation is itself a reciting tone, at the pitch of the
    // syllable it continues, and starts a line
    for (var continuation of continuations) {
      continuation.isRecitationTone.should.equal(true);
      continuation.line.notationsStartIndex.should.equal(
        score.notations.indexOf(continuation)
      );
    }

    // nothing of the text is lost or duplicated in the breaking
    var recited = recitationTones(score).map(
      (notation) => notation.lyrics[0].text
    );
    var rejoined = [];
    var next = 0;
    for (var text of recited) {
      if (recitedText[next].startsWith(text)) rejoined.push(text);
      else {
        rejoined[rejoined.length - 1] += " " + text;
        continue;
      }
      if (rejoined[rejoined.length - 1] === recitedText[next]) next++;
    }
    rejoined.join(" ").should.equal(recitedText.join(" "));
  });

  it("repeats the pitch of the syllable it continues", function () {
    var { score } = layoutAt(220);

    var notations = score.notations;
    for (var i = 0; i < notations.length; i++) {
      if (!notations[i].isRecitationContinuation) continue;

      // the notation before a continuation is the recitation it belongs to,
      // whether that is the syllable as written or an earlier continuation
      var previous = notations[i - 1];
      previous.isRecitationTone.should.equal(true);
      notations[i].notes[0].staffPosition.should.equal(
        previous.notes[0].staffPosition
      );
      notations[i].notes[0].shapeModifiers.should.equal(
        previous.notes[0].shapeModifiers
      );
    }
  });

  it("keeps the recited text inside the staff", function () {
    // the whole point of breaking the text: unbroken, a recitation this long
    // runs off the right hand end of a narrow staff
    var width = 220;
    var { score } = layoutAt(width);

    for (var line of score.lines)
      for (var notation of notationsOnLine(score, line))
        for (var lyric of notation.lyrics)
          if (lyric)
            lyric
              .getRight()
              .should.be.at.most(
                width,
                JSON.stringify(lyric.text) + " runs past the end of the staff"
              );
  });

  it("lays out the same after a resize as it does from scratch", function () {
    var { ctxt, score } = buildScore(gabc);
    var widths = [400, 300, 220, 1200, 300, 220];

    for (var width of widths) {
      score.layoutChantLines(ctxt, width, () => {});
      snapshot(score).should.equal(
        snapshot(layoutAt(width).score),
        "relayout at width " + width + " differs from a fresh layout"
      );
    }
  });

  it("puts the syllables back together when the staff widens", function () {
    var { ctxt, score } = buildScore(gabc);

    score.layoutChantLines(ctxt, 220, () => {});
    score.notations
      .filter((notation) => notation.isRecitationContinuation)
      .length.should.be.above(0);

    score.layoutChantLines(ctxt, 1200, () => {});
    score.notations
      .filter((notation) => notation.isRecitationContinuation)
      .length.should.equal(0);
    recitationTones(score)
      .map((notation) => notation.lyrics[0].text)
      .should.deep.equal(recitedText);
    score.notations
      .every((notation, index) => notation.notationIndex === index)
      .should.equal(true);
  });

  it("does not add the repeated reciting tones to playback", function () {
    var wide = layoutAt(1200);
    var narrow = layoutAt(220);

    narrow.score.notations
      .filter((notation) => notation.isRecitationContinuation)
      .length.should.be.above(0);

    var notesOf = (score) =>
      Exsurge.createPlaybackEvents(score, {})
        .events.filter((event) => event.kind === "note")
        .map((event) => [event.noteIndex, event.pitchInt]);

    notesOf(narrow.score).should.deep.equal(notesOf(wide.score));
  });
});
