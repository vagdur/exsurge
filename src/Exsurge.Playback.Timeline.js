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

//
// Playback timeline: turns a laid out (or merely parsed) ChantScore into an
// ordered list of sounding events measured in *pulses*.
//
// This module is deliberately pure: it touches no DOM and no Web Audio, so it
// can be unit tested in bare node against the built bundle. Seconds and
// frequencies are not computed here -- the player converts pulses to seconds
// and pitches to hertz at schedule time, which is what makes changing the
// tempo or the tuning mid-playback cheap.
//

import { Pitch, Step } from "./Exsurge.Core.js";
import { LiquescentType, NoteShape } from "./Exsurge.Chant.js";
import {
  DominicanBar,
  DoubleBar,
  FullBar,
  HalfBar,
  InsertionCursor,
  QuarterBar,
  Virgula
} from "./Exsurge.Chant.Signs.js";
import { language } from "./Exsurge.Text.js";

// Gabc clefs are always constructed at octave 2 (see Gabc.parseNotations), so
// Pitch(Step.Do, 2) is the Do that the clef itself names, whichever staff line
// the clef happens to sit on. That makes it the natural anchor for tuning:
// `tuning` is, quite literally, the frequency at which C is played.
export var DoReferenceInt = new Pitch(Step.Do, 2).toInt(); // === 24

// One pulse is the Solesmes chronos protos -- the indivisible beat that every
// note is worth by default. Chant carries no notated durations, so everything
// below is interpretive. The three tables in this file are the single place to
// change if you disagree with the interpretation.
//
// Every entry is a MULTIPLIER except `perMora`, which is ADDITIVE: a mora dot
// lengthens a note by adding a pulse, so a note that is both episema'd and
// mora'd is worth 1.3 + 1.0 = 2.3 pulses, not 1.3 * 2.0 = 2.6.
export var PlaybackDurations = {
  base: 1.0,

  perMora: 1.0, // ADDITIVE: each mora dot adds this many pulses

  episema: 1.3, // horizontal episema: a nuance, not a doubling
  ictus: 1.0, // the vertical episema is a rhythmic accent, not a lengthening

  quilisma: 0.9, // the quilisma itself is light...
  beforeQuilisma: 1.75, // ...and the note before it is broadened

  liquescentSmall: 0.6, // clipped
  liquescentLarge: 1.0, // full value
  initioDebilis: 0.6,

  stropha: 1.0, // apostropha/distropha/tristropha are equal repeated notes
  oriscus: 1.0,

  // A reciting tone with no text under it stands in for a stretch of
  // recitation that has not been written out -- psalm tone templates are
  // engraved this way -- so it is held rather than sounded once. With text
  // under it there is nothing to guess: it sounds once per recited syllable.
  recitationWithoutText: 3.5,

  finalNote: 1.5, // last sounding note, when no bar line closes the piece

  // the note immediately preceding each kind of bar line
  beforeDivider: {
    virgula: 1.0,
    quarterBar: 1.0,
    dominicanBar: 1.0,
    halfBar: 1.25,
    fullBar: 1.5,
    doubleBar: 1.5
  }
};

// Pulses of silence contributed by each kind of bar line.
export var PlaybackRests = {
  virgula: 0.5,
  quarterBar: 1.0,
  dominicanBar: 1.0,
  halfBar: 2.0,
  fullBar: 3.0,
  doubleBar: 4.0
};

// Gain multipliers. These never affect duration.
export var PlaybackVelocities = {
  base: 1.0,
  ictus: 1.15,
  accent: 1.15,
  quilisma: 0.85,
  liquescentSmall: 0.7,
  initioDebilis: 0.6
};

// Ordered because these are all siblings extending Divider, so `instanceof`
// alone would not disambiguate them. InsertionCursor is checked first and maps
// to null: it is an editor artifact with no width and must never sound.
//
// This must stay instanceof-based. Matching on constructor.name would break in
// dist/exsurge.min.js, where UglifyJS mangles class names.
/** @type {[Function, string|null][]} */
var __dividerKinds = [
  [InsertionCursor, null],
  [Virgula, "virgula"],
  [DoubleBar, "doubleBar"],
  [FullBar, "fullBar"],
  [HalfBar, "halfBar"],
  [QuarterBar, "quarterBar"],
  [DominicanBar, "dominicanBar"]
];

/**
 * Identifies which kind of bar line a divider is, for rest length purposes.
 *
 * @param {import("./Exsurge.Chant.Signs.js").Divider} divider
 * @return {string|null} a key into PlaybackRests, or null if it never sounds
 */
export function classifyDivider(divider) {
  for (var i = 0; i < __dividerKinds.length; i++) {
    if (divider instanceof __dividerKinds[i][0]) return __dividerKinds[i][1];
  }

  // an unrecognized Divider subclass gets the shortest breath rather than
  // being dropped, so new bar types degrade audibly rather than silently
  return "quarterBar";
}

/**
 * Converts an exsurge pitch integer to a frequency in hertz.
 *
 * @param {number} pitchInt result of Pitch.toInt()
 * @param {number} tuning frequency of Do, i.e. of Pitch(Step.Do, 2)
 * @param {number} [transpose] additional semitones
 * @return {number} frequency in hertz
 */
export function pitchIntToFrequency(pitchInt, tuning, transpose) {
  var semitones = pitchInt - DoReferenceInt + (transpose || 0);
  return tuning * Math.pow(2, semitones / 12);
}

/**
 * Converts a Pitch to a frequency in hertz.
 *
 * @param {Pitch} pitch may be null, for a note that has no pitch
 * @param {number} tuning frequency of Do, i.e. of Pitch(Step.Do, 2)
 * @param {number} [transpose] additional semitones
 * @return {number|null} frequency in hertz, or null if the pitch was null
 */
export function pitchToFrequency(pitch, tuning, transpose) {
  if (!pitch) return null;
  return pitchIntToFrequency(pitch.toInt(), tuning, transpose);
}

/**
 * How long one pulse lasts, in seconds.
 *
 * @param {number} speedPercent percentage of the base speed; higher is faster
 * @param {number} [basePulseSeconds] seconds per pulse at 100%
 * @return {number} seconds
 */
export function secondsPerPulse(speedPercent, basePulseSeconds) {
  var base = typeof basePulseSeconds === "number" ? basePulseSeconds : 0.4;
  var percent = typeof speedPercent === "number" ? speedPercent : 100;
  if (percent <= 0) percent = 100;
  return (base * 100) / percent;
}

// builds the mutable slot for a single note. `mult` accumulates multipliers,
// `add` accumulates additive lengthening; the final worth is mult + add.
function makeNoteSlot(note, durations, velocities) {
  var mult = durations.base;
  var add = 0;
  var velocity = velocities.base;

  if (note.morae && note.morae.length)
    add += note.morae.length * durations.perMora;

  if (note.episemata && note.episemata.length) mult *= durations.episema;

  if (note.ictus) {
    mult *= durations.ictus;
    velocity *= velocities.ictus;
  }

  if (note.accent) velocity *= velocities.accent;

  if (note.shape === NoteShape.Quilisma) {
    mult *= durations.quilisma;
    velocity *= velocities.quilisma;
  } else if (note.shape === NoteShape.Stropha) {
    mult *= durations.stropha;
  } else if (note.shape === NoteShape.Oriscus) {
    mult *= durations.oriscus;
  }

  // LiquescentType values are combinable bit flags, so these must be masked
  // rather than compared. InitioDebilis wins over the ascending/descending
  // large and small variants.
  var liquescent = note.liquescent || LiquescentType.None;
  if (liquescent & LiquescentType.InitioDebilis) {
    mult *= durations.initioDebilis;
    velocity *= velocities.initioDebilis;
  } else if (liquescent & LiquescentType.Small) {
    mult *= durations.liquescentSmall;
    velocity *= velocities.liquescentSmall;
  } else if (liquescent & LiquescentType.Large) {
    mult *= durations.liquescentLarge;
  }

  return {
    kind: "note",
    note: note,
    noteIndex: note.noteIndex,
    elementIndex: note.elementIndex,
    pitchInt: note.pitch ? note.pitch.toInt() : null,
    dividerKind: null,
    mult: mult,
    add: add,
    velocity: velocity
  };
}

// The text a reciting tone carries, as it was written. Laying the score out
// narrow enough breaks a long recitation across chant lines, which moves part
// of the text onto a synthesized continuation; the timeline reads through that
// so playback does not depend on how wide the score happens to be.
function recitedText(notation) {
  var lyric = notation.lyrics && notation.lyrics[0];

  if (!lyric) return "";

  return typeof lyric.unsplitText === "string"
    ? lyric.unsplitText
    : lyric.text || "";
}

// How many syllables of text a reciting tone carries, which is how many times
// it sounds. Zero means it carries no text at all.
function recitedSyllableCount(notation, defaultLanguage) {
  var text = recitedText(notation);

  if (!/\S/.test(text)) return 0;

  var lyric = notation.lyrics[0];
  var words;

  // Not every Language can syllabify. English, for one, implements only
  // findVowelSegment, and Language.syllabifyWord throws for anything that has
  // not overridden it -- so playing a score with `language: language.english`
  // would fail outright rather than merely mis-count. The recitation still has
  // to sound, and one pulse per word is far closer than letting a whole clause
  // by in a single pulse, so that is what an unsyllabifiable language gets.
  try {
    words = (lyric.language || defaultLanguage).syllabify(text);
  } catch {
    return text.trim().split(/\s+/).length;
  }

  var count = 0;

  for (var i = 0; i < words.length; i++) count += words[i].length;

  // a syllabifier that made nothing of the text still leaves us with text to
  // sing, so fall back to sounding the tone once
  return count || 1;
}

// A syllable of recitation that is not the last one: the written note's
// ornaments -- a mora, an episema -- belong to the end of the recitation, not
// to every syllable of it, so these are plain notes at the reciting pitch.
function makeRecitedSlot(note, durations, velocities) {
  return {
    kind: "note",
    note: note,
    noteIndex: note.noteIndex,
    elementIndex: note.elementIndex,
    pitchInt: note.pitch ? note.pitch.toInt() : null,
    dividerKind: null,
    mult: durations.base,
    add: 0,
    velocity: velocities.base
  };
}

/**
 * Walks a ChantScore and produces the ordered list of playback events.
 *
 * The score need not be laid out: ChantScore's constructor runs
 * updateNotations, which is what assigns the noteIndex and elementIndex values
 * this depends on.
 *
 * Note pitches are read straight off note.pitch, never re-derived from staff
 * positions. Gabc bakes the active clef and accidental into note.pitch at parse
 * time, so mid-score clef changes and accidentals are already accounted for.
 *
 * @typedef {object} PlaybackEvent
 * @property {"note"|"rest"} kind
 * @property {object|null} note the source note, or null for a rest
 * @property {number|null} noteIndex index into score.notes, null for a rest
 * @property {number|null} elementIndex
 * @property {number|null} pitchInt absolute semitone, null when unpitched
 * @property {string|undefined} dividerKind set on rests produced by a bar line
 * @property {number} velocity 0 for silent events
 * @property {number} startPulse cumulative pulse offset of this event
 * @property {number} pulses duration of this event in pulses
 */

/**
 * @typedef {object} PlaybackTimeline
 * @property {PlaybackEvent[]} events dense and monotonic in startPulse
 * @property {number} totalPulses
 * @property {number[]} eventIndexByNoteIndex maps a note index to its event
 */

/**
 * @param {import("./Exsurge.Chant.js").ChantScore} score
 * @param {{durations?: {beforeDivider?: object}, restWeights?: object, velocities?: object, classifyDivider?: Function, language?: import("./Exsurge.Text.js").Language}} [options] `language` overrides the syllabifier used for reciting tones; by default it is the one on the score's context
 * @return {PlaybackTimeline}
 */
export function createPlaybackEvents(score, options) {
  var opts = options || {};

  var durations = Object.assign({}, PlaybackDurations, opts.durations || {});
  durations.beforeDivider = Object.assign(
    {},
    PlaybackDurations.beforeDivider,
    (opts.durations || {}).beforeDivider || {}
  );
  var rests = Object.assign({}, PlaybackRests, opts.restWeights || {});
  var velocities = Object.assign({}, PlaybackVelocities, opts.velocities || {});
  var classify = opts.classifyDivider || classifyDivider;

  // Counting the syllables under a reciting tone needs a syllabifier, and it
  // has to be the one the score is written in: Latin reads the <ae> of
  // Israels as a diphthong and counts two syllables where Swedish counts
  // three. Unless the caller names a language, take it from the context the
  // score was built with, so that setting ctxt.defaultLanguage is enough and
  // playback cannot silently disagree with the layout. Scores built without a
  // context -- the timeline needs no layout, only updateNotations -- keep the
  // same Latin fallback ChantContext itself defaults to. A lyric that names
  // its own language still wins, as it does in layout.
  var defaultLanguage =
    opts.language ||
    (score && score.ctxt && score.ctxt.defaultLanguage) ||
    language.latin;

  var notations = (score && score.notations) || [];
  var slots = [];

  // the most recent note slot within the current phrase. Nulled at every bar
  // line, so that nothing reaches backwards across a breath.
  var previousNote = null;

  var i, j;

  for (i = 0; i < notations.length; i++) {
    var notation = notations[i];

    // {bracketed} notations are zero width overlays of notations that already
    // sound elsewhere; playing them would double every note they cover
    if (notation.hasNoWidth) continue;

    // reciting tones synthesized when a recitation breaks across chant lines
    // are engraving marks -- the pitch they carry is already in the timeline
    // from the notation they continue
    if (notation.isRecitationContinuation) continue;

    // clefs and accidentals affect pitch, but Gabc already applied them to
    // note.pitch at parse time, so there is nothing left to do here
    if (notation.isClef || notation.isAccidental) continue;

    if (notation.isDivider) {
      var kind = classify(notation);
      if (kind === null) continue; // InsertionCursor and friends

      if (previousNote)
        previousNote.mult *= durations.beforeDivider[kind] || 1.0;

      slots.push({
        kind: "rest",
        note: null,
        noteIndex: null,
        elementIndex: notation.elementIndex,
        pitchInt: null,
        dividerKind: kind,
        mult: rests[kind] || 0,
        add: 0,
        velocity: 0
      });

      previousNote = null;
      continue;
    }

    // Custos, TextOnly and ChantLineBreak all land here: none of them is a
    // neume, none of them has notes, and none of them sounds
    if (!notation.isNeume || !notation.notes) continue;

    // A reciting tone is a direction rather than a note: everything written
    // under it is recited on the one pitch, a syllable to a pulse, exactly as
    // if each syllable carried its own punctum. With nothing written under it
    // the recitation is left to the singer, so all that can be done is to hold
    // the pitch.
    if (notation.isRecitationTone) {
      var recited = notation.notes[0];

      if (typeof recited.noteIndex !== "number") continue;

      var syllables = recitedSyllableCount(notation, defaultLanguage);

      for (j = 0; j + 1 < syllables; j++)
        slots.push(makeRecitedSlot(recited, durations, velocities));

      // the written note itself is the last syllable, so that a mora or an
      // episema on it lengthens the end of the recitation rather than all of
      // it, and a following bar line lengthens that same last syllable
      var lastSlot = makeNoteSlot(recited, durations, velocities);
      if (syllables === 0) lastSlot.mult *= durations.recitationWithoutText;

      slots.push(lastSlot);
      previousNote = lastSlot;
      continue;
    }

    for (j = 0; j < notation.notes.length; j++) {
      var note = notation.notes[j];
      if (typeof note.noteIndex !== "number") continue;

      var slot = makeNoteSlot(note, durations, velocities);

      // a quilisma broadens the note before it, but never across a bar line
      if (note.shape === NoteShape.Quilisma && previousNote)
        previousNote.mult *= durations.beforeQuilisma;

      slots.push(slot);
      previousNote = slot;
    }
  }

  // Hold the last note of the piece -- but only if no bar line closed it,
  // since beforeDivider has already lengthened it in that case.
  if (previousNote) previousNote.mult *= durations.finalNote;

  var events = [];
  var eventIndexByNoteIndex = [];
  var pulse = 0;

  for (i = 0; i < slots.length; i++) {
    var s = slots[i];
    var pulses = s.mult + s.add;

    // a bar line configured to zero contributes nothing at all
    if (s.kind === "rest" && pulses <= 0) continue;
    if (pulses < 0) pulses = 0;

    // A reciting tone contributes one event per recited syllable, all of them
    // the same note, so this keeps the first: seeking to that note should put
    // you at the start of the recitation rather than at its last syllable.
    if (
      s.noteIndex !== null &&
      eventIndexByNoteIndex[s.noteIndex] === undefined
    )
      eventIndexByNoteIndex[s.noteIndex] = events.length;

    events.push({
      kind: s.kind,
      note: s.note,
      noteIndex: s.noteIndex,
      elementIndex: s.elementIndex,
      pitchInt: s.pitchInt,
      dividerKind: s.dividerKind,
      velocity: s.velocity,
      startPulse: pulse,
      pulses: pulses
    });

    pulse += pulses;
  }

  return {
    events: events,
    totalPulses: pulse,
    eventIndexByNoteIndex: eventIndexByNoteIndex
  };
}
