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
// Instruments for chant playback.
//
// An instrument is anything with this shape:
//
//   {
//     name: string,
//     createVoice(audioCtx, destination, frequency, when, velocity) -> Voice
//   }
//
// and a voice is anything with this shape:
//
//   {
//     endTime: number,        // audio time after which the voice is silent
//     release(when),          // begin the release envelope
//     dispose()               // hard stop, disconnect, drop references
//   }
//
// The interface is duck typed on purpose: consumers can pass a plain object
// literal without importing anything from exsurge.
//
// Nothing in this file touches Web Audio at module scope, so requiring the
// bundle in node stays safe.
//

// Ratio, relative gain and decay time (seconds) of each sine partial. The
// short lived 8th partial is the hammer transient that gives the attack its
// ping; without it the tone reads as an organ rather than a piano.
var PIANO_PARTIALS = [
  { ratio: 1, gain: 1.0, decay: 2.2 },
  { ratio: 2, gain: 0.35, decay: 1.3 },
  { ratio: 3, gain: 0.16, decay: 0.85 },
  { ratio: 4, gain: 0.09, decay: 0.6 },
  { ratio: 5, gain: 0.05, decay: 0.42 },
  { ratio: 6, gain: 0.03, decay: 0.3 },
  { ratio: 8, gain: 0.02, decay: 0.07 }
];

// Real piano strings are stiff, so their partials sit slightly sharp of exact
// harmonics: f_n = f0 * n * sqrt(1 + B * n^2). A little of this is the
// difference between "additive synthesis" and "piano".
var PIANO_INHARMONICITY = 0.0004;

var PIANO_ATTACK = 0.005; // seconds
var PIANO_PEAK = 0.22; // per voice gain, before the master chain
var PIANO_RELEASE_TAU = 0.03; // time constant used when a voice is cut short

/**
 * A single sounding note. Voices retire themselves once their oscillators
 * finish, so forgetting to stop one leaks nothing.
 *
 * @class
 */
export class Voice {
  /**
   * @param {*} audioContext
   * @param {*} output
   * @param {*} parts
   * @param {number} endTime
   */
  constructor(audioContext, output, parts, endTime) {
    this.audioContext = audioContext;
    this.output = output;
    this.parts = parts;
    this.endTime = endTime;
    this.released = false;
    this.disposed = false;

    var self = this;
    if (parts.length) {
      parts[0].osc.onended = function () {
        self.dispose();
      };
    }
  }

  /**
   * @param {number} when
   */
  release(when) {
    if (this.released || this.disposed) return;
    this.released = true;

    var t = Math.max(when, this.audioContext.currentTime);
    var stopAt = t + PIANO_RELEASE_TAU * 8;

    for (var i = 0; i < this.parts.length; i++) {
      var gain = this.parts[i].gain.gain;
      gain.cancelScheduledValues(t);
      gain.setTargetAtTime(0.0001, t, PIANO_RELEASE_TAU);
      try {
        this.parts[i].osc.stop(stopAt);
      } catch (e) {
        // already stopped, or stop() already scheduled earlier than this
        this.released = true;
      }
    }

    this.endTime = stopAt;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;

    for (var i = 0; i < this.parts.length; i++) {
      try {
        this.parts[i].osc.onended = null;
        this.parts[i].osc.stop();
      } catch (e) {
        this.disposed = true; // never started, or already stopped
      }
      try {
        this.parts[i].osc.disconnect();
        this.parts[i].gain.disconnect();
      } catch (e) {
        this.disposed = true; // already disconnected
      }
    }

    try {
      this.output.disconnect();
    } catch (e) {
      this.disposed = true; // already disconnected
    }

    this.parts = [];
  }
}

/**
 * A simple simulated piano, built from decaying sine partials. No samples, so
 * exsurge keeps its zero runtime dependencies.
 *
 * @class
 */
export class PianoInstrument {
  constructor() {
    this.name = "piano";
  }

  /**
   * @param {*} audioContext
   * @param {*} destination
   * @param {number} frequency
   * @param {number} when
   * @param {number} velocity
   */
  createVoice(audioContext, destination, frequency, when, velocity) {
    var output = audioContext.createGain();
    output.gain.setValueAtTime(PIANO_PEAK * (velocity || 1), when);
    output.connect(destination);

    var nyquist = audioContext.sampleRate / 2;
    var parts = [];
    var endTime = when;

    for (var i = 0; i < PIANO_PARTIALS.length; i++) {
      var partial = PIANO_PARTIALS[i];
      var f =
        frequency *
        partial.ratio *
        Math.sqrt(1 + PIANO_INHARMONICITY * partial.ratio * partial.ratio);

      // high notes run their upper partials past Nyquist, where they would
      // alias back down as inharmonic garbage
      if (f >= nyquist * 0.95) continue;

      var gain = audioContext.createGain();
      gain.gain.setValueAtTime(0, when);
      gain.gain.linearRampToValueAtTime(partial.gain, when + PIANO_ATTACK);
      gain.gain.setTargetAtTime(0.0001, when + PIANO_ATTACK, partial.decay / 3);

      var osc = audioContext.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, when);
      osc.connect(gain);
      gain.connect(output);

      // a hard stop so the node retires itself even if nobody calls release
      var stopAt = when + PIANO_ATTACK + partial.decay * 1.6;
      osc.start(when);
      osc.stop(stopAt);

      if (stopAt > endTime) endTime = stopAt;
      parts.push({ osc: osc, gain: gain });
    }

    return new Voice(audioContext, output, parts, endTime);
  }
}

/**
 * The instruments a ChantPlayer will accept by name. Add to this object to
 * register your own:
 *
 *   Exsurge.Instruments.organ = new MyOrganInstrument();
 */
export var /** @type {Record<string, any>} */ Instruments = {
    piano: new PianoInstrument()
  };

/**
 * Resolves an instrument option, which may be a key into Instruments or an
 * object implementing the instrument interface directly.
 *
 * @param {string|{name?: string, createVoice: Function}} [spec]
 * @return {{name?: string, createVoice: Function}} an instrument
 */
export function resolveInstrument(spec) {
  if (!spec) return Instruments.piano;

  if (typeof spec === "string") {
    var found = Instruments[spec];
    if (!found) throw new Error("exsurge: unknown instrument '" + spec + "'");
    return found;
  }

  if (typeof spec.createVoice !== "function")
    throw new Error(
      "exsurge: an instrument must have a createVoice(audioContext, destination, frequency, when, velocity) method"
    );

  return spec;
}
