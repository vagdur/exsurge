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
// Playback for rendered chant.
//
// ChantPlayer attaches to the svg node that ChantScore.createSvgNode produced,
// makes its notes clickable, and plays from whichever note was clicked while
// highlighting the note currently sounding. Hits are deliberately forgiving:
// a tap on a lyric starts that syllable, and a tap near a note (on the staff,
// or just missing the glyph) still counts -- square notes are only a few
// pixels on a phone. It has no user interface of its own: speed, tuning and
// instrument are constructor options, and hosts are expected to build their
// own controls on top of the setters.
//

import { Gabc } from "./Exsurge.Gabc.js";
import { ChantScore } from "./Exsurge.Chant.js";
import {
  createPlaybackEvents,
  pitchIntToFrequency,
  resolveTemperament,
  secondsPerPulse
} from "./Exsurge.Playback.Timeline.js";
import { resolveInstrument } from "./Exsurge.Playback.Instruments.js";

var SVG_NS = "http://www.w3.org/2000/svg";

// distinguishes one player's injected css from another's on the same page
var __playerSerial = 0;

/**
 * @typedef {object} PlaybackOptions
 * @property {number} [speed]
 * @property {number} [basePulseSeconds]
 * @property {number} [tuning]
 * @property {number} [transpose]
 * @property {any} [temperament]
 * @property {any} [instrument]
 * @property {number} [volume]
 * @property {boolean} [loop]
 * @property {number} [maxVoices]
 * @property {string} [highlightClass]
 * @property {string} [highlightColor]
 * @property {boolean} [injectStyle]
 * @property {boolean} [clearHighlightOnRest]
 * @property {boolean} [playOnBackgroundClick]
 * @property {number} [hitSlopPx]
 * @property {AudioContext|null} [audioContext]
 * @property {number} [lookaheadSeconds]
 * @property {number} [tickIntervalMs]
 * @property {object|null} [durations]
 * @property {object|null} [restWeights]
 * @property {object|null} [velocities]
 * @property {any} [language]
 * @property {Function|null} [onStart]
 * @property {Function|null} [onStop]
 * @property {Function|null} [onEnd]
 * @property {Function|null} [onNoteChange]
 * @property {((error: unknown, player: ChantPlayer|null) => void)|null} [onError]
 * @property {boolean} [useDropCap]
 * @property {boolean} [autoResize]
 */

/** @type {PlaybackOptions} */
export var PlaybackDefaults = {
  // tempo. secondsPerPulse = basePulseSeconds * 100 / speed, so a higher
  // percentage is faster. 0.4s per pulse is 150 pulses a minute.
  speed: 100,
  basePulseSeconds: 0.4,

  // Frequency of Do, i.e. of Pitch(Step.Do, 2), which is the Do that the clef
  // itself names. Every gabc clef is built at octave 2 regardless of which
  // staff line it sits on, so this is literally "what pitch is C played at".
  //
  // Note that for an f-clef the note sitting *on the clef line* is Fa, which
  // therefore sounds a perfect fourth above this frequency.
  tuning: 261.6255653,

  // extra semitones, applied after tuning. Chant has no absolute pitch, so
  // this is the knob for moving a piece into a comfortable range. It shifts
  // the piece without altering the intervals inside it, whatever the
  // temperament.
  transpose: 0,

  // How the twelve semitones are spaced: a key in Exsurge.Temperaments, or
  // your own function from signed semitones relative to Do to a frequency
  // ratio. "pythagorean" is the historically apt reading of chant -- pure 3:2
  // fifths, wide thirds -- while "equal" is what most listeners expect.
  temperament: "equal",

  // a key in Exsurge.Instruments, or an object implementing the instrument
  // interface described in Exsurge.Playback.Instruments.js
  instrument: "piano",

  volume: 1.0,
  loop: false,
  maxVoices: 8,

  highlightClass: "playing",
  highlightColor: "#cc0000",
  injectStyle: true,

  // false keeps the last note lit through a bar rest, which reads better than
  // a blink of nothing
  clearHighlightOnRest: false,

  // clicking somewhere other than a note, while stopped, does nothing.
  // Near-misses still count (see hitSlopPx); this flag is for taps on titles
  // and other empty score chrome.
  playOnBackgroundClick: false,

  // extra CSS pixels around each note glyph that still count as a hit. Square
  // notes render only a few pixels tall at the default staff size, so without
  // this a phone user has to pinch in just to start playback. 0 keeps exact
  // glyph and lyric hits but disables the near-miss fallback.
  hitSlopPx: 32,

  // supply your own context to share it with other audio on the page. If you
  // do, the player will never close it.
  audioContext: null,

  lookaheadSeconds: 0.25,
  tickIntervalMs: 40,

  // partial overrides of the tables in Exsurge.Playback.Timeline.js
  durations: null,
  restWeights: null,
  velocities: null,

  // Syllabifies the text under a reciting tone, which is how many times that
  // tone sounds. Null takes the language from the context the score was built
  // with, and Latin -- the same default ChantContext uses -- for a score built
  // without one. Set it only to override that, e.g. exsurge.language.swedish.
  language: null,

  onStart: null, // (player)
  onStop: null, // (player, reason) reason: 'user' | 'end' | 'destroy'
  onEnd: null, // (player) fired before onStop when playback runs out
  onNoteChange: null, // (noteIndex | null, event, player)
  onError: null // (error, player)
};

/**
 * @param {*} value
 */
function toArray(value) {
  if (!value) return [];
  if (Object.prototype.toString.call(value) === "[object Array]") return value;
  return [value];
}

/**
 * @param {*} element
 * @param {string} className
 */
function addClass(element, className) {
  var existing = element.getAttribute("class") || "";
  if ((" " + existing + " ").indexOf(" " + className + " ") >= 0) return;
  element.setAttribute(
    "class",
    existing ? existing + " " + className : className
  );
}

/**
 * @param {*} element
 * @param {string} className
 */
function removeClass(element, className) {
  var existing = element.getAttribute("class") || "";
  var parts = existing.split(/\s+/);
  var kept = [];
  for (var i = 0; i < parts.length; i++)
    if (parts[i] && parts[i] !== className) kept.push(parts[i]);
  element.setAttribute("class", kept.join(" "));
}

/**
 * @param {*} element
 * @param {string} className
 */
function hasClass(element, className) {
  var existing = element.getAttribute("class") || "";
  return (" " + existing + " ").indexOf(" " + className + " ") >= 0;
}

// Compares the two glyph lists a note can be drawn as. Highlighting is keyed
// on identity so that moving between notes that share a glyph -- the two notes
// of a porrectus -- does not toggle the class off and back on.
/**
 * @param {*} a
 * @param {*} b
 */
function sameElements(a, b) {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;

  for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;

  return true;
}

// Lyrics, translations and the drop cap are much larger than a punctum, so a
// tap on the text of a syllable should start that syllable rather than the
// geometrically nearest note (which, for a clivis, is often the second one).
var SYLLABLE_TEXT_SELECTOR = ".lyric, .translation, .aboveLinesText, .dropCap";

/**
 * @typedef {object} NoteHitBox
 * @property {number} noteIndex
 * @property {number} left
 * @property {number} top
 * @property {number} right
 * @property {number} bottom
 */

/**
 * @param {*} score
 * @param {*} element
 * @return {number|null}
 */
function noteIndexFromElement(score, element) {
  if (!element || !score || !score.notes) return null;
  var note = score.notes[Number(element.getAttribute("element-index"))];
  if (!note || typeof note.noteIndex !== "number") return null;
  return note.noteIndex;
}

/**
 * @param {*} score
 * @param {*} group
 * @return {number|null}
 */
function firstNoteIndexInGroup(score, group) {
  if (!group || typeof group.querySelectorAll !== "function") return null;
  var notes = group.querySelectorAll(".note");
  if (!notes.length) return null;
  return noteIndexFromElement(score, notes[0]);
}

/**
 * Picks the note whose glyph-box is closest to (x, y), provided it is within
 * slopPx of that box. Inside a glyph the distance is 0, so an exact hit always
 * beats a neighbour; overlapping expanded boxes then lose to the nearer
 * centre. Empty boxes (porrectus-end `<use>`s that draw nothing) are skipped.
 *
 * @param {number} x client X
 * @param {number} y client Y
 * @param {NoteHitBox[]} boxes
 * @param {number} slopPx
 * @return {number|null}
 */
export function nearestNoteIndexAtPoint(x, y, boxes, slopPx) {
  if (!isFinite(x) || !isFinite(y) || !boxes || !boxes.length) return null;

  var slop = slopPx > 0 ? slopPx : 0;
  var bestIndex = null;
  var bestDist = Infinity;
  var bestCenter = Infinity;

  for (var i = 0; i < boxes.length; i++) {
    var b = boxes[i];
    if (typeof b.noteIndex !== "number") continue;
    if (!(b.right > b.left) || !(b.bottom > b.top)) continue;

    var dx = x < b.left ? b.left - x : x > b.right ? x - b.right : 0;
    var dy = y < b.top ? b.top - y : y > b.bottom ? y - b.bottom : 0;
    var dist = dx === 0 && dy === 0 ? 0 : Math.sqrt(dx * dx + dy * dy);
    if (dist > slop) continue;

    var cx = x - (b.left + b.right) / 2;
    var cy = y - (b.top + b.bottom) / 2;
    var center = Math.sqrt(cx * cx + cy * cy);

    if (
      dist < bestDist ||
      (dist === bestDist && center < bestCenter) ||
      (dist === bestDist &&
        center === bestCenter &&
        (bestIndex === null || b.noteIndex < bestIndex))
    ) {
      bestIndex = b.noteIndex;
      bestDist = dist;
      bestCenter = center;
    }
  }

  return bestIndex;
}

/**
 * Resolves a pointer event on a rendered score to a noteIndex. Exact glyph
 * hits win, then a tap on the syllable's text (first note of that neume, or
 * note 0 for a drop cap), then the nearest glyph within slopPx.
 *
 * @param {*} evt
 * @param {*} score
 * @param {NoteHitBox[]} boxes
 * @param {number} slopPx
 * @return {number|null}
 */
export function noteIndexFromPointer(evt, score, boxes, slopPx) {
  var target = evt && evt.target;
  if (target && typeof target.closest === "function") {
    var hit = noteIndexFromElement(score, target.closest(".note"));
    if (hit !== null) return hit;

    var text = target.closest(SYLLABLE_TEXT_SELECTOR);
    if (text) {
      if (hasClass(text, "dropCap") || text.closest(".dropCap")) return 0;
      var fromGroup = firstNoteIndexInGroup(
        score,
        text.closest(".ChantNotationElement")
      );
      if (fromGroup !== null) return fromGroup;
    }
  }

  return nearestNoteIndexAtPoint(
    evt && evt.clientX,
    evt && evt.clientY,
    boxes,
    slopPx
  );
}

/**
 * Plays a rendered ChantScore, one note at a time, highlighting as it goes.
 *
 * @class
 */
export class ChantPlayer {
  /**
   * @param {*} score a score whose updateNotations has run
   * @param {SVGElement|SVGElement[]} [svgNode] output of score.createSvgNode
   * @param {PlaybackOptions} [options] see PlaybackDefaults
   * @param {object} options
   * @param {*} svgNode
   */
  constructor(score, svgNode, options) {
    this.score = score;
    /** @type {PlaybackOptions} */
    this.options = Object.assign({}, PlaybackDefaults, options || {});

    this.timeline = createPlaybackEvents(score, this.options);

    this.audioContext = this.options.audioContext || null;
    this.__ownsContext = false;
    this.__masterGain = null;
    this.__compressor = null;
    /** @type {{name?: string, createVoice: Function}} */
    this.__instrument = resolveInstrument(this.options.instrument);

    // resolved once here rather than per note, since it is consulted twice for
    // every event the scheduler touches
    this.__temperament = resolveTemperament(this.options.temperament);

    this.__state = "stopped";
    this.__currentNoteIndex = null;
    this.__currentElement = null;

    this.__roots = /** @type {any[]} */ ([]);
    this.__styleNodes = /** @type {any[]} */ ([]);
    this.__noteElements = /** @type {any[]} */ ([]);
    this.__rootClass = "exsurge-player-" + ++__playerSerial;

    this.__secondsPerPulse = secondsPerPulse(
      this.options.speed,
      this.options.basePulseSeconds
    );
    this.__originTime = 0;
    this.__scheduleIndex = 0;
    this.__highlightIndex = 0;
    this.__endPulse = 0;

    this.__voices = /** @type {any[]} */ ([]);
    this.__lastVoice = null;
    this.__lastFrequency = 0;

    this.__tickTimer = null;
    this.__rafId = null;

    var self = this;
    this.__boundClick = function (/** @type {*} */ evt) {
      self.__onClick(evt);
    };
    this.__boundTick = function () {
      self.__tick();
    };
    this.__boundFrame = function () {
      self.__frame();
    };

    if (svgNode) this.attach(svgNode);
  }

  get state() {
    return this.__state;
  }

  get currentNoteIndex() {
    return this.__currentNoteIndex;
  }

  get events() {
    return this.timeline.events;
  }

  get noteCount() {
    return this.timeline.eventIndexByNoteIndex.length;
  }

  get svgNode() {
    return this.__roots.length ? this.__roots[0] : null;
  }

  //
  // dom lifecycle
  //

  /**
   * Wires the player to one or more rendered svg nodes, replacing any previous
   * attachment. Safe to call while playing: a re-layout swaps the svg node but
   * changes neither note order nor pitch, so the audio continues untouched.
   *
   * @param {SVGElement|SVGElement[]} svgNode
   */
  attach(svgNode) {
    this.detach();

    this.__roots = toArray(svgNode);

    for (var i = 0; i < this.__roots.length; i++) {
      var root = this.__roots[i];
      addClass(root, this.__rootClass);
      root.addEventListener("click", this.__boundClick);
      if (this.options.injectStyle) this.__injectStyle(root);
    }

    this.__buildNoteElementMap();

    // a re-layout during playback drops the highlight along with the old dom
    if (this.__state === "playing" && this.__currentNoteIndex !== null) {
      var noteIndex = this.__currentNoteIndex;
      this.__currentNoteIndex = null;
      this.__currentElement = null;
      this.__applyHighlight(noteIndex);
    }
  }

  detach() {
    for (var i = 0; i < this.__roots.length; i++) {
      this.__roots[i].removeEventListener("click", this.__boundClick);
      removeClass(this.__roots[i], this.__rootClass);
    }

    for (var j = 0; j < this.__styleNodes.length; j++) {
      var style = this.__styleNodes[j];
      if (style.parentNode) style.parentNode.removeChild(style);
    }

    this.__roots = [];
    this.__styleNodes = [];
    this.__noteElements = [];
    this.__currentElement = null;
  }

  /**
   * Rebuilds the timeline after the underlying gabc changed. Stops playback
   * first, because note indices may have shifted underneath it.
   */
  refresh() {
    if (this.__state === "playing") this.stop();
    this.timeline = createPlaybackEvents(this.score, this.options);
    this.__buildNoteElementMap();
  }

  destroy() {
    if (this.__state === "playing") {
      this.__halt();
      this.__fire("onStop", [this, "destroy"]);
    }

    this.detach();

    if (this.__ownsContext && this.audioContext) {
      try {
        this.audioContext.close();
      } catch (e) {
        this.__ownsContext = false; // already closed
      }
    }

    this.audioContext = null;
    this.__masterGain = null;
    this.__compressor = null;
  }

  //
  // transport
  //

  /**
   * Starts playback. Must be called from inside a user gesture the first time,
   * so that the AudioContext is allowed to start.
   *
   * @param {number} [fromNoteIndex] defaults to the beginning
   */
  play(fromNoteIndex) {
    var events = this.timeline.events;
    if (!events.length) return;

    if (!this.__ensureAudio()) return;

    if (this.__state === "playing") this.__halt();

    var startIndex = this.__eventIndexForNote(fromNoteIndex);

    this.__secondsPerPulse = secondsPerPulse(
      this.options.speed,
      this.options.basePulseSeconds
    );

    var last = events[events.length - 1];
    this.__endPulse = last.startPulse + last.pulses;

    // absolute pulse arithmetic: startPulse stays the source of truth, and the
    // origin absorbs the offset of starting part way through. The small
    // pre-roll keeps the first note from being scheduled in the past.
    this.__originTime =
      this.audioContext.currentTime +
      0.06 -
      events[startIndex].startPulse * this.__secondsPerPulse;

    this.__scheduleIndex = startIndex;
    this.__highlightIndex = startIndex;
    this.__state = "playing";

    this.__fire("onStart", [this]);

    this.__tick();
    this.__frame();
  }

  stop() {
    if (this.__state !== "playing") return;
    this.__halt();
    this.__fire("onStop", [this, "user"]);
  }

  /**
   * Stops if playing, otherwise plays from the given note.
   *
   * @param {number} noteIndex
   */
  toggleAt(noteIndex) {
    if (this.__state === "playing") this.stop();
    else this.play(noteIndex);
  }

  /**
   * Creates and resumes the AudioContext. Call this from a user gesture if you
   * intend to drive playback from your own buttons rather than from clicks on
   * the score, since browsers only allow audio to start inside a gesture.
   *
   * @return {boolean} whether audio is now available
   */
  unlock() {
    return this.__ensureAudio();
  }

  //
  // settings
  //

  /**
   * @param {*} percent
   */
  setSpeed(percent) {
    this.setOptions({ speed: percent });
  }

  /**
   * @param {*} hz
   */
  setTuning(hz) {
    this.setOptions({ tuning: hz });
  }

  /**
   * @param {number} semitones
   */
  setTranspose(semitones) {
    this.setOptions({ transpose: semitones });
  }

  /**
   * @param {*} spec
   */
  setTemperament(spec) {
    this.setOptions({ temperament: spec });
  }

  /**
   * @param {*} spec
   */
  setInstrument(spec) {
    this.setOptions({ instrument: spec });
  }

  /**
   * @param {*} v
   */
  setVolume(v) {
    this.setOptions({ volume: v });
  }

  /**
   * Applies several options at once. All of them are safe to change during
   * playback; pitch and instrument changes take effect at the edge of the
   * scheduling horizon, a fraction of a second later.
   *
   * @param {object} partial
   */
  setOptions(partial) {
    if (!partial) return;

    var before = this.options;
    this.options = Object.assign({}, this.options, partial);

    if ("speed" in partial) {
      var speed = Number(this.options.speed);
      if (!isFinite(speed) || speed <= 0) speed = 100;
      this.options.speed = Math.min(400, Math.max(10, speed));
    }

    if ("instrument" in partial)
      this.__instrument = resolveInstrument(this.options.instrument);

    if ("temperament" in partial)
      this.__temperament = resolveTemperament(this.options.temperament);

    if ("volume" in partial && this.__masterGain)
      this.__masterGain.gain.value = this.__gainValue();

    if ("hitSlopPx" in partial) {
      var slop = Number(this.options.hitSlopPx);
      if (!isFinite(slop) || slop < 0) slop = 0;
      this.options.hitSlopPx = slop;
    }

    var tablesChanged =
      "durations" in partial ||
      "restWeights" in partial ||
      "velocities" in partial;
    if (tablesChanged) {
      var wasPlaying = this.__state === "playing";
      var resumeAt = this.__currentNoteIndex;
      this.timeline = createPlaybackEvents(this.score, this.options);
      if (wasPlaying) {
        this.__halt();
        this.play(resumeAt === null ? 0 : resumeAt);
      }
      return;
    }

    if (
      "highlightClass" in partial ||
      "highlightColor" in partial ||
      "injectStyle" in partial
    )
      this.__refreshStyle(before.highlightClass);

    if (this.__state !== "playing") return;

    if ("speed" in partial) this.__rebaseTempo();
    else if (
      "tuning" in partial ||
      "transpose" in partial ||
      "temperament" in partial ||
      "instrument" in partial
    )
      this.__rescheduleFuture(this.__currentPulse());
  }

  //
  // introspection
  //

  /**
   * The timeline resolved into seconds and hertz using the current settings.
   * Handy for debugging and tests; playback itself does not use it.
   *
   * @return {object[]}
   */
  getTimeline() {
    var spp = secondsPerPulse(
      this.options.speed,
      this.options.basePulseSeconds
    );
    var result = [];

    for (var i = 0; i < this.timeline.events.length; i++) {
      var ev = this.timeline.events[i];
      result.push({
        noteIndex: ev.noteIndex,
        frequency:
          ev.pitchInt === null
            ? null
            : pitchIntToFrequency(
                ev.pitchInt,
                this.options.tuning,
                this.options.transpose,
                this.__temperament
              ),
        startTime: ev.startPulse * spp,
        duration: ev.pulses * spp
      });
    }

    return result;
  }

  //
  // internals: audio
  //

  __gainValue() {
    var volume = Number(this.options.volume);
    if (!isFinite(volume) || volume < 0) volume = 1;
    return volume * 0.6;
  }

  __ensureAudio() {
    if (!this.audioContext) {
      var Ctor =
        typeof window === "undefined"
          ? null
          : window.AudioContext ||
            /** @type {any} */ (window).webkitAudioContext;

      if (!Ctor) {
        this.__fail(new Error("exsurge: Web Audio is not available here"));
        return false;
      }

      try {
        this.audioContext = new Ctor();
      } catch (e) {
        this.__fail(e);
        return false;
      }

      this.__ownsContext = true;
    }

    if (!this.__masterGain) this.__buildMasterChain();

    // browsers hand back a suspended context outside of a user gesture
    if (this.audioContext.state === "suspended" && this.audioContext.resume)
      this.audioContext.resume();

    return true;
  }

  __buildMasterChain() {
    var ctx = this.audioContext;

    this.__masterGain = ctx.createGain();
    this.__masterGain.gain.value = this.__gainValue();

    // chant is monophonic, so the only overlap is decay tails -- but those
    // still stack, and the compressor is cheap insurance against clipping
    this.__compressor = ctx.createDynamicsCompressor();
    this.__compressor.threshold.value = -14;
    this.__compressor.knee.value = 6;
    this.__compressor.ratio.value = 8;
    this.__compressor.attack.value = 0.003;
    this.__compressor.release.value = 0.25;

    this.__masterGain.connect(this.__compressor);
    this.__compressor.connect(ctx.destination);
  }

  /**
   * @param {*} event
   * @param {number} when
   */
  __startVoice(event, when) {
    var frequency = pitchIntToFrequency(
      event.pitchInt,
      this.options.tuning,
      this.options.transpose,
      this.__temperament
    );

    // a repeated note would otherwise beat against its own decaying tail
    if (this.__lastVoice && this.__lastFrequency > 0) {
      var cents = Math.abs(
        (1200 * Math.log(frequency / this.__lastFrequency)) / Math.LN2
      );
      if (cents < 5) this.__lastVoice.release(when);
    }

    var voice;
    try {
      voice = this.__instrument.createVoice(
        this.audioContext,
        this.__masterGain,
        frequency,
        when,
        event.velocity
      );
    } catch (e) {
      this.__fail(e);
      return;
    }

    voice.startTime = when;
    this.__voices.push(voice);
    this.__lastVoice = voice;
    this.__lastFrequency = frequency;

    this.__pruneVoices();
  }

  __pruneVoices() {
    var now = this.audioContext.currentTime;
    var live = [];

    for (var i = 0; i < this.__voices.length; i++) {
      var voice = this.__voices[i];
      if (voice.disposed || voice.endTime <= now) continue;
      live.push(voice);
    }

    // oldest first, so releasing from the front sheds the quietest tails
    while (live.length > this.options.maxVoices) {
      var oldest = live.shift();
      oldest.release(now);
    }

    this.__voices = live;
  }

  /**
   * @param {*} hard
   */
  __releaseAll(hard) {
    var now = this.audioContext ? this.audioContext.currentTime : 0;

    for (var i = 0; i < this.__voices.length; i++) {
      var voice = this.__voices[i];
      // a voice that never sounded can be killed outright without a click
      if (hard || (voice.startTime && voice.startTime > now)) voice.dispose();
      else voice.release(now);
    }

    this.__voices = [];
    this.__lastVoice = null;
    this.__lastFrequency = 0;
  }

  //
  // internals: scheduling
  //

  __currentPulse() {
    return (
      (this.audioContext.currentTime - this.__originTime) /
      this.__secondsPerPulse
    );
  }

  /**
   * @param {number} noteIndex
   */
  __eventIndexForNote(noteIndex) {
    var byNote = this.timeline.eventIndexByNoteIndex;

    if (typeof noteIndex !== "number" || noteIndex < 0) return 0;
    if (noteIndex >= byNote.length) noteIndex = byNote.length - 1;

    // a hole would mean a note that produced no event, which cannot currently
    // happen, but scanning forward is cheap and keeps this total
    for (var i = noteIndex; i < byNote.length; i++)
      if (typeof byNote[i] === "number") return byNote[i];

    return 0;
  }

  __tick() {
    if (this.__state !== "playing") return;

    var ctx = this.audioContext;
    var events = this.timeline.events;
    var horizon = ctx.currentTime + this.options.lookaheadSeconds;

    while (this.__scheduleIndex < events.length) {
      var event = events[this.__scheduleIndex];
      var when = this.__originTime + event.startPulse * this.__secondsPerPulse;
      if (when > horizon) break;

      if (event.kind === "note" && event.pitchInt !== null)
        this.__startVoice(event, Math.max(when, ctx.currentTime));

      this.__scheduleIndex++;
    }

    // The highlight normally rides on requestAnimationFrame, which is smoother
    // but stops entirely while the tab is hidden. Nudging it from here too --
    // setTimeout is throttled in the background but never stops -- means the
    // highlight always heals itself rather than staying stuck on a stale note.
    this.__advanceHighlight();

    var endsAt = this.__originTime + this.__endPulse * this.__secondsPerPulse;
    if (this.__scheduleIndex >= events.length && ctx.currentTime >= endsAt) {
      this.__reachedEnd();
      return;
    }

    this.__tickTimer = setTimeout(
      this.__boundTick,
      this.options.tickIntervalMs
    );
  }

  __reachedEnd() {
    this.__fire("onEnd", [this]);

    if (this.options.loop && this.__state === "playing") {
      // keep the voices ringing across the seam rather than cutting them off
      this.__originTime = this.audioContext.currentTime + 0.06;
      this.__scheduleIndex = 0;
      this.__highlightIndex = 0;
      this.__tick();
      return;
    }

    if (this.__state !== "playing") return;

    this.__halt();
    this.__fire("onStop", [this, "end"]);
  }

  __rebaseTempo() {
    var newSecondsPerPulse = secondsPerPulse(
      this.options.speed,
      this.options.basePulseSeconds
    );

    // pin the current position so a tempo change never jumps the playhead
    var now = this.audioContext.currentTime;
    var pulse = (now - this.__originTime) / this.__secondsPerPulse;

    this.__originTime = now - pulse * newSecondsPerPulse;
    this.__secondsPerPulse = newSecondsPerPulse;

    this.__rescheduleFuture(pulse);
  }

  /**
   * @param {*} fromPulse
   */
  __rescheduleFuture(fromPulse) {
    var now = this.audioContext.currentTime;
    var events = this.timeline.events;
    var kept = [];

    for (var i = 0; i < this.__voices.length; i++) {
      var voice = this.__voices[i];
      if (voice.startTime && voice.startTime > now) voice.dispose();
      else kept.push(voice);
    }
    this.__voices = kept;

    for (var j = 0; j < events.length; j++) {
      if (events[j].startPulse > fromPulse) {
        this.__scheduleIndex = j;
        return;
      }
    }

    this.__scheduleIndex = events.length;
  }

  __halt() {
    if (this.__tickTimer !== null) {
      clearTimeout(this.__tickTimer);
      this.__tickTimer = null;
    }

    if (this.__rafId !== null) {
      if (typeof cancelAnimationFrame === "function")
        cancelAnimationFrame(this.__rafId);
      this.__rafId = null;
    }

    this.__releaseAll(false);
    this.__state = "stopped";
    this.__clearHighlight();
  }

  //
  // internals: highlighting
  //

  // Moves the highlight to whatever is sounding right now. Reads the audio
  // clock rather than counting frames, so it cannot drift, and advancing the
  // index pointer makes it amortized O(1) however long the gap since the last
  // call was.
  __advanceHighlight() {
    if (this.__state !== "playing") return;

    var events = this.timeline.events;
    var pulse = this.__currentPulse();

    while (
      this.__highlightIndex + 1 < events.length &&
      events[this.__highlightIndex + 1].startPulse <= pulse
    )
      this.__highlightIndex++;

    var event = events[this.__highlightIndex];
    if (!event || event.startPulse > pulse) return;

    if (event.kind === "note") this.__setCurrent(event.noteIndex, event);
    else if (this.options.clearHighlightOnRest) this.__setCurrent(null, event);
  }

  __frame() {
    if (this.__state !== "playing") return;

    this.__advanceHighlight();

    if (typeof requestAnimationFrame === "function")
      this.__rafId = requestAnimationFrame(this.__boundFrame);
  }

  /**
   * @param {number} noteIndex
   * @param {*} event
   */
  __setCurrent(noteIndex, event) {
    if (noteIndex === this.__currentNoteIndex) return;

    this.__applyHighlight(noteIndex);
    this.__fire("onNoteChange", [noteIndex, event || null, this]);
  }

  /**
   * @param {number} noteIndex
   */
  __applyHighlight(noteIndex) {
    var elements =
      (noteIndex === null ? null : this.__noteElements[noteIndex]) || null;

    // the two notes of a porrectus share one drawn glyph, so moving between
    // them must not toggle the class off and back on
    /**
     * @param {*} element
     */
    if (!sameElements(elements, this.__currentElement)) {
      this.__eachCurrentElement((/** @type {*} */ element) =>
        removeClass(element, this.options.highlightClass)
      );
      if (elements)
        for (var i = 0; i < elements.length; i++)
          addClass(elements[i], this.options.highlightClass);
      this.__currentElement = elements;
    }

    this.__currentNoteIndex = noteIndex;
  }

  // the glyphs currently lit. Normally one, but a reciting tone that continues
  // onto further chant lines is drawn once per line and lights all at once.
  /**
   * @param {*} fn
   */
  __eachCurrentElement(fn) {
    var elements = this.__currentElement;
    if (!elements) return;
    for (var i = 0; i < elements.length; i++) fn(elements[i]);
  }

  /**
   */
  __clearHighlight() {
    this.__eachCurrentElement((/** @type {*} */ element) =>
      removeClass(element, this.options.highlightClass)
    );

    this.__currentElement = null;

    if (this.__currentNoteIndex !== null) {
      this.__currentNoteIndex = null;
      this.__fire("onNoteChange", [null, null, this]);
    }
  }

  __buildNoteElementMap() {
    this.__noteElements = [];

    for (var r = 0; r < this.__roots.length; r++) {
      var nodes = this.__roots[r].querySelectorAll(".note");

      for (var i = 0; i < nodes.length; i++) {
        var owner =
          this.score.notes[Number(nodes[i].getAttribute("element-index"))];
        if (!owner || typeof owner.noteIndex !== "number") continue;

        var element = nodes[i];

        // the second note of a porrectus is drawn by the combined glyph of the
        // first, and its own <use> has glyph code None -- it renders nothing,
        // so highlighting it would be invisible
        if (hasClass(element, "porrectus-end")) {
          var previous = nodes[i - 1];
          if (previous && hasClass(previous, "porrectus-start"))
            element = previous;
        }

        // A note is usually drawn once, but a reciting tone whose recited text
        // breaks across chant lines is drawn again at the head of every line
        // it continues onto, and all of those glyphs belong to this one note.
        var drawn = this.__noteElements[owner.noteIndex];

        if (!drawn) this.__noteElements[owner.noteIndex] = [element];
        else if (drawn.indexOf(element) < 0) drawn.push(element);
      }
    }
  }

  __styleText() {
    var root = "svg." + this.__rootClass;
    return (
      root +
      "{touch-action:manipulation}" +
      root +
      " .chantLine{cursor:pointer}" +
      root +
      " .note{cursor:pointer;pointer-events:bounding-box}" +
      root +
      " .lyric," +
      root +
      " .translation," +
      root +
      " .aboveLinesText," +
      root +
      " .dropCap{cursor:pointer}" +
      root +
      " .note." +
      this.options.highlightClass +
      "{fill:" +
      this.options.highlightColor +
      "}"
    );
  }

  /**
   * @param {*} root
   */
  __injectStyle(root) {
    // css inside inline svg is document global, so these rules are scoped by a
    // per player root class. Without that, two players on one page would fight
    // over the highlight color.
    var style = document.createElementNS(SVG_NS, "style");
    style.textContent = this.__styleText();
    root.appendChild(style);
    this.__styleNodes.push(style);
  }

  /**
   * @param {*} previousHighlightClass
   */
  __refreshStyle(previousHighlightClass) {
    /**
     * @param {*} element
     */
    if (
      previousHighlightClass &&
      previousHighlightClass !== this.options.highlightClass
    ) {
      this.__eachCurrentElement((/** @type {*} */ element) => {
        removeClass(element, previousHighlightClass);
        addClass(element, this.options.highlightClass);
      });
    }

    var i;

    if (!this.options.injectStyle) {
      for (i = 0; i < this.__styleNodes.length; i++)
        if (this.__styleNodes[i].parentNode)
          this.__styleNodes[i].parentNode.removeChild(this.__styleNodes[i]);
      this.__styleNodes = [];
      return;
    }

    if (!this.__styleNodes.length) {
      for (i = 0; i < this.__roots.length; i++)
        this.__injectStyle(this.__roots[i]);
      return;
    }

    for (i = 0; i < this.__styleNodes.length; i++)
      this.__styleNodes[i].textContent = this.__styleText();
  }

  //
  // internals: input
  //

  /**
   * @return {NoteHitBox[]}
   */
  __noteBoxes() {
    /** @type {NoteHitBox[]} */
    var boxes = [];

    for (var i = 0; i < this.__noteElements.length; i++) {
      var elements = this.__noteElements[i];
      if (!elements) continue;

      for (var j = 0; j < elements.length; j++) {
        var node = elements[j];
        if (typeof node.getBoundingClientRect !== "function") continue;
        var r = node.getBoundingClientRect();
        boxes.push({
          noteIndex: i,
          left: r.left,
          top: r.top,
          right: r.right,
          bottom: r.bottom
        });
      }
    }

    return boxes;
  }

  /**
   * @param {*} evt
   */
  __onClick(evt) {
    if (this.__state === "playing") {
      this.stop();
      return;
    }

    var noteIndex = noteIndexFromPointer(
      evt,
      this.score,
      this.__noteBoxes(),
      this.options.hitSlopPx
    );

    if (noteIndex !== null) {
      this.play(noteIndex);
      return;
    }

    if (this.options.playOnBackgroundClick) this.play(0);
  }

  //
  // internals: callbacks
  //

  /**
   * @param {string} name
   * @param {*} args
   */
  __fire(name, args) {
    var callback = /** @type {any} */ (this.options)[name];
    if (typeof callback !== "function") return;

    try {
      callback.apply(null, args);
    } catch (e) {
      // a throwing host callback must not take the scheduler down with it
      this.__fail(e);
    }
  }

  /**
   * @param {unknown} error
   */
  __fail(error) {
    if (typeof this.options.onError === "function") {
      this.options.onError(error, this);
      return;
    }
    throw error;
  }
}

/**
 * Renders gabc (or a prebuilt score) into a container and returns a player
 * wired to it.
 *
 * Layout is asynchronous, so the player arrives via the callback rather than
 * as a return value. The score is passed as a second argument so callers can
 * reach score-level state (annotation, titles, selection, …) without
 * reimplementing the layout / SVG / resize pipeline. Layout and render
 * failures are reported through `options.onError(error, player)` — `player`
 * is null when the failure happens before the player exists. Without an
 * onError, the error is written to `console.error` so a blank score is never
 * silent.
 *
 *   Exsurge.createPlayableChant(ctxt, gabc, el, { speed: 90 }, function(player, score) {
 *     mySpeedSlider.oninput = function() { player.setSpeed(this.value); };
 *   });
 *
 * GABC `annotation:` and `mode:` headers populate `score.annotation`
 * automatically (Gregorio's placement above the drop cap). Anything else
 * that must be set before layout — a custom annotation, titles, … — still
 * needs a score the caller owns. Pass a prebuilt ChantScore as the second
 * argument instead of a gabc string; a score that already has
 * `score.annotation` keeps it:
 *
 *   var score = new ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, gabc), true);
 *   score.annotation = new Annotation(ctxt, "%V%");
 *   Exsurge.createPlayableChant(ctxt, score, el, opts, onReady);
 *
 * @param {import("./Exsurge.Drawing.js").ChantContext} ctxt
 * @param {string|import("./Exsurge.Chant.js").ChantScore} gabcSourceOrScore
 * @param {HTMLElement} container emptied and filled with the rendered score
 * @param {PlaybackOptions} [options] see PlaybackDefaults, plus useDropCap and autoResize.
 *   autoResize (default true) installs a window resize listener; call
 *   player.destroy() to release it, especially before replacing the container.
 * @param {function} [onReady] receives (player, score)
 */
export function createPlayableChant(
  ctxt,
  gabcSourceOrScore,
  container,
  options,
  onReady
) {
  /** @type {PlaybackOptions} */
  var opts = options || {};

  /** @type {any} */
  var score;
  if (gabcSourceOrScore instanceof ChantScore) {
    score = gabcSourceOrScore;
  } else if (typeof gabcSourceOrScore === "string") {
    score = Gabc.createScoreFromSource(
      ctxt,
      gabcSourceOrScore,
      opts.useDropCap !== false
    );
  } else {
    throw new TypeError(
      "createPlayableChant: expected a gabc string or ChantScore as the second argument"
    );
  }

  var /** @type {any} */ player = null;
  var /** @type {any} */ resizeTimer = null;

  /**
   * @param {unknown} error
   */
  function reportError(error) {
    if (typeof opts.onError === "function") {
      /** @type {any} */
      opts.onError(error, player);
      return;
    }

    if (typeof console !== "undefined" && console.error) {
      console.error(error);
      return;
    }

    throw error;
  }

  /**
   * @param {*|undefined} callback
   */
  function render(callback) {
    // performLayoutAsync (and the resize debounce) can finish after the host
    // has replaced the container. Appending into a detached node looks like a
    // successful layout -- onReady fires, the player works -- with nothing
    // visible. Bail loudly rather than drawing into nothing.
    if (container.isConnected === false) {
      console.warn(
        "exsurge: createPlayableChant container is not in the document; skipping render. If you replaced the element, call player.destroy() first."
      );
      return;
    }

    score.layoutChantLines(ctxt, container.clientWidth, function () {
      if (container.isConnected === false) {
        console.warn(
          "exsurge: createPlayableChant container was detached during layout; skipping render."
        );
        return;
      }
      while (container.firstChild) container.removeChild(container.firstChild);
      container.appendChild(score.createSvgNode(ctxt));
      callback();
    });
  }

  function onResize() {
    // autoResize keeps this listener until destroy(); once the container is
    // gone there is nothing useful to do, and clientWidth is 0.
    if (container.isConnected === false) return;

    /** @type {any} */
    if (resizeTimer !== null) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resizeTimer = null;
      // only the second layout phase depends on width, and it changes neither
      // note order nor pitch -- so playback carries on across a resize
      try {
        render(function () {
          player.attach(/** @type {SVGElement} */ (container.firstChild));
        });
      } catch (error) {
        reportError(error);
      }
    }, 150);
  }

  score.performLayoutAsync(
    ctxt,
    function () {
      try {
        render(function () {
          try {
            player = new ChantPlayer(
              score,
              /** @type {SVGElement} */ (container.firstChild),
              opts
            );

            if (opts.autoResize !== false && typeof window !== "undefined") {
              window.addEventListener("resize", onResize);

              var innerDestroy = player.destroy;
              player.destroy = function () {
                window.removeEventListener("resize", onResize);
                /** @type {any} */
                if (resizeTimer !== null) clearTimeout(resizeTimer);
                /** @type {any} */
                innerDestroy.call(player);
              };
            }

            if (typeof onReady === "function") onReady(player, score);
          } catch (error) {
            reportError(error);
          }
        });
      } catch (error) {
        reportError(error);
      }
    },
    reportError
  );
}
