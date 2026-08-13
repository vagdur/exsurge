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

// Vitest bundles chai, so the should-style assertions this suite has always
// used carry over unchanged.
var should = chai.should();

var MIDDLE_C = 261.6255653;

// The extractor reads duck typed flags off notations and notes, so these fakes
// are enough to exercise every rule without building real neumes.
function fakeNote(
  /** @type {*} */ noteIndex,
  /** @type {*} */ pitchInt,
  /** @type {*} */ extra = undefined
) {
  /** @type {Record<string, any>} */
  var note = {
    noteIndex: noteIndex,
    elementIndex: noteIndex,
    pitch: pitchInt === null ? null : new Exsurge.Pitch(pitchInt),
    /** @type {any[]} */ morae: [],
    /** @type {any[]} */ episemata: [],
    shape: Exsurge.NoteShape.Default,
    liquescent: Exsurge.LiquescentType.None
  };

  if (extra) for (var key in extra) note[key] = extra[key];

  return note;
}

function fakeNeume(/** @type {*} */ notes) {
  return { isNeume: true, notes: notes };
}

// n plain notes in a single neume, numbered from 0
function plainNotes(/** @type {*} */ n) {
  var notes = [];
  for (var i = 0; i < n; i++) notes.push(fakeNote(i, 17));
  return notes;
}

function scoreOf(/** @type {*} */ notations) {
  var notes = [];

  for (var i = 0; i < notations.length; i++) {
    if (notations[i].isNeume) {
      for (var j = 0; j < notations[i].notes.length; j++)
        notes.push(notations[i].notes[j]);
    } else {
      notes.push(notations[i]);
    }
  }

  // Duck-typed score: createPlaybackEvents only reads notations/notes.
  return /** @type {any} */ ({ notations: notations, notes: notes });
}

function pulsesOf(/** @type {*} */ timeline) {
  return timeline.events.map(function (/** @type {*} */ e) {
    return e.pulses;
  });
}

// The "Playback: loading" suite that used to live here has moved to
// dist.test.js. It is a tripwire for module-scope DOM access, so it only means
// anything when it loads the built bundle rather than src/.

describe("Playback: pitch and tempo", function () {
  it("anchors tuning on the Do that the clef names", function () {
    Exsurge.DoReferenceInt.should.equal(24);
    Exsurge.DoReferenceInt.should.equal(
      new Exsurge.Pitch(Exsurge.Step.Do, 2).toInt()
    );

    var doPitch = new Exsurge.Pitch(Exsurge.Step.Do, 2);
    Exsurge.pitchToFrequency(doPitch, MIDDLE_C).should.equal(MIDDLE_C);
  });

  it("doubles frequency every octave", function () {
    var up = new Exsurge.Pitch(Exsurge.Step.Do, 3);
    var down = new Exsurge.Pitch(Exsurge.Step.Do, 1);

    Exsurge.pitchToFrequency(up, MIDDLE_C).should.be.closeTo(
      MIDDLE_C * 2,
      1e-9
    );
    Exsurge.pitchToFrequency(down, MIDDLE_C).should.be.closeTo(
      MIDDLE_C / 2,
      1e-9
    );
  });

  it("treats Te as one semitone below Ti", function () {
    var te = Exsurge.pitchIntToFrequency(
      new Exsurge.Pitch(Exsurge.Step.Te, 2).toInt(),
      MIDDLE_C
    );
    var ti = Exsurge.pitchIntToFrequency(
      new Exsurge.Pitch(Exsurge.Step.Ti, 2).toInt(),
      MIDDLE_C
    );

    (ti / te).should.be.closeTo(Math.pow(2, 1 / 12), 1e-12);
  });

  it("steps evenly across the unused gap at Step index 8", function () {
    // Step skips 8, but toInt() is a plain semitone count, so So(7) -> La(9)
    // must still come out as a whole tone rather than a jump
    var so = Exsurge.pitchIntToFrequency(
      new Exsurge.Pitch(Exsurge.Step.So, 2).toInt(),
      MIDDLE_C
    );
    var la = Exsurge.pitchIntToFrequency(
      new Exsurge.Pitch(Exsurge.Step.La, 2).toInt(),
      MIDDLE_C
    );

    (la / so).should.be.closeTo(Math.pow(2, 2 / 12), 1e-12);
  });

  it("composes transpose with tuning", function () {
    var pitch = new Exsurge.Pitch(Exsurge.Step.Do, 2);

    Exsurge.pitchToFrequency(pitch, MIDDLE_C, 12).should.be.closeTo(
      MIDDLE_C * 2,
      1e-9
    );
    Exsurge.pitchToFrequency(pitch, MIDDLE_C, -12).should.be.closeTo(
      MIDDLE_C / 2,
      1e-9
    );
    Exsurge.pitchToFrequency(pitch, MIDDLE_C, 0).should.equal(MIDDLE_C);
  });

  it("returns null for a note with no pitch", function () {
    should.equal(Exsurge.pitchToFrequency(null, MIDDLE_C), null);
  });

  it("tunes fifths and fourths pure in Pythagorean", function () {
    var hz = function (/** @type {*} */ step) {
      return Exsurge.pitchIntToFrequency(
        new Exsurge.Pitch(step, 2).toInt(),
        MIDDLE_C,
        0,
        "pythagorean"
      );
    };

    (hz(Exsurge.Step.So) / hz(Exsurge.Step.Do)).should.be.closeTo(3 / 2, 1e-12);
    (hz(Exsurge.Step.Fa) / hz(Exsurge.Step.Do)).should.be.closeTo(4 / 3, 1e-12);
    (hz(Exsurge.Step.La) / hz(Exsurge.Step.Re)).should.be.closeTo(3 / 2, 1e-12);

    // the ditone is the audible difference from equal temperament: 408 cents
    // against 400, roughly a seventh of a semitone sharp
    var ditone = hz(Exsurge.Step.Mi) / hz(Exsurge.Step.Do);
    ditone.should.be.closeTo(81 / 64, 1e-12);
    ((1200 * Math.log(ditone)) / Math.LN2).should.be.closeTo(407.82, 0.01);
  });

  it("keeps octaves pure in Pythagorean", function () {
    var low = new Exsurge.Pitch(Exsurge.Step.Mi, 1);
    var high = new Exsurge.Pitch(Exsurge.Step.Mi, 3);

    Exsurge.pitchToFrequency(low, MIDDLE_C, 0, "pythagorean").should.be.closeTo(
      Exsurge.pitchToFrequency(high, MIDDLE_C, 0, "pythagorean") / 4,
      1e-12
    );

    // and Do itself is still exactly the tuning frequency
    Exsurge.pitchToFrequency(
      new Exsurge.Pitch(Exsurge.Step.Do, 2),
      MIDDLE_C,
      0,
      "pythagorean"
    ).should.equal(MIDDLE_C);
  });

  it("puts Te a Pythagorean whole tone below Do", function () {
    // Bb is reached by fifths downward, so it is 16/9 rather than 9/5, and the
    // Ti-Te semitone comes out wider than the tempered one
    var te = Exsurge.pitchIntToFrequency(
      new Exsurge.Pitch(Exsurge.Step.Te, 2).toInt(),
      MIDDLE_C,
      0,
      "pythagorean"
    );
    var ti = Exsurge.pitchIntToFrequency(
      new Exsurge.Pitch(Exsurge.Step.Ti, 2).toInt(),
      MIDDLE_C,
      0,
      "pythagorean"
    );

    (te / MIDDLE_C).should.be.closeTo(16 / 9, 1e-12);
    (ti / te).should.be.closeTo(2187 / 2048, 1e-12);
  });

  it("transposes a Pythagorean piece without changing its intervals", function () {
    var plain = [];
    var moved = [];

    for (var step = 0; step < 12; step++) {
      var pitchInt = new Exsurge.Pitch(step, 2).toInt();
      plain.push(
        Exsurge.pitchIntToFrequency(pitchInt, MIDDLE_C, 0, "pythagorean")
      );
      moved.push(
        Exsurge.pitchIntToFrequency(pitchInt, MIDDLE_C, 5, "pythagorean")
      );
    }

    // every note moved by the same pure fourth, so no interval within the
    // piece was disturbed by the transposition
    for (var i = 0; i < plain.length; i++)
      (moved[i] / plain[i]).should.be.closeTo(4 / 3, 1e-12);
  });

  it("defaults to equal temperament and rejects unknown names", function () {
    Exsurge.PlaybackDefaults.temperament.should.equal("equal");

    var mi = new Exsurge.Pitch(Exsurge.Step.Mi, 2);
    Exsurge.pitchToFrequency(mi, MIDDLE_C).should.equal(
      Exsurge.pitchToFrequency(mi, MIDDLE_C, 0, "equal")
    );

    (function () {
      Exsurge.resolveTemperament("just");
    }).should.throw(/unknown temperament/);
  });

  it("accepts a temperament function of its own", function () {
    // quarter tones, to make it obvious the function is being consulted
    var quarterTones = function (/** @type {*} */ semitones) {
      return Math.pow(2, semitones / 24);
    };

    Exsurge.pitchToFrequency(
      new Exsurge.Pitch(Exsurge.Step.Do, 3),
      MIDDLE_C,
      0,
      quarterTones
    ).should.be.closeTo(MIDDLE_C * Math.sqrt(2), 1e-12);
  });

  it("converts speed percentage to seconds per pulse", function () {
    Exsurge.secondsPerPulse(100).should.be.closeTo(0.4, 1e-12);
    Exsurge.secondsPerPulse(200).should.be.closeTo(0.2, 1e-12);
    Exsurge.secondsPerPulse(50).should.be.closeTo(0.8, 1e-12);
    Exsurge.secondsPerPulse(100, 0.5).should.be.closeTo(0.5, 1e-12);
  });
});

describe("Playback: divider classification", function () {
  it("names each kind of bar line", function () {
    Exsurge.classifyDivider(new Exsurge.Virgula()).should.equal("virgula");
    Exsurge.classifyDivider(new Exsurge.QuarterBar()).should.equal(
      "quarterBar"
    );
    Exsurge.classifyDivider(new Exsurge.HalfBar()).should.equal("halfBar");
    Exsurge.classifyDivider(new Exsurge.FullBar()).should.equal("fullBar");
    Exsurge.classifyDivider(new Exsurge.DoubleBar()).should.equal("doubleBar");
    Exsurge.classifyDivider(new Exsurge.DominicanBar(3)).should.equal(
      "dominicanBar"
    );
  });

  it("refuses to sound the editor insertion cursor", function () {
    should.equal(Exsurge.classifyDivider(new Exsurge.InsertionCursor()), null);
  });

  it("gives an unrecognized divider the shortest breath", function () {
    Exsurge.classifyDivider(new Exsurge.Divider()).should.equal("quarterBar");
  });
});

describe("Playback: event extraction", function () {
  it("gives every plain note one pulse, and holds the last", function () {
    var timeline = Exsurge.createPlaybackEvents(
      scoreOf([fakeNeume(plainNotes(4))])
    );

    timeline.events.length.should.equal(4);
    pulsesOf(timeline).should.eql([1, 1, 1, 1.5]);
    timeline.totalPulses.should.equal(4.5);
  });

  it("adds a pulse per mora dot", function () {
    var notes = plainNotes(3);
    notes[0].morae = [{}];
    notes[1].morae = [{}, {}];

    var timeline = Exsurge.createPlaybackEvents(scoreOf([fakeNeume(notes)]));

    timeline.events[0].pulses.should.equal(2);
    timeline.events[1].pulses.should.equal(3);
  });

  it("lengthens an episema note by a nuance rather than a doubling", function () {
    var notes = plainNotes(3);
    notes[0].episemata = [{}];

    var timeline = Exsurge.createPlaybackEvents(scoreOf([fakeNeume(notes)]));

    timeline.events[0].pulses.should.be.closeTo(1.3, 1e-12);
  });

  it("adds morae to an episema rather than multiplying by them", function () {
    var notes = plainNotes(3);
    notes[0].episemata = [{}];
    notes[0].morae = [{}];

    var timeline = Exsurge.createPlaybackEvents(scoreOf([fakeNeume(notes)]));

    // 1.3 + 1.0, not 1.3 * 2.0
    timeline.events[0].pulses.should.be.closeTo(2.3, 1e-12);
  });

  it("accents on the ictus without lengthening it", function () {
    var notes = plainNotes(3);
    notes[0].ictus = {};

    var timeline = Exsurge.createPlaybackEvents(scoreOf([fakeNeume(notes)]));

    timeline.events[0].pulses.should.equal(1);
    timeline.events[0].velocity.should.be.above(timeline.events[1].velocity);
  });

  it("lightens a quilisma and broadens the note before it", function () {
    var notes = plainNotes(3);
    notes[1].shape = Exsurge.NoteShape.Quilisma;

    var timeline = Exsurge.createPlaybackEvents(scoreOf([fakeNeume(notes)]));

    timeline.events[0].pulses.should.be.closeTo(1.75, 1e-12);
    timeline.events[1].pulses.should.be.closeTo(0.9, 1e-12);
  });

  it("does not let a quilisma reach back across a bar line", function () {
    var before = [fakeNote(0, 17)];
    var after = [
      fakeNote(1, 17, { shape: Exsurge.NoteShape.Quilisma }),
      fakeNote(2, 17)
    ];

    var timeline = Exsurge.createPlaybackEvents(
      scoreOf([fakeNeume(before), new Exsurge.HalfBar(), fakeNeume(after)])
    );

    // the note before the bar takes the bar's lengthening, never the quilisma's
    timeline.events[0].pulses.should.be.closeTo(1.25, 1e-12);
  });

  it("clips liquescents and initio debilis", function () {
    var notes = plainNotes(4);
    notes[0].liquescent = Exsurge.LiquescentType.SmallAscending;
    notes[1].liquescent = Exsurge.LiquescentType.LargeDescending;
    notes[2].liquescent = Exsurge.LiquescentType.InitioDebilis;

    var timeline = Exsurge.createPlaybackEvents(scoreOf([fakeNeume(notes)]));

    timeline.events[0].pulses.should.be.closeTo(0.6, 1e-12);
    timeline.events[1].pulses.should.be.closeTo(1.0, 1e-12);
    timeline.events[2].pulses.should.be.closeTo(0.6, 1e-12);
  });

  it("rests for each bar line and lengthens the note before it", function () {
    var timeline = Exsurge.createPlaybackEvents(
      scoreOf([
        fakeNeume([fakeNote(0, 17)]),
        new Exsurge.HalfBar(),
        fakeNeume([fakeNote(1, 17)])
      ])
    );

    timeline.events.length.should.equal(3);
    timeline.events[0].pulses.should.be.closeTo(1.25, 1e-12);
    timeline.events[1].kind.should.equal("rest");
    timeline.events[1].dividerKind.should.equal("halfBar");
    timeline.events[1].pulses.should.equal(2);
    should.equal(timeline.events[1].noteIndex, null);
  });

  it("scales the rest by the weight of the bar", function () {
    var kinds = [
      [new Exsurge.Virgula(), 0.5],
      [new Exsurge.QuarterBar(), 1],
      [new Exsurge.HalfBar(), 2],
      [new Exsurge.FullBar(), 3],
      [new Exsurge.DoubleBar(), 4]
    ];

    for (var i = 0; i < kinds.length; i++) {
      var timeline = Exsurge.createPlaybackEvents(
        scoreOf([
          fakeNeume([fakeNote(0, 17)]),
          kinds[i][0],
          fakeNeume([fakeNote(1, 17)])
        ])
      );
      timeline.events[1].pulses.should.equal(kinds[i][1]);
    }
  });

  it("does not double-lengthen a final note that a bar already closed", function () {
    var closed = Exsurge.createPlaybackEvents(
      scoreOf([fakeNeume([fakeNote(0, 17)]), new Exsurge.DoubleBar()])
    );
    var open = Exsurge.createPlaybackEvents(
      scoreOf([fakeNeume([fakeNote(0, 17)])])
    );

    closed.events[0].pulses.should.be.closeTo(1.5, 1e-12); // beforeDivider only
    open.events[0].pulses.should.be.closeTo(1.5, 1e-12); // finalNote only
  });

  it("ignores everything that does not sound", function () {
    var silent = [
      new Exsurge.InsertionCursor(),
      { hasNoWidth: true, isNeume: true, notes: [fakeNote(99, 17)] },
      { isClef: true },
      { isAccidental: true },
      new Exsurge.Custos(),
      {/* TextOnly and ChantLineBreak look like this: no isNeume, no notes */}
    ];

    for (var i = 0; i < silent.length; i++) {
      var timeline = Exsurge.createPlaybackEvents(scoreOf([silent[i]]));
      timeline.events.length.should.equal(
        0,
        "entry " + i + " should be silent"
      );
    }
  });

  it("keeps an unpitched note in the timeline but silent", function () {
    var notes = [fakeNote(0, 17), fakeNote(1, null), fakeNote(2, 17)];
    var timeline = Exsurge.createPlaybackEvents(scoreOf([fakeNeume(notes)]));

    timeline.events.length.should.equal(3);
    should.equal(timeline.events[1].pitchInt, null);
    timeline.events[1].pulses.should.equal(1);
    // still clickable, because the note index map stays dense
    timeline.eventIndexByNoteIndex[1].should.equal(1);
  });

  it("produces a dense, monotonic timeline", function () {
    var timeline = Exsurge.createPlaybackEvents(
      scoreOf([
        fakeNeume(plainNotes(3)),
        new Exsurge.QuarterBar(),
        fakeNeume([fakeNote(3, 19), fakeNote(4, 21)]),
        new Exsurge.DoubleBar()
      ])
    );

    timeline.eventIndexByNoteIndex.length.should.equal(5);

    var pulse = 0;
    for (var i = 0; i < timeline.events.length; i++) {
      timeline.events[i].startPulse.should.equal(pulse);
      pulse += timeline.events[i].pulses;
    }
    timeline.totalPulses.should.equal(pulse);

    for (var n = 0; n < timeline.eventIndexByNoteIndex.length; n++) {
      var event = timeline.events[timeline.eventIndexByNoteIndex[n]];
      event.noteIndex.should.equal(n);
    }
  });

  it("honours a partial override of the duration tables", function () {
    var notes = plainNotes(2);
    notes[0].morae = [{}];

    var timeline = Exsurge.createPlaybackEvents(scoreOf([fakeNeume(notes)]), {
      durations: { perMora: 2.0, finalNote: 1.0 },
      restWeights: { halfBar: 9 }
    });

    timeline.events[0].pulses.should.equal(3);
    timeline.events[1].pulses.should.equal(1);
  });
});

describe("Playback: instruments", function () {
  it("resolves the default piano", function () {
    Exsurge.resolveInstrument().name.should.equal("piano");
    Exsurge.resolveInstrument("piano").should.equal(Exsurge.Instruments.piano);
  });

  it("accepts a duck typed instrument", function () {
    var custom = {
      name: "kazoo",
      /** @returns {any} */
      createVoice: function () {
        return null;
      }
    };
    Exsurge.resolveInstrument(custom).should.equal(custom);
  });

  it("rejects an unknown name and a malformed object", function () {
    (function () {
      Exsurge.resolveInstrument("sackbut");
    }).should.throw(/unknown instrument/);
    (function () {
      Exsurge.resolveInstrument(/** @type {any} */ ({ name: "nope" }));
    }).should.throw(/createVoice/);
  });
});

describe("Gabc: staff position offsets and pitch", function () {
  // The gabc 0 and 9 modifiers nudge a note a third of a staff position for
  // engraving, and that nudge is folded into note.staffPosition. Pitch belongs
  // to the line or space the note really sits on, so it has to come back off
  // -- and be rounded, since the float round trip does not always land on the
  // integer. Any leftover fraction indexes an array in staffOffsetToStep and
  // silently produces a NaN pitch.

  var SHIFTED = "(c4) a(f) b(g9) c(h0) d(e9) e(d0) f(i9) g(j0) h(f) (::)";

  function parse(/** @type {*} */ gabc) {
    var ctxt = new Exsurge.ChantContext();
    var mappings = Exsurge.Gabc.createMappingsFromSource(ctxt, gabc);
    return { ctxt: ctxt, score: new Exsurge.ChantScore(ctxt, mappings, false) };
  }

  function pitchIntsOf(/** @type {*} */ score) {
    return score.notes
      .filter(function (/** @type {*} */ n) {
        return n instanceof Exsurge.Note;
      })
      .map(function (/** @type {*} */ n) {
        return n.pitch.toInt();
      });
  }

  it("recovers the integer staff position despite float drift", function () {
    // g9 is the case that does not round trip exactly: 4 + 1/3 - 1/3 lands on
    // 3.9999999999999996
    var note = { staffPosition: 4 + 1 / 3, staffPositionOffset: 1 / 3 };
    (note.staffPosition - note.staffPositionOffset).should.not.equal(4);
    Exsurge.Gabc.getIntegerStaffPosition(note).should.equal(4);
  });

  it("tolerates a note that has no offset at all", function () {
    Exsurge.Gabc.getIntegerStaffPosition({ staffPosition: 3 }).should.equal(3);
  });

  it("gives every nudged note a real pitch when parsing", function () {
    var pitches = pitchIntsOf(parse(SHIFTED).score);

    pitches.length.should.equal(8);
    for (var i = 0; i < pitches.length; i++)
      isNaN(pitches[i]).should.equal(false, "note " + i + " has a NaN pitch");

    // the nudge is purely visual, so a nudged note sounds exactly as its
    // unnudged neighbour on the same line would
    pitches[0].should.equal(pitches[7]); // both plain f
  });

  it("gives the same pitches after an in-place source update", function () {
    var fresh = pitchIntsOf(parse(SHIFTED).score);

    var edited = parse(SHIFTED);
    Exsurge.Gabc.updateMappingsFromSource(
      edited.ctxt,
      edited.score.mappings,
      SHIFTED
    );
    edited.score.updateNotations(edited.ctxt);

    pitchIntsOf(edited.score).should.eql(fresh);
  });

  it("keeps nudged notes audible", function () {
    var timeline = Exsurge.createPlaybackEvents(parse(SHIFTED).score);

    var sounding = timeline.events.filter(function (e) {
      return e.kind === "note";
    });
    sounding.length.should.equal(8);

    for (var i = 0; i < sounding.length; i++) {
      var hz = Exsurge.pitchIntToFrequency(sounding[i].pitchInt, MIDDLE_C);
      isNaN(hz).should.equal(
        false,
        "note " + i + " would be scheduled at NaN Hz"
      );
      hz.should.be.above(0);
    }
  });

  // Accidentals cannot currently be nudged -- the modifier slot holds the
  // x/y/# that makes it an accidental in the first place, so the 0/9 never
  // reaches getStaffPositionOffset and the offset stays 0. The accidental
  // path goes through getIntegerStaffPosition anyway, so that the invariant
  // 'ask a clef for a pitch using an integer' holds everywhere rather than
  // in two places out of three. This guards that.
  it("gives an accidental a real pitch", function () {
    ["(c4) a(f) b(gx) c(g) (::)", "(c4) a(f) b(gx9) c(g) (::)"].forEach(
      function (src) {
        var accidentals = parse(src).score.notations.filter(function (n) {
          return n.isAccidental;
        });

        accidentals.length.should.be.above(0, src);
        accidentals[0].staffPosition.should.equal(
          Math.round(accidentals[0].staffPosition),
          src + " should reach the clef with a whole staff position"
        );
        isNaN(accidentals[0].pitch.toInt()).should.equal(false, src);
      }
    );
  });
});

describe("Gabc: C and F clefs describe the same staff", function () {
  // An F clef on line n and a C clef on line n+2 are two spellings of one
  // staff: the fa an F clef names is the fa a fifth BELOW the do that a C clef
  // two lines higher would name. Only playback can hear the difference -- staff
  // positions round trip through either anchoring, so an octave error here is
  // invisible in the engraving and audible the moment the score is played.

  var NOTES = "(a) (c) (d) (e) (f) (g) (h) (i) (k) (m)";

  function pitchIntsOf(/** @type {*} */ gabc) {
    var ctxt = new Exsurge.ChantContext();
    var mappings = Exsurge.Gabc.createMappingsFromSource(ctxt, gabc);
    var score = new Exsurge.ChantScore(ctxt, mappings, false);

    return score.notes
      .filter(function (n) {
        return n instanceof Exsurge.Note;
      })
      .map(function (n) {
        return n.pitch.toInt();
      });
  }

  [
    ["f1", "c3"],
    ["f2", "c4"],
    ["f3", "c5"]
  ].forEach(function (pair) {
    it(pair[0] + " sounds exactly like " + pair[1], function () {
      var fa = pitchIntsOf("(" + pair[0] + ") " + NOTES);
      var doh = pitchIntsOf("(" + pair[1] + ") " + NOTES);

      fa.length.should.equal(10);
      fa.should.eql(doh);
    });
  });

  it("does not transpose at a mid-score clef change", function () {
    // the same letter on either side of an equivalent clef change
    var pitches = pitchIntsOf("(c4) (d) (f2) (d) (c4) (d) (::)");

    pitches.should.eql([pitches[0], pitches[0], pitches[0]]);
  });

  it("names the fa a fifth below its do", function () {
    var clef = new Exsurge.FaClef(3, 2); // f2

    // seven semitones below Do2, not five above it
    clef
      .staffPositionToPitch(3)
      .toInt()
      .should.equal(new Exsurge.Pitch(Exsurge.Step.Do, 2).toInt() - 7);

    // and the do it implies sits on line 4, exactly where a c4 clef puts it
    clef
      .staffPositionToPitch(7)
      .toInt()
      .should.equal(new Exsurge.Pitch(Exsurge.Step.Do, 2).toInt());
  });

  it("round trips staff positions through pitch", function () {
    [1, 3, 5, 7, 9].forEach(function (line) {
      var clef = new Exsurge.FaClef(line, 2);

      for (var sp = -4; sp <= 14; sp++) {
        clef
          .pitchToStaffPosition(clef.staffPositionToPitch(sp))
          .should.equal(sp, "f clef on staff position " + line);
      }
    });
  });
});

describe("Playback: real gabc", function () {
  // ChantScore's constructor runs updateNotations, which is all the extractor
  // needs -- no layout, and therefore no text measurement.
  //
  // This deliberately parses at suite scope with no try/catch. It used to sit
  // in a before() hook that swallowed the exception into `score = null`, with
  // every test below opening `if (!score) this.skip()` -- so a parse
  // regression reported as three pending tests and the suite still went green.
  // Letting the exception through turns that into three real failures with a
  // usable stack.
  var ctxt = new Exsurge.ChantContext();
  var gabc =
    "(c4) Chris(ffg)tus(f.) *(,) fac(fg)tus(f) est(f) pro(f) no(gh)bis(f.) (::)";
  var mappings = Exsurge.Gabc.createMappingsFromSource(ctxt, gabc);
  var score = new Exsurge.ChantScore(ctxt, mappings, false);

  it("extracts sounding notes from parsed gabc", function () {
    var timeline = Exsurge.createPlaybackEvents(score);

    timeline.events.length.should.be.above(0);
    // ffg f. fg f f f gh f. => 3+1+2+1+1+1+2+1
    timeline.eventIndexByNoteIndex.length.should.equal(12);

    // no clef, divider or custos leaked in as a pitched note
    for (var i = 0; i < timeline.events.length; i++) {
      var event = timeline.events[i];
      if (event.kind === "note") should.exist(event.note);
      else should.equal(event.note, null);
    }
  });

  it("reads pitches straight off the parsed notes", function () {
    var timeline = Exsurge.createPlaybackEvents(score);
    var pitched = timeline.events.filter(function (e) {
      return e.pitchInt !== null;
    });

    // gabc 'f' under a c4 clef is Fa in octave 1: 12 + Step.Fa
    pitched[0].pitchInt.should.equal(12 + Exsurge.Step.Fa);

    // and the whole piece sits in a singable range at the default tuning
    for (var i = 0; i < pitched.length; i++) {
      var hz = Exsurge.pitchIntToFrequency(pitched[i].pitchInt, MIDDLE_C);
      hz.should.be.within(100, 450);
    }
  });

  it("doubles the mora dotted notes that gabc marked", function () {
    var timeline = Exsurge.createPlaybackEvents(score);
    var dotted = timeline.events.filter(function (e) {
      return e.note && e.note.morae && e.note.morae.length > 0;
    });

    dotted.length.should.be.above(0);
    for (var i = 0; i < dotted.length; i++)
      dotted[i].pulses.should.be.at.least(2);
  });
});

describe("createPlayableChant: score surface", function () {
  // The wrapper used to hide the ChantScore it built, which forced any caller
  // needing score.annotation (or titles, …) to reimplement the whole pipeline.
  // These checks cover the parts that are testable without a DOM: Annotation
  // constructibility, noteIdPrefix, and the prebuilt-score entry point's
  // argument guard. The layout/SVG path still needs a browser — see
  // test/playback.html.

  it("exports Annotation as a constructible class", function () {
    Exsurge.Annotation.should.be.a("function");
    var ctxt = new Exsurge.ChantContext();
    var annotation = new Exsurge.Annotation(ctxt, "%V%");
    annotation.should.be.instanceof(Exsurge.Annotation);

    var mappings = Exsurge.Gabc.createMappingsFromSource(
      ctxt,
      "(c4) A(f)men(f) (::)"
    );
    var score = new Exsurge.ChantScore(ctxt, mappings, true);
    score.annotation = annotation;
    score.annotation.should.equal(annotation);
  });

  it("exposes noteIdPrefix on ChantContext", function () {
    var ctxt = new Exsurge.ChantContext();
    ctxt.noteIdPrefix.should.equal("note-");
    ctxt.noteIdPrefix = "note-lauds-";
    ctxt.noteIdPrefix.should.equal("note-lauds-");
  });

  it("rejects a second argument that is neither gabc nor a ChantScore", function () {
    var ctxt = new Exsurge.ChantContext();
    (function () {
      Exsurge.createPlayableChant(
        ctxt,
        /** @type {any} */ (42),
        /** @type {any} */ ({}),
        {}
      );
    }).should.throw(TypeError, /gabc string or ChantScore/);
  });
});

describe("Playback: pointer hit testing", function () {
  /**
   * @param {number} noteIndex
   * @param {number} left
   * @param {number} top
   * @param {number} right
   * @param {number} bottom
   */
  function box(noteIndex, left, top, right, bottom) {
    return {
      noteIndex: noteIndex,
      left: left,
      top: top,
      right: right,
      bottom: bottom
    };
  }

  // two 10×10 notes sitting 20px apart centre-to-centre, like neighbouring
  // puncta that a fat finger would otherwise miss
  var leftNote = box(0, 0, 0, 10, 10);
  var rightNote = box(1, 20, 0, 30, 10);
  var stackedLow = box(0, 0, 20, 10, 30); // podatus lower
  var stackedHigh = box(1, 0, 0, 10, 10); // podatus upper

  function scoreWithNotes(/** @type {number} */ n) {
    var notes = [];
    for (var i = 0; i < n; i++) notes.push({ noteIndex: i, elementIndex: i });
    return { notes: notes };
  }

  function node(/** @type {*} */ spec = undefined) {
    spec = spec || {};
    spec.closest = spec.closest || {};
    spec.attrs = spec.attrs || {};
    spec.query = spec.query || {};
    if (spec.className) spec.attrs.class = spec.className;
    return {
      spec: spec,
      getAttribute: function (/** @type {string} */ name) {
        return spec.attrs[name];
      },
      closest: function (/** @type {string} */ selector) {
        if (Object.prototype.hasOwnProperty.call(spec.closest, selector))
          return spec.closest[selector];
        return null;
      },
      querySelectorAll: function (/** @type {string} */ selector) {
        return spec.query[selector] || [];
      }
    };
  }

  it("defaults to a finger-sized slop around each glyph", function () {
    Exsurge.PlaybackDefaults.hitSlopPx.should.equal(32);
  });

  it("returns null when nothing is close enough", function () {
    should.equal(
      Exsurge.nearestNoteIndexAtPoint(100, 100, [leftNote, rightNote], 32),
      null
    );
  });

  it("hits a note whose glyph contains the point", function () {
    Exsurge.nearestNoteIndexAtPoint(
      5,
      5,
      [leftNote, rightNote],
      0
    ).should.equal(0);
    Exsurge.nearestNoteIndexAtPoint(
      25,
      5,
      [leftNote, rightNote],
      0
    ).should.equal(1);
  });

  it("counts a near miss within the slop, but not beyond it", function () {
    // 8px to the left of the left note: inside 32, outside 0
    Exsurge.nearestNoteIndexAtPoint(-8, 5, [leftNote], 32).should.equal(0);
    should.equal(Exsurge.nearestNoteIndexAtPoint(-8, 5, [leftNote], 0), null);
    should.equal(Exsurge.nearestNoteIndexAtPoint(-40, 5, [leftNote], 32), null);
  });

  it("picks the nearer glyph when expanded boxes overlap", function () {
    // gap between the notes is 10px; a tap in it is inside both 32px slops
    Exsurge.nearestNoteIndexAtPoint(
      14,
      5,
      [leftNote, rightNote],
      32
    ).should.equal(0);
    Exsurge.nearestNoteIndexAtPoint(
      16,
      5,
      [leftNote, rightNote],
      32
    ).should.equal(1);
  });

  it("distinguishes stacked notes of a podatus by y", function () {
    Exsurge.nearestNoteIndexAtPoint(
      5,
      5,
      [stackedLow, stackedHigh],
      8
    ).should.equal(1);
    Exsurge.nearestNoteIndexAtPoint(
      5,
      25,
      [stackedLow, stackedHigh],
      8
    ).should.equal(0);
  });

  it("skips empty boxes so a porrectus-end use is not a target", function () {
    var empty = box(1, 10, 10, 10, 10);
    Exsurge.nearestNoteIndexAtPoint(12, 12, [leftNote, empty], 32).should.equal(
      0
    );
  });

  it("plays the exact glyph even when a neighbour is closer in slop", function () {
    var glyph = node({
      attrs: { "element-index": "1" }
    });
    glyph.spec.closest[".note"] = glyph;

    Exsurge.noteIndexFromPointer(
      { target: glyph, clientX: 1000, clientY: 1000 },
      scoreWithNotes(2),
      [leftNote, rightNote],
      32
    ).should.equal(1);
  });

  it("starts a syllable from its first note when the lyric is tapped", function () {
    var firstGlyph = node({ attrs: { "element-index": "0" } });
    var secondGlyph = node({ attrs: { "element-index": "1" } });
    var group = node({
      query: { ".note": [firstGlyph, secondGlyph] }
    });
    var lyric = node({ className: "lyric" });
    lyric.spec.closest[".note"] = null;
    lyric.spec.closest[".lyric, .translation, .aboveLinesText, .dropCap"] =
      lyric;
    lyric.spec.closest[".ChantNotationElement"] = group;

    // tap is geometrically closer to note 1, but the lyric belongs to the
    // syllable, so playback starts at the first note
    Exsurge.noteIndexFromPointer(
      { target: lyric, clientX: 25, clientY: 5 },
      scoreWithNotes(2),
      [leftNote, rightNote],
      32
    ).should.equal(0);
  });

  it("starts from the beginning when the drop cap is tapped", function () {
    var drop = node({ className: "dropCap" });
    drop.spec.closest[".note"] = null;
    drop.spec.closest[".lyric, .translation, .aboveLinesText, .dropCap"] = drop;
    drop.spec.closest[".dropCap"] = drop;

    Exsurge.noteIndexFromPointer(
      { target: drop, clientX: -50, clientY: 5 },
      scoreWithNotes(3),
      [leftNote, rightNote],
      8
    ).should.equal(0);
  });

  it("falls back to the nearest note for a tap on the staff", function () {
    var staff = node();
    staff.spec.closest[".note"] = null;
    staff.spec.closest[".lyric, .translation, .aboveLinesText, .dropCap"] =
      null;

    Exsurge.noteIndexFromPointer(
      { target: staff, clientX: 25, clientY: 5 },
      scoreWithNotes(2),
      [leftNote, rightNote],
      32
    ).should.equal(1);
  });
});
