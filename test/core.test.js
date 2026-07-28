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
chai.should();

describe("Core functionality", function () {
  it("Point object", function () {
    var point = new Exsurge.Point(3.14, 159.26);
    point.x.should.equal(3.14);
    point.y.should.equal(159.26);

    var clone = point.clone();
    clone.x.should.equal(3.14);
    clone.y.should.equal(159.26);

    point.equals(clone).should.equal(true);
    point.equals(new Exsurge.Point()).should.equal(false);
  });

  it("Rect object", function () {
    var rect = new Exsurge.Rect(3, 1, 4, 5);
    rect.x.should.equal(3);
    rect.y.should.equal(1);
    rect.width.should.equal(4);
    rect.height.should.equal(5);

    var clone = rect.clone();
    clone.x.should.equal(3);
    clone.y.should.equal(1);
    clone.width.should.equal(4);
    clone.height.should.equal(5);

    rect.isEmpty().should.equal(false);

    rect.right().should.equal(3 + 4);
    rect.bottom().should.equal(1 + 5);

    rect.equals(clone).should.equal(true);

    var badRect = new Exsurge.Rect();
    badRect.isEmpty().should.equal(true);

    rect.equals(badRect).should.equal(false);

    // fixme: test Rect.contains and Rect.union
  });

  it("Margins object", function () {
    var margins = new Exsurge.Margins(10, 11, 12, 13);
    margins.left.should.equal(10);
    margins.top.should.equal(11);
    margins.right.should.equal(12);
    margins.bottom.should.equal(13);

    var clone = margins.clone();
    clone.left.should.equal(10);
    clone.top.should.equal(11);
    clone.right.should.equal(12);
    clone.bottom.should.equal(13);

    margins.equals(clone).should.equal(true);
  });

  it("Size object", function () {
    var size = new Exsurge.Size(3.14, 159.26);
    size.width.should.equal(3.14);
    size.height.should.equal(159.26);

    var clone = size.clone();
    clone.width.should.equal(3.14);
    clone.height.should.equal(159.26);

    size.equals(clone).should.equal(true);
    size.equals(new Exsurge.Size()).should.equal(false);
  });
});

describe("Latin syllabification", function () {
  var lang = new Exsurge.Latin();

  var assertWordSyllables = function (word, syllables) {
    word.length.should.equal(syllables.length);

    for (var i = 0; i < word.length; i++) {
      word[i].should.equal(syllables[i]);
    }
  };

  it("Syllabify 'Puer natus est'", function () {
    var words = lang.syllabify("Puer natus est");
    words.length.should.equal(3);

    assertWordSyllables(words[0], ["Pu", "er"]);
    assertWordSyllables(words[1], ["na", "tus"]);
    assertWordSyllables(words[2], ["est"]);
  });

  // "e̊" and "o̊" are a base vowel plus U+030A COMBINING RING ABOVE. Written
  // out here as explicit escapes so that the two-code-point structure under
  // test survives any editor or tool that would normalize the source file.
  var RING = String.fromCharCode(0x30a);

  it("Syllabify ring-marked vowels", function () {
    var words = lang.syllabify("Do" + RING + "minus e" + RING + "st");
    words.length.should.equal(2);

    // The ring stays attached to the vowel it marks rather than being split
    // off onto the following syllable.
    assertWordSyllables(words[0], ["Do" + RING, "mi", "nus"]);
    assertWordSyllables(words[1], ["e" + RING + "st"]);
  });
});

describe("Latin vowel segments", function () {
  var lang = new Exsurge.Latin();

  // U+030A COMBINING RING ABOVE; see the note in the suite above.
  var RING = String.fromCharCode(0x30a);

  var assertVowelSegment = function (s, startIndex, expected) {
    var result = lang.findVowelSegment(s, startIndex);
    result.found.should.equal(true);
    s.substr(result.startIndex, result.length).should.equal(expected);
  };

  // Lyric centering positions a syllable over its neume by the extent of this
  // segment, so a ring left outside it shifts the text off centre.
  it("Ring-marked vowels match as a whole unit", function () {
    assertVowelSegment("e" + RING, 0, "e" + RING);
    assertVowelSegment("o" + RING, 0, "o" + RING);
    assertVowelSegment("Do" + RING + "minus", 0, "o" + RING);
    assertVowelSegment("e" + RING + "st", 0, "e" + RING);
    assertVowelSegment("glo" + RING + "ria", 0, "o" + RING);
  });

  it("Uppercase ring-marked vowels match as a whole unit", function () {
    assertVowelSegment("E" + RING + "st", 0, "E" + RING);
  });

  it("A combining ring alone is not a vowel segment", function () {
    // U+030A used to be a member of the character class in its own right,
    // which made a bare ring match as though it were a vowel.
    lang.findVowelSegment(RING, 0).found.should.equal(false);
  });

  it("Unmarked vowels are unaffected", function () {
    // Precomposed å, which never had the two-code-point problem.
    assertVowelSegment("å", 0, "å");

    assertVowelSegment("Puer", 0, "u");
    assertVowelSegment("Puer", 2, "e");
    assertVowelSegment("natus", 0, "a");
    assertVowelSegment("est", 0, "e");

    // Diphthongs and the leading consonantal i/u group still take priority
    // over the single-character class.
    assertVowelSegment("caelum", 1, "ae");
    assertVowelSegment("laus", 1, "au");
    assertVowelSegment("quam", 0, "a");
  });
});

describe("Swedish syllabification", function () {
  var lang = new Exsurge.Swedish();

  var assertSyllables = function (word, syllables) {
    lang.syllabifyWord(word).join("-").should.equal(syllables.join("-"));
  };

  it("Divides one consonant onto the following syllable", function () {
    // enkonsonantsregeln: whatever the cluster, one consonant carries over
    assertSyllables("huset", ["hu", "set"]);
    assertSyllables("flicka", ["flic", "ka"]);
    assertSyllables("vandra", ["vand", "ra"]);
    assertSyllables("kristendom", ["kris", "ten", "dom"]);
    assertSyllables("människa", ["män", "nis", "ka"]);
    assertSyllables("frälsare", ["fräl", "sa", "re"]);
    assertSyllables("välsignelse", ["väl", "sig", "nel", "se"]);
    assertSyllables("tacksägelse", ["tack", "sä", "gel", "se"]);
    assertSyllables("härlighet", ["här", "lig", "het"]);
  });

  it("Keeps a word with one vowel, or none, whole", function () {
    assertSyllables("själ", ["själ"]);
    assertSyllables("nåd", ["nåd"]);
    assertSyllables("psalm", ["psalm"]);
    assertSyllables("och", ["och"]);
    assertSyllables("", []);
  });

  it("Preserves the case of the original", function () {
    assertSyllables("Herren", ["Her", "ren"]);
    assertSyllables("Halleluja", ["Hal", "le", "lu", "ja"]);
    assertSyllables("KYRIE", ["KY", "RI", "E"]);
  });

  it("Divides adjacent vowels: Swedish has no diphthongs", function () {
    assertSyllables("beakta", ["be", "ak", "ta"]);
    assertSyllables("Guds", ["Guds"]);
    assertSyllables("tio", ["ti", "o"]);
    assertSyllables("evighet", ["e", "vig", "het"]);
  });

  it("Does not divide a group that spells a single sound", function () {
    assertSyllables("duschen", ["du", "schen"]);
    assertSyllables("marschera", ["mar", "sche", "ra"]);
    assertSyllables("försjunken", ["för", "sjun", "ken"]);
    assertSyllables("gudstjänst", ["guds", "tjänst"]);
    assertSyllables("machete", ["ma", "che", "te"]);
  });

  it("Divides ck, sk, gn, dj and lj normally", function () {
    assertSyllables("backen", ["bac", "ken"]);
    assertSyllables("fisken", ["fis", "ken"]);
    assertSyllables("regna", ["reg", "na"]);

    // dj, lj, hj and gj lose their first letter only at the start of a word,
    // where there is nothing to divide.
    assertSyllables("glädje", ["gläd", "je"]);
    assertSyllables("tredje", ["tred", "je"]);
    assertSyllables("vilja", ["vil", "ja"]);
    assertSyllables("olja", ["ol", "ja"]);
    assertSyllables("familjen", ["fa", "mil", "jen"]);
    assertSyllables("djup", ["djup"]);
    assertSyllables("ljuset", ["lju", "set"]);
  });

  it("Keeps ng with the syllable it closes", function () {
    assertSyllables("sjunga", ["sjung", "a"]);
    assertSyllables("ingen", ["ing", "en"]);
    assertSyllables("längre", ["läng", "re"]);
    assertSyllables("engelska", ["eng", "els", "ka"]);
  });

  it("Keeps x with the syllable it closes", function () {
    assertSyllables("växa", ["väx", "a"]);
    assertSyllables("boxen", ["box", "en"]);
  });

  it("Treats the i of -tion as part of the consonant", function () {
    assertSyllables("nation", ["na", "tion"]);
    assertSyllables("station", ["sta", "tion"]);
    assertSyllables("stationer", ["sta", "tio", "ner"]);
    assertSyllables("mission", ["mis", "sion"]);
    assertSyllables("vision", ["vi", "sion"]);
    assertSyllables("nationell", ["na", "tio", "nell"]);
  });

  it("Leaves a real i-o hiatus alone", function () {
    // The same letters, but two syllables: the rule is confined to the suffix,
    // so it may neither start the word nor be followed by anything but a known
    // ending.
    assertSyllables("tionde", ["ti", "on", "de"]);
    assertSyllables("årtionde", ["år", "ti", "on", "de"]);
    assertSyllables("nionde", ["ni", "on", "de"]);
  });

  it("Cannot find the seam of a solid compound, but honours a hyphen", function () {
    // Dividing a compound at its seam needs a dictionary; <ng> spelling a
    // single sound is the better guess in every word that is not one. An
    // explicit hyphen forces the break, and is dropped from the syllables.
    assertSyllables("vingård", ["ving", "ård"]);
    assertSyllables("vin-gård", ["vin", "gård"]);
    assertSyllables("guld-jakt", ["guld", "jakt"]);
  });

  // Decomposed å, ä and ö: a base vowel plus U+030A COMBINING RING ABOVE or
  // U+0308 COMBINING DIAERESIS. Written as explicit escapes so the
  // two-code-point structure under test survives any tool that would normalize
  // this file.
  var RING = String.fromCharCode(0x30a);
  var DIAERESIS = String.fromCharCode(0x308);

  it("Handles decomposed å, ä and ö", function () {
    assertSyllables("ha" + DIAERESIS + "lsa", ["ha" + DIAERESIS + "l", "sa"]);
    assertSyllables("na" + RING + "den", ["na" + RING, "den"]);
    assertSyllables("bo" + DIAERESIS + "nen", ["bo" + DIAERESIS, "nen"]);
  });

  it("Syllabifies a whole line", function () {
    var words = lang.syllabify("Herren är min herde");
    words.length.should.equal(4);

    words[0].join("-").should.equal("Her-ren");
    words[1].join("-").should.equal("är");
    words[2].join("-").should.equal("min");
    words[3].join("-").should.equal("her-de");
  });
});

describe("Swedish vowel segments", function () {
  var lang = new Exsurge.Swedish();

  var RING = String.fromCharCode(0x30a);
  var DIAERESIS = String.fromCharCode(0x308);

  var assertVowelSegment = function (s, startIndex, expected) {
    var result = lang.findVowelSegment(s, startIndex);
    result.found.should.equal(true);
    s.substr(result.startIndex, result.length).should.equal(expected);
  };

  it("Finds the single vowel of a syllable", function () {
    assertVowelSegment("Her", 0, "e");
    assertVowelSegment("själ", 0, "ä");
    assertVowelSegment("hjärta", 0, "ä");
    assertVowelSegment("nåd", 0, "å");
    assertVowelSegment("ny", 0, "y");
    assertVowelSegment("idé", 2, "é");
  });

  it("Does not treat j, w or a bare combining mark as a vowel", function () {
    lang.findVowelSegment("j", 0).found.should.equal(false);
    lang.findVowelSegment("w", 0).found.should.equal(false);
    lang.findVowelSegment(RING, 0).found.should.equal(false);
  });

  it("Matches a decomposed vowel as a whole unit", function () {
    // Lyric centering positions a syllable over its neume by the extent of this
    // segment, so a diacritic left outside it shifts the text off centre.
    assertVowelSegment("ha" + DIAERESIS + "l", 0, "a" + DIAERESIS);
    assertVowelSegment("na" + RING + "d", 0, "a" + RING);
    assertVowelSegment("bo" + DIAERESIS + "n", 0, "o" + DIAERESIS);
  });

  it("Centers -tion on the o, not the i", function () {
    assertVowelSegment("tion", 0, "o");
    assertVowelSegment("sion", 0, "o");
    assertVowelSegment("tioner", 0, "o");
  });
});
