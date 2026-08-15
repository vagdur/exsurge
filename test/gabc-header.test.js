//
// GABC header → score.annotation (issue #24): Gregorio places `mode:` /
// `annotation:` above the drop cap. These specs cover the conversion and the
// construction paths that apply it, including a layout check that the
// annotation actually sits above the initial.
//

import { describe, it, chai } from "vitest";
import * as Exsurge from "../src/index.js";

var should = chai.should();

// Same half-em stub as lyrics.test.js, so layout coordinates are proportional
// to string length rather than to a real font.
function stubFontDictionary() {
  var advanceWidth = (/** @type {*} */ text, /** @type {*} */ fontSize) =>
    text.length * fontSize * 0.5;

  return {
    Regular: {
      getAdvanceWidth: advanceWidth,
      getPath: (
        /** @type {*} */ text,
        /** @type {*} */ x,
        /** @type {*} */ y,
        /** @type {*} */ fontSize
      ) => ({
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

/**
 * @param {string} gabc
 * @param {boolean} [useDropCap]
 */
function scoreFromGabc(gabc, useDropCap) {
  var ctxt = new Exsurge.ChantContext();
  ctxt.fontDictionary = /** @type {any} */ (stubFontDictionary());
  var score = Exsurge.Gabc.createScoreFromSource(
    ctxt,
    gabc,
    useDropCap !== false
  );
  return { ctxt: ctxt, score: score };
}

/**
 * @param {string} headerText
 * @returns {any}
 */
function fromHeader(headerText) {
  var annotation = Exsurge.Gabc.annotationFromHeader(
    new Exsurge.ChantContext(),
    new Exsurge.GabcHeader(headerText)
  );
  should.exist(annotation);
  return annotation;
}

/**
 * Visible text of every SVG node whose class includes `className`.
 * @param {*} node
 * @param {string} className
 * @returns {string[]}
 */
function textsWithClass(node, className) {
  /** @type {string[]} */
  var found = [];

  /**
   * @param {*} n
   * @returns {string}
   */
  function textOf(n) {
    if (n === null || n === undefined) return "";
    if (typeof n === "string") return n;
    if (Array.isArray(n)) return n.map(textOf).join("");
    if (typeof n === "object") return textOf(n.children);
    return "";
  }

  (function walk(n) {
    if (!n || typeof n !== "object") return;
    if (Array.isArray(n)) return n.forEach(walk);

    var props = n.props || {};
    var classAttr = props.className || props.class || "";
    if (
      typeof classAttr === "string" &&
      classAttr.split(/\s+/).indexOf(className) >= 0
    )
      found.push(textOf(n.children));

    walk(n.children);
  })(node);

  return found;
}

describe("Gabc.annotationFromHeader", function () {
  it("returns null when neither annotation nor mode is set", function () {
    var ctxt = new Exsurge.ChantContext();
    should.equal(
      Exsurge.Gabc.annotationFromHeader(ctxt, new Exsurge.GabcHeader("")),
      null
    );
    should.equal(
      Exsurge.Gabc.annotationFromHeader(
        ctxt,
        new Exsurge.GabcHeader("name: Test;\n%%\n")
      ),
      null
    );
  });

  it("converts modes 1–8 to lowercase roman", function () {
    var expected = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"];
    for (var n = 1; n <= 8; n++) {
      var annotation = fromHeader("mode: " + n + ";\n%%\n");
      annotation.should.be.instanceof(Exsurge.Annotation);
      annotation.unsanitizedText.should.equal(expected[n - 1]);
    }
  });

  it("keeps a mode that is not 1–8 as written", function () {
    fromHeader("mode: peregrinus;\n%%\n").unsanitizedText.should.equal(
      "peregrinus"
    );
  });

  it("converts a leading 1–8 and keeps the rest of the mode string", function () {
    fromHeader("mode: 2*;\n%%\n").unsanitizedText.should.equal("ii*");
  });

  it("appends mode-modifier in italics, flush when it is punctuation", function () {
    var annotation = fromHeader("mode: 4;\nmode-modifier: *;\n%%\n");
    annotation.unsanitizedText.should.equal("iv<i>*</i>");
    annotation.text.should.equal("iv*");
  });

  it("appends mode-differentia in small caps, spaced when it is not punctuation", function () {
    var annotation = fromHeader("mode: 7;\nmode-differentia: G;\n%%\n");
    annotation.unsanitizedText.should.equal("vii <sc>G</sc>");
    annotation.text.should.equal("vii G");
  });

  it("appends both modifier and differentia after the mode", function () {
    fromHeader(
      "mode: 4;\nmode-modifier: *;\nmode-differentia: a;\n%%\n"
    ).unsanitizedText.should.equal("iv<i>*</i> <sc>a</sc>");
  });

  it("does not typeset modifier or differentia without a mode", function () {
    var ctxt = new Exsurge.ChantContext();
    var header = new Exsurge.GabcHeader(
      "mode-modifier: *;\nmode-differentia: G;\n%%\n"
    );
    should.equal(Exsurge.Gabc.annotationFromHeader(ctxt, header), null);
  });

  it("uses a single annotation: line as Annotation", function () {
    var annotation = fromHeader("annotation: Ant.;\n%%\n");
    annotation.should.be.instanceof(Exsurge.Annotation);
    annotation.unsanitizedText.should.equal("Ant.");
  });

  it("uses two annotation: lines as Annotations, winning over mode", function () {
    var annotation = fromHeader(
      "annotation: Ant.;\nannotation: vii;\nmode: 1;\n%%\n"
    );
    annotation.should.be.instanceof(Exsurge.Annotations);
    annotation.annotations.length.should.equal(2);
    annotation.annotations[0].unsanitizedText.should.equal("Ant.");
    annotation.annotations[1].unsanitizedText.should.equal("vii");
  });
});

describe("ChantScore from GABC header", function () {
  var body = "(c4) Pó(c)pu(c)lus(d) Si(c)on,(c)";

  it("createScoreFromSource sets annotation from mode:", function () {
    var { score } = scoreFromGabc("mode: 7;\n%%\n" + body);
    var annotation = /** @type {any} */ (score.annotation);
    should.exist(annotation);
    annotation.should.be.instanceof(Exsurge.Annotation);
    annotation.unsanitizedText.should.equal("vii");
  });

  it("createMappingsFromSource + new ChantScore also applies the header", function () {
    var ctxt = new Exsurge.ChantContext();
    var mappings = Exsurge.Gabc.createMappingsFromSource(
      ctxt,
      "mode: 5;\n%%\n" + body
    );
    var score = new Exsurge.ChantScore(ctxt, mappings, true);
    /** @type {any} */ (score.annotation).unsanitizedText.should.equal("v");
  });

  it("leaves annotation null when the header has neither field", function () {
    var { score } = scoreFromGabc(body);
    should.equal(score.annotation, null);
  });

  it("lets a caller overwrite the header-derived annotation", function () {
    var { ctxt, score } = scoreFromGabc("mode: 7;\n%%\n" + body);
    var custom = new Exsurge.Annotation(ctxt, "%V%");
    score.annotation = custom;
    score.annotation.should.equal(custom);
  });

  it("does not enumerate the header on the mappings array", function () {
    var ctxt = new Exsurge.ChantContext();
    var mappings = Exsurge.Gabc.createMappingsFromSource(
      ctxt,
      "mode: 7;\n%%\n" + body
    );
    should.exist(/** @type {any} */ (mappings).header);
    Object.prototype.propertyIsEnumerable
      .call(mappings, "header")
      .should.equal(false);
    Object.keys(mappings).should.not.include("header");
  });
});

describe("mode annotation layout", function () {
  it("places the roman mode above the drop cap", function () {
    var { ctxt, score } = scoreFromGabc(
      "mode: 7;\n%%\n(c4) Pó(c)pu(c)lus(d) Si(c)on,(c)"
    );

    score.performLayout(ctxt);
    score.layoutChantLines(ctxt, 800, function () {});

    var annotation = /** @type {any} */ (score.annotation);
    should.exist(score.dropCap);
    should.exist(annotation);

    // y increases downward, so the annotation must sit above the initial
    annotation.bounds.y.should.be.below(score.dropCap.bounds.y);

    var labels = textsWithClass(score.createSvgTree(ctxt), "annotation");
    labels.should.deep.equal(["vii"]);
  });
});
