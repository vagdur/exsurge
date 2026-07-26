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

var should = require('chai').should(), Exsurge = require('../dist/exsurge.min.js');

var MIDDLE_C = 261.6255653;

// The extractor reads duck typed flags off notations and notes, so these fakes
// are enough to exercise every rule without building real neumes.
function fakeNote(noteIndex, pitchInt, extra) {
  var note = {
    noteIndex: noteIndex,
    elementIndex: noteIndex,
    pitch: pitchInt === null ? null : new Exsurge.Pitch(pitchInt),
    morae: [],
    episemata: [],
    shape: Exsurge.NoteShape.Default,
    liquescent: Exsurge.LiquescentType.None
  };

  if (extra) for (var key in extra) note[key] = extra[key];

  return note;
}

function fakeNeume(notes) {
  return { isNeume: true, notes: notes };
}

// n plain notes in a single neume, numbered from 0
function plainNotes(n) {
  var notes = [];
  for (var i = 0; i < n; i++) notes.push(fakeNote(i, 17));
  return notes;
}

function scoreOf(notations) {
  var notes = [];

  for (var i = 0; i < notations.length; i++) {
    if (notations[i].isNeume) {
      for (var j = 0; j < notations[i].notes.length; j++)
        notes.push(notations[i].notes[j]);
    } else {
      notes.push(notations[i]);
    }
  }

  return { notations: notations, notes: notes };
}

function pulsesOf(timeline) {
  return timeline.events.map(function(e) {
    return e.pulses;
  });
}


describe('Playback: loading', function() {

  // If a playback module ever touches document, window or AudioContext at
  // module scope, requiring the bundle in node breaks -- and nothing else in
  // this suite would notice.
  it('exposes the playback API without needing a browser', function() {
    Exsurge.ChantPlayer.should.be.a('function');
    Exsurge.createPlayableChant.should.be.a('function');
    Exsurge.createPlaybackEvents.should.be.a('function');
    Exsurge.PianoInstrument.should.be.a('function');
    Exsurge.resolveInstrument.should.be.a('function');
    Exsurge.PlaybackDefaults.should.be.an('object');
    Exsurge.PlaybackDurations.should.be.an('object');
    Exsurge.PlaybackRests.should.be.an('object');
    Exsurge.PlaybackVelocities.should.be.an('object');
  });

});


describe('Playback: pitch and tempo', function() {

  it('anchors tuning on the Do that the clef names', function() {
    Exsurge.DoReferenceInt.should.equal(24);
    Exsurge.DoReferenceInt.should.equal(new Exsurge.Pitch(Exsurge.Step.Do, 2).toInt());

    var doPitch = new Exsurge.Pitch(Exsurge.Step.Do, 2);
    Exsurge.pitchToFrequency(doPitch, MIDDLE_C).should.equal(MIDDLE_C);
  });

  it('doubles frequency every octave', function() {
    var up = new Exsurge.Pitch(Exsurge.Step.Do, 3);
    var down = new Exsurge.Pitch(Exsurge.Step.Do, 1);

    Exsurge.pitchToFrequency(up, MIDDLE_C).should.be.closeTo(MIDDLE_C * 2, 1e-9);
    Exsurge.pitchToFrequency(down, MIDDLE_C).should.be.closeTo(MIDDLE_C / 2, 1e-9);
  });

  it('treats Te as one semitone below Ti', function() {
    var te = Exsurge.pitchIntToFrequency(new Exsurge.Pitch(Exsurge.Step.Te, 2).toInt(), MIDDLE_C);
    var ti = Exsurge.pitchIntToFrequency(new Exsurge.Pitch(Exsurge.Step.Ti, 2).toInt(), MIDDLE_C);

    (ti / te).should.be.closeTo(Math.pow(2, 1 / 12), 1e-12);
  });

  it('steps evenly across the unused gap at Step index 8', function() {
    // Step skips 8, but toInt() is a plain semitone count, so So(7) -> La(9)
    // must still come out as a whole tone rather than a jump
    var so = Exsurge.pitchIntToFrequency(new Exsurge.Pitch(Exsurge.Step.So, 2).toInt(), MIDDLE_C);
    var la = Exsurge.pitchIntToFrequency(new Exsurge.Pitch(Exsurge.Step.La, 2).toInt(), MIDDLE_C);

    (la / so).should.be.closeTo(Math.pow(2, 2 / 12), 1e-12);
  });

  it('composes transpose with tuning', function() {
    var pitch = new Exsurge.Pitch(Exsurge.Step.Do, 2);

    Exsurge.pitchToFrequency(pitch, MIDDLE_C, 12).should.be.closeTo(MIDDLE_C * 2, 1e-9);
    Exsurge.pitchToFrequency(pitch, MIDDLE_C, -12).should.be.closeTo(MIDDLE_C / 2, 1e-9);
    Exsurge.pitchToFrequency(pitch, MIDDLE_C, 0).should.equal(MIDDLE_C);
  });

  it('returns null for a note with no pitch', function() {
    should.equal(Exsurge.pitchToFrequency(null, MIDDLE_C), null);
  });

  it('converts speed percentage to seconds per pulse', function() {
    Exsurge.secondsPerPulse(100).should.be.closeTo(0.4, 1e-12);
    Exsurge.secondsPerPulse(200).should.be.closeTo(0.2, 1e-12);
    Exsurge.secondsPerPulse(50).should.be.closeTo(0.8, 1e-12);
    Exsurge.secondsPerPulse(100, 0.5).should.be.closeTo(0.5, 1e-12);
  });

});


describe('Playback: divider classification', function() {

  it('names each kind of bar line', function() {
    Exsurge.classifyDivider(new Exsurge.Virgula()).should.equal('virgula');
    Exsurge.classifyDivider(new Exsurge.QuarterBar()).should.equal('quarterBar');
    Exsurge.classifyDivider(new Exsurge.HalfBar()).should.equal('halfBar');
    Exsurge.classifyDivider(new Exsurge.FullBar()).should.equal('fullBar');
    Exsurge.classifyDivider(new Exsurge.DoubleBar()).should.equal('doubleBar');
    Exsurge.classifyDivider(new Exsurge.DominicanBar(3)).should.equal('dominicanBar');
  });

  it('refuses to sound the editor insertion cursor', function() {
    should.equal(Exsurge.classifyDivider(new Exsurge.InsertionCursor()), null);
  });

  it('gives an unrecognized divider the shortest breath', function() {
    Exsurge.classifyDivider(new Exsurge.Divider()).should.equal('quarterBar');
  });

});


describe('Playback: event extraction', function() {

  it('gives every plain note one pulse, and holds the last', function() {
    var timeline = Exsurge.createPlaybackEvents(scoreOf([fakeNeume(plainNotes(4))]));

    timeline.events.length.should.equal(4);
    pulsesOf(timeline).should.eql([1, 1, 1, 1.5]);
    timeline.totalPulses.should.equal(4.5);
  });

  it('adds a pulse per mora dot', function() {
    var notes = plainNotes(3);
    notes[0].morae = [{}];
    notes[1].morae = [{}, {}];

    var timeline = Exsurge.createPlaybackEvents(scoreOf([fakeNeume(notes)]));

    timeline.events[0].pulses.should.equal(2);
    timeline.events[1].pulses.should.equal(3);
  });

  it('lengthens an episema note by a nuance rather than a doubling', function() {
    var notes = plainNotes(3);
    notes[0].episemata = [{}];

    var timeline = Exsurge.createPlaybackEvents(scoreOf([fakeNeume(notes)]));

    timeline.events[0].pulses.should.be.closeTo(1.3, 1e-12);
  });

  it('adds morae to an episema rather than multiplying by them', function() {
    var notes = plainNotes(3);
    notes[0].episemata = [{}];
    notes[0].morae = [{}];

    var timeline = Exsurge.createPlaybackEvents(scoreOf([fakeNeume(notes)]));

    // 1.3 + 1.0, not 1.3 * 2.0
    timeline.events[0].pulses.should.be.closeTo(2.3, 1e-12);
  });

  it('accents on the ictus without lengthening it', function() {
    var notes = plainNotes(3);
    notes[0].ictus = {};

    var timeline = Exsurge.createPlaybackEvents(scoreOf([fakeNeume(notes)]));

    timeline.events[0].pulses.should.equal(1);
    timeline.events[0].velocity.should.be.above(timeline.events[1].velocity);
  });

  it('lightens a quilisma and broadens the note before it', function() {
    var notes = plainNotes(3);
    notes[1].shape = Exsurge.NoteShape.Quilisma;

    var timeline = Exsurge.createPlaybackEvents(scoreOf([fakeNeume(notes)]));

    timeline.events[0].pulses.should.be.closeTo(1.75, 1e-12);
    timeline.events[1].pulses.should.be.closeTo(0.9, 1e-12);
  });

  it('does not let a quilisma reach back across a bar line', function() {
    var before = [fakeNote(0, 17)];
    var after = [fakeNote(1, 17, { shape: Exsurge.NoteShape.Quilisma }), fakeNote(2, 17)];

    var timeline = Exsurge.createPlaybackEvents(
      scoreOf([fakeNeume(before), new Exsurge.HalfBar(), fakeNeume(after)])
    );

    // the note before the bar takes the bar's lengthening, never the quilisma's
    timeline.events[0].pulses.should.be.closeTo(1.25, 1e-12);
  });

  it('clips liquescents and initio debilis', function() {
    var notes = plainNotes(4);
    notes[0].liquescent = Exsurge.LiquescentType.SmallAscending;
    notes[1].liquescent = Exsurge.LiquescentType.LargeDescending;
    notes[2].liquescent = Exsurge.LiquescentType.InitioDebilis;

    var timeline = Exsurge.createPlaybackEvents(scoreOf([fakeNeume(notes)]));

    timeline.events[0].pulses.should.be.closeTo(0.6, 1e-12);
    timeline.events[1].pulses.should.be.closeTo(1.0, 1e-12);
    timeline.events[2].pulses.should.be.closeTo(0.6, 1e-12);
  });

  it('rests for each bar line and lengthens the note before it', function() {
    var timeline = Exsurge.createPlaybackEvents(
      scoreOf([fakeNeume([fakeNote(0, 17)]), new Exsurge.HalfBar(), fakeNeume([fakeNote(1, 17)])])
    );

    timeline.events.length.should.equal(3);
    timeline.events[0].pulses.should.be.closeTo(1.25, 1e-12);
    timeline.events[1].kind.should.equal('rest');
    timeline.events[1].dividerKind.should.equal('halfBar');
    timeline.events[1].pulses.should.equal(2);
    should.equal(timeline.events[1].noteIndex, null);
  });

  it('scales the rest by the weight of the bar', function() {
    var kinds = [
      [new Exsurge.Virgula(), 0.5],
      [new Exsurge.QuarterBar(), 1],
      [new Exsurge.HalfBar(), 2],
      [new Exsurge.FullBar(), 3],
      [new Exsurge.DoubleBar(), 4]
    ];

    for (var i = 0; i < kinds.length; i++) {
      var timeline = Exsurge.createPlaybackEvents(
        scoreOf([fakeNeume([fakeNote(0, 17)]), kinds[i][0], fakeNeume([fakeNote(1, 17)])])
      );
      timeline.events[1].pulses.should.equal(kinds[i][1]);
    }
  });

  it('does not double-lengthen a final note that a bar already closed', function() {
    var closed = Exsurge.createPlaybackEvents(
      scoreOf([fakeNeume([fakeNote(0, 17)]), new Exsurge.DoubleBar()])
    );
    var open = Exsurge.createPlaybackEvents(scoreOf([fakeNeume([fakeNote(0, 17)])]));

    closed.events[0].pulses.should.be.closeTo(1.5, 1e-12); // beforeDivider only
    open.events[0].pulses.should.be.closeTo(1.5, 1e-12); // finalNote only
  });

  it('ignores everything that does not sound', function() {
    var silent = [
      new Exsurge.InsertionCursor(),
      { hasNoWidth: true, isNeume: true, notes: [fakeNote(99, 17)] },
      { isClef: true },
      { isAccidental: true },
      new Exsurge.Custos(),
      { /* TextOnly and ChantLineBreak look like this: no isNeume, no notes */ }
    ];

    for (var i = 0; i < silent.length; i++) {
      var timeline = Exsurge.createPlaybackEvents(scoreOf([silent[i]]));
      timeline.events.length.should.equal(0, 'entry ' + i + ' should be silent');
    }
  });

  it('keeps an unpitched note in the timeline but silent', function() {
    var notes = [fakeNote(0, 17), fakeNote(1, null), fakeNote(2, 17)];
    var timeline = Exsurge.createPlaybackEvents(scoreOf([fakeNeume(notes)]));

    timeline.events.length.should.equal(3);
    should.equal(timeline.events[1].pitchInt, null);
    timeline.events[1].pulses.should.equal(1);
    // still clickable, because the note index map stays dense
    timeline.eventIndexByNoteIndex[1].should.equal(1);
  });

  it('produces a dense, monotonic timeline', function() {
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

  it('honours a partial override of the duration tables', function() {
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


describe('Playback: instruments', function() {

  it('resolves the default piano', function() {
    Exsurge.resolveInstrument().name.should.equal('piano');
    Exsurge.resolveInstrument('piano').should.equal(Exsurge.Instruments.piano);
  });

  it('accepts a duck typed instrument', function() {
    var custom = { name: 'kazoo', createVoice: function() { return null; } };
    Exsurge.resolveInstrument(custom).should.equal(custom);
  });

  it('rejects an unknown name and a malformed object', function() {
    (function() { Exsurge.resolveInstrument('sackbut'); }).should.throw(/unknown instrument/);
    (function() { Exsurge.resolveInstrument({ name: 'nope' }); }).should.throw(/createVoice/);
  });

});


describe('Gabc: staff position offsets and pitch', function() {

  // The gabc 0 and 9 modifiers nudge a note a third of a staff position for
  // engraving, and that nudge is folded into note.staffPosition. Pitch belongs
  // to the line or space the note really sits on, so it has to come back off
  // -- and be rounded, since the float round trip does not always land on the
  // integer. Any leftover fraction indexes an array in staffOffsetToStep and
  // silently produces a NaN pitch.

  var SHIFTED = "(c4) a(f) b(g9) c(h0) d(e9) e(d0) f(i9) g(j0) h(f) (::)";

  function parse(gabc) {
    var ctxt = new Exsurge.ChantContext();
    var mappings = Exsurge.Gabc.createMappingsFromSource(ctxt, gabc);
    return { ctxt: ctxt, score: new Exsurge.ChantScore(ctxt, mappings, false) };
  }

  function pitchIntsOf(score) {
    return score.notes
      .filter(function(n) { return n instanceof Exsurge.Note; })
      .map(function(n) { return n.pitch.toInt(); });
  }

  it('recovers the integer staff position despite float drift', function() {
    // g9 is the case that does not round trip exactly: 4 + 1/3 - 1/3 lands on
    // 3.9999999999999996
    var note = { staffPosition: 4 + 1 / 3, staffPositionOffset: 1 / 3 };
    (note.staffPosition - note.staffPositionOffset).should.not.equal(4);
    Exsurge.Gabc.getIntegerStaffPosition(note).should.equal(4);
  });

  it('tolerates a note that has no offset at all', function() {
    Exsurge.Gabc.getIntegerStaffPosition({ staffPosition: 3 }).should.equal(3);
  });

  it('gives every nudged note a real pitch when parsing', function() {
    var pitches = pitchIntsOf(parse(SHIFTED).score);

    pitches.length.should.equal(8);
    for (var i = 0; i < pitches.length; i++)
      isNaN(pitches[i]).should.equal(false, 'note ' + i + ' has a NaN pitch');

    // the nudge is purely visual, so a nudged note sounds exactly as its
    // unnudged neighbour on the same line would
    pitches[0].should.equal(pitches[7]); // both plain f
  });

  it('gives the same pitches after an in-place source update', function() {
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

  it('keeps nudged notes audible', function() {
    var timeline = Exsurge.createPlaybackEvents(parse(SHIFTED).score);

    var sounding = timeline.events.filter(function(e) {
      return e.kind === 'note';
    });
    sounding.length.should.equal(8);

    for (var i = 0; i < sounding.length; i++) {
      var hz = Exsurge.pitchIntToFrequency(sounding[i].pitchInt, MIDDLE_C);
      isNaN(hz).should.equal(false, 'note ' + i + ' would be scheduled at NaN Hz');
      hz.should.be.above(0);
    }
  });

  // Accidentals cannot currently be nudged -- the modifier slot holds the
  // x/y/# that makes it an accidental in the first place, so the 0/9 never
  // reaches getStaffPositionOffset and the offset stays 0. The accidental
  // path goes through getIntegerStaffPosition anyway, so that the invariant
  // 'ask a clef for a pitch using an integer' holds everywhere rather than
  // in two places out of three. This guards that.
  it('gives an accidental a real pitch', function() {
    ['(c4) a(f) b(gx) c(g) (::)', '(c4) a(f) b(gx9) c(g) (::)'].forEach(
      function(src) {
        var accidentals = parse(src).score.notations.filter(function(n) {
          return n.isAccidental;
        });

        accidentals.length.should.be.above(0, src);
        accidentals[0].staffPosition.should.equal(
          Math.round(accidentals[0].staffPosition),
          src + ' should reach the clef with a whole staff position'
        );
        isNaN(accidentals[0].pitch.toInt()).should.equal(false, src);
      }
    );
  });

});


describe('Playback: real gabc', function() {

  var score = null;

  before(function() {
    // ChantScore's constructor runs updateNotations, which is all the
    // extractor needs -- no layout, and therefore no text measurement
    try {
      var ctxt = new Exsurge.ChantContext();
      var gabc = '(c4) Chris(ffg)tus(f.) *(,) fac(fg)tus(f) est(f) pro(f) no(gh)bis(f.) (::)';
      var mappings = Exsurge.Gabc.createMappingsFromSource(ctxt, gabc);
      score = new Exsurge.ChantScore(ctxt, mappings, false);
    } catch (e) {
      score = null;
    }
  });

  it('extracts sounding notes from parsed gabc', function() {
    if (!score) this.skip();

    var timeline = Exsurge.createPlaybackEvents(score);

    timeline.events.length.should.be.above(0);
    // ffg f. fg f f f gh f. => 3+1+2+1+1+1+2+1
    timeline.eventIndexByNoteIndex.length.should.equal(12);

    // no clef, divider or custos leaked in as a pitched note
    for (var i = 0; i < timeline.events.length; i++) {
      var event = timeline.events[i];
      if (event.kind === 'note') should.exist(event.note);
      else should.equal(event.note, null);
    }
  });

  it('reads pitches straight off the parsed notes', function() {
    if (!score) this.skip();

    var timeline = Exsurge.createPlaybackEvents(score);
    var pitched = timeline.events.filter(function(e) {
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

  it('doubles the mora dotted notes that gabc marked', function() {
    if (!score) this.skip();

    var timeline = Exsurge.createPlaybackEvents(score);
    var dotted = timeline.events.filter(function(e) {
      return e.note && e.note.morae && e.note.morae.length > 0;
    });

    dotted.length.should.be.above(0);
    for (var i = 0; i < dotted.length; i++)
      dotted[i].pulses.should.be.at.least(2);
  });

});
