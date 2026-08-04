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

function buildScore(gabc, language) {
  var ctxt = new Exsurge.ChantContext();
  // the stub implements only the two methods that get called, not all of
  // opentype.js's Font, so it cannot satisfy the declared dictionary type
  ctxt.fontDictionary = /** @type {any} */ (stubFontDictionary());

  if (language) ctxt.defaultLanguage = language;

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

// the sounding shape of a score: what is heard, in order, and for how long
function timelineOf(score, options) {
  return Exsurge.createPlaybackEvents(score, options || {}).events.map(
    (event) => [event.kind, event.pitchInt, event.pulses]
  );
}

function soundingPulses(gabc, options) {
  return Exsurge.createPlaybackEvents(buildScore(gabc).score, options || {})
    .events.filter((event) => event.kind === "note")
    .map((event) => event.pulses);
}

// Every glyph the score draws with the "note" class -- what ChantPlayer looks
// for when it maps a rendered score back onto its notes. createSvgTree is used
// rather than createSvgNode because the specs run without a DOM.
function noteGlyphs(score, ctxt) {
  var found = [];

  (function walk(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(walk);

    var props = node.props || {};
    var className = props.className || props.class;

    if (typeof className === "string" && /(^| )note( |$)/.test(className))
      found.push({ id: props.id, elementIndex: props["element-index"] });

    walk(node.children);
  })(score.createSvgTree(ctxt));

  return found;
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

  it("sounds the same however the score has been laid out", function () {
    var wide = layoutAt(1200);
    var narrow = layoutAt(220);

    narrow.score.notations
      .filter((notation) => notation.isRecitationContinuation)
      .length.should.be.above(0);

    // breaking a recitation across chant lines is an engraving decision; the
    // performance it stands for is the same either way
    timelineOf(narrow.score).should.deep.equal(timelineOf(wide.score));
  });

  it("keeps a divider that begins a line ahead of what follows it", function () {
    // A divider is centered against what is on either side of it, but
    // notations[i - 1] is only on this line when the divider is not the first
    // thing on it. Continuations often take a line to themselves, which is how
    // a divider comes to begin one, and centering it against the recited text
    // on the line above used to put it to the right of its own successor.
    var { score } = layoutAt(205);

    for (var line of score.lines) {
      var onLine = notationsOnLine(score, line);

      for (var i = 0; i < onLine.length - 1; i++)
        if (onLine[i].isDivider)
          onLine[i].bounds
            .right()
            .should.be.at.most(
              onLine[i + 1].bounds.x,
              "divider overtook the notation after it"
            );
    }
  });

  it("draws the continuation as the same note it continues", function () {
    var { ctxt, score } = buildScore(gabc);

    score.layoutChantLines(ctxt, 220, () => {});

    var continuations = score.notations.filter(
      (notation) => notation.isRecitationContinuation
    );

    continuations.length.should.be.above(0);

    for (var continuation of continuations) {
      var written = score.notations[score.notations.indexOf(continuation) - 1];

      // sharing the indices is what lets the player find every glyph a note is
      // drawn as, so that clicking any of them seeks to the recitation and all
      // of them light together
      continuation.notes[0].noteIndex.should.equal(written.notes[0].noteIndex);
      continuation.notes[0].elementIndex.should.equal(
        written.notes[0].elementIndex
      );

      // but it is not a note of the score: nothing may count it twice
      score.notes.includes(continuation.notes[0]).should.equal(false);
    }

    // an id may appear only once in a document, so only the written note
    // carries one
    var ids = noteGlyphs(score, ctxt)
      .map((glyph) => glyph.id)
      .filter((id) => id !== undefined);

    // score.notes also holds the dividers and other non-note elements, so
    // count the ones that actually sound
    var sounding = score.notes.filter(
      (note) => typeof note.noteIndex === "number"
    );

    ids.length.should.equal(new Set(ids).size);
    ids.length.should.equal(sounding.length);
  });
});

describe("Recitation playback", function () {
  it("sounds once per recited syllable", function () {
    // the reciting tone is a direction to sing the text that follows on one
    // pitch, so it performs exactly as writing that text out note by note
    timelineOf(
      buildScore("(c4) och med din(fr0) An(g)de(h)").score
    ).should.deep.equal(
      timelineOf(buildScore("(c4) och(f) med(f) din(f) An(g)de(h)").score)
    );
  });

  it("counts syllables rather than words", function () {
    // "si-o Dó-mi-ni no-stri" is seven syllables on the reciting tone
    var { score } = buildScore("(c4) Pás(h)sio Dómini nostri(jr0) Ie(i)su(h)");
    var reciting = score.notations.find(
      (notation) => notation.isRecitationTone
    );

    var events = Exsurge.createPlaybackEvents(score, {}).events.filter(
      (event) => event.noteIndex === reciting.notes[0].noteIndex
    );

    events.length.should.equal(7);
    events
      .every((event) => event.pitchInt === events[0].pitchInt)
      .should.equal(true);
  });

  it("syllabifies with the language it is given", function () {
    // "va-re Fa-dern och So-nen" is seven syllables in Swedish
    var gabc = "(c4) Ä(f)ra(g) vare Fadern och Sonen(hr0) A(g)men.(h)";
    var recitingNoteIndex = (score) =>
      score.notations.find((notation) => notation.isRecitationTone).notes[0]
        .noteIndex;

    var { score } = buildScore(gabc);
    var index = recitingNoteIndex(score);
    var soundings = (options) =>
      Exsurge.createPlaybackEvents(score, options).events.filter(
        (event) => event.noteIndex === index
      ).length;

    soundings({ language: Exsurge.language.swedish }).should.equal(7);

    // and the Latin of the score's context, which is what a caller that says
    // nothing gets here, makes its own count of the same text
    soundings({}).should.equal(soundings({ language: Exsurge.language.latin }));
  });

  it("takes its syllabifier from the score's context", function () {
    // "Is-ra-els Gud" is four syllables in Swedish; Latin reads the <ae> as a
    // diphthong and counts three. Setting ctxt.defaultLanguage has to be
    // enough: playback that quietly kept counting in Latin would disagree with
    // the layout the same context produced.
    var gabc = "(c4) Lo(f)va(g) Israels Gud(hr0) i(g)dag.(h)";

    var soundings = function (score, options) {
      var reciting = score.notations.find(
        (notation) => notation.isRecitationTone
      );

      return Exsurge.createPlaybackEvents(score, options).events.filter(
        (event) => event.noteIndex === reciting.notes[0].noteIndex
      ).length;
    };

    var swedish = buildScore(gabc, Exsurge.language.swedish).score;

    soundings(swedish).should.equal(4);
    soundings(buildScore(gabc).score).should.equal(3);

    // an explicit language still overrides the context
    soundings(swedish, { language: Exsurge.language.latin }).should.equal(3);

    // and a score that has no context at all keeps the Latin fallback
    swedish.ctxt = null;
    soundings(swedish).should.equal(3);
  });

  it("survives a language that cannot syllabify", function () {
    // English implements findVowelSegment but not syllabifyWord, and the base
    // class throws for anything that has not overridden it. Playing a score is
    // not the place to discover that, so an unsyllabifiable language falls
    // back to a pulse per word.
    var gabc = "(c4) the Lord be with you(fr0) and(g) al(h)so.(g)";

    for (var name of Object.keys(Exsurge.language)) {
      var language = Exsurge.language[name];

      (() => soundingPulses(gabc, { language: language })).should.not.throw();
    }

    // "the Lord be with you" is five words, so five soundings of the tone
    // ahead of the three written notes
    soundingPulses(gabc, {
      language: Exsurge.language.english
    }).length.should.equal(8);
  });

  it("holds a reciting tone that carries no text", function () {
    // nothing is written to recite, so the length of the recitation is the
    // singer's; all the timeline can do is hold the pitch
    var held = soundingPulses("(c4) Dó(f)mi(g)nus(h) (hr0) A(g)men.(h)");
    var plain = soundingPulses("(c4) Dó(f)mi(g)nus(h) (h) A(g)men.(h)");

    held.length.should.equal(plain.length);
    held[3].should.equal(
      plain[3] * Exsurge.PlaybackDurations.recitationWithoutText
    );
  });

  it("lengthens the last recited syllable before a bar line", function () {
    var pulses = soundingPulses("(c4) och med din(fr0) (::) A(g)men.(h)");

    // the three syllables of "och med din", the last one held into the bar
    pulses
      .slice(0, 3)
      .should.deep.equal([
        1,
        1,
        Exsurge.PlaybackDurations.beforeDivider.doubleBar
      ]);
  });

  it("puts a mora at the end of a recitation, not on every syllable", function () {
    var pulses = soundingPulses("(c4) och med din(fr0.) A(g)men.(h)");

    pulses
      .slice(0, 3)
      .should.deep.equal([1, 1, 1 + Exsurge.PlaybackDurations.perMora]);
  });
});
