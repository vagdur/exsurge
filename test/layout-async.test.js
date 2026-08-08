//
// Tests for performLayoutAsync failure reporting (issue #13): the hyphen-width
// retry must be bounded, throws inside a layout chunk must reach the caller,
// and createPlayableChant must surface both through options.onError.
//

import { afterEach, beforeEach, describe, it, vi, chai } from "vitest";
import * as Exsurge from "../src/index.js";

var should = chai.should();

// Same stub as lyrics.test.js: half-em advance per character so hyphenWidth /
// lyricSize lands at 0.5, under the 0.6 sanity threshold.
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

function scoreFromGabc(gabc, withFont) {
  var ctxt = new Exsurge.ChantContext();
  if (withFont) ctxt.fontDictionary = /** @type {any} */ (stubFontDictionary());

  var mappings = Exsurge.Gabc.createMappingsFromSource(ctxt, gabc);
  var score = new Exsurge.ChantScore(ctxt, mappings, false);
  return { ctxt: ctxt, score: score };
}

describe("performLayoutAsync: hyphen-width retry", function () {
  beforeEach(function () {
    vi.useFakeTimers();
  });

  afterEach(function () {
    vi.useRealTimers();
  });

  it("gives up after MAX_HYPHEN_WIDTH_RETRIES and calls errorCallback", function () {
    var { ctxt, score } = scoreFromGabc("(c4) A(g) men.(g.)", false);
    // no font dictionary => hyphenWidth stays 0, sanity check never passes
    ctxt.hyphenWidth.should.equal(0);

    var finished = false;
    var error = null;

    score.performLayoutAsync(
      ctxt,
      function () {
        finished = true;
      },
      function (err) {
        error = err;
      }
    );

    vi.advanceTimersByTime(Exsurge.ChantScore.MAX_HYPHEN_WIDTH_RETRIES * 100);

    finished.should.equal(false);
    should.exist(error);
    error.message.should.match(/hyphen width is 0/);
    error.message.should.match(
      new RegExp(String(Exsurge.ChantScore.MAX_HYPHEN_WIDTH_RETRIES))
    );
  });

  it("warns on the third attempt before eventually failing", function () {
    var warn = vi.spyOn(console, "warn").mockImplementation(function () {});
    var { ctxt, score } = scoreFromGabc("(c4) A(g) men.(g.)", false);
    var error = null;

    score.performLayoutAsync(
      ctxt,
      function () {},
      function (err) {
        error = err;
      }
    );

    vi.advanceTimersByTime(200); // attempts 0,1,2 — warn fires when scheduling 3rd retry
    warn.mock.calls.length.should.equal(1);
    warn.mock.calls[0][0].should.match(/hyphen width still unusable/);

    vi.advanceTimersByTime(
      (Exsurge.ChantScore.MAX_HYPHEN_WIDTH_RETRIES - 2) * 100
    );
    should.exist(error);
    warn.mockRestore();
  });

  it("succeeds when a font makes hyphen metrics sane", async function () {
    var { ctxt, score } = scoreFromGabc("(c4) A(g) men.(g.)", true);
    var finished = false;

    score.performLayoutAsync(ctxt, function () {
      finished = true;
    });

    await vi.runAllTimersAsync();
    finished.should.equal(true);
    score.needsLayout.should.equal(false);
  });
});

describe("performLayoutAsync: layout chunk errors", function () {
  beforeEach(function () {
    vi.useFakeTimers();
  });

  afterEach(function () {
    vi.useRealTimers();
  });

  it("reports a throw inside a layout chunk via errorCallback", async function () {
    var { ctxt, score } = scoreFromGabc("(c4) A(g) men.(g.)", true);

    // Force the first notation that still needs layout to throw.
    var target = score.notations.find(function (n) {
      return n.needsLayout;
    });
    should.exist(target);
    var original = target.performLayout.bind(target);
    target.performLayout = function () {
      throw new Error("boom from notation.performLayout");
    };

    var finished = false;
    var error = null;

    score.performLayoutAsync(
      ctxt,
      function () {
        finished = true;
      },
      function (err) {
        error = err;
      }
    );

    await vi.runAllTimersAsync();

    finished.should.equal(false);
    should.exist(error);
    error.message.should.equal("boom from notation.performLayout");

    // restore so later suites are not affected if the instance is reused
    target.performLayout = original;
  });
});

describe("createPlayableChant: onError for layout failure", function () {
  beforeEach(function () {
    vi.useFakeTimers();
  });

  afterEach(function () {
    vi.useRealTimers();
  });

  it("calls options.onError with a null player when hyphen metrics never arrive", function () {
    var ctxt = new Exsurge.ChantContext();
    // deliberately no fontDictionary
    var container = {
      clientWidth: 400,
      firstChild: null,
      appendChild: function () {},
      removeChild: function () {}
    };

    var ready = false;
    /** @type {unknown} */
    var error = null;
    /** @type {unknown} */
    var playerArg = "unset";

    Exsurge.createPlayableChant(
      ctxt,
      "(c4) A(g) men.(g.)",
      /** @type {any} */ (container),
      {
        autoResize: false,
        onError: function (err, player) {
          error = err;
          playerArg = player;
        }
      },
      function () {
        ready = true;
      }
    );

    vi.advanceTimersByTime(Exsurge.ChantScore.MAX_HYPHEN_WIDTH_RETRIES * 100);

    ready.should.equal(false);
    should.exist(error);
    (error instanceof Error ? error.message : String(error)).should.match(
      /hyphen width/
    );
    should.equal(playerArg, null);
  });
});
