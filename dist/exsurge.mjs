/*! exsurge 1.25.2 | (c) 2008-2016 Fr. Matthew Spencer, OSJ | MIT | https://github.com/vagdur/exsurge */
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

var Units = {
  // enums
  DeviceIndepenedent: 0, // device independent units: 96/inch
  Centimeters: 1,
  Millimeters: 2,
  Inches: 3,

  // constants for device independent units (diu)
  DIU_PER_INCH: 96,
  DIU_PER_CENTIMETER: 96 / 2.54,

  ToDeviceIndependent: function (n, inputUnits) {
    switch (inputUnits) {
      case Centimeters:
        return n * Units.DIU_PER_CENTIMETER;
      case Millimeters:
        return (n * Units.DIU_PER_CENTIMETER) / 10;
      case Inches:
        return n * Units.DIU_PER_INCH;
      default:
        return n;
    }
  },

  FromDeviceIndependent: function (n, outputUnits) {
    switch (outputUnits) {
      case Centimeters:
        return n / Units.DIU_PER_CENTIMETER;
      case Millimeters:
        return (n / Units.DIU_PER_CENTIMETER) * 10;
      case Inches:
        return n / Units.DIU_PER_INCH;
      default:
        return n;
    }
  },

  StringToUnitsType: function (s) {
    switch (s.ToLower()) {
      case "in":
      case "inches":
        return Units.Inches;

      case "cm":
      case "centimeters":
        return Units.Centimeters;

      case "mm":
      case "millimeters":
        return Units.Millimeters;

      case "di":
      case "device-independent":
        return Units.DeviceIndepenedent;

      default:
        return Units.DeviceIndepenedent;
    }
  },

  UnitsTypeToString: function (units) {
    switch (units) {
      case Units.Inches:
        return "in";
      case Units.Centimeters:
        return "cm";
      case Units.Millimeters:
        return "mm";
      case Units.DeviceIndepenedent:
        return "device-independent";
      default:
        return "device-independent";
    }
  }
};

function DeviceIndependent(n) {
  return n;
}

function Centimeters(n) {
  return Units.ToDeviceIndependent(n, Units.Centimeters);
}

function Millimeters(n) {
  return Units.ToDeviceIndependent(n, Units.Millimeters);
}

function Inches(n) {
  return Units.ToDeviceIndependent(n, Units.Inches);
}

function ToCentimeters(n) {
  return Units.FromDeviceIndependent(n, Units.Centimeters);
}

function ToMillimeters(n) {
  return Units.FromDeviceIndependent(n, Units.Millimeters);
}

function ToInches(n) {
  return Units.FromDeviceIndependent(n, Units.Inches);
}

/*
 * Point
 */
class Point {
  constructor(x, y) {
    this.x = typeof x !== "undefined" ? x : 0;
    this.y = typeof y !== "undefined" ? y : 0;
  }

  clone() {
    return new Point(this.x, this.y);
  }

  equals(point) {
    return this.x === point.x && this.y === point.y;
  }
}

/*
 * Rect
 */
class Rect {
  constructor(x, y, width, height) {
    this.x = typeof x !== "undefined" ? x : Infinity;
    this.y = typeof y !== "undefined" ? y : Infinity;
    this.width = typeof width !== "undefined" ? width : -Infinity;
    this.height = typeof height !== "undefined" ? height : -Infinity;
  }

  clone() {
    return new Rect(this.x, this.y, this.width, this.height);
  }

  isEmpty() {
    return (
      this.x === Infinity &&
      this.y === Infinity &&
      this.width === -Infinity &&
      this.height === -Infinity
    );
  }

  // convenience method
  right() {
    return this.x + this.width;
  }

  bottom() {
    return this.y + this.height;
  }

  equals(rect) {
    return (
      this.x === rect.x &&
      this.y === rect.y &&
      this.width === rect.width &&
      this.height === rect.height
    );
  }

  // other can be a Point or a Rect
  contains(other) {
    if (other instanceof Point) {
      return (
        other.x >= this.x &&
        other.x <= this.x + this.width &&
        other.y >= this.y &&
        other.y <= this.y + this.height
      );
    } else {
      // better be instance of Rect
      return (
        this.x <= other.x &&
        this.x + this.width >= other.x + other.width &&
        this.y <= other.y &&
        this.y + this.height >= other.y + other.height
      );
    }
  }

  union(rect) {
    var right = Math.max(this.x + this.width, rect.x + rect.width);
    var bottom = Math.max(this.y + this.height, rect.y + rect.height);

    this.x = Math.min(this.x, rect.x);
    this.y = Math.min(this.y, rect.y);

    this.width = right - this.x;
    this.height = bottom - this.y;
  }
}

/**
 * Margins
 *
 * @class
 */
class Margins {
  constructor(left, top, right, bottom) {
    this.left = typeof left !== "undefined" ? left : 0;
    this.top = typeof top !== "undefined" ? top : 0;
    this.right = typeof right !== "undefined" ? right : 0;
    this.bottom = typeof bottom !== "undefined" ? bottom : 0;
  }

  clone() {
    return new Margins(this.left, this.top, this.right, this.bottom);
  }

  equals(margins) {
    return (
      this.left === margins.left &&
      this.top === margins.top &&
      this.right === margins.right &&
      this.bottom === margins.bottom
    );
  }
}

/**
 * Size
 *
 * @class
 */
class Size {
  constructor(width, height) {
    this.width = typeof width !== "undefined" ? width : 0;
    this.height = typeof height !== "undefined" ? height : 0;
  }

  clone() {
    return new Size(this.width, this.height);
  }

  equals(size) {
    return this.width === size.width && this.height === size.height;
  }
}

/*
 * Pitches, notes
 */
var Step = {
  Do: 0,
  Du: 1,
  Re: 2,
  Me: 3,
  Mi: 4,
  Fa: 5,
  Fu: 6,
  So: 7,
  La: 9,
  Te: 10,
  Ti: 11
};

// this little array helps map step values to staff positions. The numeric values of steps
// correspond to whole step increments (2) or half step increments (1). This gives us the ability
// to compare pitches precisely, but makes it challenging to place steps on the staff. this little
// array maps the steps to an incremental position the steps take on the staff line. This works
// so simply because chant only uses do and fa clefs, and only has a flatted ti (te), making
// for relatively easy mapping to staff line locations.
//                         Do Du Re Me Mi Fa Fu So    La Te Ti
var __StepToStaffPosition = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 6, 6];
var __StaffOffsetToStep = [
  Step.Do,
  Step.Re,
  Step.Mi,
  Step.Fa,
  Step.So,
  Step.La,
  Step.Ti
]; // no accidentals in this one

class Pitch {
  constructor(step, octave) {
    if (typeof octave === "undefined") {
      octave = Math.floor(step / 12);
      step = step % 12;
    }
    this.step = step;
    this.octave = octave;
  }

  toInt() {
    return this.octave * 12 + this.step;
  }

  transpose(step) {
    return new Pitch(this.toInt() + step);
  }

  isHigherThan(pitch) {
    return this.toInt() > pitch.toInt();
  }

  isLowerThan(pitch) {
    return this.toInt() < pitch.toInt();
  }

  equals(pitch) {
    return this.toInt() === pitch.toInt();
  }

  static stepToStaffOffset(step) {
    return __StepToStaffPosition[step];
  }

  static staffOffsetToStep(offset) {
    while (offset < 0) offset = __StaffOffsetToStep.length + offset;

    return __StaffOffsetToStep[offset % __StaffOffsetToStep.length];
  }
}

function generateRandomGuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4();
}

function getCssForProperties(properties) {
  return Object.entries(properties)
    .map(([key, val]) =>
      key && val && key !== "class" ? `${key}: ${val};` : ""
    )
    .join("");
}

//

/**
 * @class
 */
class Language {
  constructor(name) {
    this.name = typeof name !== "undefined" ? name : "<unknown>";
    this.centerNeume = false;
  }

  /**
   * @param {String} text The string to parsed into words.
   * @return {Word[]} the resulting parsed words from syllabification
   */
  syllabify(text) {
    var parsedWords = [];

    if (typeof text === "undefined" || text === "") return parsedWords;

    // Divide the text into words separated by whitespace
    var words = text.split(/[\s]+/);

    for (var i = 0, end = words.length; i < end; i++)
      parsedWords.push(this.syllabifyWord(words[i]));

    return parsedWords;
  }
}

class English extends Language {
  constructor() {
    super("English");
    this.centerNeume = true;
    this.regexLetter = /[a-z\u00c0-\u02af\u0300-\u036f\u1e00-\u1eff‿]+/i;
  }

  /**
   * @param {String} s the string to search
   * @param {Number} startIndex The index at which to start searching for a vowel in the string
   * @retuns a custom class with three properties: {found: (true/false) startIndex: (start index in s of vowel segment) length ()}
   */
  findVowelSegment(s, startIndex) {
    var match = this.regexLetter.exec(s.slice(startIndex));
    if (match)
      return {
        found: true,
        startIndex: startIndex + match.index,
        length: match[0].length
      };

    // no vowels sets found after startIndex!
    return { found: false, startIndex: -1, length: -1 };
  }
}

/**
 * @class
 */
class Latin extends Language {
  /**
   * @constructs
   */
  constructor() {
    super("Latin");

    // fixme: ui is only diphthong in the exceptional cases below (according to Wheelock's Latin)
    this.diphthongs = ["ae", "au", "oe", "aé", "áu", "oé"];
    // for centering over the vowel, we will need to know any combinations that might be diphthongs:
    this.possibleDiphthongs = this.diphthongs.concat([
      "ei",
      "eu",
      "ui",
      "éi",
      "éu",
      "úi"
    ]);
    this.regexVowel =
      /(i|(?:[qg]|^)u)?([eé][iu]|[uú]i|[ao][eé]|[aá]u|[aeiouáéíóúäëïöüāēīōūăĕĭŏŭåe̊o̊ůæœǽyýÿ])/gi;

    // some words that are simply exceptions to standard syllabification rules!
    var wordExceptions = new Object();

    // ui combos pronounced as diphthongs
    wordExceptions["huius"] = ["hui", "us"];
    wordExceptions["cuius"] = ["cui", "us"];
    wordExceptions["huic"] = ["huic"];
    wordExceptions["cui"] = ["cui"];
    wordExceptions["hui"] = ["hui"];

    // eu combos pronounced as diphthongs
    wordExceptions["euge"] = ["eu", "ge"];
    wordExceptions["seu"] = ["seu"];

    this.vowels = [
      "a",
      "e",
      "i",
      "o",
      "u",
      "á",
      "é",
      "í",
      "ó",
      "ú",
      "ä",
      "ë",
      "ï",
      "ö",
      "ü",
      "ā",
      "ē",
      "ī",
      "ō",
      "ū",
      "ă",
      "ĕ",
      "ĭ",
      "ŏ",
      "ŭ",
      "å",
      "e̊",
      "o̊",
      "ů",
      "æ",
      "œ",
      "ǽ", // no accented œ in unicode?
      "y",
      "ý",
      "ÿ"
    ]; // y is treated as a vowel; not native to Latin but useful for words borrowed from Greek

    this.vowelsThatMightBeConsonants = ["i", "u"];

    this.muteConsonantsAndF = ["b", "c", "d", "g", "p", "t", "f"];

    this.liquidConsonants = ["l", "r"];
  }

  // c must be lowercase!
  isVowel(c) {
    for (var i = 0, end = this.vowels.length; i < end; i++)
      if (this.vowels[i] === c) return true;

    return false;
  }

  isVowelThatMightBeConsonant(c) {
    for (var i = 0, end = this.vowelsThatMightBeConsonants.length; i < end; i++)
      if (this.vowelsThatMightBeConsonants[i] === c) return true;

    return false;
  }

  // substring should be a vowel and the character following
  isVowelActingAsConsonant(substring) {
    return (
      this.isVowelThatMightBeConsonant(substring[0]) &&
      this.isVowel(substring[1])
    );
  }

  /**
   * f is not a mute consonant, but we lump it together for syllabification
   * since it is syntactically treated the same way
   *
   * @param {String} c The character to test; must be lowercase
   * @return {boolean} true if c is an f or a mute consonant
   */
  isMuteConsonantOrF(c) {
    for (var i = 0, end = this.muteConsonantsAndF.length; i < end; i++)
      if (this.muteConsonantsAndF[i] === c) return true;

    return false;
  }

  /**
   *
   * @param {String} c The character to test; must be lowercase
   * @return {boolean} true if c is a liquid consonant
   */
  isLiquidConsonant(c) {
    for (var i = 0, end = this.liquidConsonants.length; i < end; i++)
      if (this.liquidConsonants[i] === c) return true;

    return false;
  }

  /**
   *
   * @param {String} s The string to test; must be lowercase
   * @return {boolean} true if s is a diphthong
   */
  isDiphthong(s) {
    for (var i = 0, end = this.diphthongs.length; i < end; i++)
      if (this.diphthongs[i] === s) return true;

    return false;
  }

  /**
   *
   * @param {String} s The string to test; must be lowercase
   * @return {boolean} true if s is a diphthong
   */
  isPossibleDiphthong(s) {
    for (var i = 0, end = this.possibleDiphthongs.length; i < end; i++)
      if (this.possibleDiphthongs[i] === s) return true;

    return false;
  }

  /**
   * Rules for Latin syllabification (from Collins, "A Primer on Ecclesiastical Latin")
   *
   * Divisions occur when:
   *   1. After open vowels (those not followed by a consonant) (e.g., "pi-us" and "De-us")
   *   2. After vowels followed by a single consonant (e.g., "vi-ta" and "ho-ra")
   *   3. After the first consonant when two or more consonants follow a vowel
   *      (e.g., "mis-sa", "minis-ter", and "san-ctus").
   *
   * Exceptions:
   *   1. In compound words the consonants stay together (e.g., "de-scribo").
   *   2. A mute consonant (b, c, d, g, p, t) or f followed by a liquid consonant (l, r)
   *      go with the succeeding vowel: "la-crima", "pa-tris"
   *
   * In addition to these rules, Wheelock's Latin provides this sound exception:
   *   -  Also counted as single consonants are qu and the aspirates ch, ph,
   *      th, which should never be separated in syllabification:
   *      architectus, ar-chi-tec-tus; loquacem, lo-qua-cem.
   *
   */
  syllabifyWord(word) {
    var syllables = [];
    var haveCompleteSyllable = false;
    var previousWasVowel = false;
    var workingString = word.toLowerCase();
    var startSyllable = 0;

    var c, lookahead, haveLookahead;

    // a helper function to create syllables
    var makeSyllable = function (length) {
      if (haveCompleteSyllable) {
        syllables.push(word.substr(startSyllable, length));
        startSyllable += length;
      }

      haveCompleteSyllable = false;
    };

    for (var i = 0, wordLength = workingString.length; i < wordLength; i++) {
      c = workingString[i];

      // get our lookahead in case we need them...
      lookahead = "*";
      haveLookahead = i + 1 < wordLength;

      if (haveLookahead) lookahead = workingString[i + 1];

      var cIsVowel = this.isVowel(c);

      // i is a special case for a vowel. when i is at the beginning
      // of the word (Iesu) or i is between vowels (alleluia),
      // then the i is treated as a consonant (y)
      if (c === "i") {
        if (i === 0 && haveLookahead && this.isVowel(lookahead))
          cIsVowel = false;
        else if (previousWasVowel && haveLookahead && this.isVowel(lookahead)) {
          cIsVowel = false;
        }
      }

      if (c === "-") {
        // a hyphen forces a syllable break, which effectively resets
        // the logic...

        haveCompleteSyllable = true;
        previousWasVowel = false;
        makeSyllable(i - startSyllable);
        startSyllable++;
      } else if (cIsVowel) {
        // once we get a vowel, we have a complete syllable
        haveCompleteSyllable = true;

        if (
          previousWasVowel &&
          !this.isDiphthong(workingString[i - 1] + "" + c)
        ) {
          makeSyllable(i - startSyllable);
          haveCompleteSyllable = true;
        }

        previousWasVowel = true;
      } else if (haveLookahead) {
        if (
          (c === "q" && lookahead === "u") ||
          (lookahead === "h" && (c === "c" || c === "p" || c === "t"))
        ) {
          // handle wheelock's exceptions for qu, ch, ph and th
          makeSyllable(i - startSyllable);
          i++; // skip over the 'h' or 'u'
        } else if (previousWasVowel && this.isVowel(lookahead)) {
          // handle division rule 2
          makeSyllable(i - startSyllable);
        } else if (
          this.isMuteConsonantOrF(c) &&
          this.isLiquidConsonant(lookahead)
        ) {
          // handle exception 2
          makeSyllable(i - startSyllable);
        } else if (haveCompleteSyllable) {
          // handle division rule 3
          makeSyllable(i + 1 - startSyllable);
        }

        previousWasVowel = false;
      }
    }

    // if we have a complete syllable, we can add it as a new one. Otherwise
    // we tack the remaining characters onto the last syllable.
    if (haveCompleteSyllable) syllables.push(word.substr(startSyllable));
    else if (startSyllable > 0)
      syllables[syllables.length - 1] += word.substr(startSyllable);

    return syllables;
  }

  /**
   * @param {String} s the string to search
   * @param {Number} startIndex The index at which to start searching for a vowel in the string
   * @retuns a custom class with three properties: {found: (true/false) startIndex: (start index in s of vowel segment) length ()}
   */
  findVowelSegment(s, startIndex, ignore) {
    this.regexVowel.lastIndex = 0;
    let stringSlice = s.slice(startIndex);
    var match = this.regexVowel.exec(stringSlice);
    var isIgnoredMatch = ({ index, endIndex }) =>
      (index <= match.index && endIndex > match.index) ||
      (index < this.regexVowel.lastIndex &&
        endIndex >= this.regexVowel.lastIndex);
    let inIgnore =
      match && ignore && ignore.length && ignore.find(isIgnoredMatch);
    while (inIgnore) {
      match = this.regexVowel.exec(stringSlice);
      inIgnore = match && ignore.find(isIgnoredMatch);
    }
    if (match) {
      if (match[1]) {
        // the first group should be ignored, as it is to separate an i or u that is used as a consonant.
        match.index += match[1].length;
      }
      return {
        found: true,
        startIndex: startIndex + match.index,
        length: match[2].length
      };
    }

    // no vowels sets found after startIndex!
    return { found: false, startIndex: -1, length: -1 };
  }
}

/**
 * @class
 */
class Spanish extends Language {
  constructor() {
    super("Spanish");

    this.vowels = ["a", "e", "i", "o", "u", "y", "á", "é", "í", "ó", "ú", "ü"];

    this.weakVowels = ["i", "u", "ü", "y"];

    this.strongVowels = ["a", "e", "o", "á", "é", "í", "ó", "ú"];

    this.diphthongs = [
      "ai",
      "ei",
      "oi",
      "ui",
      "ia",
      "ie",
      "io",
      "iu",
      "au",
      "eu",
      "ou",
      "ua",
      "ue",
      "uo",
      "ái",
      "éi",
      "ói",
      "úi",
      "iá",
      "ié",
      "ió",
      "iú",
      "áu",
      "éu",
      "óu",
      "uá",
      "ué",
      "uó",
      "üe",
      "üi"
    ];

    this.uDiphthongExceptions = ["gue", "gui", "qua", "que", "qui", "quo"];
  }

  // c must be lowercase!
  isVowel(c) {
    for (var i = 0, end = this.vowels.length; i < end; i++)
      if (this.vowels[i] === c) return true;

    return false;
  }

  /**
   * @param {String} c The character to test; must be lowercase
   * @return {boolean} true if c is an f or a mute consonant
   */
  isWeakVowel(c) {
    for (var i = 0, end = this.weakVowels.length; i < end; i++)
      if (this.weakVowels[i] === c) return true;

    return false;
  }

  /**
   * @param {String} c The character to test; must be lowercase
   * @return {boolean} true if c is an f or a mute consonant
   */
  isStrongVowel(c) {
    for (var i = 0, end = this.strongVowels.length; i < end; i++)
      if (this.strongVowels[i] === c) return true;

    return false;
  }

  /**
   *
   * @param {String} s The string to test; must be lowercase
   * @return {boolean} true if s is a diphthong
   */
  isDiphthong(s) {
    for (var i = 0, end = this.diphthongs.length; i < end; i++)
      if (this.diphthongs[i] === s) return true;

    return false;
  }

  createSyllable(text) {
    /*
    var accented = false;
    var ellidesToNext = false;

    if (text.length > 0) {

        if (text[0] == '`') {
            accented = true;
            text = text.substr(1);
        }

        if (text[text.length - 1] == '_') {
            ellidesToNext = true;
            text = text.substr(0, text.length - 1);
        }
    }

    var s = new Syllable(text);

    s.isMusicalAccent = accented;
    s.elidesToNext = ellidesToNext;*/

    return text;
  }

  /**
   */
  syllabifyWord(word) {
    var syllables = [];

    var haveCompleteSyllable = false;
    var previousIsVowel = false;
    var previousIsStrongVowel = false; // only valid if previousIsVowel == true
    var startSyllable = 0;

    // fixme: first check for prefixes

    for (var i = 0; i < word.length; i++) {
      var c = word[i].toLowerCase();

      if (this.isVowel(c)) {
        // we have a complete syllable as soon as we have a vowel
        haveCompleteSyllable = true;

        var cIsStrongVowel = this.isStrongVowel(c);

        if (previousIsVowel) {
          // if we're at a strong vowel, then we finish out the last syllable
          if (cIsStrongVowel) {
            if (previousIsStrongVowel) {
              syllables.push(
                this.createSyllable(
                  word.substr(startSyllable, i - startSyllable)
                )
              );
              startSyllable = i;
            }
          }
        }

        previousIsVowel = true;
        previousIsStrongVowel = cIsStrongVowel;
      } else {
        if (!haveCompleteSyllable) ; else {
          // handle explicit syllable breaks
          if (word[i] === "-") {
            // start new syllable
            syllables.push(
              this.createSyllable(word.substr(startSyllable, i - startSyllable))
            );
            startSyllable = ++i;
          } else {
            var numberOfConsonants = 1,
              consonant2;

            // count how many more consonants there are
            for (var j = i + 1; j < word.length; j++) {
              if (this.isVowel(word[j])) break;
              numberOfConsonants++;
            }

            if (numberOfConsonants === 1) {
              // start new syllable
              syllables.push(
                this.createSyllable(
                  word.substr(startSyllable, i - startSyllable)
                )
              );
              startSyllable = i;
            } else if (numberOfConsonants === 2) {
              consonant2 = word[i + 1].toLowerCase();
              if (
                consonant2 === "l" ||
                consonant2 === "r" ||
                (c === "c" && consonant2 === "h")
              ) {
                // split before the consonant pair
                syllables.push(
                  this.createSyllable(
                    word.substr(startSyllable, i - startSyllable)
                  )
                );
                startSyllable = i++;
              } else {
                //split the consonants
                syllables.push(
                  this.createSyllable(
                    word.substr(startSyllable, ++i - startSyllable)
                  )
                );
                startSyllable = i;
              }
            } else if (numberOfConsonants === 3) {
              consonant2 = word[i + 1].toLowerCase();

              // if second consonant is s, divide cc-c, otherwise divide c-cc
              if (consonant2 === "s") {
                i += 2;
                syllables.push(
                  this.createSyllable(
                    word.substr(startSyllable, i - startSyllable)
                  )
                );
              } else
                syllables.push(
                  this.createSyllable(
                    word.substr(startSyllable, ++i - startSyllable)
                  )
                );

              startSyllable = i;
            } else if (numberOfConsonants === 4) {
              // four always get split cc-cc
              syllables.push(
                this.createSyllable(
                  word.substr(startSyllable, i - startSyllable + 2)
                )
              );
              startSyllable = i + 2;
              i += 3;
            }
          }

          haveCompleteSyllable = false;
        }

        previousIsVowel = false;
      }
    }

    // if we have a complete syllable, we can add it as a new one. Otherwise
    // we tack the remaining characters onto the last syllable.
    if (haveCompleteSyllable) syllables.push(word.substr(startSyllable));
    else if (startSyllable > 0)
      syllables[syllables.length - 1] += word.substr(startSyllable);
    else if (syllables.length === 0) syllables.push(this.createSyllable(word));

    return syllables;
  }

  /**
   * @param {String} s the string to search
   * @param {Number} startIndex The index at which to start searching for a vowel in the string
   * @retuns a custom class with three properties: {found: (true/false) startIndex: (start index in s of vowel segment) length ()}
   */
  findVowelSegment(s, startIndex) {
    var i, end, index;
    var workingString = s.toLowerCase();

    // do we have a diphthongs?
    for (i = 0, end = this.diphthongs.length; i < end; i++) {
      var d = this.diphthongs[i];
      index = workingString.indexOf(d, startIndex);

      if (index >= 0) {
        // check the exceptions...
        if (d[0] === "u" && index > 0) {
          var tripthong = s.substr(index - 1, 3).toLowerCase();

          for (
            let j = 0, endj = this.uDiphthongExceptions.length;
            i < endj;
            j++
          ) {
            if (tripthong === this.uDiphthongExceptions[j]) {
              // search from after the u...
              return this.findVowelSegment(s, index + 1);
            }
          }
        }

        return { found: true, startIndex: index, length: d.length };
      }
    }

    // no diphthongs. Let's look for single vowels then...
    for (i = 0, end = this.vowels.length; i < end; i++) {
      index = workingString.indexOf(this.vowels[i], startIndex);

      if (index >= 0) return { found: true, startIndex: index, length: 1 };
    }

    // no vowels sets found after startIndex!
    return { found: false, startIndex: -1, length: -1 };
  }
}

const language = {
  english: new English(),
  latin: new Latin(),
  spanish: new Spanish()
};

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

// generated based on the svg data
let Glyphs = {
  None: {
    paths: [
      {
        type: "positive",
        data: ""
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    },
    origin: {
      x: 0,
      y: 0
    },
    align: "left"
  },
  AcuteAccent: {
    paths: [
      {
        type: "positive",
        data: "M4 0C-.614.52-.614.52-.803-3.182l60.768-108.422c4.52-7.182 10.543-13.67 18.075-13.67 5.27 0 14.31 1.264 23.346 7.793 7.53 5.223 8.803 11.752 8.803 16.975 0 3.917-.52 11.1-8.05 17.628L4 0z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 0, // TODO: figure out a better way to align this horizontally.  width should be 110.992,
      height: 125.794
    },
    origin: {
      x: 0.803,
      y: 125.274
    },
    align: "left"
  },
  GraveAccent: {
    paths: [
      {
        type: "positive",
        data: "M105.386.26C110 .78 110 .78 110.189-2.922l-60.768-108.422c-4.52-7.182-10.543-13.67-18.075-13.67-5.27 0-14.31 1.264-23.346 7.793-7.53 5.223-8.803 11.752-8.803 16.975 0 3.917.52 11.1 8.05 17.628L105.386.26z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 0, //110.992,
      height: 125.794
    },
    origin: {
      x: 0, // -110.992,
      y: 125.274
    },
    align: "left"
  },
  Circle: {
    paths: [
      {
        type: "positive",
        data: "M0 -50A50 50 0 0 0 100 -50 50 50 0 0 0 0 -50M10 -50A40 40 0 0 1 90 -50 40 40 0 0 1 10 -50"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 100,
      height: 100
    },
    origin: {
      x: -50,
      y: 100
    }
  },
  Semicircle: {
    paths: [
      {
        type: "positive",
        data: "M0 -50A50 50 0 0 0 100 -50 5 5 0 0 0 90 -50 40 40 0 0 1 10 -50 5 5 0 0 0 0 -50"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 100,
      height: 55
    },
    origin: {
      x: -50,
      y: 50
    }
  },
  ReversedSemicircle: {
    paths: [
      {
        type: "positive",
        data: "M0 0A50 50 0 0 1 100 0 5 5 0 0 1 90 0 40 40 0 0 0 10 0 5 5 0 0 1 0 0"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 100,
      height: 55
    },
    origin: {
      x: -50,
      y: 50
    }
  },
  Stropha: {
    paths: [
      {
        type: "positive",
        data: "M1.22-73.438c4.165 13.02 12.238 27.084 24.217 42.188L49.657 0 34.812 27.344C18.666 55.47-.084 72.396-21.438 78.124c4.687-3.645 7.03-8.593 7.03-14.843 0-8.853-4.947-20.572-14.843-35.155L-48 0 1.22-73.438z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 97.657,
      height: 151.562
    },
    origin: {
      x: 48,
      y: 73.438
    },
    align: "left"
  },
  BeginningAscLiquescent: {
    paths: [
      {
        type: "positive",
        data: "M-50 43.688V-61c4.167 7.292 12.76 10.938 25.78 10.938 9.376 0 20.053-1.563 32.032-4.688C31.773-60.48 45.833-71.677 50-88.344v117.97C43.75 42.645 32.812 51.5 17.187 56.186-.52 61.398-15.886 64-28.906 64-42.97 64-50 57.23-50 43.687z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 100,
      height: 152.344
    },
    origin: {
      x: 50,
      y: 88.344
    },
    align: "left"
  },
  BeginningDesLiquescent: {
    paths: [
      {
        type: "positive",
        data: "M-50-56.03c0-13.022 7.03-19.532 21.094-19.532 13.02 0 28.385 2.604 46.093 7.812C32.813-63.583 43.75-54.73 50-41.187V76C45.833 59.854 31.77 48.656 7.812 42.406c-11.98-3.125-22.656-4.687-32.03-4.687-13.022 0-21.615 3.905-25.782 11.718v-105.47z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 100,
      height: 151.562
    },
    origin: {
      x: 50,
      y: 75.562
    },
    align: "left"
  },
  CustosDescLong: {
    paths: [
      {
        type: "positive",
        data: "M39.063 273.472c5.73.52 7.29-6.25 4.687-20.312V-65.59c-13.542 2.083-24.22 5.468-32.03 10.156C3.905-50.226 0-43.714 0-35.904V71.91c5.73-5.21 10.677-8.594 14.844-10.157 5.73-1.562 12.24-2.343 19.53-2.343v196.875c0 11.458 1.563 17.187 4.688 17.187"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 46.353,
      height: 339.582
    },
    origin: {
      x: 0,
      y: 65.59
    },
    align: "left"
  },
  CustosDescShort: {
    paths: [
      {
        type: "positive",
        data: "M34.375 191.923c0 8.333 1.563 12.24 4.688 11.72 3.125-.522 4.687-7.033 4.687-19.533v-250c-13.542 2.084-24.22 5.47-32.03 10.157C3.905-50.525 0-44.015 0-36.203V71.61c5.73-5.208 10.677-8.593 14.844-10.156 5.73-1.562 12.24-2.344 19.53-2.344v132.813z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 43.75,
      height: 270.053
    },
    origin: {
      x: 0,
      y: 65.89
    },
    align: "left"
  },
  CustosLong: {
    paths: [
      {
        type: "positive",
        data: "M39.063-269.562c5.73-.52 7.29 6.25 4.687 20.312V69.5c-13.542-2.083-24.22-5.47-32.03-10.156C3.905 54.134 0 47.624 0 39.812V-68c5.73 5.208 10.677 8.594 14.844 10.156 5.73 1.563 12.24 2.344 19.53 2.344v-196.875c0-11.458 1.563-17.187 4.688-17.187z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 46.353,
      height: 339.582
    },
    origin: {
      x: 0,
      y: 270.082
    },
    align: "left"
  },
  CustosShort: {
    paths: [
      {
        type: "positive",
        data: "M34.375-188.125c0-8.333 1.563-12.24 4.688-11.72 3.125.522 4.687 7.033 4.687 19.532v250c-13.542-2.083-24.22-5.468-32.03-10.156C3.905 54.324 0 47.813 0 40V-67.813c5.73 5.21 10.677 8.594 14.844 10.157 5.73 1.562 12.24 2.344 19.53 2.343v-132.812z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 43.75,
      height: 270.052
    },
    origin: {
      x: 0,
      y: 200.365
    },
    align: "left"
  },
  DoClef: {
    paths: [
      {
        type: "positive",
        data: "M0 98.406V-97.688C0-118 5.99-134.275 17.97-146.516c11.978-12.24 27.603-18.36 46.874-18.36 10.937 0 19.53 3.126 25.78 9.376s9.376 14.583 9.376 25v107.813l-6.25-5.47c-4.167-3.645-10.287-7.42-18.36-11.327-8.072-3.907-16.796-5.86-26.17-5.86-11.46 0-21.486 4.427-30.08 13.282-8.593 8.854-12.89 19.53-12.89 32.03s4.297 23.308 12.89 32.423c8.594 9.115 18.62 13.672 30.08 13.672 9.374 0 18.098-1.822 26.17-5.468 8.073-3.646 14.193-7.292 18.36-10.938l6.25-6.25V132c0 9.896-3.125 18.1-9.375 24.61-6.25 6.51-14.844 9.765-25.78 9.765-19.272 0-34.897-6.25-46.876-18.75C5.99 135.125 0 118.72 0 98.405z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 100,
      height: 331.251
    },
    origin: {
      x: 0,
      y: 164.876
    },
    align: "left"
  },
  FaClef: {
    paths: [
      {
        type: "positive",
        data: "M85.156-32v193.75c0 9.375-1.562 14.323-4.687 14.844-1.564 0-2.605-.52-3.126-1.563-.52-1.04-.782-2.603-.78-4.686V56.28c-8.335-8.332-19.793-12.5-34.376-12.5-17.71 0-31.77 3.907-42.188 11.72V-32c0-18.23 14.193-27.344 42.578-27.344 28.385 0 42.578 9.115 42.578 27.344zM98.438 93V-92.156c0-19.27 5.73-34.896 17.187-46.875 11.458-11.98 26.562-17.97 45.313-17.97 10.937 0 19.14 2.865 24.61 8.594 5.467 5.73 8.202 13.542 8.202 23.437v103.126l-5.47-4.687c-3.645-3.647-9.374-7.293-17.186-10.94-7.813-3.645-15.886-5.467-24.22-5.468-11.978 0-22.004 4.167-30.077 12.5-8.073 8.334-12.11 18.36-12.11 30.08 0 11.717 4.037 22.004 12.11 30.858s18.1 13.28 30.078 13.28c8.333 0 16.406-1.822 24.22-5.468 7.81-3.645 13.54-7.03 17.186-10.156l5.47-5.468V125.81c0 9.896-2.865 17.84-8.594 23.83-5.73 5.988-13.802 8.983-24.22 8.983-18.75 0-33.853-6.12-45.31-18.36-11.46-12.24-17.19-27.994-17.19-47.265z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 193.752,
      height: 333.595
    },
    origin: {
      x: 0.001,
      y: 157.001
    },
    align: "left"
  },
  TrebleClef: {
    paths: [
      {
        type: "positive",
        data: "M291 202C95 202 0 70 0-70c0-161 122-276 238-371 9-8 8-9 7-19-6-33-11-85-11-131 0-83 19-183 78-249 16-18 41-38 52-38 9 0 30 22 42 40 32 48 52 116 52 186 0 122-66 224-152 305-5 5-7 5-5 15l20 116c2 14 2 14 23 14 118 0 193 91 193 193 0 91-54 159-135 191-11 4-12 4-10 13 9 50 23 126 23 171 0 136-104 160-157 160-121 0-152-78-152-130 0-50 32-92 85-92 49 0 77 38 77 82 0 46-29 68-54 75-18 5-25 8-25 13 0 11 21 24 64 24 47 0 127-15 127-133 0-38-12-107-22-161-1-10-3-9-12-7-16 3-36 5-55 5ZM64-16c0 111 90 189 230 189 16 0 32-2 45-4 12-3 13-3 11-11L310-81c-1-9-3-9-16-6-48 13-80 48-80 93 0 37 24 72 58 86 6 2 12 5 12 10s-3 9-10 9c-5 0-15-2-21-5-55-18-92-69-92-141 0-68 45-131 116-155 14-5 14-4 12-20l-17-102c-2-9-3-10-11-3-38 30-75 60-123 113C72-126 64-63 64-16Zm312-738c-49 0-106 76-106 201 0 26 1 53 4 74 2 10 5 11 11 6 63-55 139-127 139-216 0-44-22-65-48-65ZM353-94c-10 0-11 2-9 12l39 228c2 9 3 9 13 4 45-22 75-63 75-113 0-71-53-125-118-131Z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 671 * 0.8,
      height: 1756 * 0.8
    },
    origin: {
      x: 0,
      y: 1098 * 0.8
    },
    align: "left"
  },
  TrebleClefSmall: {
    paths: [
      {
        type: "positive",
        data: "M218 151C71 151 0 52 0-52c0-121 92-207 178-279 7-6 7-7 6-14-5-25-9-64-9-98 0-63 15-138 59-187 12-13 31-29 39-29 7 0 22 17 31 30 25 36 39 88 39 140 0 92-49 168-114 229-3 3-5 4-3 11l15 87c1 11 1 11 17 11 88 0 145 68 145 144 0 68-41 119-101 143-9 4-9 3-8 10 7 38 17 95 17 129 0 102-78 120-118 120-90 0-114-59-114-98 0-37 24-69 64-69 37 0 58 28 58 61 0 35-22 51-40 57-14 4-19 6-19 10 0 8 15 17 48 17 35 0 95-11 95-99 0-29-9-81-16-121-1-7-3-7-9-5-12 2-28 3-42 3ZM48-12c0 83 68 142 173 142 12 0 24-2 33-3 9-2 10-2 9-9L233-61c-1-6-3-7-12-4-37 10-60 36-60 70 0 27 18 53 43 64 4 2 9 4 9 8 0 3-2 6-7 6-4 0-12-1-16-3-41-14-69-52-69-106 0-51 34-99 87-117 10-3 10-3 9-14l-13-77c-1-7-2-7-8-2-29 22-56 45-92 85C54-95 48-47 48-12Zm234-554c-37 0-80 58-80 151 0 20 1 40 4 56 1 7 3 8 8 4 47-41 104-95 104-162 0-33-16-49-36-49ZM265-70c-8-1-8 1-7 8l29 171c2 7 3 7 10 4 34-17 56-48 56-85 0-53-40-94-88-98Z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 671 * 0.6,
      height: 1756 * 0.6
    },
    origin: {
      x: 0,
      y: 1098 * 0.6
    },
    align: "left"
  },
  ChiRhoClef: {
    paths: [
      {
        type: "positive",
        data: "M105.917 147.774c-2.067-3.344.33-5.742 7.093-7.094 9.764-1.953 10.878-8.732 10.878-66.221V23.014l-31.89 18.927c-17.54 10.41-32.33 18.927-32.866 18.927s-6.285 3.525-12.774 7.833c-10.211 6.78-11.65 8.56-10.708 13.24 2.437 12.105 2.353 13.736-.74 14.383-2.058.43-5.723-4.048-10.336-12.629-3.93-7.312-10.92-19.208-15.533-26.436-7.792-12.212-8.838-17.574-3.428-17.574 1.22 0 4.149 2.455 6.509 5.456 3.206 4.075 5.547 5.14 9.257 4.209 4.153-1.043 57.07-30.529 80.73-44.985L108.93.2l-39.828-22.673c-21.905-12.47-42.917-23.84-46.694-25.265-6.542-2.47-7.139-2.258-12.641 4.484-5.147 6.307-6.079 6.71-8.57 3.708-2.384-2.873-1.55-5.313 5.673-16.614 4.657-7.285 11.576-19.204 15.376-26.486 6.447-12.353 10.761-15.93 13.624-11.299.66 1.068.266 4.396-.875 7.396-1.14 3-1.54 6.847-.887 8.549 1.381 3.6 20.012 15.393 60.125 38.062l28.597 16.16.556-77.692c.613-85.706.355-87.62-11.832-87.62-6.286 0-10.966-3.346-10.966-7.838 0-4.44 92.037-3.911 102.811.59 21.627 9.037 33.743 26.842 33.76 49.614.03 37.863-30.53 65.667-72.177 65.667H151.654l-.644 28.499-.644 28.499 5.296-3.53c2.912-1.943 16.734-10.076 30.715-18.075C219.121-64.4 233.238-73.793 234.811-77.894c.694-1.81-.277-7.137-2.158-11.838-2.642-6.603-2.847-9.12-.902-11.059 3.327-3.316 6.53 1.033 24.387 33.12 9.75 17.517 13.444 26.059 11.928 27.574-1.515 1.516-3.723.761-7.126-2.436-6.943-6.522-11.612-5.87-31.58 4.41C207.227-26.73 166.254-2.377 166.254-.616c0 1.199 13.66 9.394 43.425 26.054 17.366 9.72 39.944 20.601 42.746 20.601 1.44 0 5.28-3.336 8.533-7.414 5.798-7.267 11.8-9.485 14.378-5.313.714 1.155-1.527 5.683-4.98 10.061-3.452 4.38-11.1 16.541-16.996 27.027-5.896 10.485-11.563 20.488-12.594 22.227-1.564 2.64-2.43 2.7-5.24.369-2.669-2.215-2.895-3.831-1.09-7.794 1.254-2.75 1.706-6.493 1.005-8.319-.7-1.825-9.166-8.384-18.813-14.576-17.64-11.321-62.464-37.45-64.246-37.45-2.144 0-.858 101.326 1.367 107.709 1.688 4.841 4.15 7.137 9.003 8.394 3.674.952 6.68 3.1 6.68 4.774 0 2.48-5.75 3.151-31.086 3.628-19.604.37-31.582-.218-32.43-1.589M183.434-94.909c10.38-3.663 19.694-11.631 24.662-21.101 5.14-9.799 4.065-30.404-2.313-44.336-7.44-16.251-18.35-23.003-39-24.132l-15.357-.84v93.668h11.384c6.262 0 15.542-1.466 20.624-3.26"
      }
    ],
    bounds: {
      x: 0,
      y: -200,
      width: 275.469,
      height: 149.471
    },
    origin: {
      x: 0,
      y: 0
    },
    align: "left"
  },
  ChiRhoClefSans: {
    paths: [
      {
        type: "positive",
        data: "M123.387 156.19c-.792-.792-1.44-29.618-1.44-64.058 0-48.772-.562-62.604-2.539-62.557-1.396.033-23.553 18.311-49.237 40.617s-47.76 40.556-49.06 40.556c-3.278 0-21.322-20.403-20.424-23.095.402-1.206 10.304-9.069 22.004-17.473C50.956 49.878 111.43 3.313 113.154.522c1.612-2.607-3.36-7.148-57.717-52.722-24.908-20.883-41.125-35.892-41.125-38.062 0-1.97 3.585-7.584 7.966-12.475 7.684-8.576 8.147-8.784 13.027-5.846 2.783 1.676 23.067 19.725 45.076 40.11 22.008 20.384 40.821 37.062 41.806 37.062 2.3 0 2.198-57.858-.201-113.137-1.493-34.414-2.546-44.107-5.236-48.212-3.002-4.582-3.027-5.269-.233-6.34 1.724-.662 19.415-.9 39.314-.53 34.178.638 36.68.956 45.228 5.752 23.096 12.959 30.55 46.904 14.709 66.982-8.198 10.39-28.334 19.756-49.143 22.857l-17.262 2.573c-.553 37.059-.335 74.117.609 74.117.943 0 22.966-17.82 48.94-39.601s47.996-39.602 48.939-39.602c1.922 0 22.347 22.392 22.347 24.5 0 .742-10.8 8.61-23.998 17.484C206.435-37.834 156.47-.758 156.47 2.014c0 2.548 64.949 54.22 95.854 76.26 8.6 6.133 15.682 12.423 15.74 13.978.14 3.873-17.812 24.589-21.31 24.589-1.552 0-10.849-8.332-20.66-18.515-21.38-22.192-68.878-65.502-72.838-66.416-2.35-.543-2.909 9.778-3.357 61.94l-.537 62.592-12.268.594c-6.748.326-12.917-.054-13.708-.846m55.249-278.9c17.348-8.85 23.98-25.107 16.832-41.264-5.617-12.7-14.508-18.405-30.24-19.407-12.267-.78-12.818-.608-14.81 4.632-2.218 5.831-2.89 51.452-.838 56.8 1.803 4.697 19.252 4.24 29.056-.76"
      }
    ],
    bounds: {
      x: 0,
      y: -200,
      width: 270,
      height: 157
    },
    origin: {
      x: 0,
      y: 0
    },
    align: "left"
  },
  Flat: {
    paths: [
      {
        type: "positive",
        data: "M7.813-204.406c4.166 0 6.25 5.208 6.25 15.625L12.5-10.657C33.854 13.302 54.167 25.28 73.438 25.28c9.374 0 14.062-4.686 14.062-14.06 0-6.25-1.042-11.72-3.125-16.407-2.083-4.688-7.03-9.766-14.844-15.235-7.81-5.47-13.02-8.984-15.624-10.547L27.344-45.81V-80.97c17.187 0 33.073 4.82 47.656 14.454C89.583-56.88 96.875-47.376 96.875-38c0 67.708-.26 101.562-.78 101.563-38.543 0-69.532-12.24-92.97-36.72C0-52.322-1.042-123.936 0-188c0-10.937 2.604-16.406 7.813-16.406z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 97.917,
      height: 267.969
    },
    origin: {
      x: 1.042,
      y: 204.406
    },
    align: "left"
  },
  Mora: {
    paths: [
      {
        type: "positive",
        data: "M47.478-24c6.957 0 12.793 2.288 17.49 6.883C69.662-12.52 72-6.904 72-.267c0 6.64-2.337 12.352-7.033 17.118C60.27 21.618 54.435 24 47.477 24c-6.26 0-11.748-2.383-16.444-7.15C26.337 12.086 24 6.374 24-.265c0-6.638 2.337-12.255 7.033-16.85C35.73-21.713 41.217-24 47.478-24z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 48,
      height: 48
    },
    origin: {
      x: -24,
      y: 24
    },
    align: "left"
  },
  Natural: {
    paths: [
      {
        type: "positive",
        data: "M7.906-166.563c-2.864 0-5.614.52-8.218 1.563v13.28l.78 56.25.782 78.907v85.157c.52 3.646 2.604 5.73 6.25 6.25l23.438-3.906 23.437-3.907v29.69c0 42.186-.26 63.54-.78 64.06l6.25 2.345c1.04.52 2.082.78 3.124.78 2.603 0 4.947-1.3 7.03-3.905L67.656-71.25c-.52-2.604-2.083-3.906-4.687-3.906-7.814 0-17.19 1.04-28.126 3.125l-19.53 3.124.78-38.28V-165c-2.604-1.042-5.323-1.562-8.188-1.563zM55.938-40v71.875l-41.407 7.03c0-48.436.262-72.655.783-72.655L55.938-40z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 70.311,
      height: 330.469
    },
    origin: {
      x: 0.312,
      y: 166.563
    },
    align: "left"
  },
  Sharp: {
    paths: [
      {
        type: "positive",
        data: "m41.725,-73.773c-5.421,-0.241-10.878,5.856-6.549,12.357L67.061,-20.473 61.264,-12.5 13.436,-71.199c-5.634,-5.934-16.988,1.032-11.232,9.783L50.756,0.182 2.203,61.416c-6.745,7.984 3.442,17.859 11.232,9.783L61.264,12.5l5.797,7.973-31.885,40.943c-5.578,6.844 5.588,16.005 11.594,9.783L77.568,33.154 108.367,71.199c4.894,6.717 17.343,-1.575 11.232,-9.783L87.715,20.473 93.873,12.5 141.34,71.199c6.725,7.67 17.509,-2.248 11.596,-9.783L104.02,0.182 152.936,-61.416c5.52,-7.02-5.541,-16.309-11.596,-9.783L93.873,-12.5l-6.158,-7.973 31.884766,-40.943c5.407,-7.045-5.505,-15.924-11.232,-9.783L77.568,-33.154 46.77,-71.199c-1.435,-1.708-3.238,-2.494-5.044922,-2.574zM77.568,-8.516 84.09,0.182 77.568,8.516 70.684,0.182Z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 154.646,
      height: 147.987
    },
    origin: {
      x: 0,
      y: 74.098
    },
    align: "left"
  },
  OriscusAsc: {
    paths: [
      {
        type: "positive",
        data: "M50 30.25c0 12.5-3.125 21.354-9.375 26.562-3.125 2.605-7.813 3.907-14.063 3.907-3.125 0-5.99-.522-8.593-1.564-2.605-1.04-5.6-2.474-8.986-4.297C5.6 53.035 2.734 51.603.39 50.56c-2.343-1.04-5.338-2.474-8.984-4.296-3.646-1.823-6.77-3.256-9.375-4.297-2.603-1.043-5.468-1.564-8.593-1.564-6.25 0-10.937 1.563-14.062 4.688C-46.875 50.824-50 59.677-50 71.656v-106.25c0-13.02 3.125-21.875 9.375-26.562 3.125-2.604 7.813-3.906 14.063-3.907 3.125 0 5.99.52 8.593 1.563 2.605 1.042 5.73 2.474 9.376 4.297 3.646 1.823 6.51 2.995 8.594 3.516l10.938 5.468c6.25 3.126 11.458 4.69 15.624 4.69 6.25 0 10.938-1.564 14.063-4.69C46.875-55.426 50-64.02 50-76V30.25z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 100,
      height: 147.656
    },
    origin: {
      x: 50,
      y: 76
    },
    align: "left"
  },
  OriscusDes: {
    paths: [
      {
        type: "positive",
        data: "M-50 30.844v-106.25c0 11.458 3.125 20.052 9.375 25.78 3.125 3.126 7.813 4.69 14.063 4.688 4.687 0 13.41-3.255 26.17-9.765 12.762-6.51 21.746-9.766 26.954-9.766 6.25 0 10.938 1.303 14.063 3.907C46.875-55.874 50-47.02 50-34V72.25c0-11.98-3.125-20.833-9.375-26.563C37.5 42.563 32.812 41 26.562 41 21.875 41 13.023 44.385 0 51.156c-4.167 2.604-8.594 4.948-13.28 7.032-4.69 2.083-9.116 3.124-13.283 3.124-6.25 0-10.937-1.302-14.062-3.906C-46.875 52.198-50 43.344-50 30.844z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 100,
      height: 147.656
    },
    origin: {
      x: 50,
      y: 75.406
    },
    align: "left"
  },
  OriscusLiquescent: {
    paths: [
      {
        type: "positive",
        data: "M 19.055,78.887 C 20.242,78.487 21.532,77.890 22.925,77.097 24.318,76.304 26.700882,74.417 30.074,71.438 33.447,68.458 36.524,64.985 39.303,61.019 42.083,57.052 44.563,51.396 46.743,44.05 48.923,36.704 50.013,28.671 50.013,19.950525 L 50.013,-34.226 C 50.013,-54.464 42.074,-64.584 26.195,-64.584 20.248,-64.584 11.519,-61.410 0.007,-55.064 -11.506,-48.717 -20.235,-45.544 -26.182,-45.544 -34.515,-45.544 -40.568,-48.520 -44.340791,-54.473 -48.114,-60.426 -50.000,-67.369 -50.000,-75.303 L -50.000,30.07 C -50.000,49.909 -42.060754,59.829 -26.182,59.829 -21.023,59.829 -12.39,56.455 -0.284,49.709 11.822,42.963 20.648,39.59 26.195,39.59 29.369,40.777 30.362,44.25 29.17479,50.009 27.988,55.768 26.001,62.020829 23.216,68.767 z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 100,
      height: 147.656
    },
    origin: {
      x: 50,
      y: 75.406
    },
    align: "left"
  },
  PodatusLower: {
    paths: [
      {
        type: "positive",
        data: "M-50 42.17V-50q0-5.42 3.61-5.42h2.41q19.28 3.61 35.55 3.61 4.21 0 10.84-.3t9.04-.3q13.25 0 20.48-4.82t7.23-12.65L50-75.3V41.57q0 3.61-11.14 6.92-11.15 3.32-24.4 3.32-3.01 0-7.83-.3-4.82-.31-12.05-.31-19.88 0-28.31-1.2Q-50 46.99-50 42.17"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 100,
      height: 103.6
    },
    origin: {
      x: 50,
      y: 51.8
    },
    align: "left"
  },
  PodatusLowerShort: {
    paths: [
      {
        type: "positive",
        data: "M-4.688-30.28c22.396 0 34.636-.262 36.72-.782 5.728-1.563 8.593-5.21 8.593-10.938H50v97.656c0 2.604-1.302 4.167-3.906 4.688-5.21.52-21.355.78-48.438.78-23.958 0-38.54-.26-43.75-.78-2.604 0-3.906-1.302-3.906-3.906v-82.032c0-3.646 1.302-5.468 3.906-5.468h2.344c2.604.52 15.625.78 39.063.78z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 100,
      height: 103.124
    },
    origin: {
      x: 50,
      y: 42
    },
    align: "left"
  },
  // the PodatusUpper is really the same as the PodatusUpperShort, just shifted to be fully centered where a normal punctum would be
  PodatusUpper: {
    paths: [
      {
        type: "positive",
        data: "m-46.094-55.78c13.542 0 24.61 2.473 33.203 7.42c8.593 4.947 12.891 12.367 12.891 22.264v96.093h-9.375c0-10.938-2.604-19.14-7.812-24.61c-5.21-5.468-14.844-8.203-28.907-8.202c-18.23 0-33.333 4.166-45.312 12.5v-75.782c0-19.79 15.104-29.687 45.312-29.687z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 91.406,
      height: 125.781
    },
    origin: {
      x: 91.406,
      y: 63.781
    },
    align: "right"
  },
  PodatusUpperShort: {
    paths: [
      {
        type: "positive",
        data: "M-46.094-63.78c13.542 0 24.61 2.473 33.203 7.42C-4.298-51.41 0-43.99 0-34.093V62h-9.375c0-10.938-2.604-19.14-7.812-24.61-5.21-5.468-14.844-8.203-28.907-8.202-18.23 0-33.333 4.166-45.312 12.5v-75.782c0-19.79 15.104-29.687 45.312-29.687z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 91.406,
      height: 125.781
    },
    origin: {
      x: 91.406,
      y: 63.781
    },
    align: "right"
  },
  Porrectus1: {
    paths: [
      {
        type: "positive",
        data: "M233.594 162.875c-58.855 0-107.032-6.25-144.53-18.75C34.895 125.895-11.46 99.855-50 66V-52.75C-21.354-24.625 26.302 6.885 92.97 41.78 123.697 57.928 163.54 66 212.5 66c21.354 0 34.635-9.896 39.844-29.688V151.94c0 7.29-6.25 10.937-18.75 10.937z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 302.344,
      height: 215.627
    },
    origin: {
      x: 50,
      y: 52.75
    },
    align: "left"
  },
  Porrectus2: {
    paths: [
      {
        type: "positive",
        data: "M309.375 259.375c-50.52 0-110.938-22.396-181.25-67.188C48.437 141.667-10.938 94.272-50 50V-68.75C0-3.125 60.417 52.083 131.25 96.875c58.333 36.98 110.677 58.854 157.03 65.625h7.033c16.145 0 26.822-9.896 32.03-29.688v114.844c0 7.812-5.99 11.72-17.968 11.72z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 377.343,
      height: 328.126
    },
    origin: {
      x: 50,
      y: 68.75
    },
    align: "left"
  },
  Porrectus3: {
    paths: [
      {
        type: "positive",
        data: "M309.375 355.78c-48.96-16.666-109.115-55.468-180.47-116.405C79.428 198.23 19.793 134.687-50 48.75V-70C20 40 94.104 103.79 135.25 148.063 190 200 230 230 288.28 258.906c4.168 2.083 8.334 3.125 12.5 3.125 12.5 0 21.355-10.937 26.564-32.81v114.06c0 9.376-3.386 14.063-10.156 14.064-2.084 0-4.688-.522-7.813-1.563z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 377.344,
      height: 427.345
    },
    origin: {
      x: 50,
      y: 70
    },
    align: "left"
  },
  Porrectus4: {
    paths: [
      {
        type: "positive",
        data: "M350 453.438c-52.754-22.397-120-77.345-201.74-164.844C90.87 227.656 24.784 147.708-50 48.75V-70C-8.84-1.25 58.406 86.51 151.74 193.28c60.868 69.793 119.13 124.22 174.782 163.282 5.797 3.646 11.014 5.47 15.652 5.47 12.173 0 21.45-11.72 27.826-35.157V441.72c0 9.373-3.19 14.06-9.565 14.06-2.9 0-6.377-.78-10.435-2.342z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 420,
      height: 525.78
    },
    origin: {
      x: 50,
      y: 70
    },
    align: "left"
  },
  PunctumCavum: {
    paths: [
      {
        type: "positive",
        data: "M0-60.906c33.333 0 50 9.635 50 28.906v94.53C39.062 51.595 22.396 46.126 0 46.126s-39.063 5.47-50 16.406V-32c0-19.27 16.667-28.906 50-28.906z"
      },
      {
        type: "negative",
        data: "M.08-42.56c9.585.206 20.126.53 27.954 6.822 4.96 3.9 4.71 10.792 4.574 16.482v51.278C22.09 27.066 7.283 26.072.168 26.01c-7.72.23-21.895.935-32.616 4.674.04-19.197-.083-38.395.064-57.59.567-7.5 7.834-12.33 14.62-13.774 5.818-1.498 11.857-1.86 17.844-1.88z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 100,
      height: 123.438
    },
    origin: {
      x: 50,
      y: 60.906
    },
    align: "left"
  },
  PunctumQuadratum: {
    paths: [
      {
        type: "positive",
        data: "M0-60.906c33.333 0 50 9.635 50 28.906v94.53C39.062 51.595 22.396 46.126 0 46.126s-39.063 5.47-50 16.406V-32c0-19.27 16.667-28.906 50-28.906z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 100,
      height: 123.438
    },
    origin: {
      x: 50,
      y: 60.906
    },
    align: "left"
  },
  PunctumQuadratumLiquescent: {
    paths: [
      {
        type: "positive",
        data: "M0-36.5436c19.999799999999997 0 30 5.781 30 17.3436v56.717999999999996C23.437199999999997 30.956999999999997 13.4376 27.6756 0 27.6756s-23.4378 3.2819999999999996-30 9.843599999999999V-19.2c0-11.562 10.000200000000001-17.3436 30-17.3436z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 100,
      height: 123.438
    },
    origin: {
      x: 50,
      y: 60.906
    },
    align: "left"
  },
  PunctumQuadratumAscLiquescent: {
    paths: [
      {
        type: "positive",
        data: "M-50 43.688V-61c4.167 7.292 12.76 10.938 25.78 10.938 9.376 0 20.053-1.563 32.032-4.688C31.773-60.48 45.833-71.677 50-88.344v117.97C43.75 42.645 32.812 51.5 17.187 56.186-.52 61.398-15.886 64-28.906 64-42.97 64-50 57.23-50 43.687z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 100,
      height: 152.344
    },
    origin: {
      x: 50,
      y: 88.344
    },
    align: "left"
  },
  PunctumQuadratumDesLiquescent: {
    paths: [
      {
        type: "positive",
        data: "M-50-56.03c0-13.022 7.03-19.532 21.094-19.532 13.02 0 28.385 2.604 46.093 7.812C32.813-63.583 43.75-54.73 50-41.187V76C45.833 59.854 31.77 48.656 7.812 42.406c-11.98-3.125-22.656-4.687-32.03-4.687-13.022 0-21.615 3.905-25.782 11.718v-105.47z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 100,
      height: 151.562
    },
    origin: {
      x: 50,
      y: 75.562
    },
    align: "left"
  },
  PunctumInclinatum: {
    paths: [
      {
        type: "positive",
        data: "M0-75.78L50 0 0 75-50 0 0-75.78z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 100,
      height: 150.78
    },
    origin: {
      x: 50,
      y: 75.78
    },
    align: "left"
  },
  PunctumInclinatumLiquescent: {
    paths: [
      {
        type: "positive",
        data: "M 0,-53.164 35,-0.117 0,52.383 -35,-0.117 0,-53.164 z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 100,
      height: 105.546
    },
    origin: {
      x: 50,
      y: 53.164
    },
    align: "left"
  },
  Quilisma: {
    paths: [
      {
        type: "positive",
        data: "M-50 34.938V-51c5.73 20.833 13.02 31.25 21.875 31.25 7.813 0 12.5-15.625 14.063-46.875 3.645 12.5 6.9 21.224 9.765 26.172s6.9 7.422 12.11 7.422c5.208 0 9.374-14.324 12.5-42.97 5.73 22.917 10.677 34.375 14.843 34.375 5.73 0 10.677-15.885 14.844-47.656v100c0 17.707-3.125 26.56-9.375 26.56-4.688 0-9.115-5.988-13.28-17.968-2.085 21.875-8.074 32.813-17.97 32.813-7.813 0-16.146-7.292-25-21.875-4.688 20.312-10.677 30.47-17.97 30.47-5.207 0-9.244-2.605-12.108-7.814C-48.568 47.698-50 41.708-50 34.938z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 100,
      height: 150
    },
    origin: {
      x: 50,
      y: 89.282
    },
    align: "left"
  },
  TerminatingAscLiquescent: {
    paths: [
      {
        type: "positive",
        data: "M-9.375 40.22c0-11.98-4.948-17.97-14.844-17.97-10.936 0-19.53 3.646-25.78 10.938v-53.126c0-6.77 2.604-12.76 7.813-17.968 5.208-5.21 10.677-8.594 16.406-10.157 2.603-.52 5.207-.78 7.81-.78 3.647 0 7.032.78 10.157 2.343C-2.603-43.896 0-39.73 0-34V73.03h-9.375V40.22z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 49.999,
      height: 121.873
    },
    origin: {
      x: 49.999,
      y: 48.843
    },
    align: "right"
  },
  TerminatingDesLiquescent: {
    paths: [
      {
        type: "positive",
        data: "M-9.375-48.156V-80.97H0V26.845c0 5.73-2.604 9.896-7.813 12.5-3.125 1.562-6.51 2.343-10.156 2.343-2.603 0-5.207-.26-7.81-.78-5.73-1.563-11.2-4.95-16.407-10.157C-47.398 25.542-50 19.292-50 12v-52.344c6.25 7.292 14.844 10.938 25.78 10.938 9.897 0 14.845-6.25 14.845-18.75z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 50,
      height: 122.658
    },
    origin: {
      x: 50,
      y: 80.97
    },
    align: "right"
  },
  VerticalEpisemaAbove: {
    paths: [
      {
        type: "positive",
        data: "M-8-4c2 3 6 4 8 4s6-1 8-4v-52c-2-3-6-4-8-4s-6 1-8 4z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 16,
      height: 60
    },
    origin: {
      x: 8,
      y: 60
    },
    align: "left"
  },
  VerticalEpisemaBelow: {
    paths: [
      {
        type: "positive",
        data: "M-8 56c2 3 6 4 8 4s6-1 8-4v-52c-2-3-6-4-8-4s-6 1-8 4z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 16,
      height: 60
    },
    origin: {
      x: 8,
      y: 0
    },
    align: "left"
  },
  VirgaLong: {
    paths: [
      {
        type: "positive",
        data: "M50-38v285.156c0 6.77-2.344 10.937-7.03 12.5-1.564 0-2.605-.78-3.126-2.344-.52-1.562-.782-10.156-.782-25.78V54.186C29.168 45.334 16.146 40.907 0 40.907c-22.917 0-39.583 5.208-50 15.624V-38c0-19.27 16.667-28.906 50-28.906S50-57.27 50-38z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 100,
      height: 326.562
    },
    origin: {
      x: 50,
      y: 66.906
    },
    align: "left"
  },
  VirgaShort: {
    paths: [
      {
        type: "positive",
        data: "M50-38v211.72c0 7.29-2.344 11.457-7.03 12.5-1.564 0-2.606-.783-3.126-2.345-.52-1.563-.782-10.156-.782-25.78V54.187C29.167 45.332 16.146 40.906 0 40.906c-22.917 0-39.583 5.21-50 15.625V-38c0-19.27 16.667-28.906 50-28.906S50-57.27 50-38z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 100,
      height: 253.126
    },
    origin: {
      x: 50,
      y: 66.906
    },
    align: "left"
  },
  Virgula: {
    paths: [
      {
        type: "positive",
        data: "M8.178-55.66c0-22.137 12.092-33.2 36.287-33.2 11.835 0 23.53 5.66 35.108 16.98C91.15-60.547 96.94-41.766 96.94-15.534c0 53.515-31.646 87.487-94.937 101.895-2.048-2.06-3.077-5.146-3.077-9.273 0-1.03.247-1.8.76-2.316 42.71-19.027 64.075-41.678 64.075-67.92 0-11.322-2.325-20.326-6.945-27.016-4.62-6.69-9.52-11.052-14.676-13.11-5.147-2.048-11.836-3.85-20.07-5.403C12.81-39.707 8.18-45.37 8.18-55.66z"
      }
    ],
    bounds: {
      x: 0,
      y: 0,
      width: 98.014,
      height: 175.221
    },
    origin: {
      x: 1.074 - 98.014 / 2, // centered
      y: 88.86
    },
    align: "left"
  }
};

const addAccent = (vowel) =>
  ({
    Æ: "Ǽ",
    Œ: "Œ́",
    A: "Á",
    E: "É",
    I: "Í",
    O: "Ó",
    U: "Ú",
    Y: "Ý",
    æ: "ǽ",
    œ: "œ́",
    a: "á",
    e: "é",
    i: "í",
    o: "ó",
    u: "ú",
    y: "ý"
  })[vowel] || vowel;

const greextraGlyphs = {
  MedicaeaFlat: "",
  HufnagelCustosUpShort: "",
  HufnagelCustosUpLong: "",
  HufnagelCustosUpMedium: "",
  HufnagelCustosDownShort: "",
  HufnagelCustosDownLong: "",
  HufnagelCustosDownMedium: "",
  MedicaeaCustosUpShort: "",
  MedicaeaCustosUpLong: "",
  MedicaeaCustosUpMedium: "",
  MedicaeaCustosDownShort: "",
  MedicaeaCustosDownLong: "",
  MedicaeaCustosDownMedium: "",
  MensuralCustosUpShort: "",
  MensuralCustosUpLong: "",
  MensuralCustosUpMedium: "",
  MensuralCustosDownShort: "",
  MensuralCustosDownLong: "",
  MensuralCustosDownMedium: "",
  MensuralFlat: "",
  HufnagelFlat: "",
  MedicaeaCClef: "",
  MedicaeaCClefChange: "",
  MedicaeaFClef: "",
  MedicaeaFClefChange: "",
  HufnagelCClef: "",
  HufnagelCClefChange: "",
  HufnagelFClef: "",
  HufnagelFClefChange: "",
  HugnagelCFClef: "",
  HufnagelCFClefChange: "",
  MensuralFlatHole: "",
  HufnagelFlatHole: "",
  MedicaeaFlatHole: "",
  StarSix: "",
  Dagger: "",
  "Bar.alt": "",
  StarHeight: "",
  Cross: "",
  "RBar.alt": "",
  "VBar.alt": "",
  Drawing1: "",
  Drawing2: "",
  RWithBarGoth: "",
  VWithBarGoth: "",
  Line1: "",
  Line2: "",
  Line3: "",
  Line4: "",
  Line5: "",
  "Cross.alt": "",
  ABarCaption: "",
  RBarCaption: "",
  VBarCaption: "",
  ABarCaptionSC: "",
  RBarCaptionSC: "",
  VBarCaptionSC: "",
  ABar: "",
  RBar: "",
  VBar: "",
  ABarSC: "",
  RBarSC: "",
  VBarSC: "",
  ABarSmall: "",
  RBarSmall: "",
  VBarSmall: "",
  ABarSmallSC: "",
  RBarSmallSC: "",
  VBarSmallSC: "",
  "RBar.alt2": "",
  "VBar.alt2": "",
  ABarCaptionSlant: "",
  RBarCaptionSlant: "",
  VBarCaptionSlant: "",
  ABarSlant: "",
  RBarSlant: "",
  VBarSlant: "",
  ABarSmallSlant: "",
  RBarSmallSlant: "",
  VBarSmallSlant: ""
};

const makeLigature = (vowels) =>
  ({
    AE: "Æ",
    Ae: "Æ",
    ae: "æ",
    OE: "Œ",
    Oe: "Œ",
    oe: "œ"
  })[vowels] || vowels;

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


function getFontFilenameForProperties(properties = {}, url = "{}") {
  var italic = properties["font-style"] === "italic" ? "Italic" : "",
    bold = properties["font-weight"] === "bold" ? "Bold" : "";
  return url.replace(
    "{}",
    `${italic || bold ? `${bold}${italic}` : `Regular`}`
  );
}

// load in the web font for special chant characters here:
// var __exsurgeCharactersFont = require("url?limit=30000!../assets/fonts/ExsurgeChar.otf")

const canAccessDOM = typeof document !== "undefined";

const __getNeumeFromSvgElem = (score, elem) => {
  let note =
    score.notes[
      elem.parentElement
        .querySelector("[element-index]")
        .getAttribute("element-index")
    ];
  return note.neume || note;
};

// for positioning markings on notes
var MarkingPositionHint = {
  Default: 0,
  Above: 1,
  Below: 2
};

/**
 * List of types of text and their defaults relative to lyrics
 * @type Array
 */
const TextTypes = {
  supertitle: {
    display: "Supertitle",
    defaultSize: (size) => (size * 7) / 6, // 14pt
    containedInScore: (score) => score.titles.hasSupertitle(),
    getFromScore: (score) => score.titles.supertitle
  },
  title: {
    display: "Title",
    defaultSize: (size) => (size * 3) / 2, // 18pt
    containedInScore: (score) => score.titles.hasTitle(),
    getFromScore: (score) => score.titles.title
  },
  subtitle: {
    display: "Subtitle",
    defaultSize: (size) => size, // 12pt
    containedInScore: (score) => score.titles.hasSubtitle(),
    getFromScore: (score) => score.titles.subtitle
  },
  leftRight: {
    display: "Left / Right Text",
    cssClass: "textLeftRight",
    defaultSize: (size) => size * 0.9,
    containedInScore: (score) =>
      score.titles.hasTextLeft() || score.titles.hasTextRight(),
    getFromScore: (score, elem) => score.titles[elem.extraClass],
    getFromSvgElem: (score, elem) =>
      score.titles[
        elem.classList.contains("textRight") ? "textRight" : "textLeft"
      ]
  },
  annotation: {
    display: "Annotation",
    defaultSize: (size) => (size * 2) / 3,
    containedInScore: (score) => !!score.annotation,
    getFromScore: (score, { elementIndex = 0 }) =>
      score.annotation &&
      (score.annotation.annotations
        ? score.annotation.annotations[elementIndex]
        : score.annotation),
    getFromSvgElem: (score, elem) =>
      score.annotation &&
      (score.annotation.annotations
        ? score.annotation.annotations[
            Array.from(
              elem.parentElement.querySelectorAll("text.annotation")
            ).indexOf(elem)
          ]
        : score.annotation)
  },
  dropCap: {
    display: "Drop Cap",
    defaultSize: (size) => size * 4,
    containedInScore: (score) => !!score.dropCap,
    getFromScore: (score) => score.dropCap
  },
  al: {
    display: "Above Staff",
    cssClass: "aboveLinesText",
    defaultSize: (size) => size,
    containedInScore: (score) => score.hasAboveLinesText,
    getFromScore: (score, elem) =>
      score.notations[elem.notation.notationIndex].alText[elem.alIndex],
    getFromSvgElem: (score, elem) =>
      __getNeumeFromSvgElem(score, elem).alText[
        elem.getAttribute("al-index") || 0
      ]
  },
  choralSign: {
    display: "Choral Sign",
    size: (ctxt) => ctxt.staffInterval * 1.5,
    containedInScore: (score) => false,
    getFromScore: (score, elem) =>
      score.notes[elem.note.elementIndex].choralSign
  },
  lyric: {
    display: "Lyric",
    defaultSize: (size) => size * 0.9,
    containedInScore: (score) => score.hasLyrics,
    getFromScore: (score, elem) =>
      score.notations[elem.notation.notationIndex].lyrics[elem.lyricIndex],
    getFromSvgElem: (score, elem) =>
      __getNeumeFromSvgElem(score, elem).lyrics[
        elem.getAttribute("lyric-index") || 0
      ]
  },
  translation: {
    display: "Translation",
    defaultSize: (size) => size * 0.75,
    containedInScore: (score) => score.hasTranslations,
    getFromScore: (score, elem) =>
      score.notations[elem.notation.notationIndex].translationText[
        elem.translationIndex
      ],
    getFromSvgElem: (score, elem) =>
      __getNeumeFromSvgElem(score, elem).translationText[
        elem.getAttribute("translation-index") || 0
      ]
  }
};
const TextTypesByClass = {};
Object.entries(TextTypes).forEach(([key, entry]) => {
  let cssClass = (entry.cssClass = entry.cssClass || key);
  entry.key = key;
  TextTypesByClass[cssClass] = entry;
});

const DefaultTrailingSpace = (ctxt) =>
  ctxt.intraNeumeSpacing * ctxt.interSyllabicMultiplier;
DefaultTrailingSpace.isDefault = true;

let GlyphCode = {
  None: "None",

  AcuteAccent: "AcuteAccent",
  GraveAccent: "GraveAccent",
  Circle: "Circle",
  Semicircle: "Semicircle",
  ReversedSemicircle: "ReversedSemicircle",
  Stropha: "Stropha",
  StrophaLiquescent: "StrophaLiquescent",

  BeginningAscLiquescent: "BeginningAscLiquescent",
  BeginningDesLiquescent: "BeginningDesLiquescent",

  CustosDescLong: "CustosDescLong",
  CustosDescShort: "CustosDescShort",
  CustosLong: "CustosLong",
  CustosShort: "CustosShort",

  // clefs and other markings
  DoClef: "DoClef",
  FaClef: "FaClef",
  TrebleClef: "TrebleClef",
  TrebleClefSmall: "TrebleClefSmall",
  ChiRhoClef: "ChiRhoClef",
  ChiRhoClefSans: "ChiRhoClefSans",
  Flat: "Flat",
  Mora: "Mora",
  Natural: "Natural",
  OriscusAsc: "OriscusAsc",
  OriscusDes: "OriscusDes",
  OriscusLiquescent: "OriscusLiquescent",

  PodatusLower: "PodatusLower",
  PodatusUpper: "PodatusUpper",
  PodatusLowerShort: "PodatusLowerShort",
  PodatusUpperShort: "PodatusUpperShort",

  Porrectus1: "Porrectus1", // 1 staff line difference,
  Porrectus2: "Porrectus2", // 2 lines difference, etc...
  Porrectus3: "Porrectus3",
  Porrectus4: "Porrectus4",

  PunctumCavum: "PunctumCavum",
  PunctumQuadratum: "PunctumQuadratum",
  PunctumQuadratumLiquescent: "PunctumQuadratumLiquescent",
  PunctumQuadratumAscLiquescent: "PunctumQuadratumAscLiquescent",
  PunctumQuadratumDesLiquescent: "PunctumQuadratumDesLiquescent",
  PunctumInclinatum: "PunctumInclinatum",
  PunctumInclinatumLiquescent: "PunctumInclinatumLiquescent",
  Quilisma: "Quilisma",

  Sharp: "Sharp",
  TerminatingAscLiquescent: "TerminatingAscLiquescent",
  TerminatingDesLiquescent: "TerminatingDesLiquescent",
  VerticalEpisemaAbove: "VerticalEpisemaAbove",
  VerticalEpisemaBelow: "VerticalEpisemaBelow",
  VirgaLong: "VirgaLong",
  VirgaShort: "VirgaShort",
  Virgula: "Virgula",

  UpperBrace: "UpperBrace"
}; // GlyphCode

var QuickSvg = {
  // namespaces
  ns: "http://www.w3.org/2000/svg",
  xmlns: "https://www.w3.org/2000/xmlns/",
  xlink: "http://www.w3.org/1999/xlink",

  hasDOMAccess: function () {
    return canAccessDOM;
  },

  // create the root level svg object
  svg: function (width, height) {
    var node = document.createElementNS(this.ns, "svg");

    node.setAttribute("xmlns", this.ns);
    node.setAttribute("version", "1.1");
    node.setAttributeNS(this.xmlns, "xmlns:xlink", this.xlink);

    node.setAttribute("width", width);
    node.setAttribute("height", height);

    // create the defs element
    var defs = document.createElementNS(this.ns, "defs");
    node.appendChild(defs);

    node.defs = defs;

    node.clearNotations = function () {
      // clear out all children except defs
      node.removeChild(defs);

      while (node.hasChildNodes()) node.removeChild(node.lastChild);

      node.appendChild(defs);
    };

    return node;
  },

  rect: function (width, height) {
    var node = document.createElementNS(this.ns, "rect");

    node.setAttribute("width", width);
    node.setAttribute("height", height);

    return node;
  },

  line: function (x1, y1, x2, y2) {
    var node = document.createElementNS(this.ns, "line");

    node.setAttribute("x1", x1);
    node.setAttribute("y1", y1);
    node.setAttribute("x2", x2);
    node.setAttribute("y2", y2);

    return node;
  },

  g: function () {
    var node = document.createElementNS(this.ns, "g");

    return node;
  },

  text: function () {
    var node = document.createElementNS(this.ns, "text");

    return node;
  },

  tspan: function (str) {
    var node = document.createElementNS(this.ns, "tspan");
    node.textContent = str;

    return node;
  },

  // nodeRef should be the id of the object in defs (without the #)
  use: function (nodeRef) {
    var node = document.createElementNS(this.ns, "use");
    node.setAttributeNS(this.xlink, "xlink:href", "#" + nodeRef);

    return node;
  },

  svgFragmentForGlyph: function (glyph) {
    var svgSrc = "";
    for (var i = 0; i < glyph.paths.length; ++i) {
      var path = glyph.paths[i];
      svgSrc += QuickSvg.createFragment(path.data ? "path" : "g", {
        d: path.data || undefined,
        fill: path.type === "negative" ? "#fff" : undefined
      });
    }
    return svgSrc;
  },

  nodesForGlyph: function (glyph, functionName = "createNode") {
    var nodes = [];
    for (var i = 0; i < glyph.paths.length; ++i) {
      var path = glyph.paths[i];
      let props = {};
      if (path.data) props.d = path.data;
      if (path.type === "negative") props.fill = "#fff";
      nodes.push(QuickSvg[functionName](path.data ? "path" : "g", props));
    }
    return nodes;
  },

  createNode: function (name, attributes, children) {
    var node = document.createElementNS(this.ns, name);
    if (attributes && attributes.source) {
      node.source = attributes.source;
      delete attributes.source;
    }
    for (var attr in attributes) {
      if (
        attributes.hasOwnProperty(attr) &&
        typeof attributes[attr] !== "undefined"
      ) {
        var val = attributes[attr];
        var match = attr.match(/^([^:]+):([^:]+)$/);
        if (match) {
          node.setAttributeNS(this[match[1]], match[2], val);
        } else {
          node.setAttribute(attr, val);
        }
      }
    }
    if (children) {
      if (typeof children === "string") {
        node.textContent = children;
      } else if (children.constructor === [].constructor) {
        for (var i = 0; i < children.length; ++i) {
          node.appendChild(children[i]);
        }
      } else {
        node.appendChild(children);
      }
    }
    return node;
  },

  createSvgTree(name, props, ...children) {
    if ("class" in props) {
      props.className = props.class;
      delete props.class;
    }
    if (children.length === 1 && children[0] instanceof Array) {
      children = children[0];
    }
    const convertKeysToCamelCase = (obj) => {
      for (let key of Object.keys(obj)) {
        if (/[-:][a-z]/.test(key)) {
          if (/^\w+-index$/.test(key)) continue;
          let camelCase = key.replace(/[-:]([a-z])/g, (whole, letter) =>
            letter.toUpperCase()
          );
          obj[camelCase] = obj[key];
          delete obj[key];
        }
      }
    };
    convertKeysToCamelCase(props);
    if (props.style) convertKeysToCamelCase(props.style);
    let source = props.source;
    if (source && source.sourceGabc) {
      props["source-gabc"] = source.sourceGabc;
    }
    return { name, props, children };
  },

  createFragment: function (name, attributes, child) {
    if (child === undefined || child === null) child = "";

    var fragment = "<" + name + " ";

    for (var attr in attributes) {
      if (
        attributes.hasOwnProperty(attr) &&
        typeof attributes[attr] !== "undefined"
      )
        fragment += attr + '="' + attributes[attr] + '" ';
    }

    fragment += ">" + child + "</" + name + ">";

    return fragment;
  },

  parseFragment: function (fragment) {
    // create temporary holder
    var well = document.createElement("svg");

    // act as a setter if svg is given
    if (fragment) {
      var container = this.g();

      // dump raw svg
      // do this to allow the browser to automatically create svg nodes?
      well.innerHTML =
        "<svg>" +
        fragment
          .replace(/\n/, "")
          .replace(/<(\w+)([^<]+?)\/>/g, "<$1$2></$1>") +
        "</svg>";

      // transplant nodes
      for (var i = 0, il = well.firstChild.childNodes.length; i < il; i++)
        container.appendChild(well.firstChild.firstChild);

      return container;
    }
  },

  translate: function (node, x, y) {
    node.setAttribute("transform", "translate(" + x + "," + y + ")");
    return node;
  },

  scale: function (node, sx, sy) {
    node.setAttribute("transform", "scale(" + sx + "," + sy + ")");
    return node;
  }
};

var TextMeasuringStrategy = {
  // shapes
  Svg: 0,
  Canvas: 1,
  OpenTypeJS: 2
};

/*
 * ChantContext
 */
class ChantContext {
  constructor(
    textMeasuringStrategy = QuickSvg.hasDOMAccess()
      ? TextMeasuringStrategy.Canvas
      : TextMeasuringStrategy.OpenTypeJS
  ) {
    /**
     * font dictionary
     * @type {{ [key: string]: import('opentype.js').Font }}
     */
    this.fontDictionary = undefined;
    this.staffLineCount = 4;
    this.textMeasuringStrategy = textMeasuringStrategy;
    this.getFontFilenameForProperties = getFontFilenameForProperties;
    this.defs = {};
    this.makeDefs = [];
    if (QuickSvg.hasDOMAccess()) {
      this.defsNode = QuickSvg.createNode("defs");
    }

    // font styles
    this.textStyles = {};
    this.textColor = "#000";
    this.setFont("'Palatino Linotype', 'Book Antiqua', Palatino, serif", 16);

    this.rubricColor = "#d00";
    this.specialCharProperties = {
      "font-family": "'Exsurge Characters'",
      fill: this.rubricColor,
      class: "rubric"
    };
    this.textBeforeSpecialChar = "";
    this.textAfterSpecialChar = ".";
    this.specialCharMap = {
      "℣": "v",
      "℟": "r",
      "+": "+",
      "*": "*"
    };
    this.plusProperties = {};
    this.asteriskProperties = {};
    this.specialCharText = (char) => this.specialCharMap[char] || char;

    this.fontStyleDictionary = {
      b: { "font-weight": "bold" },
      i: { "font-style": "italic" },
      u: { "text-decoration": "underline" },
      ul: { "text-decoration": "underline" },
      c: { fill: this.rubricColor, class: "rubric" },
      sc: { "font-variant": "small-caps" },
      v: {},
      e: { "font-style": "italic", "font-size": "90%" }
    };

    this.markupSymbolDictionary = {
      "*": "b",
      _: "i",
      "^": "c",
      "%": "sc"
    };

    this.textStyles.al.prefix = "<i>";

    this.textStyles.translation.prefix = "<i>";

    this.textStyles.dropCap.padding = 1; // minimum padding on either side of drop cap in staffIntervals

    this.textStyles.annotation.padding = 1; // minimum padding on either side of annotation in staffIntervals

    this.minLedgerSeparation = 2; // multiple of staffInterval
    this.minSpaceAboveStaff = 2; // multiple of staffInterval
    this.minSpaceBelowStaff = 1; // multiple of staffInterval
    this.spaceBetweenSystems = 1.5; // multiple of staffInterval

    // everything depends on the scale of the punctum
    this.glyphPunctumWidth = Glyphs.PunctumQuadratum.bounds.width;
    this.glyphPunctumHeight = Glyphs.PunctumQuadratum.bounds.height;

    // max space to add between notations when justifying, in multiples of this.staffInterval
    this.maxExtraSpaceInStaffIntervals = 0.5;

    // for keeping track of the clef
    this.activeClef = null;

    this.neumeLineColor = "#000";
    this.staffLineColor = "#000";
    this.dividerLineColor = "#000";

    this.defaultLanguage = language.latin;

    // calculate the pixel ratio for drawing to a canvas
    this.pixelRatio =
      typeof window === "undefined" ? 1.0 : window.devicePixelRatio || 1.0;

    //this.canvasCtxt.scale(this.pixelRatio, this.pixelRatio);

    if (textMeasuringStrategy === TextMeasuringStrategy.Svg) {
      this.svgTextMeasurer = QuickSvg.svg(0, 0);
      this.svgTextMeasurer.setAttribute("id", "TextMeasurer");
      this.svgTextMeasurer.setAttribute("style", "position:absolute");
      document.body.insertBefore(
        this.svgTextMeasurer,
        document.body.firstChild
      );
    } else if (textMeasuringStrategy === TextMeasuringStrategy.Canvas) {
      this.makeCanvasIfNeeded();
    }

    // for connecting neume syllables...
    this.syllableConnector = "-";

    // set whether to scale the def tags (scaleDefs = true) or the use tags.
    this.scaleDefs = true;

    // fixme: for now, we just set these using the glyph scales as noted above, presuming a
    // staff line size of 0.5 in. Really what we should do is scale the punctum size based
    // on the text metrics, right? 1 punctum ~ x height size?
    this.setGlyphScaling(1.0 / 16.0);

    // minimum space between puncta of different syllables, in multiples of this.intraNeumeSpacing
    this.interSyllabicMultiplier = 2.5;

    // space between an accidental and the following note, in multiples of this.intraNeumeSpacing
    this.accidentalSpaceMultiplier = 2;

    // space added between puncta of different words, in multiples of this.intraNeumeSpacing
    this.interVerbalMultiplier = 1;

    this.drawGuides = false;
    this.drawDebuggingBounds = true;

    // we keep track of where we are in processing notations, so that
    // we can maintain the context for notations to know about.
    //
    // these are only gauranteed to be valid during the performLayout phase!
    this.activeNotations = null;
    this.currNotationIndex = -1;

    this.minSyllablesLastLine = 0;
    this.minNotesLastLine = 0;

    // chant notation elements are normally separated by a minimum fixed amount of space
    // on the staff line. It can happen, however, that two text elements are almost close
    // enough to merge, only to be separated much more by the required hyphen (or other
    // connecting string).
    //
    // This tolerance value allows a little bit of flexibility to merge two close lyrical
    // elements, thus bringing the chant notation elements a bit closer than otherwise
    // would be normally allowed.
    //
    // condensing tolerance is a percentage value (0.0-1.0, inclusive) that indicates
    // how much the default spacing can shrink. E.g., a value of 0.20 allows the layout
    // engine to separate two glyphs by only 80% of the normal inter-neume spacing value.
    this.condensingTolerance = 0.3;

    // if auto color is true, then exsurge tries to automatically colorize
    // some elements of the chant (directives become rubric color, etc.)
    this.autoColor = true;

    this.useExtraTextOnly = true;

    this.noteIdPrefix = "note-";

    this.insertFontsInDoc();
    this.setMergeAnnotationWithTextLeft(true);
  }

  /**
   * convert a staff position counting from the first space below the staff (gabc notation "c")
   * into a position counting from the middle space (variable based on how many staff lines there are)
   * @param {number} staffPosition
   * @returns {number}
   */
  convertStaffPositionToSymmetric(staffPosition) {
    return staffPosition - this.staffLineCount;
  }

  convertSymmetricStaffPosition(staffPositionSymmetric) {
    return staffPositionSymmetric + this.staffLineCount;
  }

  /**
   *
   * @param {*} properties
   * @param {string} fontFamily
   * @returns {import('opentype.js').Font | import('fontkit').Font | undefined}
   */
  getFontForProperties(properties = {}, fontFamily) {
    this.getFontFilenameForProperties(properties);
      let keyWithFontFamily = this.getFontFilenameForProperties(
        properties,
        fontFamily
      );
    return (
      this.fontDictionary &&
      (this.fontDictionary[keyWithFontFamily] ||
        this.fontDictionary[fontFamily] ||
        this.fontDictionary.Regular)
    );
  }

  /**
   *
   * @param {string} font : ;
   * @param {number} size
   * @param {any} baseStyle
   * @param {{ [key: string]: import('opentype.js').Font }} fontDictionary
   */
  setFont(font, size = 16, baseStyle = {}, fontDictionary) {
    for (let [key, textType] of Object.entries(TextTypes)) {
      let textStyle = (this.textStyles[key] = this.textStyles[key] || {});
      textStyle.size = textType.defaultSize
        ? textType.defaultSize(size, this)
        : textType.size(this);
      textStyle.font = font;
      textStyle.color = this.textColor || "#000";
    }

    this.baseTextStyle = baseStyle;

    if (fontDictionary) {
      this.textMeasuringStrategy = TextMeasuringStrategy.OpenTypeJS;
      this.fontDictionary = fontDictionary;
    }
  }

  setRubricColor(color) {
    this.rubricColor = color;
    this.specialCharProperties.fill = color;
    this.fontStyleDictionary.c.fill = color;
  }

  setMergeAnnotationWithTextLeft(merge) {
    this.mergeAnnotationWithTextLeft = merge
      ? __mergeAnnotationWithTextLeft
      : undefined;
  }

  setScaleDefs(scaleDefs) {
    scaleDefs = !!scaleDefs;
    if (this.scaleDefs !== scaleDefs) {
      this.scaleDefs = scaleDefs;
      this.setGlyphScaling(this.glyphScaling);
    }
  }

  createStyleCss() {
    var style = "";
    for (let [key, textType] of Object.entries(TextTypes)) {
      var cssClass = textType.cssClass,
        { color, font, size } = this.textStyles[key];
      style += `svg.Exsurge .${cssClass}{fill:${color};font-family:${font};font-size:${size}px;font-kerning:normal}`;
    }
    return style;
  }

  createStyleNode() {
    var node = QuickSvg.createNode("style", {});
    node.textContent = this.createStyleCss();
    return node;
  }

  createStyleTree() {
    return { name: "style", props: {}, children: [this.createStyleCss()] };
  }

  createStyle() {
    return "<style>" + this.createStyleCss() + "</style>";
  }

  updateHyphenWidth() {
    // measure the size of a hyphen for the lyrics
    var hyphen = new Lyric(
      this,
      this.syllableConnector,
      LyricType.SingleSyllable
    );
    var multiplier =
      this.minLyricWordSpacing /
        (this.hyphenWidth || this.minLyricWordSpacing) || 1;
    this.hyphenWidth = hyphen.bounds.width;

    this.minLyricWordSpacing = multiplier * this.hyphenWidth;
  }

  setStaffHeight(staffHeight, glyphMultiplier = 1) {
    this.setGlyphScaling(staffHeight / 600, glyphMultiplier);
  }

  setGlyphScaling(glyphScaling, glyphMultiplier = 1) {
    this.glyphMultiplier = glyphMultiplier;
    this.glyphScaling = glyphScaling * glyphMultiplier;

    this.staffInterval = this.glyphPunctumWidth * glyphScaling;

    // setup the line weights for the various elements.
    this.staffLineWeight = Math.ceil((5 * this.staffInterval) / 8) / 5;
    this.neumeLineWeight = this.staffLineWeight; // the weight of connecting lines in the glyphs.
    this.dividerLineWeight = this.neumeLineWeight; // of quarter bar, half bar, etc.
    this.episemaLineWeight = this.neumeLineWeight * 1.25; // of horizontal episemata

    this.intraNeumeSpacing = this.staffInterval / 2.0;

    while (this.defsNode && this.defsNode.firstChild)
      this.defsNode.removeChild(this.defsNode.firstChild);
    for (var i = 0; i < this.makeDefs.length; ++i) {
      this.makeDefs[i]();
    }

    this.updateHyphenWidth();
  }

  calculateHeightFromStaffPosition(staffPosition) {
    return -staffPosition * this.staffInterval;
  }

  insertFontsInDoc() {
    if (!canAccessDOM) return;

    var styleElement = document.getElementById("exsurge-fonts");

    if (styleElement === null) {
      // create it since it doesn't exist yet.
      styleElement = document.createElement("style");
      styleElement.id = "exsurge-fonts";

      // styleElement.appendChild(document.createTextNode("@font-face{font-family: 'Exsurge Characters';font-weight: normal;font-style: normal;src: url(" + __exsurgeCharactersFont + ") format('opentype');}"));

      document.head.appendChild(styleElement);
    }
  }

  // returns the next neume starting at this.currNotationIndex, or null
  // if there isn't a neume after this one...
  findNextNeume() {
    if (typeof this.currNotationIndex === "undefined")
      throw "findNextNeume() called without a valid currNotationIndex set";

    for (var i = this.currNotationIndex + 1; i < this.notations.length; i++) {
      var notation = this.notations[i];

      if (notation.isNeume && !notation.hasNoWidth) return notation;
    }

    return null;
  }

  makeCanvasIfNeeded() {
    if (!this.canvas) {
      this.canvas = document.createElement("canvas");
      this.canvasCtxt = this.canvas.getContext("2d");
    }
  }

  setCanvasSize(width, height, scale = 1) {
    this.makeCanvasIfNeeded();

    this.canvas.style.width = width * scale + "px";
    this.canvas.style.height = height * scale + "px";
    scale *= this.pixelRatio;
    this.canvas.width = width * scale;
    this.canvas.height = height * scale;

    this.canvasCtxt.setTransform(scale, 0, 0, scale, 0, 0);
  }
}

/*
 * ChantLayoutElement
 */
class ChantLayoutElement {
  constructor() {
    this.bounds = new Rect();
    this.origin = new Point(0, 0);

    this.selected = false;
    this.highlighted = false;
  }

  // draws the element on an html5 canvas
  draw(ctxt) {
    throw "ChantLayout Elements must implement draw(ctxt)";
  }

  // returns svg element
  createSvgNode(ctxt) {
    throw "ChantLayout Elements must implement createSvgNode(ctxt)";
  }

  // returns svg code for the element, used for printing support
  createSvgFragment(ctxt) {
    throw "ChantLayout Elements must implement createSvgFragment(ctxt)";
  }
}

class DividerLineVisualizer extends ChantLayoutElement {
  constructor(ctxt, staffPosition0, staffPosition1, divider) {
    super();

    this.divider = divider;

    var y0 = ctxt.calculateHeightFromStaffPosition(staffPosition0);
    var y1 = ctxt.calculateHeightFromStaffPosition(staffPosition1);

    if (y0 > y1) {
      var temp = y0;
      y0 = y1;
      y1 = temp;
    }

    this.bounds.x = 0;
    this.bounds.y = y0;
    this.bounds.width = ctxt.dividerLineWeight;
    this.bounds.height = y1 - y0;

    this.origin.x = this.bounds.width / 2;
    this.origin.y = y0;
  }

  draw(ctxt) {
    var canvasCtxt = ctxt.canvasCtxt;

    canvasCtxt.fillStyle = ctxt.dividerLineColor;

    canvasCtxt.fillRect(
      this.bounds.x,
      this.bounds.y,
      ctxt.dividerLineWeight,
      this.bounds.height
    );
  }

  getSvgProps(ctxt) {
    let props = {
      x: this.bounds.x,
      y: this.bounds.y,
      width: ctxt.dividerLineWeight,
      height: this.bounds.height,
      fill: ctxt.dividerLineColor,
      class: "dividerLine"
    };
    if (this.divider) {
      if (this.divider.selected) props.class += " selected";
      props["source-index"] = this.divider.sourceIndex;
      props["element-index"] = this.divider.elementIndex;
      props.source = this.divider;
    }
    return props;
  }

  createSvgNode(ctxt) {
    return QuickSvg.createNode("rect", this.getSvgProps(ctxt));
  }
  createSvgTree(ctxt) {
    return QuickSvg.createSvgTree("rect", this.getSvgProps(ctxt));
  }

  createSvgFragment(ctxt) {
    return QuickSvg.createFragment("rect", this.getSvgProps(ctxt));
  }
}

class NeumeLineVisualizer extends ChantLayoutElement {
  constructor(ctxt, note0, note1, hanging) {
    super();

    var staffPosition0 = note0.staffPosition;
    var staffPosition1 =
      typeof note1 === "number"
        ? note1
        : note1
          ? note1.staffPosition
          : note0.staffPosition + 4;

    // note0 should be the upper one for our calculations here
    if (staffPosition0 < staffPosition1) {
      var temp = staffPosition0;
      staffPosition0 = staffPosition1;
      staffPosition1 = temp;
    }

    if (hanging && staffPosition0 - staffPosition1 > 4) {
      staffPosition1 = staffPosition0 - 4;
    }

    var y0 = ctxt.calculateHeightFromStaffPosition(staffPosition0);
    var y1 = 0;

    if (hanging) {
      // if the difference between the notes is only one, and the upper
      // note is on a line, and the lower note is within the four staff lines,
      // then our hanging line goes past the lower note by a whole
      // staff interval
      if (
        staffPosition0 - staffPosition1 === 1 &&
        Math.abs(staffPosition0) % 2 === 1 &&
        staffPosition1 > -3
      )
        staffPosition1--;

      y1 += (ctxt.glyphPunctumHeight * ctxt.glyphScaling) / 2.2;
    }

    y1 += ctxt.calculateHeightFromStaffPosition(staffPosition1);

    this.bounds.x = 0;
    this.bounds.y = y0;
    this.bounds.width = ctxt.neumeLineWeight;
    this.bounds.height = y1 - y0;

    this.origin.x = 0;
    this.origin.y = 0;
  }

  draw(ctxt) {
    var canvasCtxt = ctxt.canvasCtxt;

    canvasCtxt.fillStyle = ctxt.neumeLineColor;

    canvasCtxt.fillRect(
      this.bounds.x,
      this.bounds.y,
      ctxt.neumeLineWeight,
      this.bounds.height
    );
  }

  getSvgProps(ctxt) {
    return {
      x: this.bounds.x,
      y: this.bounds.y,
      width: ctxt.neumeLineWeight,
      height: this.bounds.height,
      fill: ctxt.neumeLineColor,
      class: "neumeLine"
    };
  }

  createSvgNode(ctxt) {
    return QuickSvg.createNode("rect", this.getSvgProps(ctxt));
  }
  createSvgTree(ctxt) {
    return QuickSvg.createSvgTree("rect", this.getSvgProps(ctxt));
  }

  createSvgFragment(ctxt) {
    return QuickSvg.createFragment("rect", this.getSvgProps(ctxt));
  }
}

class NeumeBeamVisualizer extends ChantLayoutElement {
  constructor(ctxt, x0, x1, staffPosition0, staffPosition1, yOffset = 0) {
    super();

    var y0 = ctxt.calculateHeightFromStaffPosition(staffPosition0);
    var y1 = ctxt.calculateHeightFromStaffPosition(staffPosition1);

    if (y0 === y1 && x0 === x1) {
      y0 -= ctxt.staffInterval / 2;
      x0 -= (ctxt.staffInterval * 2) / 3;
    }

    this.bounds.x = x0;
    this.bounds.y = y0 + yOffset * ctxt.neumeLineWeight * 6;
    this.bounds.width = x1 - x0;
    this.bounds.height = y1 - y0;

    this.origin.x = 0;
    this.origin.y = 0;
  }
  getPoints(ctxt) {
    const lineHeight = ctxt.neumeLineWeight * 3;
    return {
      x0: this.bounds.x - ctxt.neumeLineWeight / 2,
      x1: this.bounds.x + this.bounds.width + ctxt.neumeLineWeight / 2,
      y0: this.bounds.y,
      y1: this.bounds.y + this.bounds.height,
      height: lineHeight
    };
  }

  draw(ctxt) {
    var canvasCtxt = ctxt.canvasCtxt;
    const points = this.getPoints(ctxt);

    canvasCtxt.fillStyle = ctxt.neumeLineColor;
    canvasCtxt.beginPath();
    canvasCtxt.moveTo(points.x0, points.y0 + points.height / 2);
    canvasCtxt.lineTo(points.x0, points.y0 - points.height / 2);
    canvasCtxt.lineTo(points.x1, points.y1 - points.height / 2);
    canvasCtxt.lineTo(points.x1, points.y1 + points.height / 2);
    canvasCtxt.closePath();
    canvasCtxt.fill();
  }

  getSvgProps(ctxt) {
    const points = this.getPoints(ctxt);
    return {
      points: `${points.x0},${points.y0 + points.height / 2} ${points.x0},${points.y0 - points.height / 2} ${
        points.x1
      },${points.y1 - points.height / 2} ${points.x1},${points.y1 + points.height / 2}`,
      fill: ctxt.neumeLineColor,
      class: "neumeBeam"
    };
  }

  createSvgNode(ctxt) {
    return QuickSvg.createNode("polygon", this.getSvgProps(ctxt));
  }
  createSvgTree(ctxt) {
    return QuickSvg.createSvgTree("polygon", this.getSvgProps(ctxt));
  }

  createSvgFragment(ctxt) {
    return QuickSvg.createFragment("polygon", this.getSvgProps(ctxt));
  }
}

class VirgaLineVisualizer extends ChantLayoutElement {
  constructor(ctxt, note) {
    super();

    var staffPosition = note.staffPosition;

    var y0 = ctxt.calculateHeightFromStaffPosition(staffPosition);
    var y1;

    if (Math.abs(staffPosition % 2) === 0) y1 = y0 + ctxt.staffInterval * 1.8;
    else y1 = y0 + ctxt.staffInterval * 2.7;

    this.bounds.x = 0;
    this.bounds.y = y0;
    this.bounds.width = ctxt.neumeLineWeight;
    this.bounds.height = y1 - y0;

    this.origin.x = 0;
    this.origin.y = 0;
  }

  draw(ctxt) {
    var canvasCtxt = ctxt.canvasCtxt;

    canvasCtxt.fillStyle = ctxt.neumeLineColor;
    canvasCtxt.fillRect(
      this.bounds.x,
      this.bounds.y,
      ctxt.neumeLineWeight,
      this.bounds.height
    );
  }

  getSvgProps(ctxt) {
    return {
      x: this.bounds.x,
      y: this.bounds.y,
      width: ctxt.neumeLineWeight,
      height: this.bounds.height,
      fill: ctxt.neumeLineColor,
      class: "neumeLine"
    };
  }

  createSvgNode(ctxt) {
    return QuickSvg.createNode("rect", this.getSvgProps(ctxt));
  }
  createSvgTree(ctxt) {
    return QuickSvg.createSvgTree("rect", this.getSvgProps(ctxt));
  }

  createSvgFragment(ctxt) {
    return QuickSvg.createFragment("rect", this.getSvgProps(ctxt));
  }
}

class LineaVisualizer extends ChantLayoutElement {
  constructor(ctxt, note) {
    super();

    var staffPosition = note.staffPosition;

    var y0 =
      ctxt.calculateHeightFromStaffPosition(staffPosition) - note.origin.y;
    var y1 = y0 + note.bounds.height;

    this.bounds.x = 0;
    this.bounds.y = y0;
    this.bounds.width = ctxt.neumeLineWeight * 5 + note.bounds.width;
    this.bounds.height = y1 - y0;

    this.origin.x = ctxt.neumeLineWeight * 2.5;
    this.origin.y = 0;
  }

  draw(ctxt) {
    var canvasCtxt = ctxt.canvasCtxt;

    canvasCtxt.fillStyle = ctxt.neumeLineColor;
    canvasCtxt.fillRect(
      this.bounds.x,
      this.bounds.y,
      ctxt.neumeLineWeight,
      this.bounds.height
    );
    canvasCtxt.fillRect(
      this.bounds.x + this.bounds.width - ctxt.neumeLineWeight,
      this.bounds.y,
      ctxt.neumeLineWeight,
      this.bounds.height
    );
  }

  getSvgProps(ctxt, x) {
    return {
      x,
      y: this.bounds.y,
      width: ctxt.neumeLineWeight,
      height: this.bounds.height,
      fill: ctxt.neumeLineColor,
      class: "neumeLine"
    };
  }

  createSvgNode(ctxt) {
    return QuickSvg.createNode(
      "g",
      null,
      [
        this.bounds.x,
        this.bounds.x + this.bounds.width - ctxt.neumeLineWeight
      ].map((x) => QuickSvg.createNode("rect", this.getSvgProps(ctxt, x)))
    );
  }

  createSvgTree(ctxt) {
    return QuickSvg.createSvgTree(
      "g",
      {},
      ...[
        this.bounds.x,
        this.bounds.x + this.bounds.width - ctxt.neumeLineWeight
      ].map((x) => QuickSvg.createSvgTree("rect", this.getSvgProps(ctxt, x)))
    );
  }

  createSvgFragment(ctxt) {
    return QuickSvg.createFragment(
      "g",
      null,
      [this.bounds.x, this.bounds.x + this.bounds.width - ctxt.neumeLineWeight]
        .map((x) => QuickSvg.createFragment("rect", this.getSvgProps(ctxt, x)))
        .join("")
    );
  }
}

class GlyphVisualizer extends ChantLayoutElement {
  constructor(ctxt, glyphCode) {
    super();

    this.glyph = null;

    this.setGlyph(ctxt, glyphCode);
  }

  setGlyph(ctxt, glyphCode) {
    if (this.glyphCode !== glyphCode) {
      if (
        typeof glyphCode === "undefined" ||
        glyphCode === null ||
        glyphCode === ""
      )
        glyphCode = this.glyphCode = GlyphCode.None;
      else this.glyphCode = glyphCode;

      let glyph = (this.glyph = Glyphs[glyphCode]);

      // if this glyph hasn't been used yet, then load it up in the defs section for sharing
      if (!ctxt.defs.hasOwnProperty(glyphCode)) {
        var getDefProps = () => {
          var options = {
            id: glyphCode,
            class: "glyph"
          };
          if (ctxt.scaleDefs === true) {
            options.transform = "scale(" + ctxt.glyphScaling + ")";
          }
          return options;
        };
        var makeDef = () => {
          let options = getDefProps();
          // create the ref
          ctxt.defs[glyphCode] = QuickSvg.createFragment(
            "g",
            options,
            QuickSvg.svgFragmentForGlyph(glyph)
          );

          if (ctxt.defsNode)
            ctxt.defsNode.appendChild(
              QuickSvg.createNode("g", options, QuickSvg.nodesForGlyph(glyph))
            );
        };
        makeDef.makeSvgTree = () => {
          return QuickSvg.createSvgTree(
            "g",
            getDefProps(),
            ...QuickSvg.nodesForGlyph(glyph, "createSvgTree")
          );
        };
        makeDef.glyphCode = glyphCode;
        makeDef();
        ctxt.makeDefs.push(makeDef);
      }

      this.align = this.glyph.align;
    }

    this.origin.x = this.glyph.origin.x * ctxt.glyphScaling;
    this.origin.y = this.glyph.origin.y * ctxt.glyphScaling;

    this.bounds.x = 0;
    this.bounds.y = -this.origin.y;
    this.bounds.width = this.glyph.bounds.width * ctxt.glyphScaling;
    this.bounds.height = this.glyph.bounds.height * ctxt.glyphScaling;
  }

  setStaffPosition(ctxt, staffPosition) {
    this.bounds.y =
      ctxt.calculateHeightFromStaffPosition(staffPosition) - this.origin.y;
  }

  draw(ctxt) {
    var canvasCtxt = ctxt.canvasCtxt;

    const porrectusResult = /^Porrectus([1-9])$/.exec(this.glyphCode);
    const porrectusNoteDiff = porrectusResult ? Number(porrectusResult[1]) : 0;

    var x = this.bounds.x + this.origin.x;
    var y = this.bounds.y + this.origin.y;
    var scaleX = ctxt.glyphScaling;
    var scaleY = ctxt.glyphScaling;
    if (porrectusNoteDiff) {
      scaleY /= ctxt.glyphMultiplier;
      y /= scaleY;
    }
    canvasCtxt.translate(x, y);
    canvasCtxt.scale(scaleX, scaleY);

    for (var i = 0; i < this.glyph.paths.length; i++) {
      var path = this.glyph.paths[i];
      canvasCtxt.fillStyle =
        path.type === "negative" ? "#fff" : ctxt.neumeLineColor;
      canvasCtxt.fill(new Path2D(path.data));
    }

    canvasCtxt.scale(1 / scaleX, 1 / scaleY);
    canvasCtxt.translate(-x, -y);
  }

  getSvgAttributes(ctxt, source) {
    let className = "";
    const porrectusResult = /^Porrectus([1-9])$/.exec(this.glyphCode);
    const porrectusNoteDiff = porrectusResult ? Number(porrectusResult[1]) : 0;
    if (porrectusNoteDiff) {
      let notes = source.neume.notes,
        noteIndex = notes.indexOf(source),
        nextNote = notes[noteIndex + 1];
      className = source.selected
        ? nextNote.selected
          ? "selected"
          : "selectedA"
        : nextNote.selected
          ? "selectedB"
          : "";
    } else {
      let isSelected =
        source && (source.selected || (source.model && source.model.selected));
      className = isSelected ? "selected" : "";
    }
    var result = {
      "xlink:href": "#" + this.glyphCode,
      class: className
    };
    if (source) {
      result["source-index"] = source.sourceIndex;
      result["element-index"] = source.elementIndex;
      if ("noteIndex" in source) {
        result.class += " note";
        result.id = ctxt.noteIdPrefix + (source.noteIndex + 1);
        if (source.neume) {
          const glyphCode = source.glyphVisualizer.glyphCode;
          if (porrectusNoteDiff) {
            result.class += " porrectus porrectus-start";
          } else if (glyphCode === "None") {
            result.class += " porrectus porrectus-end";
          }
        }
      }
    }
    if (ctxt.scaleDefs === true) {
      result.x = this.bounds.x + this.origin.x;
      result.y = this.bounds.y + this.origin.y;
      if (porrectusNoteDiff) {
        // result.transform = "scale(" + (porrectusNoteDiff / (porrectusNoteDiff + 1)) + ")";
        const scaleGlyph = 1 / ctxt.glyphMultiplier;
        result.transform = "scale(1," + scaleGlyph + ")";
        result.y /= scaleGlyph;
      }
    } else {
      const scaleGlyph = porrectusNoteDiff
        ? ctxt.glyphScaling / ctxt.glyphMultiplier
        : ctxt.glyphScaling;
      result.x = (this.bounds.x + this.origin.x) / ctxt.glyphScaling;
      result.y = (this.bounds.y + this.origin.y) / scaleGlyph;
      result.transform = "scale(" + ctxt.glyphScaling + "," + scaleGlyph + ")";
    }
    return result;
  }

  createSvgNode(ctxt, source) {
    var attributes = this.getSvgAttributes(ctxt, source);
    attributes.source = source;
    return QuickSvg.createNode("use", attributes);
  }
  createSvgTree(ctxt, source) {
    var attributes = this.getSvgAttributes(ctxt, source);
    if (source) attributes.source = source;
    return QuickSvg.createSvgTree("use", attributes);
  }

  createSvgFragment(ctxt, source) {
    return QuickSvg.createFragment("use", this.getSvgAttributes(ctxt, source));
  }
}

class RoundBraceVisualizer extends ChantLayoutElement {
  constructor(ctxt, x1, x2, y, isAbove) {
    super();
    this.ignoreBounds = true;

    if (x1 > x2) {
      // swap the xs
      var temp = x1;
      x1 = x2;
      x2 = temp;
    }

    this.isAbove = isAbove;
    this.braceHeight = (3 * ctxt.staffInterval) / 2;

    this.bounds = new Rect(
      x1,
      isAbove ? y - this.braceHeight : y,
      x2 - x1,
      this.braceHeight
    );

    this.origin.x = 0;
    this.origin.y = 0;
  }

  draw(ctxt) {
    /**
     * @type CanvasRenderingContext2D
     */
    var d = ctxt.canvasCtxt;

    const { x1, x2, y, cx1, cx2, cy } = this.getPathPoints();
    d.beginPath();
    d.moveTo(x1, y);
    d.bezierCurveTo(cx1, cy, cx2, cy, x2, y);
    d.stroke();
  }

  getSvgPathProps(ctxt) {
    return {
      d: this.generatePathString(),
      stroke: ctxt.neumeLineColor,
      "stroke-width": ctxt.staffLineWeight + "px",
      fill: "none",
      class: "brace"
    };
  }

  createSvgNode(ctxt) {
    var node = QuickSvg.createNode("path", this.getSvgPathProps(ctxt));
    if (this.accent) {
      return QuickSvg.createNode(
        "g",
        {
          class: "accentedBrace"
        },
        [node, this.accent.createSvgNode(ctxt)]
      );
    } else return node;
  }
  createSvgTree(ctxt) {
    var node = QuickSvg.createSvgTree("path", this.getSvgPathProps(ctxt));
    if (this.accent) {
      return QuickSvg.createSvgTree(
        "g",
        {
          class: "accentedBrace"
        },
        node,
        this.accent.createSvgTree(ctxt)
      );
    } else return node;
  }

  createSvgFragment(ctxt) {
    var fragment = QuickSvg.createFragment("path", this.getSvgPathProps(ctxt));

    if (this.accent) {
      fragment += this.accent.createSvgFragment(ctxt);

      return QuickSvg.createFragment(
        "g",
        {
          class: "accentedBrace"
        },
        fragment
      );
    } else return fragment;
  }

  getPathPoints() {
    var x1 = this.bounds.x;
    var x2 = this.bounds.right();
    var width = this.bounds.width;
    var y, dx, dy;

    dx = width / 6;
    dy = this.bounds.height;
    if (this.isAbove) {
      y = this.bounds.bottom();
      dy = -dy;
    } else {
      y = this.bounds.y;
    }

    //Calculate Control Points of path,
    var cx1 = x1 + dx;
    var cy = y + dy;
    var cx2 = x2 - dx;

    return { x1, x2, y, cx1, cx2, cy };
  }

  // returns svg path d string
  generatePathString() {
    const { x1, x2, y, cx1, cx2, cy } = this.getPathPoints();

    // two decimal points should be enough, but if we need more precision, we can
    // up it here.
    var dp = 2;
    return (
      "M " +
      x1.toFixed(dp) +
      " " +
      y.toFixed(dp) +
      " C " +
      cx1.toFixed(dp) +
      " " +
      cy.toFixed(dp) +
      " " +
      cx2.toFixed(dp) +
      " " +
      cy.toFixed(dp) +
      " " +
      x2.toFixed(dp) +
      " " +
      y.toFixed(dp)
    );
  }
}

class CurlyBraceVisualizer extends ChantLayoutElement {
  constructor(ctxt, x1, x2, y, isAbove = true, addAcuteAccent = false) {
    super();

    if (x1 > x2) {
      // swap the xs
      var temp = x1;
      x1 = x2;
      x2 = temp;
    }

    this.isAbove = isAbove;
    this.braceHeight = ctxt.staffInterval / 2;

    // y is the actual vertical start of the brace (left hand side)
    // thus for a brace over notes, bounds.y is the bottom of brace,
    // but for a brace under the notes, y is simply the y passed in.
    if (isAbove) y -= this.braceHeight;

    var bounds = new Rect(x1, y, x2 - x1, this.braceHeight);

    if (addAcuteAccent && isAbove) {
      this.accent = new GlyphVisualizer(ctxt, GlyphCode.AcuteAccent);
      this.accent.bounds.x += bounds.x + (x2 - x1) / 2;
      this.accent.bounds.y += bounds.y - ctxt.staffInterval / 4;

      bounds.union(this.accent.bounds);
    }

    this.bounds = bounds;

    this.origin.x = 0;
    this.origin.y = 0;
  }

  getSvgPathProps(ctxt) {
    return {
      d: this.generatePathString(),
      stroke: ctxt.neumeLineColor,
      "stroke-width": ctxt.staffLineWeight + "px",
      fill: "none",
      class: "brace"
    };
  }

  createSvgNode(ctxt) {
    var node = QuickSvg.createNode("path", this.getSvgPathProps(ctxt));

    if (this.accent) {
      return QuickSvg.createNode(
        "g",
        {
          class: "accentedBrace"
        },
        [node, this.accent.createSvgNode(ctxt)]
      );
    } else return node;
  }
  createSvgTree(ctxt) {
    var node = QuickSvg.createSvgTree("path", this.getSvgPathProps(ctxt));
    if (this.accent) {
      return QuickSvg.createSvgTree(
        "g",
        {
          class: "accentedBrace"
        },
        node,
        this.accent.createSvgTree(ctxt)
      );
    } else return node;
  }

  createSvgFragment(ctxt) {
    var fragment = QuickSvg.createFragment("path", this.getSvgPathProps(ctxt));

    if (this.accent) {
      fragment += this.accent.createSvgFragment(ctxt);

      return QuickSvg.createFragment(
        "g",
        {
          class: "accentedBrace"
        },
        fragment
      );
    } else return fragment;
  }

  // code below inspired by: https://gist.github.com/alexhornbake
  // optimized for braces that are only drawn horizontally.
  // returns svg path d string
  generatePathString() {
    var q = 0.6; // .5 is normal, higher q = more expressive bracket

    var x1 = this.bounds.x;
    var x2 = this.bounds.right();
    var width = this.bounds.width;
    var y, h;

    if (this.isAbove) {
      y = this.bounds.bottom();
      h = -this.braceHeight;
    } else {
      y = this.bounds.y;
      h = this.braceHeight;
    }

    // calculate Control Points of path
    var qy1 = y + q * h;
    var qx2 = x1 + 0.25 * width;
    var qy2 = y + (1 - q) * h;
    var tx1 = x1 + 0.5 * width;
    var ty1 = y + h;
    var qy3 = y + q * h;
    var qx4 = x1 + 0.75 * width;
    var qy4 = y + (1 - q) * h;

    // two decimal points should be enough, but if we need more precision, we can
    // up it here.
    var dp = 2;
    return (
      "M " +
      x1.toFixed(dp) +
      " " +
      y.toFixed(dp) +
      " Q " +
      x1.toFixed(dp) +
      " " +
      qy1.toFixed(dp) +
      " " +
      qx2.toFixed(dp) +
      " " +
      qy2.toFixed(dp) +
      " T " +
      tx1.toFixed(dp) +
      " " +
      ty1.toFixed(dp) +
      " M " +
      x2.toFixed(dp) +
      " " +
      y.toFixed(dp) +
      " Q " +
      x2.toFixed(dp) +
      " " +
      qy3.toFixed(dp) +
      " " +
      qx4.toFixed(dp) +
      " " +
      qy4.toFixed(dp) +
      " T " +
      tx1.toFixed(dp) +
      " " +
      ty1.toFixed(dp)
    );
  }
}

class TextSpan {
  constructor(text, propertyArray, activeTags, index = 0, extraProps) {
    if (typeof propertyArray === "undefined" || propertyArray === null)
      propertyArray = [];

    this.text = text;
    this.propertyArray = propertyArray;
    this.activeTags = activeTags || [];
    this.index = index;
    if (extraProps) {
      if ("xOffset" in extraProps) this.xOffset = extraProps.xOffset;
      if ("newLine" in extraProps) this.newLine = extraProps.newLine;
    }
  }

  get properties() {
    const result = Object.assign.apply(
      null,
      [{}].concat(this.propertyArray).concat()
    );
    if ("xOffset" in this) result.xOffset = this.xOffset;
    if ("newLine" in this) result.newLine = this.newLine;
    return result;
  }

  clone() {
    const result = new TextSpan(
      this.text,
      this.propertyArray,
      this.activeTags,
      this.index
    );
    if ("xOffset" in this) result.xOffset = this.xOffset;
    if ("newLine" in this) result.newLine = this.newLine;
    return result;
  }
}

class MarkupStackFrame {
  constructor(tagName, startIndex, propertyArray = [], symbol) {
    this.tagName = tagName;
    this.startIndex = startIndex;
    this.propertyArray = propertyArray;
    if (symbol) this.symbol = symbol;
  }

  get properties() {
    return Object.assign.apply(null, [{}].concat(this.propertyArray));
  }

  static createStackFrame(
    ctxt,
    tagName,
    startIndex,
    extraProperties = {},
    symbol = ""
  ) {
    return new MarkupStackFrame(
      tagName,
      startIndex,
      [ctxt.fontStyleDictionary[tagName], extraProperties],
      symbol
    );
  }
}

// for escaping html strings before they go into the svgs
// adapted from http://stackoverflow.com/a/12034334/5720160
var __subsForTspans = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};

class TextElement extends ChantLayoutElement {
  constructor(
    ctxt,
    text,
    fontFamily,
    fontSize,
    textAnchor,
    sourceIndex,
    sourceGabc
  ) {
    super();

    // set these to some sane values for now...
    this.bounds.x = 0;
    this.bounds.y = 0;
    this.bounds.width = 0;
    this.bounds.height = 0;
    this.origin.x = 0;
    this.origin.y = 0;

    this.fontFamily = fontFamily;
    this.fontSize = fontSize;
    this.textAnchor = textAnchor;
    this.sourceIndex = sourceIndex;
    this.sourceGabc = sourceGabc;
    this.dominantBaseline = "baseline"; // default placement

    this.generateSpansFromText(ctxt, text);

    this.recalculateMetrics(ctxt);
  }

  getFromScore(score) {
    return this.textType.getFromScore(score, this);
  }

  generateSpansFromText(ctxt, text) {
    text = text.replace(/\s+/g, " ");
    this.text = "";
    this.spans = [];

    // save ourselves a lot of grief for a very common text:
    if (text === "*" || text === "+" || text === "†") {
      let properties =
        text === "*"
          ? [ctxt.asteriskProperties]
          : text === "+"
            ? [ctxt.plusProperties]
            : null;
      text = ctxt.specialCharText(text) || text;
      this.spans.push(new TextSpan(text, properties));
      return;
    }

    var markupStack = [];
    var spanStartIndex = 0;
    var newLineInNextSpan = 0;

    var filterFrames = (frame, symbol) => frame.Symbol === symbol;

    var closeSpan = (spanText, index, extraProperties) => {
      if (spanText === "" && !this.dropCap) return;

      this.text += spanText;

      var properties = [];
      for (var i = 0; i < markupStack.length; i++) {
        properties.push.apply(properties, markupStack[i].propertyArray);
      }

      if (extraProperties) properties.push(extraProperties);
      const span = new TextSpan(
        spanText,
        properties,
        markupStack.map((frame) => frame.tagName),
        index
      );
      this.spans.push(span);
      if (newLineInNextSpan) {
        span.newLine = newLineInNextSpan;
        newLineInNextSpan = 0;
      }
    };

    var markupRegex =
      /(<br\/?>)|<v>([\s\S]*?)(?:<\/v>|$)|(\*)(?=\s*\*|[^*]*(?:$|<v>))|(\+)|<sp>(?:(~)|(')?([ao]e|[æœaeiouy])|([arv])\/)<\/sp>|([arv])\/\.|([℣℟])\.?|(?:([*_^%])|<(\/)?([bceiuv]|ul|sc|font)(?:\s+(?:family="([^"]+)"|fill="([^"]+)"|class="([^"]+)"))*>)(?=(?:(.+?)(?:\11|<\/\13>))?)/gi;
    var vTagRegex =
      /(\\grecross)|\{greextra\}\{([^}]*)\}|\{?(\\?')?(?:\\([ao]e|æœaeiouy))\}?/gi;
    var match = null;
    var openedAsterisk = false;
    var closeCurrentSpan = () =>
      closeSpan(text.substring(spanStartIndex, match.index), spanStartIndex);
    while ((match = markupRegex.exec(text))) {
      var [
        ,
        newLine,
        vTag,
        asterisk,
        plus,
        tilde,
        accent,
        vowelLigature,
        specialChar,
        specialChar2,
        specialChar3,
        markupSymbol,
        closingTag,
        tagName,
        family,
        fill,
        cssClass,
        enclosedText
      ] = match;
      specialChar = specialChar || specialChar2 || specialChar3;
      // non-matching symbols first
      if (newLine) {
        // close the current span, if any:
        if (match.index > spanStartIndex) {
          closeCurrentSpan();
        }
        // add the newline span:
        newLineInNextSpan++;
      } else if (vTag) {
        closeCurrentSpan();
        let vMatch;
        let lastIndex = 0;
        let iOffset = 0;
        while ((vMatch = vTagRegex.exec(vTag))) {
          if (lastIndex < vMatch.index) {
            closeSpan(
              vTag.slice(lastIndex, vMatch.index),
              match.index + lastIndex + iOffset
            );
            iOffset = 3; // length of '<v>'
          }
          let [, grecross, greextra, accent, diphthong] = vMatch;
          let char = "";
          if (diphthong) {
            char = makeLigature(diphthong);
            if (accent) char = addAccent(char);
            closeSpan(char, match.index + vMatch.index + iOffset);
          } else {
            if (grecross) {
              // grecross is just the command for the Cross:
              // set up greextra so it will get handled with it below:
              greextra = "Cross";
            }
            char = greextraGlyphs[greextra];
            if (char) {
              closeSpan(char, match.index + vMatch.index + iOffset, {
                "font-family": "greextra"
              });
            }
          }
          lastIndex = vTagRegex.lastIndex;
          iOffset = 3; // length of '<v>'
        }
        if (lastIndex < vTag.length) {
          closeSpan(vTag.slice(lastIndex), match.index + lastIndex + iOffset);
        }
      } else if (asterisk) {
        closeCurrentSpan();
        // first check if it is just a symbol to close:
        if (
          markupStack.length > 0 &&
          markupStack[markupStack.length - 1].symbol === asterisk
        ) {
          // close asterisk tag
          markupStack.pop();
        } else {
          // add special asterisk:
          closeSpan(
            ctxt.specialCharText(asterisk) || "*",
            match.index,
            ctxt.asteriskProperties
          );
        }
      } else if (plus) {
        closeCurrentSpan();
        closeSpan(
          ctxt.specialCharText(plus) || "+",
          match.index,
          ctxt.plusProperties
        );
      } else if (tilde) {
        closeCurrentSpan();
        closeSpan("∼", match.index);
      } else if (vowelLigature) {
        let vowel = makeLigature(vowelLigature);
        if (accent) vowel = addAccent(vowel);
        closeCurrentSpan();
        closeSpan(vowel, match.index);
      } else if (specialChar) {
        closeCurrentSpan();
        closeSpan(
          ctxt.textBeforeSpecialChar +
            ctxt.specialCharText(specialChar) +
            ctxt.textAfterSpecialChar,
          match.index,
          ctxt.specialCharProperties
        );
      } else {
        // otherwise we're dealing with matching markup delimeters
        if (markupSymbol === "*") {
          // we are only strict with the asterisk, because there are cases when it needs to be displayed rather than count as a markup symbol
          if (enclosedText && /[^\s*]/.test(enclosedText)) {
            openedAsterisk = true;
          } else if (openedAsterisk) {
            openedAsterisk = false;
          } else {
            // actually use the asterisk, since it doesn't have a matching closing asterisk
            continue;
          }
        }
        if (markupSymbol) {
          tagName = ctxt.markupSymbolDictionary[markupSymbol];
          if (
            markupStack.length > 0 &&
            markupStack[markupStack.length - 1].tagName === tagName &&
            markupStack[markupStack.length - 1].symbol === markupSymbol
          ) {
            closingTag = true;
          }
        }
        if (
          markupStack.length > 0 &&
          markupStack[markupStack.length - 1].tagName === tagName
        ) {
          if (closingTag) {
            // group close
            closeCurrentSpan();
            markupStack.pop();
          }
        } else if (markupStack.filter(filterFrames).length > 0) {
          // trying to open a recursive group (or forgot to close a previous group)
          // in either case, we just unwind to the previous stack frame
          spanStartIndex = markupStack[markupStack.length - 1].startIndex;
          markupStack.pop();
          continue;
        } else {
          closeCurrentSpan();
          if (closingTag) {
            // out of order group close:
            let index = markupStack.findIndex(
              (frame) => frame.tagName === tagName
            );
            if (index >= 0) {
              markupStack.splice(index, 1);
            }
          } else {
            // group open
            const extraProperties = {};
            if (family) extraProperties["font-family"] = family;
            if (fill) extraProperties.fill = fill;
            if (cssClass) extraProperties.class = cssClass;
            markupStack.push(
              MarkupStackFrame.createStackFrame(
                ctxt,
                tagName,
                match.index,
                extraProperties,
                markupSymbol
              )
            );
          }
        }
      }

      // advance the start index past the current markup
      spanStartIndex = match.index + match[0].length;
    }

    // if we finished matches, and there is still some text left,
    // or if we haven't generated any spans yet, create one final run
    if (spanStartIndex < text.length || this.spans.length === 0)
      closeSpan(text.slice(spanStartIndex), spanStartIndex);
  }

  getCanvasFontForProperties(ctxt, properties = {}) {
    var font = "";
    if (properties["font-style"] === "italic") font += "italic ";
    if (properties["font-variant"] === "small-caps") font += "small-caps ";
    if (properties["font-weight"] === "bold") font += "bold ";
    let fontSize = parseFloat(properties["font-size"]) || this.fontSize(ctxt);
    if (/%$/.test(properties["font-size"])) {
      fontSize *= this.fontSize(ctxt) / 100;
    }
    font += `${fontSize * (this.resize || 1)}px `;
    font += properties["font-family"] || this.fontFamily(ctxt);
    return font;
  }

  measureSubstringBBox(ctxt, length) {
    return this.measureSubstring(ctxt, length, true);
  }

  /**
   * if length is undefined and this.rightAligned === true, then offsets will be marked for each newLine span
   *
   * @param {ChantContext} ctxt
   * @param {number} length
   * @param {boolean} returnBBox
   * @returns measured substring, as a simple width unless returnBBox == true
   */
  measureSubstring(ctxt, length, returnBBox = false) {
    if (length === 0) return 0;
    if (!length) length = Infinity;
    if (length < 0) {
      var lines = -length;
      length = Infinity;
    }
    var canvasCtxt = ctxt.canvasCtxt;
    var width = 0;
    var widths = [];
    var newLineSpans = [this.spans[0]];
    var subStringLength = 0;
    var numLines = 1;
    var fontSize = this.fontSize(ctxt) * (this.resize || 1);
    var bbox = new Rect(0, 0, 0, 0);
    for (var i = 0; i < this.spans.length; i++) {
      var span = this.spans[i],
        myText = span.text.slice(0, length - subStringLength);
      if (span.newLine) {
        numLines += parseInt(span.newLine) || 1;
        if (!lines && this.rightAligned === true && length === Infinity) {
          newLineSpans[newLineSpans.length - 1].xOffset =
            this.firstLineMaxWidth - width;
          newLineSpans.push(span);
        } else if (--lines === 0) break;
        widths.push(width);
        width = 0;
      }
      if (ctxt.textMeasuringStrategy === TextMeasuringStrategy.Canvas) {
        canvasCtxt.font = this.getCanvasFontForProperties(
          ctxt,
          span.properties
        );
        let metrics = canvasCtxt.measureText(
          myText,
          width,
          fontSize * (numLines - 1)
        );
        if ("actualBoundingBoxAscent" in metrics) {
          let left = metrics.actualBoundingBoxLeft;
          bbox.union(
            new Rect(
              width - left,
              fontSize * (numLines - 1) - metrics.actualBoundingBoxAscent,
              metrics.width + left,
              metrics.actualBoundingBoxDescent + metrics.actualBoundingBoxAscent
            )
          );
          if (this instanceof DropCap) {
            width += Math.max(0, left);
          }
        } else {
          bbox.union(
            new Rect(width, fontSize * (numLines - 2), metrics.width, fontSize)
          );
        }
        width += metrics.width;
      } else if (
        ctxt.textMeasuringStrategy === TextMeasuringStrategy.OpenTypeJS &&
        ctxt.fontDictionary
      ) {
        // get the bounding box for the substring, placing it at x = width, y = fontSize * (numLines - 1)
        let font = ctxt.getFontForProperties(
          span.properties,
          span.properties["font-family"] || this.fontFamily(ctxt)
        );
        /**
         * @type {{ features: { liga: boolean; smcp?: boolean; } }}
         */
        let options = { features: { liga: true } };
        if (span.properties["font-variant"] === "small-caps") {
          options.features.smcp = true;
        }
        let spanFontSize = parseFloat(span.properties["font-size"]) || fontSize;
        if (/%$/.test(span.properties["font-size"])) {
          spanFontSize *= fontSize / 100;
        }
        const y = fontSize * (numLines - 1);
        if ("getPath" in font) {
          // opentype.js
          let subBbox = font
            .getPath(myText, width, y, spanFontSize, options)
            .getBoundingBox();
          let subWidth = font.getAdvanceWidth(myText, spanFontSize, options);
          bbox.union(
            new Rect(
              width + subBbox.x1,
              subBbox.y1,
              subWidth - subBbox.x1,
              subBbox.y2 - subBbox.y1
            )
          );
          width += subWidth;
          if (this instanceof DropCap) {
            width -= subBbox.x1;
          }
        } else {
          // fontkit
          const run = font.layout(myText, options.features);
          const { unitsPerEm } = font;
          const multiplier = spanFontSize / unitsPerEm;
          let subBbox = run.bbox;
          let subWidth = run.advanceWidth * multiplier;
          bbox.union(
            new Rect(
              width + subBbox.minX * multiplier,
              y - subBbox.maxY * multiplier,
              subWidth - subBbox.minX * multiplier,
              subBbox.height * multiplier
            )
          );
          width += subWidth;
          if (this instanceof DropCap) {
            width -= subBbox.minX * multiplier;
          }
        }
      }
      subStringLength += myText.length;
      if (subStringLength === length) break;
    }
    if (
      !lines &&
      width &&
      newLineSpans.length &&
      this.rightAligned === true &&
      length === Infinity
    ) {
      newLineSpans[newLineSpans.length - 1].xOffset =
        this.firstLineMaxWidth - width;
    }
    width = Math.max(width, ...widths);
    if (returnBBox === true) {
      let height = bbox.height;
      let y = bbox.y,
        x = bbox.x;
      return { width, height, x, y };
    } else {
      return width;
    }
  }

  recalculateMetrics(ctxt, resetNewLines = true) {
    if (resetNewLines) {
      delete this.maxWidth;
      delete this.firstLineMaxWidth;
      delete this.rightAligned;
      delete this.resize;
      delete this.numLines;
      // replace newlines with spaces
      this.spans.forEach((span) => {
        delete span.xOffset;
        if (span.newLine === true) {
          delete span.newLine;
          span.text = " " + span.text;
        }
      });
    }

    this.bounds.x = 0;
    this.bounds.y = 0;

    this.origin.x = 0;

    if (ctxt.textMeasuringStrategy === TextMeasuringStrategy.Svg) {
      while (ctxt.svgTextMeasurer.firstChild)
        ctxt.svgTextMeasurer.removeChild(ctxt.svgTextMeasurer.firstChild);
      ctxt.svgTextMeasurer.appendChild(this.createSvgNode(ctxt));
      ctxt.svgTextMeasurer.appendChild(ctxt.createStyleNode());

      var bbox = ctxt.svgTextMeasurer.firstChild.getBBox();
      this.bounds.width = bbox.width;
      this.bounds.height = bbox.height;
      this.origin.y = -bbox.y; // offset to baseline from top
      this.origin.x = -bbox.x;
    } else {
      let bbox = this.measureSubstringBBox(ctxt);
      this.bounds.width = bbox.width;
      this.bounds.height = bbox.height;
      this.origin.y = -bbox.y;
      this.origin.x = -bbox.x;
    }
    this.numLines = this.spans.reduce(
      (result, span) =>
        result + (span.newLine ? parseInt(span.newLine) || 1 : 0),
      1
    );
  }

  setMaxWidth(ctxt, maxWidth, firstLineMaxWidth = maxWidth) {
    if (this.spans.filter((s) => s.newLine === true).length) {
      // first get rid of any new lines set from a previous maxWidth
      this.recalculateMetrics(ctxt);
    }
    if (this.bounds.width > maxWidth) {
      this.maxWidth = maxWidth;
      var percentage = maxWidth / this.bounds.width;
      if (this instanceof Lyric && percentage >= 0.85) {
        this.resize = percentage;
      } else {
        if (firstLineMaxWidth < 0) firstLineMaxWidth = maxWidth;
        this.firstLineMaxWidth = firstLineMaxWidth;
        var lastMatch = null,
          regex = /\s+|$/g,
          max = firstLineMaxWidth,
          match;
        while (
          (match = regex.exec(this.text)) &&
          (!lastMatch || match.index > lastMatch.index)
        ) {
          var width = this.measureSubstring(ctxt, match.index);
          if (width > max && lastMatch) {
            var spanIndex = 0,
              length = 0;
            while (length < lastMatch.index && spanIndex < this.spans.length) {
              let span = this.spans[spanIndex++];
              length += span.text.length + (span.newLine ? 1 : 0);
            }
            if (length > lastMatch.index || spanIndex >= this.spans.length) {
              let span = this.spans[--spanIndex];
              length -= span.text.length;
            }
            var splitSpan = this.spans[spanIndex],
              textLeft = splitSpan.text.slice(0, lastMatch.index - length),
              textRight = splitSpan.text.slice(
                lastMatch.index + lastMatch[0].length - length
              ),
              newSpans = [];
            this.rightAligned =
              max === firstLineMaxWidth && firstLineMaxWidth !== maxWidth;
            if (textLeft)
              newSpans.push(
                new TextSpan(
                  textLeft,
                  splitSpan.propertyArray,
                  splitSpan.activeTags
                )
              );
            if (textRight) {
              newSpans.push(
                new TextSpan(
                  textRight,
                  splitSpan.propertyArray,
                  splitSpan.activeTags,
                  undefined,
                  { newLine: true }
                )
              );
            } else if (this.spans[spanIndex + 1]) {
              this.spans[spanIndex + 1].newLine = true;
            }
            this.spans.splice(spanIndex, 1, ...newSpans);
            this.needsLayout = true;
            max = maxWidth;
            if (
              match.index === this.text.length ||
              this.measureSubstring(ctxt) <= maxWidth
            )
              break;
            width = 0;
            match = lastMatch = null;
          }
          lastMatch = match;
        }
      }
      this.recalculateMetrics(ctxt, false);
    }
  }

  getCssClasses() {
    return (this.textType && this.textType.cssClass) || "";
  }

  getExtraStyleProperties(ctxt) {
    return ctxt.baseTextStyle || {};
  }

  static escapeForTspan(string) {
    return String(string).replace(/[&<>]/g, function (s) {
      return __subsForTspans[s];
    });
  }

  draw(ctxt) {
    var canvasCtxt = ctxt.canvasCtxt;

    if (this.textAnchor === "middle") canvasCtxt.textAlign = "center";
    else canvasCtxt.textAlign = "start";

    var translateWidth = 0,
      translateHeight = 0;
    for (var i = 0; i < this.spans.length; i++) {
      var span = this.spans[i];
      var xOffset = span.xOffset || 0;
      if (span.newLine) {
        let count = parseInt(span.newLine) || 1;
        canvasCtxt.translate(
          translateWidth + xOffset,
          this.fontSize(ctxt) * count
        );
        translateWidth = -xOffset;
        translateHeight -= this.fontSize(ctxt);
      } else if (xOffset) {
        canvasCtxt.translate(translateWidth + xOffset, 0);
        translateWidth = -xOffset;
      }
      var properties = Object.assign(
        {},
        this.getExtraStyleProperties(ctxt),
        span.properties
      );
      canvasCtxt.font = this.getCanvasFontForProperties(ctxt, properties);
      canvasCtxt.fillStyle = properties.fill || "#000";
      canvasCtxt.fillText(
        span.text,
        this.bounds.x,
        this.bounds.y,
        span.textLength || undefined
      );
      var metrics = canvasCtxt.measureText(
        span.text,
        this.bounds.x,
        this.bounds.y
      );
      translateWidth -= metrics.width;
      canvasCtxt.translate(metrics.width, 0);
    }
    canvasCtxt.translate(translateWidth, translateHeight);
  }

  getSvgProps() {
    return {
      "source-index": this.sourceIndex,
      x: this.bounds.x,
      y: this.bounds.y,
      class: this.getCssClasses().trim(),
      "text-anchor": this.textAnchor
      //'dominant-baseline': this.dominantBaseline, // hanging baseline doesn't work in Safari
    };
  }

  getSpanOptions(span, ctxt, useStyleObject = false) {
    var options = {
      "source-index": span.index,
      class: span.properties.class,
      style: useStyleObject
        ? Object.assign({}, span.properties)
        : getCssForProperties(span.properties)
    };

    if (span.newLine) {
      var xOffset = span.xOffset || 0;
      options.dy = 1.1 * (parseInt(span.newLine) || 1) + "em";
      options.x = this.bounds.x + xOffset;
    } else if (span.xOffset) {
      options.x = this.bounds.x + span.xOffset;
    }
    if (span.textLength) {
      options.textLength = span.textLength;
      options.lengthAdjust = "spacingAndGlyphs";
      options.y = this.bounds.y;
    }
    if (this.resize) {
      options["font-size"] =
        span.properties["font-size"] || this.fontSize(ctxt) * this.resize;
    }
    // if (ctxt.setFontFamilyAttributes) {
    //   options["font-family"] =
    //     span.properties["font-family"] ||
    //     getFontFilenameForProperties(span.properties, this.fontFamily(ctxt));
    //   let properties = Object.assign({}, span.properties);
    //   delete properties["font-weight"];
    //   delete properties["font-style"];
    //   options["style"] = getCssForProperties(properties);
    // } else {
    //   options["style"] = getCssForProperties(span.properties);
    // }

    return options;
  }

  createSvgNode(ctxt) {
    var spans = [];

    for (var i = 0; i < this.spans.length; i++) {
      let span = this.spans[i];
      let options = this.getSpanOptions(span, ctxt);

      spans.push(QuickSvg.createNode("tspan", options, span.text));
    }

    let options = this.getSvgProps();
    const extraStyleProperties = this.getExtraStyleProperties(ctxt);
    options.style = getCssForProperties(extraStyleProperties);
    if (extraStyleProperties.class) {
      options.class = extraStyleProperties.class + " " + options.class;
    }
    options.source = this;

    return (this.svgNode = QuickSvg.createNode("text", options, spans));
  }
  createSvgTree(ctxt) {
    var spans = [];

    for (var i = 0; i < this.spans.length; i++) {
      let span = this.spans[i];
      let options = this.getSpanOptions(span, ctxt, true);

      spans.push(QuickSvg.createSvgTree("tspan", options, span.text));
    }

    let options = this.getSvgProps();
    options.style = this.getExtraStyleProperties(ctxt);
    if (options.style.class) {
      options.class = options.style.class + " " + options.class;
    }
    options.source = this;

    return QuickSvg.createSvgTree("text", options, ...spans);
  }

  createSvgFragment(ctxt) {
    var spans = "";

    for (var i = 0; i < this.spans.length; i++) {
      let span = this.spans[i];
      let options = this.getSpanOptions(span, ctxt);

      spans += QuickSvg.createFragment(
        "tspan",
        options,
        TextElement.escapeForTspan(span.text)
      );
    }

    let options = this.getSvgProps();
    const extraStyleProperties = this.getExtraStyleProperties(ctxt);
    options.style = getCssForProperties(extraStyleProperties);
    if (extraStyleProperties.class) {
      options.class = extraStyleProperties.class + " " + options.class;
    }
    if (ctxt.setFontFamilyAttributes) {
      options["font-size"] = this.fontSize(ctxt);
    }

    return QuickSvg.createFragment("text", options, spans);
  }
}

var LyricType = {
  SingleSyllable: 0,
  BeginningSyllable: 1,
  MiddleSyllable: 2,
  EndingSyllable: 3,

  Directive: 4 // for asterisks, "ij." elements, or other performance notes.
};

var LyricArray = {
  getLeft: function (lyricArray) {
    if (lyricArray.length === 0) return NaN;

    var x = Number.MAX_VALUE;
    for (var i = 0; i < lyricArray.length; i++) {
      if (lyricArray[i])
        x = Math.min(
          x,
          lyricArray[i].notation.bounds.x + lyricArray[i].bounds.x
        );
    }

    return x;
  },

  getRight: function (lyricArray, presumeConnectorNeeded) {
    if (lyricArray.length === 0) return NaN;

    var x = Number.MIN_VALUE;
    for (var i = 0; i < lyricArray.length; i++) {
      let l = lyricArray[i];
      if (l)
        x = Math.max(
          x,
          l.notation.bounds.x +
            l.bounds.x +
            l.bounds.width +
            (presumeConnectorNeeded && l.allowsConnector() && !l.needsConnector
              ? l.getConnectorWidth()
              : 0)
        );
    }

    return x;
  },

  hasOnlyOneLyric: function (lyricArray) {
    return lyricArray.filter((l) => l.originalText).length === 1;
  },

  indexOfLyric: function (lyricArray) {
    return lyricArray.indexOf(lyricArray.filter((l) => l.originalText)[0]);
  },

  mergeIn: function (lyricArray, newLyrics) {
    for (var i = 0; i < newLyrics.length; ++i) {
      if (newLyrics[i].originalText || !lyricArray[i])
        lyricArray[i] = newLyrics[i];
    }
  },

  mergeInArray: function (lyricArray, notations) {
    for (var i = 0; i < notations.length; ++i) {
      this.mergeIn(lyricArray, notations[i].lyrics);
    }
  },

  setNotation: function (lyricArray, notation) {
    notation.lyrics = lyricArray;
    for (var i = 0; i < lyricArray.length; ++i) {
      lyricArray[i].notation = notation;
    }
  }
};

class Lyric extends TextElement {
  constructor(ctxt, text, lyricType, notation, notations, sourceIndex) {
    super(
      ctxt,
      (ctxt.textStyles.lyric.prefix || "") + text,
      (ctxt) => ctxt.textStyles.lyric.font,
      (ctxt) => ctxt.textStyles.lyric.size,
      "start",
      sourceIndex,
      text
    );
    this.textType = TextTypes.lyric;

    // save the original text in case we need to later use the lyric
    // in a dropcap...
    this.originalText = text;

    this.notation = notation;
    this.notations = notations;

    if (
      typeof lyricType === "undefined" ||
      lyricType === null ||
      lyricType === ""
    )
      this.lyricType = LyricType.SingleSyllable;
    else this.lyricType = lyricType;

    // Lyrics keep track of how to center them on notation elements.
    // centerTextIndex is the index in this.text where the centering starts,
    // centerLength is how many characters comprise the center point.
    // performLayout will do the processing
    this.centerStartIndex = -1;
    this.centerLength = text.length;

    this.needsConnector = false;

    // Lyrics can have their own language defined, which affects the alignment
    // of the text with the notation element
    this.language = null;

    if (this.allowsConnector)
      this.connectorSpan = new TextSpan(ctxt.syllableConnector);
  }

  allowsConnector() {
    return (
      this.lyricType === LyricType.BeginningSyllable ||
      this.lyricType === LyricType.MiddleSyllable
    );
  }

  setForceConnector(force) {
    this.forceConnector = force && this.allowsConnector();
  }

  setNeedsConnector(needs, width) {
    if (needs === true || this.forceConnector) {
      this.needsConnector = true;
      if (typeof width !== "undefined") {
        this.setConnectorWidth(width);
      } else {
        this.bounds.width =
          this.widthWithoutConnector + this.getConnectorWidth();
      }

      if (
        this.spans.length > 0 &&
        this.spans[this.spans.length - 1] !== this.connectorSpan
      )
        this.spans.push(this.connectorSpan);
    } else {
      this.connectorWidth = 0;
      this.needsConnector = false;
      this.bounds.width = this.widthWithoutConnector;

      var span = this.spans.pop();
      if (span && span !== this.connectorSpan) this.spans.push(span);
    }
  }

  setConnectorWidth(width) {
    this.connectorWidth = width;
    this.connectorSpan.textLength = width;
    if (this.needsConnector)
      this.bounds.width = this.widthWithoutConnector + this.getConnectorWidth();
  }

  getConnectorWidth() {
    return this.connectorWidth || this.defaultConnectorWidth;
  }

  getLeft() {
    return this.notation.bounds.x + this.bounds.x;
  }

  getRight() {
    return this.notation.bounds.x + this.bounds.x + this.bounds.width;
  }

  recalculateMetrics(ctxt, resetNewLines = true) {
    this.setNeedsConnector();

    super.recalculateMetrics(ctxt, resetNewLines);

    this.widthWithoutConnector = this.bounds.width;

    this.connectorWidth = 0;
    this.defaultConnectorWidth = ctxt.hyphenWidth;

    var activeLanguage = this.language || ctxt.defaultLanguage;

    // calculate the point where the text lines up to the staff notation
    // and offset the rect that much. By default we just center the text,
    // but the logic below allows for smarter lyric alignment based
    // on manual override or language control.
    var offset = this.widthWithoutConnector / 2,
      x1,
      x2,
      vowelSegmentWidth = this.widthWithoutConnector;

    // some simple checks for sanity, and disable manual centering if the numbers are bad
    if (
      this.centerStartIndex >= 0 &&
      (this.centerStartIndex >= this.text.length ||
        this.centerLength < 0 ||
        this.centerStartIndex + this.centerLength > this.text.length)
    )
      this.centerStartIndex = -1;

    if (this.text.length === 0) {
      // if we have no text to work with, then there's nothing to do!
      // Unless it's a drop cap, in which case we center the connector:
      if (this.dropCap && this.originalText) {
        offset = ctxt.hyphenWidth / 2;
        vowelSegmentWidth = ctxt.hyphenWidth;
      }
    } else if (this.centerStartIndex >= 0) {
      // if we have manually overriden the centering logic for this lyric,
      // then always use that.
      if (ctxt.textMeasuringStrategy === TextMeasuringStrategy.Svg) {
        // svgTextMeasurer still has the current lyric in it...
        x1 = ctxt.svgTextMeasurer.firstChild.getSubStringLength(
          0,
          this.centerStartIndex
        );
        x2 = ctxt.svgTextMeasurer.firstChild.getSubStringLength(
          0,
          this.centerStartIndex + this.centerLength
        );
      } else {
        x1 = this.measureSubstring(ctxt, this.centerStartIndex);
        x2 = this.measureSubstring(
          ctxt,
          this.centerStartIndex + this.centerLength
        );
      }
      offset = (x1 + x2) / 2;
      vowelSegmentWidth = x2 - x1;
    } else {
      // if it's a directive with no manual centering override, then
      // just center the text.
      if (this.lyricType !== LyricType.Directive) {
        // only consider text content after the last space (if any)
        var startIndex = this.text.lastIndexOf(" ") + 1;

        // unless there are no text characters following the space:
        if (
          startIndex > 0 &&
          !this.text
            .slice(startIndex)
            .match(/[a-záéíóúýäëïöüÿàèìòùỳāēīōūȳăĕĭŏŭ]/i)
        ) {
          startIndex = 0;
        }

        // find indices of e tags to ignore when finding vowel segment:
        var ignore = [];
        let index = 0;
        let indexOffset = startIndex;
        for (var span of this.spans) {
          let endIndex = index + span.text.length;
          if (span.activeTags.includes("e")) {
            if (index <= startIndex) {
              startIndex = endIndex;
            } else {
              ignore.push({
                index: index - indexOffset,
                endIndex: endIndex - indexOffset
              });
            }
          }
          index = endIndex;
        }
        // Non-directive elements are lined up to the chant notation based on vowel segments,
        var result = activeLanguage.findVowelSegment(
          this.text,
          startIndex,
          ignore
        );

        if (result.found !== true) {
          var match = this.text.slice(startIndex).match(/[a-z]+/i);
          if (match) {
            result.startIndex = startIndex + match.index;
            result.length = match[0].length;
          } else {
            result.startIndex = startIndex;
            result.length = this.text.length - startIndex;
          }
        }
        if (ctxt.textMeasuringStrategy === TextMeasuringStrategy.Svg) {
          // svgTextMeasurer still has the current lyric in it...
          x1 = ctxt.svgTextMeasurer.firstChild.getSubStringLength(
            0,
            result.startIndex
          );
          x2 = ctxt.svgTextMeasurer.firstChild.getSubStringLength(
            0,
            result.startIndex + result.length
          );
        } else {
          x1 = this.measureSubstring(ctxt, result.startIndex);
          x2 = this.measureSubstring(ctxt, result.startIndex + result.length);
        }
        offset = (x1 + x2) / 2;
        vowelSegmentWidth = x2 - x1;
      }
    }

    this.vowelSegmentWidth = vowelSegmentWidth;

    this.bounds.x = -offset;
    this.bounds.y = 0;

    this.origin.x = offset;
  }

  generateDropCap(ctxt) {
    if (this.dropCap) return this.dropCap;
    // disallow special characters:
    if (
      this.spans[0].properties["font-family"] ===
      ctxt.specialCharProperties["font-family"]
    ) {
      return null;
    }
    let dropCapSpan = this.spans[0].clone();
    dropCapSpan.text = dropCapSpan.text.slice(0, 1).toUpperCase();
    let dropCapLowerCase = dropCapSpan.text.toLowerCase();
    // disallow any characters that do not change from .toUpperCase():
    if (dropCapSpan.text === dropCapLowerCase) return null;

    if (dropCapSpan.activeTags.indexOf("sc") >= 0)
      dropCapSpan.text = dropCapLowerCase;

    var dropCap = (this.dropCap = new DropCap(ctxt, "", this.sourceIndex));
    dropCap.spans = [dropCapSpan];
    let dropCapSourceGabcLength = this.sourceGabc.match(
      /^(?:<\/?[^>]+>)*.?(?:<\/[^>]+>)*/
    )[0].length;
    dropCap.sourceGabc = this.sourceGabc.slice(0, dropCapSourceGabcLength);
    this.sourceIndex += dropCap.sourceGabc.length;
    this.sourceGabc = this.sourceGabc.slice(dropCapSourceGabcLength);

    this.spans[0].text = this.spans[0].text.slice(1);
    this.text = this.text.slice(1);
    this.centerStartIndex--; // lost a letter, so adjust centering accordingly

    return dropCap;
  }

  getCssClasses() {
    var classes = this.lyricType === LyricType.Directive ? "directive " : "";

    return classes + super.getCssClasses();
  }

  getExtraStyleProperties(ctxt) {
    var props = super.getExtraStyleProperties(ctxt);

    if (this.lyricType === LyricType.Directive && ctxt.autoColor === true)
      props = Object.assign({}, props, { fill: ctxt.rubricColor });

    return props;
  }
}

class ChoralSign extends TextElement {
  constructor(ctxt, text, note, sourceIndex) {
    super(
      ctxt,
      (ctxt.textStyles.choralSign.prefix || "") + text,
      (ctxt) => ctxt.textStyles.choralSign.font,
      TextTypes.choralSign.size,
      "start",
      sourceIndex,
      text
    );
    this.positionHint = MarkingPositionHint.Default;
    this.note = note;
    this.textType = TextTypes.choralSign;
  }

  recalculateMetrics(ctxt) {
    super.recalculateMetrics(ctxt);
  }

  performLayout(ctxt) {
    this.recalculateMetrics(ctxt);
    this.bounds.x =
      this.note.bounds.x +
      Math.max(0, (ctxt.staffInterval - this.bounds.width) / 2); // center on the note itself

    let offset, staffPosition;
    if (this.positionHint === MarkingPositionHint.Below) {
      offset = -1;
      staffPosition = this.note.staffPosition + 2 * offset;
      staffPosition += staffPosition % 2 === 0 ? 0.3 : 1;
    } else {
      offset = 1;
      staffPosition = this.note.staffPosition + 2 * offset;
      staffPosition += staffPosition % 2 === 0 ? 0.3 : -0.4;
    }
    // if (staffPosition % 2 === 0) staffPosition += offset;
    this.bounds.y =
      ctxt.calculateHeightFromStaffPosition(staffPosition) + this.origin.y;
  }
}

class AboveLinesText extends TextElement {
  /**
   * @param {String} text
   */
  constructor(ctxt, text, notation, sourceIndex) {
    super(
      ctxt,
      (ctxt.textStyles.al.prefix || "") + text,
      (ctxt) => ctxt.textStyles.al.font,
      (ctxt) => ctxt.textStyles.al.size,
      "start",
      sourceIndex,
      text
    );
    this.notation = notation;
    this.textType = TextTypes.al;

    this.padding = ctxt.staffInterval / 2;
  }
}

class TranslationText extends TextElement {
  /**
   * @param {String} text
   */
  constructor(ctxt, text, notation, sourceIndex) {
    var gabcSource = text;
    var anchor = "start";
    if (text === "/") {
      text = "";
      anchor = "end";
    } else {
      text = (ctxt.textStyles.translation.prefix || "") + text;
    }
    super(
      ctxt,
      text,
      (ctxt) => ctxt.textStyles.translation.font,
      (ctxt) => ctxt.textStyles.translation.size,
      anchor,
      sourceIndex,
      gabcSource
    );
    this.notation = notation;
    this.textType = TextTypes.translation;

    this.padding = ctxt.staffInterval / 2;
  }
}

class DropCap extends TextElement {
  /**
   * @param {String} text
   */
  constructor(ctxt, text, sourceIndex) {
    super(
      ctxt,
      (ctxt.textStyles.dropCap.prefix || "") + text,
      (ctxt) => ctxt.textStyles.dropCap.font,
      (ctxt) => ctxt.textStyles.dropCap.size,
      "middle",
      sourceIndex,
      text
    );
    this.textType = TextTypes.dropCap;

    this.padding = ctxt.staffInterval * ctxt.textStyles.dropCap.padding;
  }
}

class TitleTextElement extends TextElement {
  constructor(
    ctxt,
    text,
    fontFamily,
    fontSize,
    textAnchor,
    sourceIndex,
    sourceGabc
  ) {
    super(
      ctxt,
      text,
      fontFamily,
      fontSize,
      textAnchor,
      sourceIndex,
      sourceGabc
    );
  }
}

class Supertitle extends TitleTextElement {
  constructor(ctxt, text, sourceIndex) {
    super(
      ctxt,
      (ctxt.textStyles.supertitle.prefix || "") + text,
      (ctxt) => ctxt.textStyles.supertitle.font,
      (ctxt) => ctxt.textStyles.supertitle.size,
      "middle",
      sourceIndex,
      text
    );
    this.textType = TextTypes.supertitle;

    this.padding = (ctxt) =>
      ((Number(ctxt.textStyles.supertitle.padding) || 1) *
        ctxt.textStyles.supertitle.size) /
      3;
  }
}

class Title extends TitleTextElement {
  constructor(ctxt, text, sourceIndex) {
    super(
      ctxt,
      (ctxt.textStyles.title.prefix || "") + text,
      (ctxt) => ctxt.textStyles.title.font,
      (ctxt) => ctxt.textStyles.title.size,
      "middle",
      sourceIndex,
      text
    );
    this.textType = TextTypes.title;

    this.padding = (ctxt) =>
      ((Number(ctxt.textStyles.title.padding) || 1) *
        ctxt.textStyles.title.size) /
      3;
  }
}

class Subtitle extends TitleTextElement {
  constructor(ctxt, text, sourceIndex) {
    super(
      ctxt,
      (ctxt.textStyles.subtitle.prefix || "") + text,
      (ctxt) => ctxt.textStyles.subtitle.font,
      (ctxt) => ctxt.textStyles.subtitle.size,
      "middle",
      sourceIndex,
      text
    );
    this.textType = TextTypes.subtitle;

    this.padding = (ctxt) =>
      ((Number(ctxt.textStyles.subtitle.padding) || 1) *
        ctxt.textStyles.subtitle.size) /
      3;
  }
}

class TextLeftRight extends TitleTextElement {
  constructor(ctxt, text, type, sourceIndex) {
    super(
      ctxt,
      (ctxt.textStyles.leftRight.prefix || "") + text,
      (ctxt) => ctxt.textStyles.leftRight.font,
      (ctxt) => ctxt.textStyles.leftRight.size,
      type === "textLeft" ? "start" : "end",
      sourceIndex,
      text
    );
    this.textType = TextTypes.leftRight;
    this.extraClass = type === "textLeft" ? "textLeft" : "textRight";
    this.headerKey = type === "textLeft" ? "text-left" : "text-right";
    this.padding = (ctxt) =>
      ((Number(ctxt.textStyles.leftRight.padding) || 1) *
        ctxt.textStyles.leftRight.size) /
      5;
  }

  getCssClasses() {
    return this.extraClass + " " + super.getCssClasses();
  }
}

class Annotation extends TextElement {
  /**
   * @param {String} text
   */
  constructor(ctxt, text, elementIndex) {
    super(
      ctxt,
      (ctxt.textStyles.annotation.prefix || "") + text,
      (ctxt) => ctxt.textStyles.annotation.font,
      (ctxt) => ctxt.textStyles.annotation.size,
      "middle"
    );
    this.sourceGabc = text;
    if (typeof elementIndex === "number") this.elementIndex = elementIndex;
    this.textType = TextTypes.annotation;
    this.padding = ctxt.staffInterval * ctxt.textStyles.annotation.padding;
    this.dominantBaseline = "hanging"; // so that annotations can be aligned at the top.
  }
}

class Annotations extends ChantLayoutElement {
  /**
   * @param {String} text
   */
  constructor(ctxt, ...texts) {
    super();

    this.lineHeight = 1.1;
    this.annotations = texts.map(function (text, i) {
      return new Annotation(ctxt, text, i);
    });
    this.padding = Math.max.apply(
      null,
      this.annotations.map(function (annotation) {
        return annotation.padding;
      })
    );
  }

  updateBounds(multiplier) {
    if (!multiplier) multiplier = 1;
    for (var i = 0; i < this.annotations.length; ++i) {
      var annotation = this.annotations[i];
      annotation.bounds.x += this.bounds.x * multiplier;
      annotation.bounds.y += this.bounds.y * multiplier;
    }
  }

  recalculateMetrics(ctxt) {
    this.bounds.x = 0;
    this.bounds.y = 0;

    this.bounds.width = 0;
    this.bounds.height = 0;

    this.origin.x = 0;
    this.origin.y = 0;

    let y = 0;
    for (var i = 0; i < this.annotations.length; ++i) {
      var annotation = this.annotations[i];
      annotation.recalculateMetrics(ctxt);
      this.bounds.width = Math.max(this.bounds.width, annotation.bounds.width);
      annotation.bounds.y += y;
      this.bounds.height = annotation.bounds.bottom();
      this.origin.y = this.origin.y || annotation.origin.y;
      y +=
        annotation.fontSize(ctxt) * (annotation.resize || 1) * this.lineHeight;
    }
  }

  draw(ctxt) {
    this.updateBounds();
    this.annotations.forEach(function (annotation) {
      annotation.draw(ctxt);
    });
    this.updateBounds(-1);
  }

  createSvgNode(ctxt) {
    this.updateBounds();
    var result = this.annotations.map(function (annotation) {
      return annotation.createSvgNode(ctxt);
    });
    this.updateBounds(-1);
    return result;
  }
  createSvgTree(ctxt) {
    this.updateBounds();
    var result = this.annotations.map(function (annotation) {
      return annotation.createSvgTree(ctxt);
    });
    this.updateBounds(-1);
    return { children: result };
  }

  createSvgFragment(ctxt) {
    this.updateBounds();
    var result = this.annotations
      .map(function (annotation) {
        return annotation.createSvgFragment(ctxt);
      })
      .join("");
    this.updateBounds(-1);
    return result;
  }
}

class ChantNotationElement extends ChantLayoutElement {
  constructor() {
    super();

    //double
    this.leadingSpace = 0.0;
    this.trailingSpace = DefaultTrailingSpace;
    this.keepWithNext = false;
    this.needsLayout = true;

    this.lyrics = [];

    /**
     * @type {ChantScore}
     */
    this.score = null; // the ChantScore

    /**
     * @type {ChantLine}
     */
    this.line = null; // the ChantLine

    this.visualizers = [];
  }

  hasLyrics() {
    return this.lyrics.length !== 0;
  }

  getAllLyricsLeft() {
    if (this.lyrics.length === 0) return this.bounds.right();

    var x = Number.MAX_VALUE;
    for (var i = 0; i < this.lyrics.length; i++) {
      if (this.lyrics[i]) x = Math.min(x, this.lyrics[i].bounds.x);
    }

    return this.bounds.x + x;
  }

  getAllLyricsRight() {
    if (this.lyrics.length === 0) return this.bounds.x;

    var x = Number.MIN_VALUE;
    for (var i = 0; i < this.lyrics.length; i++) {
      if (this.lyrics[i])
        x = Math.max(x, this.lyrics[i].bounds.x + this.lyrics[i].bounds.width);
    }

    return this.bounds.x + x;
  }

  // used by subclasses while building up the chant notations.
  addVisualizer(chantLayoutElement) {
    if (!chantLayoutElement.ignoreBounds) {
      if (this.bounds.isEmpty())
        this.bounds = chantLayoutElement.bounds.clone();
      else this.bounds.union(chantLayoutElement.bounds);
    }

    this.visualizers.push(chantLayoutElement);
  }

  // same as addVisualizer, except the element is unshifted to the front
  // of the visualizer array rather than the end. This way, some
  // visualizers can be placed behind the others...ledger lines for example.
  prependVisualizer(chantLayoutElement) {
    if (this.bounds.isEmpty()) this.bounds = chantLayoutElement.bounds.clone();
    else this.bounds.union(chantLayoutElement.bounds);

    this.visualizers.unshift(chantLayoutElement);
  }

  // chant notation elements are given an opportunity to perform their layout via this function.
  // subclasses should call this function first in overrides of this function.
  // on completion, exsurge presumes that the bounds, the origin, and the fragment objects are
  // all valid and prepared for higher level layout.
  performLayout(ctxt) {
    if (typeof this.trailingSpace === "function")
      this.calculatedTrailingSpace = this.trailingSpace(ctxt);
    else this.calculatedTrailingSpace = this.trailingSpace;

    // reset the bounds and the staff notations before doing a layout
    this.visualizers = [];
    this.bounds = new Rect(Infinity, Infinity, -Infinity, -Infinity);

    for (var i = 0; i < this.lyrics.length; i++)
      this.lyrics[i].recalculateMetrics(ctxt);

    if (this.alText)
      for (i = 0; i < this.alText.length; i++)
        this.alText[i].recalculateMetrics(ctxt);

    if (this.translationText)
      for (i = 0; i < this.translationText.length; i++)
        this.translationText[i].recalculateMetrics(ctxt);
  }

  // some subclasses have internal dependencies on other notations (for example,
  // a custos can depend on a later neume which it uses to set its height).
  // subclasses can override this function so that when the notations are
  // altered, the subclass can correctly invalidate (and later restore) its own
  // depedencies
  resetDependencies() {}

  // a helper function for subclasses to call after they are done performing layout...
  finishLayout(ctxt) {
    this.bounds.x = 0;

    let language =
      (this.lyrics[0] && this.lyrics[0].language) || ctxt.defaultLanguage;
    // center the neume itself over the syllable, or just the first punctum
    // if the neume is wider than the syllable + the width of a punctum, we always revert to centering just over the punctum
    let calculateLyricX = language.centerNeume
      ? (lyric) =>
          (lyric.bounds.x =
            this.bounds.width + ctxt.staffInterval < lyric.vowelSegmentWidth
              ? this.bounds.width / 2 - lyric.origin.x
              : this.origin.x - lyric.origin.x)
      : (lyric) => (lyric.bounds.x = this.origin.x - lyric.origin.x);
    this.lyrics.forEach(calculateLyricX);

    this.needsLayout = false;
  }

  draw(ctxt) {
    var canvasCtxt = ctxt.canvasCtxt;
    canvasCtxt.translate(this.bounds.x, 0);

    for (var i = 0; i < this.visualizers.length; i++)
      this.visualizers[i].draw(ctxt);

    for (i = 0; i < this.lyrics.length; i++) this.lyrics[i].draw(ctxt);

    if (this.translationText)
      for (i = 0; i < this.translationText.length; i++)
        this.translationText[i].draw(ctxt);

    if (this.alText)
      for (i = 0; i < this.alText.length; i++) this.alText[i].draw(ctxt);

    canvasCtxt.translate(-this.bounds.x, 0);
  }

  getInnerSvgNodes(ctxt, functionName = "createSvgNode") {
    var inner = [];

    for (i = 0; i < this.lyrics.length; i++)
      inner.push(this.lyrics[i][functionName](ctxt));

    if (this.translationText)
      for (i = 0; i < this.translationText.length; i++)
        inner.push(this.translationText[i][functionName](ctxt));

    if (this.alText)
      for (i = 0; i < this.alText.length; i++)
        inner.push(this.alText[i][functionName](ctxt));

    if (this.visualizers.length) {
      let visualizers = [];
      for (var i = 0; i < this.visualizers.length; i++)
        visualizers.push(this.visualizers[i][functionName](ctxt, this));

      if (functionName === "createSvgTree") {
        inner.push(
          QuickSvg.createSvgTree("g", { class: "Notations" }, ...visualizers)
        );
      } else {
        inner.push(
          QuickSvg.createNode("g", { class: "Notations" }, visualizers)
        );
      }
    }
    return inner;
  }

  getSvgProps() {
    return {
      // this.constructor.name will not be the same after being mangled by UglifyJS
      class: "ChantNotationElement " + (this.cssClass || this.constructor.name),
      transform: "translate(" + this.bounds.x + "," + 0 + ")"
    };
  }

  createSvgNode(ctxt) {
    var inner = this.getInnerSvgNodes(ctxt, "createSvgNode");
    var svgProps = this.getSvgProps();
    svgProps.source = this;
    return QuickSvg.createNode("g", svgProps, inner);
  }
  createSvgTree(ctxt) {
    var inner = this.getInnerSvgNodes(ctxt, "createSvgTree");
    var svgProps = this.getSvgProps();
    svgProps.source = this;
    return QuickSvg.createSvgTree("g", svgProps, ...inner);
  }

  createSvgFragment(ctxt) {
    var inner = "";

    for (i = 0; i < this.lyrics.length; i++)
      inner += this.lyrics[i].createSvgFragment(ctxt);

    if (this.translationText)
      for (i = 0; i < this.translationText.length; i++)
        inner += this.translationText[i].createSvgFragment(ctxt);

    if (this.alText)
      for (i = 0; i < this.alText.length; i++)
        inner += this.alText[i].createSvgFragment(ctxt);

    for (var i = 0; i < this.visualizers.length; i++)
      inner += this.visualizers[i].createSvgFragment(ctxt, this);

    return QuickSvg.createFragment("g", this.getSvgProps(), inner);
  }
}

const __connectorSpan = new TextSpan(" • ");
const __mergeAnnotationWithTextLeft = (...annotationSpans) =>
  annotationSpans.reduce((result, spans) => {
    if (result && result.length) {
      if (spans && spans.length) return result.concat(__connectorSpan, spans);
      else return result;
    } else if (spans && spans.length) {
      return spans;
    }
    return [];
  });

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


class Accent extends GlyphVisualizer {
  constructor(ctxt, note, glyphCode = GlyphCode.AcuteAccent) {
    super(ctxt, glyphCode);
    this.note = note;
    this.positionHint = MarkingPositionHint.Above;
  }

  performLayout(ctxt) {
    this.bounds.x = this.note.bounds.x + this.bounds.width / 2; // center on the note itself

    // this puts the acute accent either over the staff lines, or over the note if the
    // note is above the staff lines
    this.setStaffPosition(
      ctxt,
      Math.max(this.note.staffPosition + 1, 2 * ctxt.staffLineCount)
    );
  }
}

// for positioning markings on notes
var HorizontalEpisemaAlignment = {
  Default: 0,
  Left: 1,
  Center: 2,
  Right: 3
};

/*
 * HorizontalEpisema
 *
 * A horizontal episema marking is it's own visualizer (that is, it implements createSvgFragment)
 */
class HorizontalEpisema extends ChantLayoutElement {
  constructor(note) {
    super();

    this.note = note;

    this.positionHint = MarkingPositionHint.Default;
    this.terminating = false; // indicates if this episema should terminate itself or not
    this.alignment = HorizontalEpisemaAlignment.Default;
  }

  performLayout(ctxt) {
    // following logic helps to keep the episemata away from staff lines if they get too close

    var y = 0,
      step;
    var minDistanceAway = ctxt.staffInterval * 0.25; // min distance from neume
    var glyphCode = this.note.glyphVisualizer.glyphCode;
    var ledgerLine = this.note.neume.ledgerLines[0] || {};
    var punctumInclinatumShorten = false;

    if (glyphCode === GlyphCode.PunctumInclinatum) {
      let notes = this.note.neume.notes,
        index = notes.indexOf(this.note),
        prevNote = notes[index - 1];
      if (
        prevNote &&
        prevNote.glyphVisualizer.glyphCode === GlyphCode.PunctumInclinatum &&
        prevNote.staffPosition - this.note.staffPosition === 1
      ) {
        punctumInclinatumShorten = true;
      }
    }

    const staffLineCountParity = ctxt.staffLineCount % 2 || 0;
    const staffLineCountNonParity = (staffLineCountParity + 1) % 2;
    if (this.positionHint === MarkingPositionHint.Below) {
      y = this.note.bounds.bottom() + minDistanceAway; // the highest the line could be at
      // convert y to be based around center Y between top and bottom staff lines so that it is symmetric:
      y += ctxt.staffLineCount * ctxt.staffInterval;

      if (glyphCode === GlyphCode.None)
        // correction for episema under the second note of a porrectus
        y += ctxt.staffInterval / 2;
      step = Math.ceil(y / ctxt.staffInterval);
      // if there's enough space, center the episema between the punctum and the next staff line
      if (Math.abs(step % 2) === staffLineCountParity) {
        step = (step + 3 / 4 + (y - minDistanceAway) / ctxt.staffInterval) / 2;
      } else {
        // otherwise, find nearest acceptable third between staff lines (or staff line)
        step =
          (Math.ceil((1.5 * y) / ctxt.staffInterval - 0.5) * 2 +
            staffLineCountNonParity) /
          3;

        // if it's an odd step, that means we're on a staff line,
        // so we shift to between the staff line
        if (Math.abs(step) % 2 === staffLineCountNonParity) {
          if (
            Math.abs(step) < ctxt.staffLineCount ||
            ctxt.convertStaffPositionToSymmetric(ledgerLine.staffPosition) ===
              -step
          ) {
            step += 2 / 3;
          } else {
            // no ledger line, but we don't want the episema to be at exactly the same height the ledger line would occupy:
            step += 1 / 3;
          }
        }
      }
    } else {
      y = this.note.bounds.y - minDistanceAway; // the lowest the line could be at
      // convert y to be based around center Y between top and bottom staff lines so that it is symmetric:
      y += ctxt.staffLineCount * ctxt.staffInterval;

      step = Math.floor(y / ctxt.staffInterval);
      // if there's enough space, center the episema between the punctum and the next staff line
      if (Math.abs(step % 2) === staffLineCountParity) {
        step = (step - 3 / 4 + (y + minDistanceAway) / ctxt.staffInterval) / 2;
      } else {
        // otherwise, find nearest acceptable third between staff lines (or staff line)
        step =
          (Math.floor((1.5 * y) / ctxt.staffInterval - 0.5) * 2 +
            staffLineCountNonParity) /
          3;

        // find nearest acceptable third between staff lines (or staff line)
        if (Math.abs(step) % 2 === staffLineCountNonParity) {
          // if it was a staff line, we need to adjust
          if (
            Math.abs(step) < ctxt.staffLineCount ||
            ctxt.convertStaffPositionToSymmetric(ledgerLine.staffPosition) ===
              -step
          ) {
            step -= 2 / 3;
          } else {
            // no ledger line, but we don't want the episema to be at exactly the same height the ledger line would occupy:
            step -= 1 / 3;
          }
        }
      }
    }

    y = (step - ctxt.staffLineCount) * ctxt.staffInterval;

    var width = this.note.bounds.width;
    var x = this.note.bounds.x;

    // The porrectus requires special handling of the note width,
    // otherwise the width is just that of the note itself
    if (
      glyphCode === GlyphCode.Porrectus1 ||
      glyphCode === GlyphCode.Porrectus2 ||
      glyphCode === GlyphCode.Porrectus3 ||
      glyphCode === GlyphCode.Porrectus4
    )
      width = ctxt.staffInterval;
    else if (glyphCode === GlyphCode.None) {
      width = ctxt.staffInterval;
      x -= width;
    } else if (punctumInclinatumShorten) {
      width *= 2 / 3;
      x += 0.5 * width;
    } else if (glyphCode === GlyphCode.PunctumInclinatumLiquescent) {
      width *= 2 / 3;
      x += 0.25 * width;
    }

    // also, the position hint can affect the x/width of the episema
    if (this.alignment === HorizontalEpisemaAlignment.Left) {
      width *= 0.8;
    } else if (this.alignment === HorizontalEpisemaAlignment.Center) {
      x += width * 0.1;
      width *= 0.8;
    } else if (this.alignment === HorizontalEpisemaAlignment.Right) {
      x += width * 0.2;
      width *= 0.8;
    }

    this.bounds.x = x;
    this.bounds.y = y - ctxt.episemaLineWeight / 2;
    this.bounds.width = width;
    this.bounds.height = ctxt.episemaLineWeight;

    this.origin.x = 0;
    this.origin.y = 0;
  }

  draw(ctxt) {
    var canvasCtxt = ctxt.canvasCtxt;

    canvasCtxt.fillStyle = ctxt.neumeLineColor;

    canvasCtxt.fillRect(
      this.bounds.x,
      this.bounds.y,
      this.bounds.width,
      this.bounds.height
    );
  }

  getSvgProps(ctxt) {
    return {
      x: this.bounds.x,
      y: this.bounds.y,
      width: this.bounds.width,
      height: this.bounds.height,
      fill: ctxt.neumeLineColor,
      class: "horizontalEpisema"
    };
  }

  createSvgNode(ctxt) {
    return QuickSvg.createNode("rect", this.getSvgProps(ctxt));
  }
  createSvgTree(ctxt) {
    return QuickSvg.createSvgTree("rect", this.getSvgProps(ctxt));
  }

  createSvgFragment(ctxt) {
    return QuickSvg.createFragment("rect", this.getSvgProps(ctxt));
  }
}

/*
 * Ictus
 */
class Ictus extends GlyphVisualizer {
  constructor(ctxt, note) {
    super(ctxt, GlyphCode.VerticalEpisemaAbove);
    this.note = note;
    this.positionHint = MarkingPositionHint.Default;
  }

  performLayout(ctxt) {
    var glyphCode = this.note.glyphVisualizer.glyphCode;
    // we have to place the ictus further from the note in some cases to avoid a collision with an episema on the same note:
    var positionHint = this.positionHint || MarkingPositionHint.Below;
    var staffPosition =
      this.note.staffPosition +
      (positionHint === MarkingPositionHint.Above ? 1 : -1);
    var collisionWithEpisema =
      this.note.episemata.length > 0 &&
      (this.note.episemata[0].positionHint || MarkingPositionHint.Above) ===
        positionHint;
    var horizontalOffset;
    var verticalOffset = 1;
    var shortOffset = -0.2;
    var extraOffset = 0;
    var collisionWithStaffLine =
      staffPosition % 2 &&
      (Math.abs(ctxt.convertStaffPositionToSymmetric(staffPosition)) <
        ctxt.staffLineCount ||
        (this.note.neume.ledgerLines[0] || {}).staffPosition === staffPosition);

    // The porrectus requires special handling of the note width,
    // otherwise the width is just that of the note itself
    if (
      glyphCode === GlyphCode.Porrectus1 ||
      glyphCode === GlyphCode.Porrectus2 ||
      glyphCode === GlyphCode.Porrectus3 ||
      glyphCode === GlyphCode.Porrectus4
    )
      horizontalOffset = ctxt.staffInterval / 2;
    else if (glyphCode === GlyphCode.None) {
      horizontalOffset = -ctxt.staffInterval / 2;
    } else {
      horizontalOffset = this.note.bounds.width / 2;
      if (
        glyphCode === GlyphCode.PunctumInclinatum &&
        !collisionWithStaffLine &&
        !collisionWithEpisema
      ) {
        extraOffset = 0.3;
      }
    }

    if (this.positionHint === MarkingPositionHint.Above) {
      glyphCode = GlyphCode.VerticalEpisemaAbove;
      verticalOffset *= -1;
    } else {
      glyphCode = GlyphCode.VerticalEpisemaBelow;
    }
    if (collisionWithEpisema) {
      extraOffset = 0.4;
    }
    verticalOffset *=
      ctxt.staffInterval *
      (extraOffset + (collisionWithStaffLine ? 0.3 : shortOffset));

    this.setGlyph(ctxt, glyphCode);
    this.setStaffPosition(ctxt, staffPosition);

    this.bounds.x = this.note.bounds.x + horizontalOffset - this.origin.x;
    this.bounds.y += verticalOffset;
  }
}

/*
 * Mora
 */
class Mora extends GlyphVisualizer {
  constructor(ctxt, note) {
    super(ctxt, GlyphCode.Mora);
    this.note = note;
    this.positionHint = MarkingPositionHint.Default;
    this.horizontalOffset = ctxt.staffInterval / 2 + this.origin.x;
  }

  performLayout(ctxt) {
    this.setGlyph(ctxt, this.glyphCode);
    this.horizontalOffset = ctxt.staffInterval / 2 + this.origin.x;
    var staffPosition = this.note.staffPosition;

    this.setStaffPosition(ctxt, staffPosition);

    var verticalOffset = 0;
    // First, we need to find the next note in the neume.
    var noteIndex = this.note.neume.notes.indexOf(this.note);
    var nextNote;
    if (noteIndex >= 0) {
      ++noteIndex;
      if (this.note.neume.notes.length > noteIndex) {
        nextNote = this.note.neume.notes[noteIndex];
        if (
          nextNote.morae &&
          nextNote.morae.length &&
          this.note.neume.notes.length === noteIndex + 1
        ) {
          // this note is the second to last in its neume, and the last note also has a mora
          this.horizontalOffset +=
            nextNote.bounds.right() - this.note.bounds.right();
        } else if (nextNote.bounds.right() > this.note.bounds.right()) {
          // center the dot over the following note.
          this.horizontalOffset =
            (nextNote.bounds.right() -
              this.note.bounds.right() -
              this.bounds.right()) /
            2;
        } else {
          nextNote = null;
        }
      } else if (this.note.neume.notes.length === noteIndex) {
        // this note is the last in its neume:
        if (this.note.neume.trailingSpace === 0) {
          // if this was the last note in its neume, we only care about the next note if there is no trailing space at the end of this neume.
          var notationIndex = this.note.neume.score.notations.indexOf(
            this.note.neume
          );
          if (notationIndex >= 0) {
            var nextNotation =
              this.note.neume.score.notations[notationIndex + 1];
            if (nextNotation && nextNotation.notes) {
              nextNote = nextNotation.notes[0];
            }
          }
        } else if (this.note.shape !== NoteShape.Inclinatum) {
          this.note.neume.calculatedTrailingSpace += this.origin.x;
        }
      }
    }

    if (this.positionHint === MarkingPositionHint.Above) {
      if (staffPosition % 2 === 0) verticalOffset -= ctxt.staffInterval * 1.75;
      else verticalOffset -= ctxt.staffInterval * 0.75;
    } else if (this.positionHint === MarkingPositionHint.Below) {
      if (staffPosition % 2 === 0) verticalOffset += ctxt.staffInterval * 1.75;
      else verticalOffset += ctxt.staffInterval * 0.75;
    } else {
      if (staffPosition % 2 === 0) {
        // if the note is in a space and followed by a note on the line below, we often want to move the mora dot up slightly so that it is centered
        // between the top of the note's space and the top of the following note.
        if (nextNote && nextNote.staffPosition === staffPosition - 1) {
          verticalOffset -= ctxt.staffInterval * 0.25;
        }
      } else {
        verticalOffset -= ctxt.staffInterval * 0.75;
      }
    }
    this.bounds.x = this.horizontalOffset + this.note.bounds.right();
    this.bounds.y += verticalOffset;
  }
}

// indicates the shape of the brace
var BraceShape = {
  RoundBrace: 0,
  CurlyBrace: 1,
  AccentedCurlyBrace: 2
};

// indicates how the brace is alignerd to the note to which it's connected
var BraceAttachment = {
  Left: 0,
  Right: 1
};

class BracePoint extends ChantLayoutElement {
  constructor(note, isAbove, shape, attachment) {
    super();

    this.note = note;
    this.isAbove = isAbove;
    this.shape = shape;
    this.attachment = attachment;
  }

  getAttachmentX(note) {
    if (!note) note = this.note;
    if (this.attachment === BraceAttachment.Left)
      return (note.neume ? note.neume.bounds.x : 0) + note.bounds.x;
    else return (note.neume ? note.neume.bounds.x : 0) + note.bounds.right();
  }
}

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


/*
 *
 */
class Custos extends ChantNotationElement {
  // if auto is true, then the custos will automatically try to determine it's height based on
  // subsequent notations
  constructor(auto = false) {
    super();
    this.auto = auto;
    this.staffPosition = 2; // default sane value
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    if (this.auto) {
      var neume = ctxt.findNextNeume();

      if (neume) {
        const note = neume.notes[0];
        this.staffPosition =
          ctxt.activeClef.pitchToStaffPosition(note.pitch) +
          (note.staffPositionOffset || 0);
        this.staffPositionOffset = note.staffPositionOffset;
      }

      // in case there was a weird fa/do clef change, let's sanitize the staffPosition by making sure it is
      // within reasonable bounds
      while (this.staffPosition < -2) this.staffPosition += 7;

      while (this.staffPosition > 2 * ctxt.staffLineCount + 2)
        this.staffPosition -= 7;
    }

    var glyph = new GlyphVisualizer(
      ctxt,
      Custos.getGlyphCode(this.staffPosition, ctxt.staffLineCount)
    );
    glyph.setStaffPosition(ctxt, this.staffPosition);
    this.addVisualizer(glyph);

    this.finishLayout(ctxt);
  }

  // called when layout has changed and our dependencies are no longer good
  resetDependencies() {
    // we only need to resolve new dependencies if we're an automatic custos
    if (this.auto) this.needsLayout = true;
  }

  /**
   *
   * @param {number} staffPosition position of custos
   * @param {number} staffLineCount number of lines on staff
   * @returns
   */
  static getGlyphCode(staffPosition, staffLineCount = 4) {
    if (staffPosition <= staffLineCount * 2 - 2) {
      // ascending custos
      if (Math.abs(staffPosition) % 2 === 1) return GlyphCode.CustosLong;
      else return GlyphCode.CustosShort;
    } else {
      // descending custos
      if (Math.abs(staffPosition) % 2 === 1) return GlyphCode.CustosDescLong;
      else return GlyphCode.CustosDescShort;
    }
  }
}

/*
 * Divider
 */
class Divider extends ChantNotationElement {
  constructor(withCarryover = false) {
    super();

    this.isDivider = true;
    this.hasCarryover = withCarryover || false;
    this.resetsAccidentals = true;
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);
    if (this.hasCarryover) {
      const top = ctxt.staffLineCount * 2;
      const y = ctxt.calculateHeightFromStaffPosition(top);
      this.addVisualizer(
        new RoundBraceVisualizer(
          ctxt,
          -ctxt.staffInterval * 1.5,
          ctxt.staffInterval * 1.5,
          y,
          true
        )
      );
    }
  }
}

/*
 * QuarterBar
 */
class QuarterBar extends Divider {
  performLayout(ctxt) {
    super.performLayout(ctxt);
    const top = ctxt.staffLineCount * 2;
    this.addVisualizer(new DividerLineVisualizer(ctxt, top - 2, top, this));
    this.origin.x = this.bounds.width / 2;

    this.finishLayout(ctxt);
  }
}

/*
 * HalfBar
 */
class HalfBar extends Divider {
  performLayout(ctxt) {
    super.performLayout(ctxt);

    const offset = ctxt.staffLineCount === 2 ? 1.5 : 2;
    this.addVisualizer(
      new DividerLineVisualizer(
        ctxt,
        offset,
        ctxt.staffLineCount * 2 - offset,
        this
      )
    );

    this.origin.x = this.bounds.width / 2;

    this.finishLayout(ctxt);
  }
}

/*
 * FullBar
 */
class FullBar extends Divider {
  performLayout(ctxt) {
    super.performLayout(ctxt);

    this.addVisualizer(
      new DividerLineVisualizer(ctxt, 1, ctxt.staffLineCount * 2 - 1, this)
    );

    this.origin.x = this.bounds.width / 2;

    this.finishLayout(ctxt);
  }
}

/*
 * Insertion Cursor
 */
class InsertionCursor extends Divider {
  performLayout(ctxt) {
    super.performLayout(ctxt);
    this.cssClass = "InsertionCursor";

    this.addVisualizer(
      new DividerLineVisualizer(ctxt, 0, ctxt.staffLineCount * 2)
    );

    this.origin.x = this.bounds.width / 2;
    this.bounds.width = 0;
    this.bounds.height = 0;

    this.finishLayout(ctxt);
  }
}

/*
 * DominicanBar
 */
class DominicanBar extends Divider {
  constructor(staffPosition) {
    super();
    var parity = (staffPosition + 1) % 2;

    this.staffPosition = staffPosition - 2 * parity;
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);
    this.addVisualizer(
      new DividerLineVisualizer(
        ctxt,
        this.staffPosition,
        this.staffPosition + 3,
        this
      )
    );

    this.origin.x = this.bounds.width / 2;

    this.finishLayout(ctxt);
  }
}

/*
 * DoubleBar
 */
class DoubleBar extends Divider {
  performLayout(ctxt) {
    super.performLayout(ctxt);

    const top = ctxt.staffLineCount * 2 - 1;
    var line0 = new DividerLineVisualizer(ctxt, 1, top, this);
    line0.bounds.x = 0;
    this.addVisualizer(line0);

    var line1 = new DividerLineVisualizer(ctxt, 1, top, this);
    line1.bounds.x = ctxt.intraNeumeSpacing * 2 - line1.bounds.width;
    this.addVisualizer(line1);

    this.origin.x = this.bounds.width / 2;

    this.finishLayout(ctxt);
  }
}

const AccidentalType = {
  Flat: -1,
  Natural: 0,
  Sharp: 1
};

/*
 * Accidental
 */
class Accidental extends ChantNotationElement {
  constructor(staffPosition, accidentalType) {
    super();
    this.isAccidental = true;
    this.keepWithNext = true; // accidentals should always stay connected...

    this.staffPosition = staffPosition;
    this.accidentalType = accidentalType;
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    this.addVisualizer(this.createGlyphVisualizer(ctxt));

    this.finishLayout(ctxt);
  }

  // creation of the glyph visualizer is refactored out or performLayout
  // so that clefs can use the same logic for their accidental glyph
  createGlyphVisualizer(ctxt) {
    var glyphCode = GlyphCode.Flat;

    switch (this.accidentalType) {
      case AccidentalType.Natural:
        glyphCode = GlyphCode.Natural;
        break;
      case AccidentalType.Sharp:
        glyphCode = GlyphCode.Sharp;
        break;
      default:
        glyphCode = GlyphCode.Flat;
        break;
    }

    var glyph = new GlyphVisualizer(ctxt, glyphCode);
    glyph.setStaffPosition(ctxt, this.staffPosition);

    return glyph;
  }

  adjustStep(step) {
    switch (this.accidentalType) {
      case AccidentalType.Flat:
        if (step === Step.Ti) return Step.Te;
        if (step === Step.Mi) return Step.Me;
        break;
      case AccidentalType.Sharp:
        if (step === Step.Do) return Step.Du;
        if (step === Step.Fa) return Step.Fu;
        break;
      case AccidentalType.Natural:
        if (step === Step.Te) return Step.Ti;
        if (step === Step.Me) return Step.Mi;
        if (step === Step.Du) return Step.Do;
        if (step === Step.Fu) return Step.Fa;
        break;
    }

    // no adjustment needed
    return step;
  }

  applyToPitch(pitch) {
    // no adjusment needed
    if (this.pitch.octave !== pitch.octave) return;

    pitch.step = this.adjustStep(pitch.step);
  }
}

/*
 * Virgula
 */
class Virgula extends Divider {
  constructor(withCarryover = false) {
    super(withCarryover);

    // unlike other dividers a virgula does not reset accidentals
    this.resetsAccidentals = false;

    // the staff position of the virgula is customizable, so that it
    // can be placed on different lines (top or bottom) depending on the
    // notation tradition of what is being notated (e.g., Benedictine has it
    //  on top line, Norbertine at the bottom)
    this.staffPosition = 7;
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    var glyph = new GlyphVisualizer(ctxt, GlyphCode.Virgula);
    glyph.setStaffPosition(ctxt, this.staffPosition);

    this.addVisualizer(glyph);

    this.origin.x = this.bounds.width / 2;

    this.finishLayout(ctxt);
  }
}

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


// a chant line represents one staff line on the page. ChantLines are created by the score
// and laid out by the page
class ChantLine extends ChantLayoutElement {
  constructor(score) {
    super();

    this.score = score;

    this.notationsStartIndex = 0;
    this.numNotationsOnLine = 0;
    this.notationBounds = null; // Rect

    this.staffLeft = 0;
    this.staffRight = 0;

    this.startingClef = null; // necessary for the layout process
    this.custos = null;

    this.justify = true;

    // these are markings that exist at the chant line level rather than at the neume level.
    this.ledgerLines = [];
    this.braces = [];

    this.nextLine = null;
    this.previousLine = null; // for layout assistance

    this.lyricLineHeight = 0; // height of each text line
    this.lyricLineBaseline = 0; // offsets from the top of the text line to the baseline
    this.numLyricLines = 0; // maximum count of lyrics on the same syllable

    // fixme: make these configurable values from the score
    this.spaceAfterNotations = 0; // the space between the notation bounds and the first text track
    this.spaceBetweenTextTracks = 0; // spacing between each text track

    this.lastLyrics = [];
  }

  get staffSpaces() {
    return this.score.staffLineCount - 1;
  }

  performLayout(ctxt) {
    // start off with a rectangle that holds at least the four staff lines
    const staffSpaces = this.staffSpaces;
    const staffLineCount = this.score.staffLineCount;
    this.notationBounds = new Rect(
      this.staffLeft,
      -(
        ctxt.staffLineWeight / 2 +
        staffLineCount * 2 -
        1 +
        ctxt.minSpaceAboveStaff
      ) * ctxt.staffInterval,
      this.staffRight - this.staffLeft,
      (ctxt.staffLineWeight + staffSpaces * 2 + ctxt.minSpaceAboveStaff) *
        ctxt.staffInterval
    );

    // run through all the elements of the line and calculate the bounds of the notations,
    // as well as the bounds of each text track we will use
    var i;
    var notations = this.score.notations;
    var lastNeumeIndex =
      this.extraTextOnlyIndex === null
        ? this.notationsStartIndex + this.numNotationsOnLine
        : this.extraTextOnlyIndex;
    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;
    var notation = null;

    this.notationBounds.union(this.startingClef.bounds);

    // reset the lyric line offsets before we [re]calculate them now
    this.lyricLineHeight =
      ctxt.textStyles.lyric.size * (ctxt.textStyles.lyric.lineHeight || 1.1);
    this.lyricLineBaseline = 0;
    this.numLyricLines = 0;

    this.altLineHeight = 0;
    this.altLineBaseline = 0;
    this.numAltLines = 0;

    this.translationLineHeight =
      ctxt.textStyles.translation.size *
      (ctxt.textStyles.translation.lineHeight || 1.1);
    this.translationLineBaseline = 0;
    this.numTranslationLines = 0;

    const aboveLinesLineHeight =
      ctxt.textStyles.al.size * (ctxt.textStyles.al.lineHeight || 1.1);

    for (i = this.notationsStartIndex; i < lastNeumeIndex; i++) {
      notation = notations[i];

      if (notation.bounds.height || notation.bounds.width)
        this.notationBounds.union(notation.bounds);

      // keep track of lyric line offsets
      if (notation.lyrics.length && notation.lyrics[0].text) {
        // if (notation.lyrics[0].bounds.height > this.lyricLineHeight)
        //   this.lyricLineHeight = notation.lyrics[0].bounds.height;
        if (notation.lyrics[0].origin.y > this.lyricLineBaseline)
          this.lyricLineBaseline = notation.lyrics[0].origin.y;
        if (notation.lyrics.length > this.numLyricLines)
          this.numLyricLines = notation.lyrics.length;
      }

      if (notation.alText && this.numAltLines < notation.alText.length) {
        if (notation.alText[0].bounds.height > this.altLineHeight)
          this.altLineHeight = notation.alText[0].bounds.height;
        if (notation.alText[0].origin.y > this.altLineBaseline)
          this.altLineBaseline = notation.alText[0].origin.y;
        if (notation.alText.length > this.numAltLines)
          this.numAltLines = notation.alText.length;
      }

      if (
        notation.translationText &&
        notation.translationText[0] &&
        notation.translationText[0].text
      ) {
        // if (
        //   notation.translationText[0].bounds.height > this.translationLineHeight
        // )
        //   this.translationLineHeight =
        //     notation.translationText[0].bounds.height;
        if (notation.translationText[0].origin.y > this.translationLineBaseline)
          this.translationLineBaseline = notation.translationText[0].origin.y;
        if (notation.translationText.length > this.numTranslationLines)
          this.numTranslationLines = notation.translationText.length;
      }
    }

    if (this.custos) this.notationBounds.union(this.custos.bounds);

    // add any braces to the notationBounds as well
    for (i = 0; i < this.braces.length; i++)
      this.notationBounds.union(this.braces[i].bounds);

    // finalize the lyrics placement
    var notationBoundsOffset =
      this.notationBounds.bottom() +
      ctxt.minSpaceBelowStaff * ctxt.staffInterval;
    this.lyricLineBaseline += notationBoundsOffset;
    this.translationLineBaseline += notationBoundsOffset;
    this.altLineBaseline +=
      this.notationBounds.y - this.altLineHeight - ctxt.staffInterval * 0.5;

    for (i = this.notationsStartIndex; i < lastNeumeIndex; i++) {
      notation = notations[i];
      var offset = 0;
      for (var j = 0; j < notation.lyrics.length; j++) {
        notation.lyrics[j].bounds.y = offset + this.lyricLineBaseline;
        offset += this.lyricLineHeight;
      }

      if (notation.translationText) {
        for (j = 0; j < notation.translationText.length; j++) {
          notation.translationText[j].bounds.y =
            offset + this.translationLineBaseline;
          offset += this.translationLineHeight;
        }
      }

      if (notation.alText) {
        offset = 0;
        for (j = 0; j < notation.alText.length; j++) {
          notation.alText[j].bounds.y = offset + this.altLineBaseline;
          offset -= aboveLinesLineHeight;
        }
      }
    }

    this.extraTextOnlyHeight = 0;
    // handle placement of extra TextOnly elements:
    if (ctxt.useExtraTextOnly) {
      var extraTextOnlyLyricIndex = this.extraTextOnlyLyricIndex;
      if (this.extraTextOnlyIndex === null) {
        // even if extraTextOnlyIndex is null, there might be extra lines on the last lyric if it is TextOnly:
        let lastNotation = notations[lastNeumeIndex - 1] || {};
        if (lastNotation.constructor === ChantLineBreak)
          lastNotation = notations[lastNeumeIndex - 2];
        if (
          lastNotation.constructor === TextOnly &&
          lastNotation.lyrics.length === 1 &&
          lastNotation.lyrics[0].bounds.height > this.lyricLineHeight
        ) {
          this.extraTextOnlyHeight = this.lyricLineHeight;
        }
      } else {
        let lastLyrics = null;
        let xOffset = 0;
        offset = (this.numLyricLines - 1) * this.lyricLineHeight;
        offset += this.numTranslationLines * this.translationLineHeight;
        let extraLines = 0;
        for (i = this.extraTextOnlyIndex; i < lastIndex; i++) {
          notation = notations[i];
          if (!notation.lyrics[extraTextOnlyLyricIndex]) continue;
          lastLyrics = notation.lyrics[extraTextOnlyLyricIndex];
          if (lastLyrics.lineWidth) {
            xOffset = this.staffRight - lastLyrics.lineWidth;
            offset += this.lyricLineHeight;
            extraLines++;
          }
          extraLines += lastLyrics.numLines - 1;
          lastLyrics.bounds.y = offset + this.lyricLineBaseline;
          notation.bounds.x += xOffset;
        }
        this.extraTextOnlyHeight = this.lyricLineHeight * extraLines;
      }
    }

    if (this.startingClef.hasLyrics()) {
      offset = 0;
      for (j = 0; j < this.startingClef.lyrics.length; j++) {
        this.startingClef.lyrics[j].bounds.y = offset + this.lyricLineBaseline;
        offset += this.lyricLineHeight;
      }
    }

    // dropCap and the annotations
    if (this.notationsStartIndex === 0) {
      if (this.score.annotation !== null) {
        // annotations use dominant-baseline to align text to the top
        this.score.annotation.bounds.x = this.staffLeft / 2;
        this.score.annotation.bounds.y =
          -ctxt.staffInterval * (staffLineCount * 2 - 1);
        if (this.score.dropCap !== null) {
          var lowestPossibleAnnotationY =
            this.lyricLineBaseline -
            this.score.annotation.bounds.height -
            ctxt.staffInterval * ctxt.textStyles.annotation.padding -
            this.score.dropCap.origin.y;
          // if the annotation would overlap with the drop cap, move the annotation higher.
          // otherwise, center the annotation in the vertical space between the top of the drop cap and the top of the staff.
          if (lowestPossibleAnnotationY < this.score.annotation.bounds.y) {
            this.score.annotation.bounds.y = lowestPossibleAnnotationY;
          } else {
            this.score.annotation.bounds.y =
              (this.score.annotation.bounds.y + lowestPossibleAnnotationY) / 2;
          }
          if (this.score.annotation.bounds.y < this.notationBounds.y) {
            this.notationBounds.y = this.score.annotation.bounds.y;
            this.notationBounds.height +=
              this.notationBounds.y - this.score.annotation.bounds.y;
          }
        }
        this.score.annotation.bounds.y += this.score.annotation.origin.y;
      }

      if (this.score.dropCap !== null) {
        // drop caps and annotations are drawn from their center, so aligning them
        // horizontally is as easy as this.staffLeft / 2
        this.score.dropCap.bounds.x = this.staffLeft / 2;
        this.score.dropCap.bounds.y =
          this.lyricLineBaseline - this.score.dropCap.origin.y;
        this.notationBounds.union(this.score.dropCap.bounds);
        this.score.dropCap.bounds.y = this.lyricLineBaseline;
      }
    }

    if (this.numLyricLines > 0) {
      // add up the lyric line heights to get the total height of the chant line
      var lyricAndTextRect = new Rect(
        0,
        notationBoundsOffset,
        0,
        this.lyricLineHeight * this.numLyricLines +
          this.extraTextOnlyHeight +
          this.translationLineHeight * this.numTranslationLines
      );
      this.notationBounds.union(lyricAndTextRect);
    }
    if (this.numAltLines > 0) {
      var altLineTextRect = new Rect(
        0,
        this.notationBounds.y -
          this.altLineHeight -
          0.5 * ctxt.staffInterval -
          aboveLinesLineHeight * (this.numAltLines - 1),
        0,
        aboveLinesLineHeight * this.numAltLines
      );
      this.notationBounds.union(altLineTextRect);
    }
    // Ensure that there is at least minSpaceBelowStaff below the lowest staff line:
    this.notationBounds.union(
      new Rect(
        0,
        -ctxt.staffInterval, // lowest staff line
        0,
        (ctxt.staffLineWeight / 2 + ctxt.minSpaceBelowStaff) *
          ctxt.staffInterval
      )
    );
    var totalHeight = this.notationBounds.height;

    this.bounds.x = 0;
    this.bounds.y = this.notationBounds.y;
    this.bounds.width = this.notationBounds.right();
    this.bounds.height = totalHeight;

    // the origin of the chant line's coordinate space is at the center line of the left extremity of the staff
    this.origin = new Point(this.staffLeft, -this.notationBounds.y);
  }

  // TODO: remove if not necsessary
  layoutInsertionCursor(ctxt) {
    if (this.insertionCursor) {
      // we have either a Notation to draw the cursor after, or the ChantLine itself when the cursor is the first thing on the line
      this.insertionCursor.performLayout(ctxt);
      this.insertionCursor.bounds.x =
        this.score.insertionElement.bounds.right() +
        ((this.score.insertionElement.trailingSpace &&
          this.score.insertionElement.calculatedTrailingSpace) ||
          0) /
          2 -
        this.insertionCursor.origin.x;
    }
    return this.insertionCursor;
  }

  draw(ctxt) {
    var canvasCtxt = ctxt.canvasCtxt;

    canvasCtxt.translate(this.bounds.x, this.bounds.y);

    // draw the staff lines
    var i,
      x1 = this.staffLeft,
      x2 = this.staffRight,
      y;
    canvasCtxt.lineWidth = ctxt.staffLineWeight;
    canvasCtxt.strokeStyle = ctxt.staffLineColor;

    for (i = this.score.staffLineCount * -2 + 1; i < 0; i += 2) {
      y = ctxt.staffInterval * i;

      canvasCtxt.beginPath();
      canvasCtxt.moveTo(x1, y);
      canvasCtxt.lineTo(x2, y);
      canvasCtxt.stroke();
    }

    if (this.layoutInsertionCursor(ctxt)) {
      this.insertionCursor.draw(ctxt);
    }

    // draw the ledger lines
    for (i = 0; i < this.ledgerLines.length; i++) {
      var ledgerLine = this.ledgerLines[i];
      y = ctxt.calculateHeightFromStaffPosition(ledgerLine.staffPosition);

      canvasCtxt.beginPath();
      canvasCtxt.moveTo(ledgerLine.x1, y);
      canvasCtxt.lineTo(ledgerLine.x2, y);
      canvasCtxt.stroke();
    }

    // fixme: draw the braces

    // draw the dropCap and the annotations
    if (this.notationsStartIndex === 0) {
      if (this.score.dropCap !== null) this.score.dropCap.draw(ctxt);

      if (
        this.score.annotation !== null &&
        (!ctxt.mergeAnnotationWithTextLeft || this.score.dropCap)
      )
        // only draw it if there is a dropCap or there is no mergeAnnotationWithTextLeft
        this.score.annotation.draw(ctxt);
    }

    // draw the notations
    var notations = this.score.notations;
    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;

    for (i = this.notationsStartIndex; i < lastIndex; i++)
      notations[i].draw(ctxt);

    this.startingClef.draw(ctxt);

    if (this.custos) this.custos.draw(ctxt);

    canvasCtxt.translate(-this.bounds.x, -this.bounds.y);
  }

  getInnerNodes(
    ctxt,
    top = 0,
    functionNames = { quickSvg: "createNode", elements: "createSvgNode" }
  ) {
    var inner = [];

    // add the chant lines
    var i,
      x1 = this.staffLeft,
      x2 = this.staffRight;
    const staffSpaces = this.staffSpaces;
    if (ctxt.editable) {
      inner.push(
        QuickSvg[functionNames.quickSvg]("rect", {
          key: "insertion",
          x: x1,
          y: ctxt.staffInterval * this.score.staffLineCount * -2 + 1,
          width: x2 - x1,
          height: ctxt.staffInterval * 2 * staffSpaces,
          fill: "none"
        })
      );
    }

    // create the staff lines
    for (i = this.score.staffLineCount * -2 + 1; i < 0; i += 2) {
      inner.push(
        QuickSvg[functionNames.quickSvg]("line", {
          key: i,
          x1: x1,
          y1: ctxt.staffInterval * i,
          x2: x2,
          y2: ctxt.staffInterval * i,
          stroke: ctxt.staffLineColor,
          "stroke-width": ctxt.staffLineWeight,
          class: "staffLine"
        })
      );
    }

    inner = [
      QuickSvg[functionNames.quickSvg]("g", { class: "staffLines" }, inner)
    ];

    if (this.layoutInsertionCursor(ctxt)) {
      inner.push(this.insertionCursor[functionNames.elements](ctxt));
    }

    // create the ledger lines
    for (i = 0; i < this.ledgerLines.length; i++) {
      var ledgerLine = this.ledgerLines[i];
      var y = ctxt.calculateHeightFromStaffPosition(ledgerLine.staffPosition);

      inner.push(
        QuickSvg[functionNames.quickSvg]("line", {
          x1: ledgerLine.x1,
          y1: y,
          x2: ledgerLine.x2,
          y2: y,
          stroke: ctxt.staffLineColor,
          "stroke-width": ctxt.staffLineWeight,
          class: "ledgerLine"
        })
      );
    }

    // add any braces
    for (i = 0; i < this.braces.length; i++)
      inner.push(this.braces[i][functionNames.elements](ctxt));

    // dropCap and the annotations
    if (this.notationsStartIndex === 0) {
      if (this.score.dropCap !== null)
        inner.push(this.score.dropCap[functionNames.elements](ctxt));

      if (
        this.score.annotation !== null &&
        (!ctxt.mergeAnnotationWithTextLeft || this.score.dropCap)
      )
        // only draw it if there is a dropCap or there is no mergeAnnotationWithTextLeft
        inner = inner.concat(
          this.score.annotation[functionNames.elements](ctxt)
        );
    }

    inner.push(this.startingClef[functionNames.elements](ctxt));

    var notations = this.score.notations;
    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;

    // add all of the notations
    for (i = this.notationsStartIndex; i < lastIndex; i++)
      inner.push(notations[i][functionNames.elements](ctxt));

    if (this.custos) inner.push(this.custos[functionNames.elements](ctxt));
    return inner;
  }

  createSvgNode(ctxt, top = 0) {
    let inner = this.getInnerNodes(ctxt, top, {
      quickSvg: "createNode",
      elements: "createSvgNode"
    });

    return QuickSvg.createNode(
      "g",
      {
        class: "chantLine",
        transform:
          "translate(" + this.bounds.x + "," + (this.bounds.y - top) + ")",
        "element-index": this.elementIndex,
        source: this
      },
      inner
    );
  }

  createSvgTree(ctxt, top = 0) {
    let inner = this.getInnerNodes(ctxt, top, {
      quickSvg: "createSvgTree",
      elements: "createSvgTree"
    });

    return QuickSvg.createSvgTree(
      "g",
      {
        class: "chantLine",
        transform:
          "translate(" + this.bounds.x + "," + (this.bounds.y - top) + ")",
        "element-index": this.elementIndex
      },
      ...inner
    );
  }

  createSvgFragment(ctxt, top = 0) {
    var inner = "";

    // add the chant lines
    var i,
      x1 = this.staffLeft,
      x2 = this.staffRight;

    // create the staff lines
    for (i = this.score.staffLineCount * -2 + 1; i < 0; i += 2) {
      inner += QuickSvg.createFragment("line", {
        x1: x1,
        y1: ctxt.staffInterval * i,
        x2: x2,
        y2: ctxt.staffInterval * i,
        stroke: ctxt.staffLineColor,
        "stroke-width": ctxt.staffLineWeight,
        class: "staffLine"
      });
    }

    inner = QuickSvg.createFragment("g", { class: "staffLines" }, inner);

    if (this.layoutInsertionCursor(ctxt)) {
      inner += this.insertionCursor.createSvgFragment(ctxt);
    }

    // create the ledger lines
    for (i = 0; i < this.ledgerLines.length; i++) {
      var ledgerLine = this.ledgerLines[i];
      var y = ctxt.calculateHeightFromStaffPosition(ledgerLine.staffPosition);

      inner += QuickSvg.createFragment("line", {
        x1: ledgerLine.x1,
        y1: y,
        x2: ledgerLine.x2,
        y2: y,
        stroke: ctxt.staffLineColor,
        "stroke-width": ctxt.staffLineWeight,
        class: "ledgerLine"
      });
    }

    // add any braces
    for (i = 0; i < this.braces.length; i++)
      inner += this.braces[i].createSvgFragment(ctxt);

    // dropCap and the annotations
    if (this.notationsStartIndex === 0) {
      if (this.score.dropCap !== null)
        inner += this.score.dropCap.createSvgFragment(ctxt);

      if (
        this.score.annotation !== null &&
        (!ctxt.mergeAnnotationWithTextLeft || this.score.dropCap)
      )
        // only draw it if there is a dropCap or there is no mergeAnnotationWithTextLeft
        inner += this.score.annotation.createSvgFragment(ctxt);
    }

    inner += this.startingClef.createSvgFragment(ctxt);

    var notations = this.score.notations;
    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;

    // add all of the notations
    for (i = this.notationsStartIndex; i < lastIndex; i++)
      inner += notations[i].createSvgFragment(ctxt);

    if (this.custos) inner += this.custos.createSvgFragment(ctxt);

    return QuickSvg.createFragment(
      "g",
      {
        class: "chantLine",
        transform:
          "translate(" + this.bounds.x + "," + (this.bounds.y - top) + ")",
        "element-index": this.elementIndex
      },
      inner
    );
  }

  // code below based on code by: https://gist.github.com/alexhornbake
  //
  // optimized for braces that are only drawn horizontally.
  // returns svg path string ready to insert into svg doc
  generateCurlyBraceDrawable(ctxt, x1, x2, y, isAbove) {
    var h;

    if (isAbove) h = -ctxt.staffInterval / 2;
    else h = ctxt.staffInterval / 2;

    // and q factor, .5 is normal, higher q = more expressive bracket
    var q = 0.6;

    var len = x2 - x1;

    //Calculate Control Points of path,
    var qx1 = x1;
    var qy1 = y + q * h;
    var qx2 = x1 + 0.25 * len;
    var qy2 = y + (1 - q) * h;
    var tx1 = x1 + 0.5 * len;
    var ty1 = y + h;
    var qx3 = x2;
    var qy3 = y + q * h;
    var qx4 = x1 + 0.75 * len;
    var qy4 = y + (1 - q) * h;
    var d =
      "M " +
      x1 +
      " " +
      y +
      " Q " +
      qx1 +
      " " +
      qy1 +
      " " +
      qx2 +
      " " +
      qy2 +
      " T " +
      tx1 +
      " " +
      ty1 +
      " M " +
      x2 +
      " " +
      y +
      " Q " +
      qx3 +
      " " +
      qy3 +
      " " +
      qx4 +
      " " +
      qy4 +
      " T " +
      tx1 +
      " " +
      ty1;

    return QuickSvg.createFragment("path", {
      d: d,
      stroke: ctxt.neumeLineColor,
      "stroke-width": ctxt.neumeLineWeight + "px",
      fill: "none"
    });
  }

  buildFromChantNotationIndex(ctxt, newElementStart, width) {
    // todo: reset / clear the children we have in case they have data
    var notations = this.score.notations,
      beginningLyrics = null,
      prev = null,
      prevNeume = null,
      prevLyrics = [];
    var condensableSpaces = [];
    this.notationsStartIndex = newElementStart;
    this.numNotationsOnLine = 0;

    this.staffLeft = 0;
    this.paddingLeft = 0;

    this.extraTextOnlyIndex = null;
    this.extraTextOnlyLyricIndex = 0;

    if (width > 0) this.staffRight = width;
    else this.staffRight = Infinity; // no limit to staff size

    // If this is the first chant line, then we have to make room for a
    // drop cap and/or annotation, if present
    if (this.notationsStartIndex === 0) {
      var padding = 0;

      if (this.score.dropCap)
        padding =
          this.score.dropCap.bounds.width + this.score.dropCap.padding * 2;

      if (
        this.score.annotation &&
        (!ctxt.mergeAnnotationWithTextLeft || this.score.dropCap)
      )
        padding = Math.max(
          padding,
          this.score.annotation.bounds.width + this.score.annotation.padding * 2
        );

      this.staffLeft += padding;
      if (this.score.dropCap)
        this.paddingLeft = (padding - this.score.dropCap.bounds.width) / 2;
    } else {
      prev = notations[newElementStart - 1];
      if (
        prev.constructor === DoubleBar &&
        prev.hasLyrics() &&
        (prev.lyrics.length > 1 || !prev.lyrics[0].text.match(/^(i\.?)+j\.?/))
      ) {
        beginningLyrics = prev.lyrics.map((lyric) => {
          var newLyric = new Lyric(
            ctxt,
            lyric.originalText,
            lyric.lyricType,
            lyric.notation,
            lyric.notations,
            lyric.sourceIndex
          );
          newLyric.elidesToNext = lyric.elidesToNext;
          // Hide the original lyric by setting its bounds.y to an extremely high number.
          // If the chant is re-laid out, this value will be recalculated so that it won't stay hidden.
          lyric.bounds.y = Number.MAX_SAFE_INTEGER;
          return newLyric;
        });
        var minX = beginningLyrics
          .map((l) => l.bounds.x)
          .reduce((a, b) => (a < b ? a : b));
        beginningLyrics.forEach((l) => {
          l.bounds.x -= minX;
        });
      }
    }

    // set up the clef...
    // if the first notation on the line is a starting clef, then we treat it a little differently...
    // the clef becomes this line's starting clef and we skip over the clef in the notations array
    if (notations.length && notations[newElementStart].isClef) {
      ctxt.activeClef = notations[newElementStart];
      newElementStart++;
      this.notationsStartIndex++;
    }

    // make a copy for this line to use at the beginning
    this.startingClef = ctxt.activeClef.clone();
    this.startingClef.performLayout(ctxt);
    this.startingClef.bounds.x = this.staffLeft;

    var curr = this.startingClef;

    if (beginningLyrics) {
      LyricArray.setNotation(beginningLyrics, curr);
    }

    // estimate how much space we have available to us
    var rightNotationBoundary =
      this.staffRight - Glyphs.CustosLong.bounds.width * ctxt.glyphScaling; // possible custos on the line
    var lastTranslationTextWithEndNeume = null;

    // iterate through the notations, fittng what we can on this line
    var i,
      j,
      lastNotationIndex = notations.length - 1;

    if (curr.hasLyrics()) LyricArray.mergeIn(this.lastLyrics, curr.lyrics);

    // if we already have a start brace on the context, we must be continuing it from the previous system.
    if (ctxt.lastStartBrace && !ctxt.lastStartBrace.note) {
      ctxt.lastStartBrace.note = this.startingClef;
    }
    var lastLyricsBeforeTextOnly;
    var textOnlyStartIndex;

    for (i = newElementStart; i <= lastNotationIndex; i++) {
      prev = curr;
      if (curr.constructor !== TextOnly) prevNeume = curr;

      curr = notations[i];

      var actualRightBoundary;
      if (
        i === lastNotationIndex ||
        curr.constructor === Custos ||
        (prev.constructor === Custos && curr.isDivider) ||
        (curr.constructor === ChantLineBreak &&
          prevNeume.constructor === Custos)
      ) {
        // on the last notation of the score, we don't need a custos or trailing space, so we use staffRight as the
        // right boundary.
        // Also, if the current notation is a divider and the previous was a custos, we don't need extra space
        // because if the following notation won't fit, we can switch the order and use the custos as the end-of-the-line custos
        // Ditto in the case of the current element being a chant line break and the previous neume a custos, because that custos will become our end-of-line custos
        actualRightBoundary = this.staffRight;
      } else if (i === lastNotationIndex - 1) {
        // on the penultimate notation, make sure there is at least enough room for whichever takes up less space,
        // between the final notation and a custos:
        actualRightBoundary = Math.max(
          rightNotationBoundary,
          this.staffRight - notations[lastNotationIndex].bounds.width
        );
      } else {
        // Otherwise, we use rightNotationBoundary, which leaves room for a custos...
        actualRightBoundary = rightNotationBoundary;
      }

      // First check if we're already beyond the rightNotationBoundary (due to condensing that hasn't yet happened) and have a good element to end with
      // but if we have 2 or fewer elements, or if the current element is a line break or a custos, we'll go ahead and try for them anyway.
      var forceBreak =
        !curr.isDivider &&
        curr.constructor !== ChantLineBreak &&
        curr.constructor !== Custos &&
        !(
          curr.constructor === TextOnly &&
          curr.hasLyrics() &&
          /^(?:[*†]|i+j\.?)$/.test(curr.lyrics[0].text)
        ) &&
        lastNotationIndex - i > 1 &&
        !prevNeume.keepWithNext &&
        prevNeume.bounds.right() >= rightNotationBoundary;

      // also force a break if we've run into extra TextOnly elements, but the current notation is not a TextOnly and has lyrics
      forceBreak =
        forceBreak ||
        (this.extraTextOnlyIndex !== null &&
          curr.constructor !== TextOnly &&
          curr.constructor !== ChantLineBreak &&
          curr.constructor !== Custos &&
          curr.hasLyrics());

      if (curr instanceof TextOnly && prev === prevNeume) {
        lastLyricsBeforeTextOnly = this.lastLyrics.slice();
        textOnlyStartIndex = i;
      }
      if (
        curr instanceof TextOnly &&
        notations[textOnlyStartIndex] &&
        !notations[textOnlyStartIndex].hasLyrics()
      ) {
        // we want textOnlyStartIndex to be the first TextOnly that actually has lyrics,
        // so if the current "textOnlyStart" element does not have lyrics, and we have another textOnly
        // that does have lyrics, we will use it instead
        textOnlyStartIndex = i;
      }

      if (curr.hasLyrics() && curr.lyrics[0].needsLayout) {
        curr.lyrics[0].recalculateMetrics(ctxt);
      }

      // try to fit the curr element on this line.
      // if it doesn't fit, we finish up here.
      var fitsOnLine =
        !forceBreak &&
        this.positionNotationElement(
          ctxt,
          this.lastLyrics,
          prevNeume,
          curr,
          actualRightBoundary,
          this.extraTextOnlyIndex ? [] : condensableSpaces // no spaces are condensable once we are on extra text only lyrics
        );
      var candidateForExtraTextOnlyLine =
        ctxt.useExtraTextOnly &&
        curr.constructor === TextOnly &&
        LyricArray.hasOnlyOneLyric(curr.lyrics) &&
        (fitsOnLine === false || this.extraTextOnlyIndex !== null);
      var extraTextOnlyLyricIndex;
      if (candidateForExtraTextOnlyLine && this.extraTextOnlyIndex === null) {
        // check to make sure there is enough text to put on the text only line:
        extraTextOnlyLyricIndex = LyricArray.indexOfLyric(curr.lyrics);
        if (textOnlyStartIndex === i) {
          var currentLyric = notations[i].lyrics[extraTextOnlyLyricIndex].text;
          if (currentLyric.length <= 1) {
            var nextNotation = notations[i + 1];
            candidateForExtraTextOnlyLine =
              nextNotation &&
              nextNotation.constructor === TextOnly &&
              nextNotation.lyrics[extraTextOnlyLyricIndex] &&
              nextNotation.lyrics[extraTextOnlyLyricIndex].text.length > 0;
          }
        }
      }
      if (candidateForExtraTextOnlyLine) {
        // a special case for TextOnly elements that don't fit on the line: since they don't have neumes associated with them, we can place this
        // and any additional TextOnly elements just below the current lyric lines, but we can only do this if the TextOnly elements have only one
        // line of lyrics associated with them.
        var firstOnLine;
        extraTextOnlyLyricIndex = this.extraTextOnlyLyricIndex;
        if (
          this.extraTextOnlyIndex === null &&
          notations[textOnlyStartIndex].lyrics.length
        ) {
          if (
            textOnlyStartIndex === this.notationsStartIndex ||
            !ctxt.startExtraTextOnlyFromFirst
          ) {
            textOnlyStartIndex = i;
            let lastNotationWithLyrics = notations
              .slice(this.notationsStartIndex, i)
              .reverse()
              .find((notation) => notation.hasLyrics());
            lastLyricsBeforeTextOnly =
              (lastNotationWithLyrics &&
                lastNotationWithLyrics.lyrics.slice()) ||
              [];
          }
          // go back to the first in this string of consecutive TextOnly elements.
          this.extraTextOnlyIndex = textOnlyStartIndex;
          extraTextOnlyLyricIndex = this.extraTextOnlyLyricIndex =
            LyricArray.indexOfLyric(curr.lyrics);
          this.lastLyricsBeforeTextOnly = lastLyricsBeforeTextOnly;
          this.lastLyrics = [];
          i = textOnlyStartIndex - 1;
          this.numNotationsOnLine =
            textOnlyStartIndex - this.notationsStartIndex;
          continue;
        }
        delete curr.lyrics[extraTextOnlyLyricIndex].lineWidth;
        if (!fitsOnLine || i === this.extraTextOnlyIndex) {
          curr.bounds.x = curr.lyrics[extraTextOnlyLyricIndex].origin.x;
          let lastLyricRight = ctxt.startExtraTextOnlyFromFirst
            ? LyricArray.getRight(this.lastLyrics) +
              (ctxt.minLyricWordSpacing || 0)
            : 0;
          curr.lyrics[extraTextOnlyLyricIndex].setMaxWidth(
            ctxt,
            this.staffRight,
            this.staffRight - lastLyricRight
          );
          firstOnLine = curr;
        }
        if (firstOnLine)
          firstOnLine.lyrics[extraTextOnlyLyricIndex].lineWidth =
            curr.lyrics[extraTextOnlyLyricIndex].getRight();
      } else if (fitsOnLine === false) {
        const isTextOnlyBeforeDivider = (i) => {
          const curr = notations[i];
          if (curr.constructor !== TextOnly) return false;
          const firstDivider = notations
            .slice(i + 1)
            .findIndex((notation) => notation.isDivider);
          if (firstDivider < 0) return false;
          return notations
            .slice(i + 1, i + 1 + firstDivider)
            .every((notation) => notation.constructor === TextOnly);
        };
        // first check for elements that cannot begin a system: dividers and custodes
        while (
          this.numNotationsOnLine > 1 &&
          (curr.isDivider ||
            curr.constructor === Custos ||
            isTextOnlyBeforeDivider(i))
        ) {
          curr = notations[--i];
          this.numNotationsOnLine--;
          if (this.lastLyricsBeforeTextOnly && isTextOnlyBeforeDivider(i)) {
            delete this.lastLyricsBeforeTextOnly;
          }
        }

        // count syllables and notes
        const notationsAfterBreak = notations.slice(i + 1);
        let countSyllables = 0;
        let countNotes = 0;
        if (ctxt.minSyllablesLastLine && ctxt.minNotesLastLine) {
          countSyllables = notationsAfterBreak.filter((notation) =>
            notation.hasLyrics()
          ).length;
          countNotes = notationsAfterBreak
            .flatMap((notation) => notation.notes)
            .filter((note) => !!note).length;
        }

        // check if the prev elements want to be kept with this one
        for (j = i - 1; j > this.notationsStartIndex; j--) {
          var cne = notations[j];
          curr = notations[j + 1];

          // curr is the first notation on the next line
          // cne is the last notation on this line
          if (ctxt.minSyllablesLastLine && ctxt.minNotesLastLine) {
            countSyllables += curr.hasLyrics() ? 1 : 0;
            countNotes += (curr.notes || []).length;
          }

          if (cne.firstWithNoWidth) {
            this.numNotationsOnLine--;
            continue;
          }

          // don't let a line break occur in the middle of a translation
          if (lastTranslationTextWithEndNeume) {
            this.numNotationsOnLine--;
            if (cne === lastTranslationTextWithEndNeume) {
              lastTranslationTextWithEndNeume = null;
            }
            continue;
          }

          // force any notations starting with a quilisma or inclinatum (diamond) to be kept with the previous notation:
          if (
            curr &&
            curr.notes &&
            (curr.notes[0].shape === NoteShape.Quilisma ||
              curr.notes[0].shape === NoteShape.Inclinatum)
          ) {
            this.numNotationsOnLine--;
            continue;
          }

          if (
            countSyllables < ctxt.minSyllablesLastLine &&
            countNotes < ctxt.minNotesLastLine
          ) {
            this.numNotationsOnLine--;
            continue;
          }

          // if the line break is allowed (cne.allowLineBreakBeforeNext), keep this number of notations around so we can check during justification
          // whether there would be too much space introduced between
          if (cne.keepWithNext === true) {
            if (cne.allowLineBreakBeforeNext && !this.maxNumNotationsOnLine)
              this.maxNumNotationsOnLine = this.numNotationsOnLine;
            this.numNotationsOnLine--;
          } else break;
        }
        if (
          this.extraTextOnlyIndex &&
          this.notationsStartIndex + this.numNotationsOnLine <=
            this.extraTextOnlyIndex
        ) {
          // we've cut back to before the extra text only index, so we have to remove it:
          this.extraTextOnlyIndex = null;
        }

        // if for some reason not a single notation can fit on the line, we'd better put it on anyway, to avoid an infinite loop:
        if (this.numNotationsOnLine === 0) this.numNotationsOnLine = 1;

        // determine the neumes we can space apart, if we do end up justifying
        curr = this.findNeumesToJustify(prevLyrics);

        this.lastLyrics = prevLyrics;
        if (this.maxNumNotationsOnLine) {
          // Check whether we should squeeze some extra notations on the line to avoid too much space after justification:
          // Check how much space we would have without the extra notations
          var extraSpace = this.getWhitespaceOnRight(ctxt);
          if (
            extraSpace / this.toJustify.length >
            ctxt.staffInterval * ctxt.maxExtraSpaceInStaffIntervals
          ) {
            LyricArray.mergeInArray(
              prevLyrics,
              notations.slice(
                this.notationsStartIndex + this.numNotationsOnLine,
                this.notationsStartIndex + this.maxNumNotationsOnLine
              )
            );
            this.numNotationsOnLine = this.maxNumNotationsOnLine;
            delete this.maxNumNotationsOnLine;
          }
        }

        // if the next line begins with a fresh word, than there can be extra space between the last notation on this line and the custos:
        let next =
          this.score.notations[
            this.extraTextOnlyIndex === null
              ? this.notationsStartIndex + this.numNotationsOnLine
              : this.extraTextOnlyIndex
          ];
        if (
          next &&
          next.hasLyrics() &&
          (next.lyrics[0].lyricType === LyricType.BeginningSyllable ||
            next.lyrics[0].lyricType === LyricType.SingleSyllable)
        ) {
          this.toJustify.push(this.custos);
        }

        if (
          j >= 1 &&
          notations[j].isDivider &&
          notations[j - 1].constructor === Custos
        ) {
          // reverse the order: put the divider first, and end the line with the custos.
          prevLyrics = [];
          for (i = j - 2; i >= this.notationsStartIndex; i--) {
            if (notations[i].hasLyrics()) {
              LyricArray.mergeIn(prevLyrics, notations[i].lyrics);
              break;
            }
          }
          // remove the custos and divider from the condensable spaces list, before adding the divider back, when repositioning it.
          condensableSpaces.sum -= condensableSpaces.pop().condensable;
          condensableSpaces.sum -= condensableSpaces.pop().condensable;
          this.positionNotationElement(
            ctxt,
            prevLyrics,
            notations[j - 2],
            notations[j],
            this.staffRight,
            condensableSpaces
          );
          this.custos = notations[j - 1];
          this.custos.bounds.x =
            this.staffRight -
            this.custos.bounds.width -
            this.custos.leadingSpace;
        }

        // we are at the end of the line!
        break;
      }

      if (curr.hasLyrics()) LyricArray.mergeIn(this.lastLyrics, curr.lyrics);

      if (
        lastTranslationTextWithEndNeume &&
        curr === lastTranslationTextWithEndNeume.translationText[0].endNeume
      ) {
        lastTranslationTextWithEndNeume = null;
      } else if (
        curr.translationText &&
        curr.translationText.length &&
        curr.translationText[0].endNeume
      ) {
        lastTranslationTextWithEndNeume = curr;
      }

      curr.line = this;
      this.numNotationsOnLine++;

      if (curr.isClef) ctxt.activeClef = curr;

      // line breaks are a special case indicating to stop processing here
      if (curr.constructor === ChantLineBreak && width > 0) {
        this.justify =
          curr.justify ||
          this.extraTextOnlyIndex !== null ||
          this.getWhitespaceOnRight(ctxt) < 0;
        if (this.justify) this.findNeumesToJustify(prevLyrics);
        break;
      }

      if (curr.constructor === Custos) {
        this.custos = curr;
      } else if (curr.isNeume) {
        this.custos = null;
      }
    }

    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine - 1;
    var last = notations[lastIndex] || {};
    while (
      lastIndex > 0 &&
      (last.constructor === ChantLineBreak ||
        last.constructor === Custos ||
        last.constructor === TextOnly)
    ) {
      last = notations[--lastIndex];
    }
    var isLastLine =
      this.notationsStartIndex + this.numNotationsOnLine === notations.length;
    if (
      (this.justify && this.extraTextOnlyIndex !== null) ||
      (width > 0 && isLastLine)
    ) {
      // this is the last chant line, or it has extra TextOnly elements at the end
      if (!this.toJustify) this.findNeumesToJustify(prevLyrics);
      this.justify =
        (!isLastLine || last.isDivider) &&
        this.getWhitespaceOnRight(ctxt) / (this.toJustify.length || 1) <=
          ctxt.staffInterval * ctxt.maxExtraSpaceInStaffIntervals;
    }

    if (!this.custos) {
      // create the automatic custos at the end of the line if there are neumes left in the notations
      for (
        i = this.notationsStartIndex + this.numNotationsOnLine;
        i < notations.length;
        i++
      ) {
        var notation = notations[i];

        if (notation.isNeume) {
          this.custos = new Custos(true);
          ctxt.currNotationIndex = i - 1; // make sure the context knows where the custos is
          this.custos.performLayout(ctxt);

          if (this.justify) {
            // Put the custos at the very end of the line
            this.custos.bounds.x =
              this.staffRight -
              this.custos.bounds.width -
              this.custos.leadingSpace;
          } else {
            this.custos.bounds.x =
              prevNeume.bounds.right() + prevNeume.calculatedTrailingSpace;
          }
          // nothing more to see here...
          break;
        }
      }
    }

    if (this.lastLyricsBeforeTextOnly) {
      this.lastLyrics = this.lastLyricsBeforeTextOnly;
      delete this.lastLyricsBeforeTextOnly;
    }

    // find the final lyric and mark it as connecting if needed.
    if (width > 0) {
      var whitespace = this.getWhitespaceOnRight();
      var rightEdge = this.staffRight;
      if (whitespace < 0) {
        rightEdge -= whitespace;
      }
    }
    i = 0;
    while (this.lastLyrics && this.lastLyrics[i]) {
      let lyrics = this.lastLyrics[i];
      if (lyrics.allowsConnector()) {
        lyrics.setNeedsConnector(true, 0);
        if (width > 0 && ctxt.minLyricWordSpacing < ctxt.hyphenWidth) {
          whitespace = rightEdge - lyrics.getRight();
          // shrink the hyphen if we are already out of whitespace or if we would be if we used a regular hyphen:
          if (whitespace < 0) {
            var minHyphenWidth = Math.max(
              ctxt.hyphenWidth + whitespace,
              this.lastLyrics.length > 1
                ? ctxt.intraNeumeSpacing
                : ctxt.minLyricWordSpacing
            );
            // we might not need to shift the syllable, but we do want to shrink the hyphen...
            lyrics.setConnectorWidth(minHyphenWidth);
          }
        }
      }
      ++i;
    }

    // if the provided width is less than zero, then set the width of the line
    // based on the last notation
    if (width <= 0) {
      const lastNotation =
        notations[this.notationsStartIndex + this.numNotationsOnLine - 1];
      if (lastNotation) {
        this.staffRight = lastNotation.bounds.right();
      }
      this.justify = false;
    }

    // Justify the line if we need to
    this.justifyElements(ctxt, this.justify, condensableSpaces);

    this.centerDividers();

    if (
      width > 0 &&
      isLastLine &&
      this.score.extendLastSystemStaffLines !== true
    ) {
      // set the staff lines to only extend to the last element
      const lastNotation =
        notations[this.notationsStartIndex + this.numNotationsOnLine - 1];
      if (lastNotation) {
        this.staffRight = lastNotation.bounds.right();
      }
    }

    this.finishLayout(ctxt);
  }

  centerDividers() {
    var lastIndex =
        this.extraTextOnlyIndex === null
          ? this.notationsStartIndex + this.numNotationsOnLine
          : this.extraTextOnlyIndex,
      curr;
    for (var i = this.notationsStartIndex; i < lastIndex; i++) {
      curr = this.score.notations[i];

      if (curr && curr.isDivider) {
        var j = 1;
        var prev = this.score.notations[i - 1];
        var next =
          i + 1 === lastIndex ? this.custos : this.score.notations[i + 1];
        if (prev === next && next === this.custos) {
          prev = this.score.notations[i - 2];
          // force custos to right edge in this case, since it is a custos that exists
          // regardless of line break, and would normally be before the double bar, but in this case it ends the line:
          next.bounds.x = this.staffRight - next.bounds.width;
        }
        if (prev && next) {
          //if (prev instanceof TextOnly || next instanceof TextOnly) continue;
          var oldBoundsX = curr.bounds.x;
          var barWidth = curr.bounds.width;
          var leftPoint =
              prev instanceof TextOnly && prev.hasLyrics()
                ? prev.lyrics[0].getRight()
                : prev.bounds.right(),
            rightPoint =
              next instanceof TextOnly && next.hasLyrics()
                ? next.lyrics[0].getLeft()
                : next.bounds.x;
          if (prev instanceof TextOnly) {
            let prev = this.score.notations
              .slice(this.notationsStartIndex, i)
              .reverse()
              .find((notation) => !(notation instanceof TextOnly));
            leftPoint = prev ? prev.bounds.right() : 0;
          }
          if (leftPoint) {
            curr.bounds.x = (leftPoint + rightPoint - barWidth) / 2;
          }
          if (curr.hasLyrics()) {
            var offset = oldBoundsX - curr.bounds.x;
            for (j = curr.lyrics.length - 1; j >= 0; j--) {
              curr.lyrics[j].bounds.x += offset;
              curr.lyrics[j].needsLayout = true;
            }
          }
        } else if (
          i === lastIndex - 1 &&
          this.justify &&
          (curr.constructor === DoubleBar || curr.constructor === FullBar)
        ) {
          curr.bounds.x = this.staffRight - curr.bounds.width;
        }
      }
    }
  }

  findNeumesToJustify(prevLyrics) {
    this.toJustify = [];
    var prev,
      curr = null,
      next = null,
      nextOrCurr = null,
      lastIndex = this.notationsStartIndex + this.numNotationsOnLine;
    for (var i = this.notationsStartIndex; i < lastIndex; i++) {
      prev = nextOrCurr;
      curr = this.score.notations[i];
      next = curr.isAccidental && this.score.notations[++i];
      nextOrCurr = next || curr;
      var hasLyrics = nextOrCurr.hasLyrics();

      if (!curr || !prev) continue;

      if (
        this.extraTextOnlyIndex !== null &&
        i >= this.extraTextOnlyIndex &&
        curr.constructor === TextOnly
      )
        continue;

      if (prev !== null) {
        LyricArray.mergeIn(prevLyrics, prev.lyrics);
        if (prev.keepWithNext === true) continue;
      }

      if (
        !curr.isDivider &&
        prevLyrics.length &&
        prevLyrics[0].allowsConnector() &&
        hasLyrics
      )
        continue;

      if (nextOrCurr.constructor === ChantLineBreak) continue;

      if (nextOrCurr === this.custos && !hasLyrics) continue;

      if (i === 0 && this.score.useDropCap && hasLyrics) continue;

      // otherwise, we can add space before this element
      this.toJustify.push(curr);
    }
    if (nextOrCurr !== null) LyricArray.mergeIn(prevLyrics, nextOrCurr.lyrics);
    return nextOrCurr;
  }

  getWhitespaceOnRight(ctxt) {
    var notations = this.score.notations;
    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;
    var last = notations[lastIndex - 1];
    if (this.extraTextOnlyIndex !== null && last.constructor === TextOnly) {
      lastIndex = this.extraTextOnlyIndex;
      last = notations[lastIndex - 1];
    }
    var lastRightNeume = last
      ? last.bounds.right() + last.calculatedTrailingSpace
      : 0;
    var lastLyrics = this.lastLyricsBeforeTextOnly || this.lastLyrics;
    var lastRightLyric = lastLyrics.length
      ? LyricArray.getRight(lastLyrics)
      : 0;

    if (this.custos) {
      lastRightNeume += this.custos.bounds.width + this.custos.leadingSpace;
      if (this.custos.hasLyrics()) {
        lastRightLyric = LyricArray.getRight(this.custos.lyrics);
      }
    } else if (ctxt && lastIndex < notations.length) {
      lastRightNeume += Glyphs.CustosLong.bounds.width * ctxt.glyphScaling;
    }
    return this.staffRight - Math.max(lastRightLyric, lastRightNeume);
  }

  justifyElements(ctxt, doJustify, condensableSpaces) {
    var i;
    var toJustify = this.toJustify || [];
    var notations = this.score.notations;
    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;

    // if it wasn't an ideal line break, and the last note is further from the custos than it would have been from its next punctum,
    // move the custos over.
    // We do this first so that if it opens up any new whitespace, that gets accounted for when we do the justification
    var lastNotation =
      notations[this.notationsStartIndex + this.numNotationsOnLine - 1];
    var extraSpaceBeforeCustos =
      this.staffRight < Infinity &&
      this.custos &&
      lastNotation.keepWithNext &&
      this.custos.bounds.x -
        lastNotation.bounds.right() -
        lastNotation.calculatedTrailingSpace;
    if (extraSpaceBeforeCustos > 0) {
      // first, shrink the hyphen(s) if applicable, to move the neumes closer to the custos:
      i = 0;
      while (this.lastLyrics && this.lastLyrics[i]) {
        let lyrics = this.lastLyrics[i];
        if (lyrics.allowsConnector()) {
          var connectorWidth = lyrics.getConnectorWidth();
          if (ctxt.minLyricWordSpacing < connectorWidth) {
            var minHyphenWidth = Math.max(
              connectorWidth - extraSpaceBeforeCustos,
              this.lastLyrics.length > 1
                ? ctxt.intraNeumeSpacing
                : ctxt.minLyricWordSpacing
            );
            // we might not need to shift the syllable, but we do want to shrink the hyphen...
            lyrics.setConnectorWidth(minHyphenWidth);
          }
        }
        ++i;
      }
      this.custos.bounds.x =
        lastNotation.bounds.right() + lastNotation.calculatedTrailingSpace;
    }

    // first step of justification is to determine how much space we have to use up
    var extraSpace = this.getWhitespaceOnRight();

    if (
      Math.abs(extraSpace) < 0.5 ||
      (extraSpace > 0 && ((doJustify && toJustify.length === 0) || !doJustify))
    )
      return;

    this.condensableSpaces = condensableSpaces;

    var curr, prev;
    var offset = 0;
    var increment = extraSpace / toJustify.length;
    var multiplier = 0;
    var toJustifyIndex = 0;
    if (extraSpace < 0) {
      toJustify = condensableSpaces.filter((s) => s.condensable > 0);
      multiplier = extraSpace / condensableSpaces.sum;
      increment = 0;
    }
    var nextToJustify = toJustify[toJustifyIndex++];
    var incrementOffsetAtNextChance = false;
    for (i = this.notationsStartIndex; i < lastIndex; i++) {
      prev = curr;
      curr = notations[i];

      if (
        this.extraTextOnlyIndex !== null &&
        i >= this.extraTextOnlyIndex &&
        curr.constructor === TextOnly
      ) {
        continue;
      }

      if (!multiplier && curr === this.custos) {
        if (curr.hasLyrics()) {
          curr.bounds.x = Math.min(
            curr.bounds.x +
              (this.staffRight - LyricArray.getRight(curr.lyrics)),
            this.staffRight - curr.bounds.width
          );
          offset += increment;
        } else {
          curr.bounds.x = Math.min(
            curr.bounds.x + offset,
            this.staffRight - curr.bounds.width
          );
        }
        continue;
      }

      if (multiplier) {
        if (nextToJustify && nextToJustify.notation === curr) {
          offset += multiplier * nextToJustify.condensable;
          nextToJustify = toJustify[toJustifyIndex++];
        }
      } else if (nextToJustify === curr) {
        if (prev.hasNoWidth) {
          incrementOffsetAtNextChance = true;
        } else {
          offset += increment;
        }
        nextToJustify = toJustify[toJustifyIndex++];
      } else if (incrementOffsetAtNextChance && !prev.hasNoWidth) {
        incrementOffsetAtNextChance = false;
        offset += increment;
      }

      curr.bounds.x += offset;
    }

    if (extraSpaceBeforeCustos > 0) {
      this.custos.bounds.x =
        lastNotation.bounds.right() + lastNotation.calculatedTrailingSpace;
    }
  }

  handleEndBrace(ctxt, note, i) {
    var startBrace = ctxt.lastStartBrace;
    if (!startBrace) return;
    // calculate the y value of the brace by iterating over all notations
    // under/over the brace.
    var y;
    var k = startBrace.notationIndex;
    var notations = this.score.notations;
    var dy = ctxt.intraNeumeSpacing / 2; // some safe space between brace and notes.
    var startNote = startBrace.note;

    if (startBrace.isAbove) {
      y = Math.min(
        ctxt.calculateHeightFromStaffPosition(this.score.staffLineCount * 2),
        ...[startNote, note]
          .concat(notations.slice(k, i + 1))
          .map((n) => n.bounds.y - dy)
      );
    } else {
      y = Math.max(
        ctxt.calculateHeightFromStaffPosition(0),
        ...[startNote, note]
          .concat(notations.slice(k, i + 1))
          .map((n) => n.bounds.bottom() + dy)
      );
    }

    var addAcuteAccent = false;

    if (startBrace.shape === BraceShape.RoundBrace) {
      this.braces.push(
        new RoundBraceVisualizer(
          ctxt,
          startBrace.getAttachmentX(startNote),
          note.braceEnd.getAttachmentX(note),
          y,
          startBrace.isAbove
        )
      );
    } else {
      if (startBrace.shape === BraceShape.AccentedCurlyBrace)
        addAcuteAccent = true;

      this.braces.push(
        new CurlyBraceVisualizer(
          ctxt,
          startBrace.getAttachmentX(startNote),
          note.braceEnd.getAttachmentX(note),
          y,
          startBrace.isAbove,
          addAcuteAccent
        )
      );
    }

    delete ctxt.lastStartBrace;
  }

  finishLayout(ctxt) {
    this.ledgerLines = []; // clear any existing ledger lines

    var notations = this.score.notations;
    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;

    // an element needs to have a staffPosition property, as well as the standard
    // bounds property. so it could be a note, or it could be a custos
    // offsetX can be used to add to the position info for the element,
    // useful in the case of notes.
    var processElementForLedgerLine = (
      element,
      endElem = element,
      staffPosition = element.staffPosition,
      offsetX = element.neume ? element.neume.bounds.x : 0
    ) => {
      // do we need a ledger line for this note?
      const ledgerLinePositionAbove = ctxt.staffLineCount * 2 + 1;
      if (staffPosition >= ledgerLinePositionAbove || staffPosition <= -1) {
        var x1 = offsetX + element.bounds.x - ctxt.intraNeumeSpacing;
        var x2 =
          offsetX +
          endElem.bounds.x +
          endElem.bounds.width +
          ctxt.intraNeumeSpacing;

        // round the staffPosition to the nearest line
        if (staffPosition > 0)
          staffPosition = staffPosition - ((staffPosition - 1) % 2);
        else staffPosition = staffPosition - ((staffPosition + 1) % 2);

        // if we have a ledger line close by, then average out the distance between the two
        var minLedgerSeparation = ctxt.staffInterval * ctxt.minLedgerSeparation;

        if (
          this.ledgerLines.length > 0 &&
          this.ledgerLines[this.ledgerLines.length - 1].x2 +
            minLedgerSeparation >=
            x1
        ) {
          // average out the distance
          var half =
            (x1 - this.ledgerLines[this.ledgerLines.length - 1].x2) / 2;
          this.ledgerLines[this.ledgerLines.length - 1].x2 += half;
          x1 -= half;
        }

        // never let a ledger line extend past the staff width
        if (x2 > this.staffRight) x2 = this.staffRight;

        // finally, add the ledger line
        this.ledgerLines.push({
          x1,
          x2,
          staffPosition
        });
      }
    };

    var episemata = []; // keep track of episemata in case we can connect some
    var startBrace = null;
    var minY = Number.MAX_VALUE,
      maxY = Number.MIN_VALUE; // for braces

    var positionNonLyricText = (text, neume, rightX) => {
      text.setMaxWidth(ctxt, this.staffRight);
      //text.bounds.x = neume.hasLyrics()? Math.min(...neume.lyrics.map(l => l.bounds.x)) : 0;
      text.bounds.x = 0;
      if (rightX)
        text.bounds.x = (text.bounds.x + rightX - text.bounds.width) / 2;
      var beyondStaffRight =
        neume.bounds.x + text.bounds.right() - this.staffRight;
      if (beyondStaffRight > 0) {
        text.bounds.x -= beyondStaffRight;
      }
      if (neume.bounds.x + text.bounds.x < 0) {
        text.bounds.x = -neume.bounds.x;
      }
    };

    // make a final pass over all of the notes to add any necessary
    // ledger lines and to smooth out episemata
    for (var i = this.notationsStartIndex; i < lastIndex; i++) {
      var neume = notations[i];

      minY = Math.min(minY, neume.bounds.y);
      maxY = Math.max(maxY, neume.bounds.bottom());

      if (neume.constructor === Custos) {
        processElementForLedgerLine(neume);
        continue;
      }

      // if the AboveLinesText would extend beyond the right edge of the staff, right align it instead
      if (neume.alText) {
        for (var j = 0; j < neume.alText.length; j++) {
          positionNonLyricText(neume.alText[j], neume);
        }
      }

      // set up horizontal position of translations
      if (neume.translationText) {
        for (j = 0; j < neume.translationText.length; j++) {
          var text = neume.translationText[j];
          if (text.endNeume) {
            var rightX = text.endNeume.hasLyrics()
              ? text.endNeume.bounds.x +
                Math.max(...text.endNeume.lyrics.map((l) => l.bounds.right()))
              : text.endNeume.bounds.right();
            rightX -= neume.bounds.x;
            positionNonLyricText(text, neume, rightX);
          } else {
            positionNonLyricText(text, neume);
          }
        }
      }

      // if it's not a neume then just skip here
      if (!neume.isNeume) continue;

      for (j = 0; j < neume.ledgerLines.length; j++) {
        var ll = neume.ledgerLines[j];
        processElementForLedgerLine(ll.element, ll.endElem, ll.staffPosition);
      }

      for (j = 0; j < neume.notes.length; j++) {
        var k,
          note = neume.notes[j];

        // blend episemata as we're able
        if (note.episemata.length === 0) episemata = [];
        for (k = 0; k < note.episemata.length; k++) {
          var episema = note.episemata[k];

          var spaceBetweenEpisemata = 0;

          // calculate the distance between the last episemata and this one...
          // lots of code for a simple: currEpisemata.left - prevEpisemata.right
          if (episemata.length > 0)
            spaceBetweenEpisemata =
              neume.bounds.x +
              episema.bounds.x -
              (episemata[episemata.length - 1].note.neume.bounds.x +
                episemata[episemata.length - 1].bounds.right());

          // we try to blend the episema if we're able.
          if (
            episemata.length === 0 ||
            episemata[episemata.length - 1].positionHint !==
              episema.positionHint ||
            episemata[episemata.length - 1].terminating === true ||
            episemata[episemata.length - 1].alignment ===
              HorizontalEpisemaAlignment.Left ||
            episemata[episemata.length - 1].alignment ===
              HorizontalEpisemaAlignment.Center ||
            episema.alignment === HorizontalEpisemaAlignment.Right ||
            episema.alignment === HorizontalEpisemaAlignment.Center ||
            (spaceBetweenEpisemata > ctxt.intraNeumeSpacing * 2 &&
              note.glyphVisualizer.glyphCode !== GlyphCode.None)
          ) {
            // start a new set of episemata to potentially blend
            episemata = [episema];
          } else {
            // blend all previous with this one
            var newY;

            if (episema.positionHint === MarkingPositionHint.Below)
              newY = Math.max(
                episema.bounds.y,
                episemata[episemata.length - 1].bounds.y
              );
            else
              newY = Math.min(
                episema.bounds.y,
                episemata[episemata.length - 1].bounds.y
              );

            if (episema.bounds.y !== newY) episema.bounds.y = newY;
            else {
              for (var l = 0; l < episemata.length; l++)
                episemata[l].bounds.y = newY;
            }

            // extend the last episema to meet the new one
            var newWidth =
              neume.bounds.x +
              episema.bounds.x -
              (episemata[episemata.length - 1].note.neume.bounds.x +
                episemata[episemata.length - 1].bounds.x);
            if (newWidth < 0) {
              newWidth *= -1;
              episemata[episemata.length - 1].bounds.x -= newWidth;
            }
            episemata[episemata.length - 1].bounds.width = newWidth;

            episemata.push(episema);
          }
        }

        if (note.braceEnd) this.handleEndBrace(ctxt, note, i);

        if (note.braceStart) {
          ctxt.lastStartBrace = startBrace = note.braceStart;
          startBrace.notationIndex = i;
        }
      }
    }

    // if we still have an active brace, that means it spands two chant lines!
    if (startBrace !== null) {
      if (this.custos) {
        // if the next end brace is on the first note following the line break, simply use it with the custos
        // Do the same if there is only an accidental between
        // otherwise, make a new end brace to work for this one, and a new start brace for the next line.
        var nextNotation = notations[lastIndex];
        var nextNote = nextNotation.notes && nextNotation.notes[0];
        var nextNotationButOne = notations[lastIndex + 1];
        var nextNoteButOne =
          nextNotationButOne &&
          nextNotationButOne.notes &&
          nextNotationButOne.notes[0];
        var braceEnd =
          (nextNote && nextNote.braceEnd) ||
          (nextNotation.isAccidental &&
            nextNoteButOne &&
            nextNoteButOne.braceEnd);
        if (braceEnd) {
          this.custos.braceEnd = braceEnd;
          this.handleEndBrace(ctxt, this.custos, i);
        } else {
          this.braceStart = startBrace;
          this.custos.braceEnd = new BracePoint(
            this.custos,
            startBrace.isAbove,
            startBrace.shape,
            BraceAttachment.Right
          );
          this.handleEndBrace(ctxt, this.custos, i - 1);
          ctxt.lastStartBrace = new BracePoint(
            null,
            startBrace.isAbove,
            startBrace.shape,
            BraceAttachment.Left
          );
          ctxt.lastStartBrace.notationIndex = i;
        }
      }
    }

    // don't forget to also include the final custos, which may need a ledger line too
    if (this.custos) processElementForLedgerLine(this.custos);
  }

  // this is where the real core of positioning neumes takes place
  // returns true if positioning was able to fit the neume before rightNotationBoundary.
  // returns false if cannot fit before given right margin.
  // fixme: if this returns false, shouldn't we set the connectors on prev to be activated?!
  positionNotationElement(
    ctxt,
    prevLyrics,
    prev,
    curr,
    rightNotationBoundary,
    condensableSpaces = []
  ) {
    if (!condensableSpaces.hasOwnProperty("sum")) condensableSpaces.sum = 0;
    var i,
      space = { notation: curr },
      fixedX = false;

    // To begin we just place the current notation right after the previous,
    // irrespective of lyrics.
    // But if the previous neume was part of a polyphonic "no width" group and the current is not, or is of a separate group,
    // we force it to have the same x as the previous group.
    if (
      (!curr.hasNoWidth || curr.firstWithNoWidth === curr) &&
      prev.firstWithNoWidth
    ) {
      curr.bounds.x = prev.firstWithNoWidth.bounds.x;
      fixedX = true;
    } else {
      curr.bounds.x = prev.bounds.right();
    }

    if (
      (curr.constructor === TextOnly && this.extraTextOnlyIndex === null) ||
      (!curr.hasLyrics() && prev.calculatedTrailingSpace < 0)
    ) {
      // We transfer over the trailing space from the previous neume if the current neume is text only,
      // so that the text only neume has a better chance at not needing a connector.
      curr.calculatedTrailingSpace = prev.calculatedTrailingSpace;
      if (curr.hasLyrics())
        curr.calculatedTrailingSpace -= curr.lyrics[0].bounds.width;
      if (curr.constructor === TextOnly && curr.lyrics.length === 1) {
        curr.lyrics[0].setMaxWidth(
          ctxt,
          this.staffRight,
          this.staffRight -
            LyricArray.getRight(prevLyrics) -
            ctxt.minLyricWordSpacing
        );
      }
    } else if (!fixedX) {
      curr.bounds.x += prev.calculatedTrailingSpace;
    }

    if (
      curr.hasLyrics() &&
      !prev.isDivider &&
      !prev.isAccidental &&
      this.numNotationsOnLine > 0 &&
      (curr.lyrics[0].lyricType === LyricType.SingleSyllable ||
        curr.lyrics[0].lyricType === LyricType.BeginningSyllable)
    ) {
      curr.bounds.x += ctxt.intraNeumeSpacing * ctxt.interVerbalMultiplier;
    }
    if (curr.hasNoWidth || fixedX) {
      space.total = space.condensable = 0;
    } else if (
      this.extraTextOnlyIndex !== null &&
      curr.constructor === TextOnly
    ) {
      curr.bounds.x = 0;
      space.total = space.condensable = 0;
    } else {
      space.total = curr.bounds.x - prev.bounds.right();
      space.condensable = space.total * ctxt.condensingTolerance;
    }

    // if the previous notation has no lyrics, then we simply make sure the
    // current notation with lyrics is in the bounds of the line
    if (prevLyrics.length === 0) {
      var maxRight = curr.bounds.right() + curr.calculatedTrailingSpace;

      // if the lyric left is negative, then offset the neume appropriately
      for (i = 0; i < curr.lyrics.length; i++) {
        let currLyric = curr.lyrics[i];
        // we hope for the best!
        // but always use a connector if the lyric has original text that was all used up for the drop cap.
        let needsConnector =
          currLyric.allowsConnector() &&
          currLyric.dropCap &&
          currLyric.originalText &&
          !currLyric.text;
        currLyric.setNeedsConnector(needsConnector);
        let minLeft = this.staffLeft - this.paddingLeft;

        if (currLyric.getLeft() < minLeft)
          curr.bounds.x -= currLyric.getLeft() - minLeft;

        space.condensable = Math.min(
          space.condensable,
          currLyric.getLeft() - minLeft
        );
        maxRight = Math.max(maxRight, currLyric.getRight());
      }

      if (
        maxRight >
        rightNotationBoundary + condensableSpaces.sum + space.condensable
      )
        return false;
      condensableSpaces.push(space);
      condensableSpaces.sum += space.condensable;
      return true;
    } else {
      if (curr.firstOfSyllable && prevLyrics.length && !curr.hasLyrics()) {
        curr.bounds.x = Math.max(curr.bounds.x, prevLyrics[0].getRight());
        space.total = curr.bounds.x - prev.bounds.right();
        space.condensable = space.total * ctxt.condensingTolerance;
      }
    }

    // if the curr notation has no lyrics, then simply check whether there is enough room
    if (curr.hasLyrics() === false) {
      if (
        curr.bounds.right() + curr.calculatedTrailingSpace >
        rightNotationBoundary + condensableSpaces.sum + space.condensable
      )
        return false;
      condensableSpaces.push(space);
      condensableSpaces.sum += space.condensable;
      return true;
    }

    // if we have multiple lyrics on the current or the previous notation,
    // we will have to run several passes over each set of lyrics:

    // on the first pass, we will check the absolute left-most placement of the new syllables
    // we will make additional passes until everything is stable
    do {
      var hasShifted = false;
      var atLeastOneWithoutConnector = false;
      for (i = 0; i < curr.lyrics.length; i++) {
        if (!curr.lyrics[i].originalText) continue;
        var prevLyricRight = 0;
        let condensableSpacesSincePrevLyric = [];
        let condensableSpaceSincePrevLyric = null;
        if (i < prevLyrics.length && prevLyrics[i]) {
          prevLyricRight = prevLyrics[i].getRight();
          let notationI = condensableSpaces
            .map((s) => s.notation)
            .lastIndexOf(prevLyrics[i].notation);
          if (notationI >= 0) {
            condensableSpacesSincePrevLyric = condensableSpaces.slice(
              notationI + 1
            );
            condensableSpacesSincePrevLyric.sum =
              condensableSpacesSincePrevLyric
                .map((s) => s.condensable)
                .reduce((a, b) => a + b, 0);
          } else {
            condensableSpacesSincePrevLyric.sum = 0;
          }
        }

        curr.lyrics[i].setNeedsConnector(false); // we hope for the best!
        var currLyricLeft = curr.lyrics[i].getLeft();
        if (!prevLyrics[i] || prevLyrics[i].allowsConnector() === false) {
          // No connector needed, but include space between words if necessary!
          let extraSpace =
            currLyricLeft - prevLyricRight - ctxt.minLyricWordSpacing;
          if (extraSpace < 0) {
            // push the current element over a bit.
            let shift =
              prevLyricRight + ctxt.minLyricWordSpacing - currLyricLeft;
            curr.bounds.x += shift;
            condensableSpaceSincePrevLyric = 0;
            hasShifted = shift > 0.5;
          } else {
            condensableSpaceSincePrevLyric = extraSpace;
          }
        } else {
          // we may need a connector yet...
          if (
            prevLyricRight + 0.1 >
            currLyricLeft -
              condensableSpacesSincePrevLyric.sum -
              space.condensable
          ) {
            // in this case, the lyric elements actually overlap.
            // so nope, no connector needed. instead, we just place the lyrics together
            // fixme: for better text layout, we could actually use the kerning values
            // between the prev and curr lyric elements!
            let shift = prevLyricRight - currLyricLeft;
            if (shift < -0.1) {
              // in this case, the spacing needs to be condensed in the neumes since the last lyric...
              let multiplier =
                shift /
                (condensableSpacesSincePrevLyric.sum + space.condensable);
              let offset = 0;
              condensableSpacesSincePrevLyric.forEach((s) => {
                offset += multiplier * s.condensable;
                s.notation.bounds.x += offset;
              });
            }
            curr.bounds.x += shift;
            condensableSpaceSincePrevLyric = 0;
            atLeastOneWithoutConnector = true;
            hasShifted = shift > 0.5;
          } else {
            // bummer, looks like we couldn't merge the syllables together. Better add a connector...
            if (ctxt.minLyricWordSpacing < ctxt.hyphenWidth) {
              var spaceBetweenSyls = currLyricLeft - prevLyricRight;
              if (spaceBetweenSyls < ctxt.hyphenWidth) {
                var minHyphenWidth =
                  prevLyrics.length > 1
                    ? ctxt.intraNeumeSpacing
                    : ctxt.minLyricWordSpacing;
                // we might not need to shift the syllable, but we do want to shrink the hyphen...
                prevLyrics[i].setConnectorWidth(
                  Math.max(minHyphenWidth, spaceBetweenSyls)
                );
              }
            }
            prevLyrics[i].setNeedsConnector(true);
            prevLyricRight = prevLyrics[i].getRight();

            if (prevLyricRight + 0.1 > currLyricLeft) {
              let shift = prevLyricRight - currLyricLeft;
              curr.bounds.x += shift;
              condensableSpaceSincePrevLyric = 0;
              hasShifted = shift > 0.5;
            } else {
              condensableSpaceSincePrevLyric = currLyricLeft - prevLyricRight;
            }
          }
        }

        if (condensableSpaceSincePrevLyric !== null) {
          if (
            condensableSpaceSincePrevLyric <
            condensableSpacesSincePrevLyric.sum + space.condensable
          ) {
            // reduce condensable space so that lyrics retain at least the width of a space character between words:
            let multiplier =
              condensableSpaceSincePrevLyric /
              (condensableSpacesSincePrevLyric.sum + space.condensable);
            space.condensable *= multiplier;
            if (condensableSpacesSincePrevLyric.sum) {
              condensableSpacesSincePrevLyric.forEach((space) => {
                space.condensable *= multiplier;
              });
              condensableSpaces.sum = condensableSpaces
                .map((s) => s.condensable)
                .reduce((a, b) => a + b, 0);
            }
          }
        }
      }
    } while (
      curr.lyrics.length > 1 &&
      hasShifted &&
      atLeastOneWithoutConnector
    );

    for (i = Math.min(curr.lyrics.length, prevLyrics.length) - 1; i >= 0; i--) {
      let pLyrics = prevLyrics[i];
      if (pLyrics.needsConnector && pLyrics.connectorWidth) {
        currLyricLeft = curr.lyrics[i].getLeft();
        prevLyricRight = pLyrics.getRight() - pLyrics.connectorWidth;
        spaceBetweenSyls = currLyricLeft - prevLyricRight;
        if (spaceBetweenSyls >= ctxt.hyphenWidth) spaceBetweenSyls = 0;
        pLyrics.setConnectorWidth(spaceBetweenSyls);
      }
    }

    if (
      curr.bounds.right() + curr.calculatedTrailingSpace <
        rightNotationBoundary + condensableSpaces.sum + space.condensable &&
      LyricArray.getRight(curr.lyrics, true) <=
        this.staffRight + condensableSpaces.sum + space.condensable
    ) {
      if (prev.isAccidental) {
        // move the previous accidental up next to the current note:
        let shift =
          curr.bounds.x -
          prev.bounds.width -
          prev.calculatedTrailingSpace -
          prev.bounds.x;
        prev.bounds.x += shift;
        if (Math.abs(shift) > 0.1) {
          let lastCondensable = condensableSpaces[condensableSpaces.length - 1];
          condensableSpaces.sum -= lastCondensable.condensable;
          lastCondensable.condensable = 0;
        }
      }
      condensableSpaces.push(space);
      condensableSpaces.sum += space.condensable;
      return true;
    }

    // if we made it this far, then the element won't fit on this line.
    return false;
  }

  /**
   * Find the notation closest to x without going past it
   * @param {number} x
   */
  bisectNotationAtX(x, useMidpoint = true) {
    let minIndex = -1,
      maxIndex = Math.min(this.numNotationsOnLine, Infinity),
      curIndex = minIndex + ((maxIndex - minIndex) >> 1),
      notations = this.score.notations.slice(
        this.notationsStartIndex,
        this.notationsStartIndex + this.numNotationsOnLine
      );

    while (minIndex < curIndex) {
      let notation = notations[curIndex];
      let notationX = notation.bounds.x;
      if (notationX > x) {
        maxIndex = curIndex;
      } else {
        minIndex = curIndex;
      }
      curIndex = minIndex + ((maxIndex - minIndex) >> 1);
    }
    let notation = notations[curIndex];
    if (
      useMidpoint &&
      notation &&
      notation.bounds.width === 0 &&
      curIndex + 1 < notations.length
    ) {
      let nextNotation = notations[curIndex + 1],
        closenessToLeft = x - notation.bounds.x,
        closenessToRight = nextNotation.bounds.x - x;
      if (nextNotation.bounds.width === 0 && closenessToRight < closenessToLeft)
        ++curIndex;
    }
    return notations[curIndex];
  }
}

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


class NeumeBuilder {
  constructor(ctxt, neume, startingX = 0) {
    this.ctxt = ctxt;
    this.neume = neume;
    this.x = startingX;
    this.lastNote = null;
    this.lineIsHanging = false;
    this.minX = 0;
  }

  // used to start a hanging line on the left of the next note
  lineFrom(note) {
    var previousNotation = this.ctxt.notations[this.ctxt.currNotationIndex - 1];
    if (
      this.x === 0 &&
      previousNotation &&
      previousNotation.notes &&
      previousNotation.trailingSpace === 0
    ) {
      this.lastNote = previousNotation.notes.slice(-1)[0];
      this.minX = -this.ctxt.neumeLineWeight;
    } else {
      this.lastNote = note;
      this.lineIsHanging = true;
    }
    return this;
  }

  // add a note, with a connecting line on the left if we have one
  noteAt(note, glyph, withLineTo = true) {
    if (!note) throw "NeumeBuilder.noteAt: note must be a valid note";

    if (!glyph) throw "NeumeBuilder.noteAt: glyph must be a valid glyph code";

    note.setGlyph(this.ctxt, glyph);
    var noteAlignsRight = note.glyphVisualizer.align === "right";

    var needsLine =
      withLineTo &&
      this.lastNote !== null &&
      (this.ctxt.glyphMultiplier < 1 ||
        this.lineIsHanging ||
        (this.lastNote.glyphVisualizer &&
          this.lastNote.glyphVisualizer.align === "right") ||
        Math.abs(this.lastNote.staffPosition - note.staffPosition) > 1);

    if (needsLine) {
      var line = new NeumeLineVisualizer(
        this.ctxt,
        this.lastNote,
        note,
        this.lineIsHanging
      );
      this.neume.addVisualizer(line);
      line.bounds.x = Math.max(this.minX, this.x - line.bounds.width);

      if (!noteAlignsRight) this.x = line.bounds.x;
    }

    let xOffset = 0;
    if (note.shapeModifiers & NoteShapeModifiers.Linea) {
      var linea = new LineaVisualizer(this.ctxt, note);
      this.neume.addVisualizer(linea);
      note.origin.x += linea.origin.x;
      xOffset = linea.origin.x;
    }

    // if this is the first note of a right aligned glyph (probably an initio debilis),
    // then there's nothing to worry about. but if it's not then first, then this
    // subtraction will right align it visually
    if (noteAlignsRight && this.lastNote)
      note.bounds.x = this.x - note.bounds.width;
    else {
      note.bounds.x = this.x + xOffset;
      this.x += note.bounds.width + xOffset;
    }

    this.neume.addVisualizer(note);

    this.lastNote = note;
    this.lineIsHanging = false;

    return this;
  }

  // a special form of noteAdd that creates a virga
  // uses a punctum cuadratum and a line rather than the virga glyphs
  virgaAt(note, withLineTo = true) {
    // add the punctum for the virga
    this.noteAt(note, GlyphCode.PunctumQuadratum);

    // add a line for the virga
    var line = new VirgaLineVisualizer(this.ctxt, note);
    this.x -= line.bounds.width;
    if (note.shapeModifers & NoteShapeModifiers.Reverse) {
      line.bounds.x = 0;
    } else {
      line.bounds.x = this.x;
    }
    this.neume.addVisualizer(line);

    this.lastNote = note;
    this.lineIsHanging = false;

    return this;
  }

  advanceBy(x) {
    this.lastNote = null;
    this.lineIsHanging = false;

    this.x += x;

    return this;
  }

  // for terminating hanging lines with no lower notes
  withLineEndingAt(note) {
    if (this.lastNote === null) return;

    var line = new NeumeLineVisualizer(this.ctxt, this.lastNote, note, true);
    this.neume.addVisualizer(line);
    this.x -= line.bounds.width;
    line.bounds.x = this.x;

    this.neume.addVisualizer(line);

    this.lastNote = note;

    return this;
  }

  withPodatus(lowerNote, upperNote) {
    var upperGlyph;
    var lowerGlyph;

    if (lowerNote.liquescent === LiquescentType.InitioDebilis) {
      // liquescent upper note or not?
      if (upperNote.liquescent === LiquescentType.None)
        upperGlyph = GlyphCode.PunctumQuadratum;
      else upperGlyph = GlyphCode.PunctumQuadratumDesLiquescent;

      lowerGlyph = GlyphCode.TerminatingDesLiquescent;
    } else if (upperNote.liquescent & LiquescentType.Small) {
      lowerGlyph = GlyphCode.BeginningAscLiquescent;
      upperGlyph = GlyphCode.TerminatingAscLiquescent;
    } else if (upperNote.liquescent & LiquescentType.Ascending) {
      lowerGlyph = GlyphCode.PunctumQuadratum;
      upperGlyph = GlyphCode.PunctumQuadratumAscLiquescent;
    } else if (upperNote.liquescent & LiquescentType.Descending) {
      lowerGlyph = GlyphCode.PunctumQuadratum;
      upperGlyph = GlyphCode.PunctumQuadratumDesLiquescent;
    } else {
      const diff =
        upperNote.staffPosition -
        lowerNote.staffPosition +
        (this.ctxt.glyphMultiplier <= 0.85 ? 1 : 0);
      // standard shape
      lowerGlyph =
        diff > 1 ? GlyphCode.PodatusLower : GlyphCode.PodatusLowerShort;
      upperGlyph =
        diff > 1 ? GlyphCode.PodatusUpper : GlyphCode.PodatusUpperShort;
    }

    // allow a quilisma pes
    if (lowerNote.shape === NoteShape.Quilisma) lowerGlyph = GlyphCode.Quilisma;

    this.noteAt(lowerNote, lowerGlyph).noteAt(upperNote, upperGlyph);

    // make sure we don't have lines connected to the podatus
    this.lastNote = null;

    return this;
  }

  withClivisUpper(upper, lower, glyph = GlyphCode.PunctumQuadratum) {
    if (upper.shape === NoteShape.Oriscus)
      this.noteAt(upper, GlyphCode.OriscusDes, false);
    else {
      if (lower) {
        this.lineFrom(lower);
        this.lineIsHanging = lower.staffPosition < upper.staffPosition;
        if (lower.liquescent & LiquescentType.Small) {
          glyph = GlyphCode.BeginningDesLiquescent;
        }
      }
      this.noteAt(upper, glyph);
    }
    return this;
  }

  withClivisLower(lower) {
    var lowerGlyph;
    if (lower.liquescent & LiquescentType.Small) {
      lowerGlyph = GlyphCode.TerminatingDesLiquescent;
    } else if (lower.liquescent === LiquescentType.Ascending)
      lowerGlyph = GlyphCode.PunctumQuadratumAscLiquescent;
    else if (lower.liquescent === LiquescentType.Descending)
      lowerGlyph = GlyphCode.PunctumQuadratumDesLiquescent;
    else lowerGlyph = GlyphCode.PunctumQuadratum;

    return this.noteAt(lower, lowerGlyph);
  }

  withClivis(upper, lower) {
    this.withClivisUpper(upper, lower);
    this.withClivisLower(lower);

    // make sure we don't have lines connected to the clivis
    this.lastNote = null;

    return this;
  }

  // lays out a sequence of notes that are inclinata (e.g., climacus, pes subpunctis)
  withInclinata(notes) {
    var staffPosition = notes[0].staffPosition,
      prevStaffPosition = notes[0].staffPosition;

    // it is important to advance by the width of the inclinatum glyph itself
    // rather than by individual note widths, so that any liquescents are spaced
    // the same as non-liquscents
    var advanceWidth =
      Glyphs.PunctumInclinatum.bounds.width * this.ctxt.glyphScaling;

    const stemNotes = [];
    let beamCount;
    // now add all the punctum inclinatum
    for (var i = 0; i < notes.length; i++, prevStaffPosition = staffPosition) {
      var note = notes[i];
      let beams = notes.slice(i).find((note) => note.inclinataFlags);
      beamCount = beamCount || (beams && beams.inclinataFlags);

      if (note.liquescent & LiquescentType.Small)
        note.setGlyph(this.ctxt, GlyphCode.PunctumInclinatumLiquescent);
      else if (note.liquescent & LiquescentType.Large)
        // fixme: is the large inclinatum liquescent the same as the apostropha?
        note.setGlyph(this.ctxt, GlyphCode.Stropha);
      // fixme: some climaci in the new chant books end with a punctum quadratum
      // (see, for example, the antiphon "Sancta Maria" for October 7).
      else note.setGlyph(this.ctxt, GlyphCode.PunctumInclinatum);

      staffPosition = note.staffPosition;

      var multiple = Math.abs(prevStaffPosition - staffPosition);
      switch (multiple) {
        case 0:
          multiple = 1.1;
          break;
        default:
          multiple *= (multiple >= 1 ? 2 : 4) / 3;
          break;
      }

      if (i > 0) this.x += advanceWidth * multiple;

      note.bounds.x = this.x;

      this.neume.addVisualizer(note);
      if (beams) {
        stemNotes.push(note);
      }
    }
    if (stemNotes.length) {
      const firstNote = stemNotes[0];
      const lastNote = stemNotes[stemNotes.length - 1];
      const startCoord = {
        x: firstNote.bounds.x,
        staffPosition: firstNote.staffPosition + 4
      };
      const endCoord = {
        x: lastNote.bounds.x,
        staffPosition: lastNote.staffPosition + 4
      };
      // Linear interpolation: y = y1 + (x - x1) * (y2 - y1) / (x2 - x1)
      const getStaffPositionForX = (x) =>
        x === startCoord.x
          ? startCoord.staffPosition
          : startCoord.staffPosition +
            ((x - startCoord.x) / (endCoord.x - startCoord.x)) *
              (endCoord.staffPosition - startCoord.staffPosition);

      for (const note of stemNotes) {
        var stem = new NeumeLineVisualizer(
          this.ctxt,
          note,
          getStaffPositionForX(note.bounds.x)
        );
        this.neume.addVisualizer(stem);
        stem.bounds.x =
          note.bounds.x + note.bounds.width / 2 - stem.bounds.width / 2;
      }
      while (beamCount > 0) {
        let beams = new NeumeBeamVisualizer(
          this.ctxt,
          startCoord.x + firstNote.bounds.width / 2,
          endCoord.x + lastNote.bounds.width / 2,
          startCoord.staffPosition,
          endCoord.staffPosition,
          --beamCount
        );
        this.neume.addVisualizer(beams);
      }
    }

    return this;
  }

  withPorrectusSwash(start, end) {
    var needsLine =
      this.lastNote !== null &&
      (this.ctxt.glyphMultiplier < 1 ||
        this.lineIsHanging ||
        (this.lastNote.glyphVisualizer &&
          this.lastNote.glyphVisualizer.align === "right") ||
        Math.abs(this.lastNote.staffPosition - start.staffPosition) > 1);

    if (needsLine) {
      var line = new NeumeLineVisualizer(
        this.ctxt,
        this.lastNote,
        start,
        this.lineIsHanging
      );
      this.x = Math.max(this.minX, this.x - line.bounds.width);
      line.bounds.x = this.x;
      this.neume.addVisualizer(line);
    }

    var glyph;

    switch (start.staffPosition - end.staffPosition) {
      case 1:
        glyph = GlyphCode.Porrectus1;
        break;
      case 2:
        glyph = GlyphCode.Porrectus2;
        break;
      case 3:
        glyph = GlyphCode.Porrectus3;
        break;
      case 4:
        glyph = GlyphCode.Porrectus4;
        break;
      default:
        // fixme: should we generate an error here?
        glyph = GlyphCode.None;
        break;
    }

    start.setGlyph(this.ctxt, glyph);
    start.bounds.x = this.x;

    // the second glyph does not draw anything, but it still has logical importance for the editing
    // environment...it can respond to changes which will then change the swash glyph of the first.
    end.setGlyph(this.ctxt, GlyphCode.None);

    this.x = start.bounds.right();
    end.bounds.x = this.x - end.bounds.width;

    this.neume.addVisualizer(start);
    this.neume.addVisualizer(end);

    this.lastNote = end;
    this.lineIsHanging = false;

    return this;
  }
}

/*
 * Neumes base class
 */
class Neume extends ChantNotationElement {
  constructor(notes = []) {
    super();

    this.isNeume = true; // poor man's reflection
    this.notes = notes;

    for (var i = 0; i < notes.length; i++) notes[i].neume = this;
  }

  addNote(note) {
    note.neume = this;
    this.notes.push(note);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);
  }

  finishLayout(ctxt) {
    this.ledgerLines = this.requiresLedgerLine(ctxt);

    // allow subclasses an opportunity to position their own markings...
    this.positionMarkings();

    // layout the markings of the notes
    for (var i = 0; i < this.notes.length; i++) {
      var note = this.notes[i];
      var j;

      for (j = 0; j < note.episemata.length; j++) {
        note.episemata[j].performLayout(ctxt);
        this.addVisualizer(note.episemata[j]);
      }

      for (j = 0; j < note.morae.length; j++) {
        note.morae[j].performLayout(ctxt);
        this.addVisualizer(note.morae[j]);
      }

      // if the note has an ictus, then add it here
      if (note.ictus) {
        note.ictus.performLayout(ctxt);
        this.addVisualizer(note.ictus);
      }

      if (note.accent) {
        note.accent.performLayout(ctxt);
        this.addVisualizer(note.accent);
      }

      if (note.choralSign) {
        note.choralSign.performLayout(ctxt);
        this.addVisualizer(note.choralSign);
      }

      // braces are handled by the chant line, so we don't mess with them here
      // this is because brace size depends on chant line logic (neume spacing,
      // justification, etc.) so they are considered chant line level
      // markings rather than note level markings
    }

    this.origin.x = this.notes[0].origin.x;
    this.origin.y = this.notes[0].origin.y;

    super.finishLayout(ctxt);
  }

  requiresLedgerLine(ctxt) {
    var firstAbove = false,
      needsAbove = false,
      firstBelow = false,
      needsBelow = false,
      // isPorrectus = false,
      result = [],
      ledgerLinePositionAbove = ctxt.staffLineCount * 2 + 1;

    if (!this.notes) return result;

    for (var i = 0; i < this.notes.length; ++i) {
      var note = this.notes[i];
      var staffPosition = note.staffPosition;
      if (staffPosition >= ledgerLinePositionAbove - 1) {
        needsAbove =
          needsAbove || staffPosition >= ledgerLinePositionAbove - 0.9;
        if (firstAbove === false) firstAbove = Math.max(0, i - 1);
        if (staffPosition >= ledgerLinePositionAbove) continue;
      } else if (staffPosition <= 0) {
        needsBelow = needsBelow || staffPosition < -0.1;
        if (firstBelow === false) firstBelow = Math.max(0, i - 1);
        if (staffPosition <= -1) continue;
      }
      if (needsAbove || needsBelow) {
        var endI = i; // Math.abs(staffPosition) >= 4? i : i - 1;
        result.push({
          element: this.notes[firstAbove || firstBelow || 0],
          endElem: this.notes[endI],
          staffPosition: needsAbove ? ledgerLinePositionAbove : -1
        });
        firstAbove = firstBelow = needsAbove = needsBelow = false;
      }
      // isPorrectus = /^Porrectus\d$/.test(note.glyphVisualizer.glyphCode);
    }
    if (needsAbove || needsBelow) {
      result.push({
        element: this.notes[firstAbove || firstBelow || 0],
        endElem: this.notes[this.notes.length - 1],
        staffPosition: needsAbove ? ledgerLinePositionAbove : -1
      });
    }
    return result;
  }

  resetDependencies() {}

  build(ctxt) {
    return new NeumeBuilder(ctxt, this);
  }
  positionEpisemata(note, position) {
    var i;
    for (i = 0; i < note.episemata.length; i++)
      if (note.episemata[i].positionHint === MarkingPositionHint.Default)
        note.episemata[i].positionHint = position;
    if (note.choralSign) note.choralSign.positionHint = position;
    return note.episemata.length;
  }
  positionEpisemataAbove(note) {
    return this.positionEpisemata(note, MarkingPositionHint.Above);
  }
  positionEpisemataBelow(note) {
    return this.positionEpisemata(note, MarkingPositionHint.Below);
  }

  positionPodatusEpisemata(bottomNote, topNote) {
    // 1. episema on lower note by default be below, upper note above
    this.positionEpisemataBelow(bottomNote);
    this.positionEpisemataAbove(topNote);
    if (topNote.ictus) {
      topNote.ictus.positionHint = MarkingPositionHint.Above;
    }
  }
  positionInclinataMorae(notes) {
    notes = notes.slice(-2);
    if (notes.length < 2 || notes[1].staffPosition > notes[0].staffPosition)
      return;
    var bottomNote = notes[1],
      topNote = notes[0],
      mark;

    // The mora on the second (lower) note should be below the punctum,
    // if the punctum is on a line and the previous punctum is in the space above.
    if (
      Math.abs(bottomNote.staffPosition % 2) === 1 &&
      topNote.staffPosition - bottomNote.staffPosition === 1 &&
      bottomNote.morae.length > 0
    ) {
      mark = bottomNote.morae.slice(-1)[0];
      if (mark.positionHint === MarkingPositionHint.Default)
        mark.positionHint = MarkingPositionHint.Below;
    }
  }
  positionPodatusMorae(bottomNote, topNote) {
    var mark;

    // The mora on the first (lower) note should be below it,
    // if it is on a line.
    if (Math.abs(bottomNote.staffPosition % 2) === 1) {
      if (bottomNote.morae.length === 1) {
        mark = bottomNote.morae[0];
      } else if (topNote.morae.length > 1) {
        mark = topNote.morae[0];
      }
      if (mark && mark.positionHint === MarkingPositionHint.Default)
        mark.positionHint = MarkingPositionHint.Below;
    }

    // if there is a mora on the first note but not on the second, and the neume
    // continues with a punctum higher than the second note, we need to adjust
    // the space after the neume so that it follows immediately with no gap
    if (bottomNote.morae.length > 0 && topNote.morae.length === 0) {
      bottomNote.morae[0].ignoreBounds = true;
    }
  }
  // for any subclasses that begin with a podatus, they can call this from their own positionMarkings()
  positionPodatusMarkings(bottomNote, topNote) {
    this.positionPodatusEpisemata(bottomNote, topNote);
    this.positionPodatusMorae(bottomNote, topNote);
  }

  // just like a clivis, but the first note of the three also works like the second note of the clivis:
  // episema below, unless the middle note also has an episema
  positionTorculusMarkings(firstNote, secondNote, thirdNote) {
    var hasTopEpisema = this.positionClivisMarkings(secondNote, thirdNote);
    hasTopEpisema =
      this.positionEpisemata(
        firstNote,
        hasTopEpisema ? MarkingPositionHint.Above : MarkingPositionHint.Below
      ) && hasTopEpisema;
    return hasTopEpisema;
  }
  positionClivisMorae(firstNote, secondNote) {
    // 1. second note of a clivis that ends on a line and goes down one step has its mora below:
    var morae = firstNote.morae.concat(secondNote.morae);
    if (
      secondNote.morae.length &&
      firstNote.staffPosition - secondNote.staffPosition === 1 &&
      Math.abs(secondNote.staffPosition % 2) === 1
    ) {
      morae.slice(-1)[0].positionHint = MarkingPositionHint.Below;
    }
  }
  positionClivisEpisemata(firstNote, secondNote) {
    var hasTopEpisema = this.positionEpisemataAbove(firstNote);
    this.positionEpisemata(
      secondNote,
      hasTopEpisema ? MarkingPositionHint.Above : MarkingPositionHint.Below
    );
    return hasTopEpisema;
  }
  positionClivisMarkings(firstNote, secondNote) {
    this.positionClivisMorae(firstNote, secondNote);
    return this.positionClivisEpisemata(firstNote, secondNote);
  }

  positionPorrectusMarkings(firstNote, secondNote, thirdNote) {
    // episemata on first and second note work like a clivis,
    // the second note should have its episema below, unless the first note also has an episema.
    this.positionClivisEpisemata(firstNote, secondNote);
    this.positionPodatusMarkings(secondNote, thirdNote);
  }

  positionPorrectusFlexusMarkings(first, second, third, fourth) {
    var hasTopEpisema = this.positionEpisemataAbove(first);
    hasTopEpisema = this.positionClivisMarkings(third, fourth) || hasTopEpisema;
    this.positionEpisemata(
      second,
      hasTopEpisema ? MarkingPositionHint.Above : MarkingPositionHint.Below
    );
  }

  // subclasses can override this in order to correctly place markings in a neume specific way
  positionMarkings() {}
}

/*
 * Apostropha
 */
class Apostropha extends Neume {
  positionMarkings() {
    var positionHint = MarkingPositionHint.Above;

    // logic here is this: if first episema is default position, place it above.
    // then place the second one (if there is one) opposite of the first.
    for (var i = 0; i < this.notes[0].episemata.length; i++) {
      if (
        this.notes[0].episemata[i].positionHint === MarkingPositionHint.Default
      )
        this.notes[0].episemata[i].positionHint = positionHint;
      else positionHint = this.notes[0].episemata[i].positionHint;

      // now place the next one in the opposite position
      positionHint =
        positionHint === MarkingPositionHint.Above
          ? MarkingPositionHint.Below
          : MarkingPositionHint.Above;
    }
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    this.build(ctxt).noteAt(
      this.notes[0],
      Apostropha.getNoteGlyphCode(this.notes[0])
    );

    this.finishLayout(ctxt);
  }

  static getNoteGlyphCode(note) {
    if (note.shape === NoteShape.Stropha) return GlyphCode.Stropha;

    if (note.liquescent & LiquescentType.Ascending)
      return GlyphCode.PunctumQuadratumAscLiquescent;
    else if (note.liquescent & LiquescentType.Descending)
      return GlyphCode.PunctumQuadratumDesLiquescent;

    if (note.shapeModifiers & NoteShapeModifiers.Cavum)
      return GlyphCode.PunctumCavum;

    return GlyphCode.PunctumQuadratum;
  }
}

/*
 * Bivirga
 *
 * For simplicity in implementation, Bivirga's have two notes in the object
 * structure. These technically must be the same pitch though.
 */
class Bivirga extends Neume {
  positionMarkings() {
    this.positionEpisemataAbove(this.notes[0]);
    this.positionEpisemataAbove(this.notes[1]);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    this.build(ctxt)
      .virgaAt(this.notes[0])
      .advanceBy(ctxt.intraNeumeSpacing)
      .virgaAt(this.notes[1]);

    this.finishLayout(ctxt);
  }
}

/*
 * Trivirga
 *
 * For simplicity in implementation, Trivirga's have three notes in the object
 * structure. These technically must be the same pitch though.
 */
class Trivirga extends Neume {
  positionMarkings() {
    this.positionEpisemataAbove(this.notes[0]);
    this.positionEpisemataAbove(this.notes[1]);
    this.positionEpisemataAbove(this.notes[2]);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    this.build(ctxt)
      .virgaAt(this.notes[0])
      .advanceBy(ctxt.intraNeumeSpacing)
      .virgaAt(this.notes[1])
      .advanceBy(ctxt.intraNeumeSpacing)
      .virgaAt(this.notes[2]);

    this.finishLayout(ctxt);
  }
}

/*
 * Climacus
 */
class Climacus extends Neume {
  positionMarkings() {
    for (var i = 0; i < this.notes.length; i++) {
      this.positionEpisemataAbove(this.notes[i]);
    }
    this.positionInclinataMorae(this.notes);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    this.build(ctxt)
      .virgaAt(this.notes[0])
      .advanceBy(ctxt.intraNeumeSpacing)
      .withInclinata(this.notes.slice(1));

    this.finishLayout(ctxt);
  }
}

/*
 * Clivis
 */
class Clivis extends Neume {
  positionMarkings() {
    this.positionClivisMarkings(this.notes[0], this.notes[1]);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    var upper = this.notes[0];
    var lower = this.notes[1];

    this.build(ctxt).withClivis(upper, lower);

    this.finishLayout(ctxt);
  }
}

/*
 * Ancus
 */
class Ancus extends Neume {
  positionMarkings() {
    this.positionClivisMarkings(this.notes[0], this.notes[2]);
    this.positionClivisMarkings(this.notes[1], this.notes[2]);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    var upper = this.notes[0];
    var middle = this.notes[1];
    var lower = this.notes[2];

    var builder = this.build(ctxt);
    builder.withClivisUpper(upper, middle);
    let middleGlyph = GlyphCode.PunctumQuadratum;
    if (lower.liquescent & LiquescentType.Small) {
      middleGlyph = GlyphCode.BeginningDesLiquescent;
    }
    if (upper.staffPosition - middle.staffPosition > 1) {
      builder.withClivisUpper(middle, upper, middleGlyph);
    } else {
      builder.withClivisUpper(middle, null, middleGlyph);
    }
    builder.withClivisLower(lower);
    builder.lastNote = null;

    this.finishLayout(ctxt);
  }
}

/*
 * Distropha
 *
 * For simplicity in implementation, Distropha's have two notes in the object
 * structure. These technically must be the same pitch though (like Bivirga).
 */
class Distropha extends Neume {
  positionMarkings() {
    this.positionEpisemataAbove(this.notes[0]);
    this.positionEpisemataAbove(this.notes[1]);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);
    let glyphCodes = this.notes.map((note) =>
      Apostropha.getNoteGlyphCode(note)
    );
    let glyphAdvance = ctxt.intraNeumeSpacing;
    glyphCodes.slice(0, 2).forEach((glyphCode) => {
      if (glyphCode === GlyphCode.Stropha)
        glyphAdvance -= ctxt.intraNeumeSpacing / 4;
    });

    this.build(ctxt)
      .noteAt(this.notes[0], glyphCodes[0])
      .advanceBy(glyphAdvance)
      .noteAt(this.notes[1], glyphCodes[1]);

    this.finishLayout(ctxt);
  }
}

/*
 * Oriscus
 */
class Oriscus extends Neume {
  positionMarkings() {
    this.positionEpisemataAbove(this.notes[0]);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    // determine the glyph to use
    var note = this.notes[0];
    var glyph;

    if (note.liquescent !== LiquescentType.None) {
      glyph = GlyphCode.OriscusLiquescent;
    } else {
      if (note.shapeModifiers & NoteShapeModifiers.Ascending)
        glyph = GlyphCode.OriscusAsc;
      else if (note.shapeModifiers & NoteShapeModifiers.Descending)
        glyph = GlyphCode.OriscusDes;
      else {
        // by default we take the descending form, unless we can figure out by a lookahead here
        glyph = GlyphCode.OriscusDes;

        // try to find a neume following this one
        var neume = ctxt.findNextNeume();

        if (neume) {
          var nextNoteStaffPosition = ctxt.activeClef.pitchToStaffPosition(
            neume.notes[0].pitch
          );

          if (nextNoteStaffPosition > note.staffPosition)
            glyph = GlyphCode.OriscusAsc;
        }
      }
    }

    this.build(ctxt).noteAt(note, glyph);

    this.finishLayout(ctxt);
  }

  resetDependencies() {
    // a single oriscus tries to automatically use the right direction
    // based on the following neumes. if we don't have a manually designated
    // direction, then we reset our layout so that we can try to guess it
    // at next layout phase.
    if (
      this.notes[0].shapeModifiers & NoteShapeModifiers.Ascending ||
      this.notes[0].shapeModifiers & NoteShapeModifiers.Descending
    )
      return;

    this.needsLayout = true;
  }
}

/*
 * PesQuassus
 */
class PesQuassus extends Neume {
  performLayout(ctxt) {
    super.performLayout(ctxt);

    var lower = this.notes[0];
    var upper = this.notes[1];

    var lowerGlyph;

    var lowerStaffPos = lower.staffPosition;
    var upperStaffPos = upper.staffPosition;

    if (lower.shape === NoteShape.Oriscus) lowerGlyph = GlyphCode.OriscusAsc;
    else lowerGlyph = GlyphCode.PunctumQuadratum;

    var builder = this.build(ctxt).noteAt(lower, lowerGlyph);

    if (upperStaffPos - lowerStaffPos === 1)
      // use a virga glyph in this case
      builder.virgaAt(upper);
    else if (upper.liquescent === LiquescentType.LargeDescending)
      builder
        .noteAt(upper, GlyphCode.PunctumQuadratumDesLiquescent)
        .withLineEndingAt(lower);
    else
      builder.noteAt(upper, GlyphCode.PunctumQuadratum).withLineEndingAt(lower);

    this.finishLayout(ctxt);
  }
}

/*
 * PesSubpunctis
 */
class PesSubpunctis extends Neume {
  positionMarkings() {
    this.positionPodatusEpisemata(this.notes[0], this.notes[1]);
    for (var i = 2; i < this.notes.length; ++i) {
      this.positionEpisemataAbove(this.notes[i]);
    }
    this.positionInclinataMorae(this.notes.slice(1));
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    // podatus followed by inclinata
    this.build(ctxt)
      .withPodatus(this.notes[0], this.notes[1])
      .advanceBy(ctxt.intraNeumeSpacing * 0.68)
      .withInclinata(this.notes.slice(2));

    this.finishLayout(ctxt);
  }
}

/*
 * Podatus
 *
 * This podatus class handles a few neume types actually, depending on the note
 * data: Podatus (including various liquescent types on the upper note),
 * Podatus initio debilis, and Quilisma-Pes
 */
class Podatus extends Neume {
  positionMarkings() {
    this.positionPodatusMarkings(this.notes[0], this.notes[1]);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    this.build(ctxt).withPodatus(this.notes[0], this.notes[1]);

    this.finishLayout(ctxt);
  }
}

/*
 * Porrectus
 */
class Porrectus extends Neume {
  positionMarkings() {
    this.positionPorrectusMarkings(this.notes[0], this.notes[1], this.notes[2]);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    var first = this.notes[0];
    var second = this.notes[1];
    var third = this.notes[2];

    var thirdGlyph;

    if (third.liquescent & LiquescentType.Small)
      thirdGlyph = GlyphCode.TerminatingAscLiquescent;
    else if (third.liquescent & LiquescentType.Descending)
      thirdGlyph = GlyphCode.PunctumQuadratumDesLiquescent;
    else
      thirdGlyph =
        third.staffPosition - second.staffPosition > 1
          ? GlyphCode.PodatusUpper
          : GlyphCode.PodatusUpperShort;

    this.build(ctxt)
      .lineFrom(second)
      .withPorrectusSwash(first, second)
      .noteAt(third, thirdGlyph);

    this.finishLayout(ctxt);
  }
}

/*
 * PorrectusFlexus
 */
class PorrectusFlexus extends Neume {
  positionMarkings() {
    this.positionPorrectusFlexusMarkings(
      this.notes[0],
      this.notes[1],
      this.notes[2],
      this.notes[3]
    );
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    var first = this.notes[0];
    var second = this.notes[1];
    var third = this.notes[2];
    var fourth = this.notes[3];

    var thirdGlyph = GlyphCode.PunctumQuadratum,
      fourthGlyph;

    if (fourth.liquescent & LiquescentType.Small) {
      thirdGlyph = GlyphCode.PunctumQuadratumDesLiquescent;
      fourthGlyph = GlyphCode.TerminatingDesLiquescent;
    } else if (fourth.liquescent & LiquescentType.Ascending)
      fourthGlyph = GlyphCode.PunctumQuadratumAscLiquescent;
    else if (fourth.liquescent & LiquescentType.Descending)
      fourthGlyph = GlyphCode.PunctumQuadratumDesLiquescent;
    else fourthGlyph = GlyphCode.PunctumQuadratum;

    this.build(ctxt)
      .lineFrom(second)
      .withPorrectusSwash(first, second)
      .noteAt(third, thirdGlyph)
      .noteAt(fourth, fourthGlyph);

    this.finishLayout(ctxt);
  }
}

// this is some type of pseudo nume right? there is no such thing as a neume
// of puncta inclinata, but this will be part of other composite neumes.
class PunctaInclinata extends Neume {
  positionMarkings() {
    this.positionInclinataMorae(this.notes);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    this.build(ctxt).withInclinata(this.notes);

    this.finishLayout(ctxt);
  }
}

/*
 * Punctum
 */
class Punctum extends Neume {
  positionMarkings() {
    this.positionEpisemataAbove(this.notes[0]);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    var note = this.notes[0];
    var glyph = GlyphCode.PunctumQuadratum;

    // determine the glyph to use
    if (note.liquescent !== LiquescentType.None) {
      if (note.shape === NoteShape.Inclinatum)
        glyph = GlyphCode.PunctumInclinatumLiquescent;
      else if (note.shape === NoteShape.Oriscus)
        glyph = GlyphCode.OriscusLiquescent;
      else if (note.liquescent & LiquescentType.Ascending)
        glyph = GlyphCode.PunctumQuadratumAscLiquescent;
      else if (note.liquescent & LiquescentType.Descending)
        glyph = GlyphCode.PunctumQuadratumDesLiquescent;
      else glyph = GlyphCode.PunctumQuadratumLiquescent;
    } else {
      if (note.shapeModifiers & NoteShapeModifiers.Cavum)
        glyph = GlyphCode.PunctumCavum;
      else if (note.shape === NoteShape.Inclinatum)
        glyph = GlyphCode.PunctumInclinatum;
      else if (note.shape === NoteShape.Quilisma) glyph = GlyphCode.Quilisma;
      else glyph = GlyphCode.PunctumQuadratum;
    }

    this.build(ctxt).noteAt(note, glyph);

    this.finishLayout(ctxt);
  }
}

/*
 * Salicus
 */
class Salicus extends Neume {
  positionMarkings() {
    // by default place episema below
    // fixme: is this correct?
    for (var i = 0; i < this.notes.length; i++)
      this.positionEpisemataBelow(this.notes[i]);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    var first = this.notes[0];
    var second = this.notes[1];
    var third = this.notes[2];

    var builder = this.build(ctxt).noteAt(first, GlyphCode.PunctumQuadratum);

    // if the next note doesn't require a stem connector, then add a tad bit
    // of spacing here
    if (!(second.shapeModifiers & NoteShapeModifiers.Stemmed))
      builder.advanceBy(ctxt.intraNeumeSpacing);

    // second note is always an oriscus, which may or may not be stemmed
    // to the first
    builder.noteAt(second, GlyphCode.OriscusAsc);

    // third note can be a punctum quadratum or various liquescent forms
    if (third.liquescent & LiquescentType.Small)
      builder.noteAt(third, GlyphCode.TerminatingAscLiquescent);
    else if (third.liquescent === LiquescentType.Ascending)
      builder.noteAt(third, GlyphCode.PunctumQuadratumAscLiquescent);
    else if (third.liquescent === LiquescentType.Descending)
      builder.noteAt(third, GlyphCode.PunctumQuadratumDesLiquescent);
    else builder.virgaAt(third);

    this.finishLayout(ctxt);
  }
}

/*
 * Salicus Flexus
 */
class SalicusFlexus extends Neume {
  positionMarkings() {
    var hasTopEpisema = this.positionTorculusMarkings(
      this.notes[1],
      this.notes[2],
      this.notes[3]
    );
    this.positionEpisemata(
      this.notes[0],
      hasTopEpisema ? MarkingPositionHint.Above : MarkingPositionHint.Below
    );
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    var first = this.notes[0];
    var second = this.notes[1];
    var third = this.notes[2];
    var fourth = this.notes[3];

    var builder = this.build(ctxt).noteAt(first, GlyphCode.PunctumQuadratum);

    // if the next note doesn't require a stem connector, then add a tad bit
    // of spacing here
    if (!(second.shapeModifiers & NoteShapeModifiers.Stemmed))
      builder.advanceBy(ctxt.intraNeumeSpacing);

    // second note is always an oriscus, which may or may not be stemmed
    // to the first
    builder.noteAt(second, GlyphCode.OriscusAsc);

    // third note can be a punctum quadratum or various liquescent forms,
    // ...based on note four though!
    if (fourth.liquescent & LiquescentType.Small)
      builder.noteAt(third, GlyphCode.PunctumQuadratumDesLiquescent);
    else builder.noteAt(third, GlyphCode.PunctumQuadratum);

    // finally, do the fourth note
    if (fourth.liquescent & LiquescentType.Small)
      builder.noteAt(fourth, GlyphCode.TerminatingDesLiquescent);
    else if (fourth.liquescent & LiquescentType.Ascending)
      builder.noteAt(fourth, GlyphCode.PunctumQuadratumAscLiquescent);
    else if (fourth.liquescent & LiquescentType.Descending)
      builder.noteAt(fourth, GlyphCode.PunctumQuadratumDesLiquescent);
    else builder.noteAt(fourth, GlyphCode.PunctumQuadratum);

    this.finishLayout(ctxt);
  }
}

/*
 * Scandicus
 */
class Scandicus extends Neume {
  positionMarkings() {
    if (this.notes[2].shape === NoteShape.Virga) {
      this.positionPodatusMarkings(this.notes[0], this.notes[1]);
      this.positionEpisemataAbove(this.notes[2]);
    } else {
      this.positionEpisemataBelow(this.notes[0]);
      this.positionPodatusMarkings(this.notes[1], this.notes[2]);
    }
  }

  // if the third note shape is a virga, then the scadicus is rendered
  // as a podatus followed by a virga. Otherwise, it's rendered as a
  // punctum followed by a podatus...
  performLayout(ctxt) {
    super.performLayout(ctxt);

    var first = this.notes[0];
    var second = this.notes[1];
    var third = this.notes[2];

    if (third.shape === NoteShape.Virga) {
      this.build(ctxt).withPodatus(first, second).virgaAt(third);
    } else {
      this.build(ctxt)
        .noteAt(
          first,
          first.shape === NoteShape.Quilisma
            ? GlyphCode.Quilisma
            : GlyphCode.PunctumQuadratum
        )
        .withPodatus(second, third);
    }

    this.finishLayout(ctxt);
  }
}

/*
 * Scandicus Flexus
 */
class ScandicusFlexus extends Neume {
  positionMarkings() {
    if (this.notes[2].shape === NoteShape.Virga) {
      this.positionPodatusMarkings(this.notes[0], this.notes[1]);
      this.positionClivisMarkings(this.notes[2], this.notes[3]);
    } else {
      this.positionEpisemataBelow(this.notes[0]);
      this.positionPodatusMarkings(this.notes[1], this.notes[2]);
      this.positionEpisemataAbove(this.notes[3]);
    }
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    var first = this.notes[0];
    var second = this.notes[1];
    var third = this.notes[2];
    var fourth = this.notes[3];

    if (third.shape === NoteShape.Virga) {
      this.build(ctxt)
        .withPodatus(first, second)
        .advanceBy(ctxt.intraNeumeSpacing)
        .withClivis(third, fourth);
    } else {
      var fourthGlyph = GlyphCode.PunctumQuadratum;

      if (fourth.liquescent & LiquescentType.Ascending)
        fourthGlyph = GlyphCode.PunctumQuadratumAscLiquescent;
      else if (fourth.liquescent & LiquescentType.Descending)
        fourthGlyph = GlyphCode.PunctumQuadratumDesLiquescent;

      this.build(ctxt)
        .noteAt(first, GlyphCode.PunctumQuadratum)
        .withPodatus(second, third)
        .advanceBy(ctxt.intraNeumeSpacing)
        .noteAt(fourth, fourthGlyph);
    }

    this.finishLayout(ctxt);
  }
}

/*
 * Torculus
 */
class Torculus extends Neume {
  positionMarkings() {
    this.positionTorculusMarkings(this.notes[0], this.notes[1], this.notes[2]);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    var note1 = this.notes[0];
    var note2 = this.notes[1];
    var note3 = this.notes[2];

    var glyph1, glyph3;

    if (note1.liquescent === LiquescentType.InitioDebilis)
      glyph1 = GlyphCode.TerminatingDesLiquescent;
    else if (note1.shape === NoteShape.Quilisma) glyph1 = GlyphCode.Quilisma;
    else glyph1 = GlyphCode.PunctumQuadratum;

    if (note3.liquescent & LiquescentType.Small)
      glyph3 = GlyphCode.TerminatingDesLiquescent;
    else if (note3.liquescent & LiquescentType.Ascending)
      glyph3 = GlyphCode.PunctumQuadratumAscLiquescent;
    else if (note3.liquescent & LiquescentType.Descending)
      glyph3 = GlyphCode.PunctumQuadratumDesLiquescent;
    else glyph3 = GlyphCode.PunctumQuadratum;

    this.build(ctxt)
      .noteAt(note1, glyph1)
      .noteAt(note2, GlyphCode.PunctumQuadratum)
      .noteAt(note3, glyph3);

    this.finishLayout(ctxt);
  }
}

/*
 * TorculusResupinus
 */
class TorculusResupinus extends Neume {
  positionMarkings() {
    this.positionPorrectusMarkings(this.notes[1], this.notes[2], this.notes[3]);
    this.positionClivisEpisemata(this.notes[1], this.notes[0]);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    var first = this.notes[0];
    var second = this.notes[1];
    var third = this.notes[2];
    var fourth = this.notes[3];

    var firstGlyph, fourthGlyph;

    if (first.liquescent === LiquescentType.InitioDebilis) {
      firstGlyph = GlyphCode.TerminatingDesLiquescent;
    } else if (first.shape === NoteShape.Quilisma)
      firstGlyph = GlyphCode.Quilisma;
    else firstGlyph = GlyphCode.PunctumQuadratum;

    if (fourth.liquescent & LiquescentType.Small)
      fourthGlyph = GlyphCode.TerminatingAscLiquescent;
    else if (third.liquescent & LiquescentType.Descending)
      fourthGlyph = GlyphCode.PunctumQuadratumDesLiquescent;
    else fourthGlyph = GlyphCode.PodatusUpper;

    this.build(ctxt)
      .noteAt(first, firstGlyph)
      .withPorrectusSwash(second, third)
      .noteAt(fourth, fourthGlyph);

    this.finishLayout(ctxt);
  }
}

/*
 * TorculusResupinusFlexus
 */
class TorculusResupinusFlexus extends Neume {
  positionMarkings() {
    this.positionPorrectusFlexusMarkings(
      this.notes[1],
      this.notes[2],
      this.notes[3],
      this.notes[4]
    );
    this.positionClivisEpisemata(this.notes[1], this.notes[0]);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    var first = this.notes[0];
    var second = this.notes[1];
    var third = this.notes[2];
    var fourth = this.notes[3];
    var fifth = this.notes[4];

    var firstGlyph,
      fourthGlyph = GlyphCode.PunctumQuadratum,
      fifthGlyph;

    if (first.liquescent === LiquescentType.InitioDebilis) {
      firstGlyph = GlyphCode.TerminatingDesLiquescent;
    } else if (first.shape === NoteShape.Quilisma)
      firstGlyph = GlyphCode.Quilisma;
    else firstGlyph = GlyphCode.PunctumQuadratum;

    if (fifth.liquescent & LiquescentType.Small) {
      fourthGlyph = GlyphCode.PunctumQuadratumDesLiquescent;
      fifthGlyph = GlyphCode.TerminatingDesLiquescent;
    } else if (fifth.liquescent & LiquescentType.Ascending)
      fifthGlyph = GlyphCode.PunctumQuadratumAscLiquescent;
    else if (fifth.liquescent & LiquescentType.Descending)
      fifthGlyph = GlyphCode.PunctumQuadratumDesLiquescent;
    else fifthGlyph = GlyphCode.PunctumQuadratum;

    this.build(ctxt)
      .noteAt(first, firstGlyph)
      .withPorrectusSwash(second, third)
      .noteAt(fourth, fourthGlyph)
      .noteAt(fifth, fifthGlyph);

    this.finishLayout(ctxt);
  }
}

/*
 * Tristropha
 *
 * For simplicity in implementation, Tristropha's have three notes in the object
 * structure. These technically must be the same pitch though (like the
 * Distropha and Bivirga).
 */
class Tristropha extends Neume {
  positionMarkings() {
    this.positionEpisemataAbove(this.notes[0]);
    this.positionEpisemataAbove(this.notes[1]);
    this.positionEpisemataAbove(this.notes[2]);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);
    let glyphCodes = this.notes.map((note) =>
      Apostropha.getNoteGlyphCode(note)
    );
    let glyphAdvance =
      glyphCodes[0] === GlyphCode.Stropha
        ? ctxt.intraNeumeSpacing / 2
        : ctxt.intraNeumeSpacing;

    this.build(ctxt)
      .noteAt(this.notes[0], glyphCodes[0])
      .advanceBy(glyphAdvance)
      .noteAt(this.notes[1], glyphCodes[1])
      .advanceBy(glyphAdvance)
      .noteAt(this.notes[2], glyphCodes[2]);

    this.finishLayout(ctxt);
  }
}

/*
 * Virga
 */
class Virga extends Neume {
  positionMarkings() {
    this.positionEpisemataAbove(this.notes[0]);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    this.build(ctxt).virgaAt(this.notes[0]);

    this.finishLayout(ctxt);
  }
}

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


// reusable reg exps
var __syllablesRegex = /(?=\S)((?:<v>[\s\S]*?<\/v>|[^(])*)(?:\(?([^)]*)\)?)?/g;
var __altTranslationRegex = /<alt>(.*?)<\/alt>|\[(alt:)?(.*?)\]/g;

var __notationsRegex =
  /z0|z|Z|(::|(?::|[,;][1-8]?|`)_?)|(?:[cfg]|cb|treble-?|xp-?)[1-5]|\/+| |\!|-?[a-nA-N][oOwWvVrRsxy#~\+><_\.'0123459|]*(?:\[[^\]]*\]?)*|\{([^}]+)\}?/g;
var __notationsRegex_group_bar = 1;
var __notationsRegex_group_insideBraces = 2;

var __bracketedCommandRegex = /^([a-z]+):(.*)/;

// for the brace string inside of [ and ] in notation data
// the capturing groups are:
//  1. o or u, to indicate over or under
//  2. b, cb, or cba, to indicate the brace type
//  3. 0 or 1 to indicate the attachment point
//  4. { or } to indicate opening/closing (this group will be null if the metric version is used)
//  5. a float indicating the millimeter length of the brace (not supported yet)
var __braceSpecRegex = /([ou])(b|cb|cba):([01])(?:([{}])|;(\d*(?:\.\d+)?)mm)/;

const TrailingSpaceForAccidental = (ctxt) =>
  ctxt.intraNeumeSpacing * ctxt.accidentalSpaceMultiplier;
const TrailingSpaceMultiple = (multiplier) => (ctxt) =>
  ctxt.intraNeumeSpacing * multiplier;

const regexHeaderEnd = /(?:^|\n)%%\s?\n/;
const regexHeaderLine = /^([\w-_.]+):\s*((?:[^;\r\n]|;[ \t])*)(?:;|$)/i;
const regexHeaderComment = /^%.*/;
class GabcHeader {
  static getLength(gabc) {
    let match = gabc.match(regexHeaderEnd);
    return match ? match.index + match[0].length : 0;
  }

  constructor(text) {
    if (typeof text !== "string") text = "";
    this.comments = [];
    this.cValues = {};
    this.original = "";
    let match = text.match(regexHeaderEnd);
    if (match) {
      let txtHeader = (this.original = text.slice(
        0,
        match.index + match[0].length
      ));
      var lines = txtHeader.split(/\r?\n/g);
      for (var i = 0; i < lines.length; ++i) {
        let line = lines[i],
          match = regexHeaderLine.exec(line);
        if (match) {
          var key = match[1].replace(/-([a-z])/g, function (a, letter) {
            return letter.toUpperCase();
          });
          if (this[match[1]]) {
            var arrayName = match[1] + "Array";
            if (!this[arrayName]) {
              this[arrayName] = [this[match[1]]];
            }
            this[arrayName].push(match[2]);
          } else {
            this[match[1]] = match[2];
          }
          if (key !== match[1]) this[key] = this[match[1]];
        } else if ((match = regexHeaderComment.exec(line))) {
          if (line !== "%%") {
            match = regexHeaderLine.exec(line.slice(1));
            if (match) {
              let key = match[1].replace(/-([a-z])/g, function (a, letter) {
                return letter.toUpperCase();
              });
              this.cValues[match[1]] = match[2];
              if (key !== match[1]) this.cValues[key] = match[2];
            } else {
              this.comments[i] = line;
            }
          }
        }
      }
    }
  }

  toString() {
    var result = [];
    for (let key in this) {
      if (
        typeof this[key] !== "string" ||
        /^(length|original|comments|cValues)$/.test(key)
      ) {
        continue;
      }
      var alternateKey = key.replace(/[A-Z]/g, function (letter) {
        return "-" + letter.toLowerCase();
      });
      if (alternateKey !== key && alternateKey in this) continue;
      var array = this[key + "Array"];
      if (array) {
        for (var i = 0; i < array.length; ++i) {
          result.push(key + ": " + array[i] + ";");
        }
      } else {
        result.push(key + ": " + this[key] + ";");
      }
    }
    for (let key in this.cValues) {
      if (key.length === 0 || !this.cValues.hasOwnProperty(key)) continue;
      result.push("%" + key + ": " + this.cValues[key] + ";");
    }
    for (let i in this.comments) {
      if (!this.comments.hasOwnProperty(i)) continue;
      try {
        result.splice(i, 0, this.comments[i]);
      } catch (e) {
        console.warn(e);
      }
    }
    return result.join("\n") + "\n%%\n";
  }
}

var elementCountForNotations = (items) =>
  items.reduce((sum, item) => sum + (item.notes ? item.notes.length : 1), 0);

class Gabc {
  // takes gabc source code (without the header info) and returns an array
  // of ChantMappings describing the chant. A chant score can then be created
  // fron the chant mappings and later updated via updateMappings() if need
  // be...
  static createMappingsFromSource(ctxt, gabcSource) {
    var headerLength = GabcHeader.getLength(gabcSource);
    gabcSource = gabcSource.slice(headerLength);
    var words = this.splitWords(gabcSource);

    // set the default clef
    ctxt.activeClef = Clef.default();

    var mappings = this.createMappingsFromWords(
      ctxt,
      words,
      (clef) => (ctxt.activeClef = clef)
    );

    // always set the last notation to have a trailingSpace of 0. This makes layout for the last chant line simpler
    if (
      mappings.length > 0 &&
      mappings[mappings.length - 1].notations.length > 0
    )
      mappings[mappings.length - 1].notations[
        mappings[mappings.length - 1].notations.length - 1
      ].trailingSpace = 0;

    return mappings;
  }

  // A simple general purpose diff algorithm adapted here for comparing
  // an array of existing mappings with an updated list of gabc words.
  // note before is an array of mappings, and after is an array of strings
  // (gabc words).
  //
  // This is definitely not the most effecient diff algorithm, but for our
  // limited needs and source size it seems to work just fine...
  //
  // code is adapted from: https://github.com/paulgb/simplediff
  //
  // Returns:
  //   A list of pairs, with the first part of the pair being one of three
  //   strings ('-', '+', '=') and the second part being a list of values from
  //   the original before and/or after lists. The first part of the pair
  //   corresponds to whether the list of values is a deletion, insertion, or
  //   unchanged, respectively.
  static diffDescriptorsAndNewWords(before, after) {
    // Create a map from before values to their indices
    var oldIndexMap = {},
      i;
    for (i = 0; i < before.length; i++) {
      oldIndexMap[before[i].source] = oldIndexMap[before[i].source] || [];
      oldIndexMap[before[i].source].push(i);
    }

    var overlap = [],
      startOld,
      startNew,
      subLength,
      inew;

    startOld = startNew = subLength = 0;

    for (inew = 0; inew < after.length; inew++) {
      var _overlap = [];
      oldIndexMap[after[inew]] = oldIndexMap[after[inew]] || [];
      for (i = 0; i < oldIndexMap[after[inew]].length; i++) {
        var iold = oldIndexMap[after[inew]][i];
        // now we are considering all values of val such that
        // `before[iold] == after[inew]`
        _overlap[iold] = ((iold && overlap[iold - 1]) || 0) + 1;
        if (_overlap[iold] > subLength) {
          // this is the largest substring seen so far, so store its indices
          subLength = _overlap[iold];
          startOld = iold - subLength + 1;
          startNew = inew - subLength + 1;
        }
      }
      overlap = _overlap;
    }

    if (subLength === 0) {
      // If no common substring is found, we return an insert and delete...
      var result = [];

      if (before.length) result.push(["-", before]);

      if (after.length) result.push(["+", after]);

      return result;
    }

    // ...otherwise, the common substring is unchanged and we recursively
    // diff the text before and after that substring
    return [].concat(
      this.diffDescriptorsAndNewWords(
        before.slice(0, startOld),
        after.slice(0, startNew)
      ),
      [["=", after.slice(startNew, startNew + subLength)]],
      this.diffDescriptorsAndNewWords(
        before.slice(startOld + subLength),
        after.slice(startNew + subLength)
      )
    );
  }

  // this function essentially performs and applies a rudimentary diff between a
  // previously parsed set of mappings and between a new gabc source text.
  // the mappings array passed in is changed in place to be updated from the
  // new source
  static updateMappingsFromSource(
    ctxt,
    mappings,
    newGabcSource,
    insertionIndex = null,
    oldInsertionIndex = null
  ) {
    var headerLength = GabcHeader.getLength(newGabcSource);
    newGabcSource = newGabcSource.slice(headerLength);
    // always remove the last old mapping since it's spacing/trailingSpace is handled specially
    mappings.pop();

    if (insertionIndex === null) {
      insertionIndex = NaN;
    }
    if (oldInsertionIndex === null) {
      oldInsertionIndex = NaN;
    }

    var newWords = this.splitWords(newGabcSource);

    var results = this.diffDescriptorsAndNewWords(mappings, newWords);

    var index = 0,
      j,
      k,
      l,
      sourceIndex = 0,
      wordLength = 0,
      mapping,
      elementIndex = 0;

    ctxt.activeClef = Clef.default();

    // apply the results to the mappings, marking notations that need to be processed
    var lastTranslationNeumes = [];
    for (var i = 0; i < results.length; i++) {
      var resultCode = results[i][0];
      var resultValues = results[i][1];

      if (index > 0)
        sourceIndex =
          mappings[index - 1].sourceIndex +
          mappings[index - 1].source.length +
          1;
      if (resultCode === "=") {
        var sourceIndexDiff = sourceIndex - mappings[index].sourceIndex;
        // skip over ones that haven't changed, but updating the clef and source
        // index (and pitch in case clef or accidentals have changed) as we go
        for (j = 0; j < resultValues.length; j++, index++) {
          mapping = mappings[index];
          if (
            elementIndex === 0 &&
            mapping.notations.length &&
            mapping.notations[0].isClef
          ) {
            // the first clef doesn't get kept as a notation:
            elementIndex = -1;
          }
          if (
            insertionIndex >= elementIndex ||
            oldInsertionIndex >= elementIndex
          ) {
            // check if the insertion index is within this mapping:
            let elementCount = elementCountForNotations(mapping.notations);
            if (
              (insertionIndex >= elementIndex &&
                insertionIndex < elementIndex + elementCount) ||
              (oldInsertionIndex >= elementIndex &&
                oldInsertionIndex < elementIndex + elementCount)
            ) {
              // re-do this mapping:
              // TODO: check sourceIndex
              let sourceIndex = mapping.sourceIndex + sourceIndexDiff;
              mapping = this.createMappingFromWord(
                ctxt,
                resultValues[j],
                sourceIndex,
                lastTranslationNeumes,
                insertionIndex - elementIndex
              );
              mappings.splice(index, 1, mapping);

              elementIndex += elementCount;
              continue;
            }
            elementIndex += elementCount;
          }
          mapping.sourceIndex += sourceIndexDiff;
          for (k = 0; k < mapping.notations.length; k++) {
            var curNotation = mapping.notations[k];
            var prevIsAccidental =
              mapping.notations[k - 1] && mapping.notations[k - 1].isAccidental;
            // notify the notation that its dependencies are no longer valid
            curNotation.resetDependencies();

            if (curNotation.isClef) {
              ctxt.activeClef = mappings[index].notations[k];
            }

            if (curNotation.isAccidental) {
              ctxt.activeClef.activeAccidental = curNotation;
            } else if (
              curNotation.resetsAccidentals ||
              (!prevIsAccidental &&
                curNotation.hasLyrics() &&
                curNotation.lyrics[0].lyricType <= LyricType.BeginningSyllable)
            ) {
              ctxt.activeClef.resetAccidentals();
            }

            // update source index, pitch, and automatic braces
            if (curNotation.notes) {
              for (l = 0; l < curNotation.notes.length; ++l) {
                let note = curNotation.notes[l];
                note.sourceIndex += sourceIndexDiff;
                note.pitch = ctxt.activeClef.staffPositionToPitch(
                  this.getIntegerStaffPosition(note)
                );
                if (note.braceEnd && note.braceEnd.automatic)
                  delete note.braceEnd;
                if (this.needToEndBrace && !note.braceStart && !note.braceEnd) {
                  note.braceEnd = new BracePoint(
                    note,
                    this.needToEndBrace.isAbove,
                    this.needToEndBrace.shape,
                    this.needToEndBrace.attachment ===
                      BraceAttachment.Left
                      ? BraceAttachment.Right
                      : BraceAttachment.Left
                  );
                  note.braceEnd.automatic = true;
                  delete this.needToEndBrace;
                } else if (note.braceStart && note.braceStart.automatic) {
                  this.needToEndBrace = note.braceStart;
                }
              }
            }
            if (curNotation.translationText) {
              for (l = 0; l < curNotation.translationText.length; ++l) {
                let transText = curNotation.translationText[l];
                delete transText.endNeume;
                curNotation.translationText[l].sourceIndex += sourceIndexDiff;
                if (
                  transText.textAnchor === "end" &&
                  lastTranslationNeumes[0]
                ) {
                  let lastTranslationText =
                    lastTranslationNeumes[0].translationText[l];
                  if (lastTranslationText)
                    lastTranslationText.endNeume = curNotation;
                }
              }
              lastTranslationNeumes[0] = curNotation;
            }
            if (sourceIndexDiff) {
              if (typeof curNotation.sourceIndex === "number") {
                curNotation.sourceIndex += sourceIndexDiff;
              }
              for (l = 0; l < curNotation.lyrics.length; ++l) {
                curNotation.lyrics[l].sourceIndex += sourceIndexDiff;
              }
              if (curNotation.alText) {
                for (l = 0; l < curNotation.alText.length; ++l) {
                  curNotation.alText[l].sourceIndex += sourceIndexDiff;
                }
              }
            }
          }
        }
      } else if (resultCode === "-") {
        // delete elements that no longer exist, but first notify all
        // elements of the change
        mappings.splice(index, resultValues.length);
      } else if (resultCode === "+") {
        // insert new ones
        for (j = 0; j < resultValues.length; j++) {
          wordLength = resultValues[j].length + 1;
          mapping = this.createMappingFromWord(
            ctxt,
            resultValues[j],
            sourceIndex,
            lastTranslationNeumes,
            insertionIndex - elementIndex
          );

          if (
            elementIndex === 0 &&
            mapping.notations.length &&
            mapping.notations[0].isClef
          ) {
            // the first clef doesn't get kept as a notation:
            elementIndex = -1;
            let elementCount = elementCountForNotations(mapping.notations);
            if (insertionIndex < elementCount) {
              // re-do the first mapping, because it was broken up incorrectly, due to the presence of the initial clef
              mapping = this.createMappingFromWord(
                ctxt,
                resultValues[j],
                sourceIndex,
                lastTranslationNeumes,
                insertionIndex - elementIndex
              );
            }
          }

          for (k = 0; k < mapping.notations.length; k++) {
            let curNotation = mapping.notations[k];
            elementIndex += curNotation.notes ? curNotation.notes.length : 1;
            if (curNotation.isClef) {
              ctxt.activeClef = mapping.notations[k];
            }
          }

          mappings.splice(index++, 0, mapping);
          sourceIndex += wordLength;
        }
      }
    }

    // always set the last notation to have a trailingSpace of 0. This makes layout for the last chant line simpler
    if (
      mappings.length > 0 &&
      mappings[mappings.length - 1].notations.length > 0
    )
      mappings[mappings.length - 1].notations[
        mappings[mappings.length - 1].notations.length - 1
      ].trailingSpace = 0;

    return headerLength;
  }

  // takes an array of gabc words (like that returned by splitWords below)
  // and returns an array of ChantMapping objects, one for each word.
  static createMappingsFromWords(ctxt, words) {
    var mappings = [];
    var sourceIndex = 0,
      wordLength = 0,
      lastTranslationNeumes = [];

    for (var i = 0; i < words.length; i++) {
      sourceIndex += wordLength;
      wordLength = words[i].length + 1;
      var word = words[i].trim();

      if (word === "") continue;

      var mapping = this.createMappingFromWord(
        ctxt,
        word,
        sourceIndex,
        lastTranslationNeumes
      );

      if (mapping) mappings.push(mapping);
    }

    return mappings;
  }

  // takes a gabc word (like those returned by splitWords below) and returns
  // a ChantMapping object that contains the gabc word source text as well
  // as the generated notations.
  static createMappingFromWord(
    ctxt,
    word,
    sourceIndex,
    lastTranslationNeumes,
    insertionIndex
  ) {
    var matches = [];
    var notations = [];
    var currSyllable = 0;

    while ((match = __syllablesRegex.exec(word))) matches.push(match);

    for (var j = 0; j < matches.length; j++) {
      var match = matches[j];

      var lyricText = match[1].replace(
        /(^|<\/sp>)([\s\S]*?)($|<sp>)/g,
        (_, pre, main, post) => `${pre}${main.replace(/~/g, " ")}${post}`
      );
      var alText = [];
      var translationText = [];
      var notationData = match[2];

      // new words reset the accidentals, per the Solesmes style (see LU xviij)
      // but we need to also make sure that there _is_ a word and that it has notes associated with it.
      if (
        currSyllable === 0 &&
        /[a-z]/i.test(lyricText) &&
        /[a-n]/i.test(notationData)
      )
        ctxt.activeClef.resetAccidentals();

      var items = this.parseNotations(
        ctxt,
        notationData,
        sourceIndex + match.index + match[1].length + 1,
        insertionIndex
      );

      if (items.length === 0) continue;

      if (insertionIndex >= 0)
        insertionIndex -= elementCountForNotations(items);

      items[0].firstOfSyllable = !!lyricText;
      items[0].firstOfParentheses = true;
      notations.push(...items);

      // add the lyrics and/or alText to the first notation that makes sense...
      var notationWithLyrics = null;
      for (var i = 0; i < items.length; i++) {
        var cne = items[i];

        if (cne.isAccidental && i + 1 < items.length) continue;

        notationWithLyrics = cne;
        break;
      }

      var m = __altTranslationRegex.exec();
      let indexOffset = 0;
      while ((m = __altTranslationRegex.exec(lyricText))) {
        let index = m.index;
        lyricText =
          lyricText.slice(0, index) + lyricText.slice(index + m[0].length);
        index += sourceIndex + indexOffset + 1;
        if (typeof m[1] === "string") {
          let elem = new AboveLinesText(
            ctxt,
            m[1],
            notationWithLyrics,
            index + 4
          );
          elem.alIndex = alText.push(elem) - 1;
        } else if (typeof m[2] === "string") {
          let elem = new AboveLinesText(
            ctxt,
            m[3],
            notationWithLyrics,
            index + m[2].length
          );
          elem.alIndex = alText.push(elem) - 1;
        } else {
          let elem = new TranslationText(ctxt, m[3], notationWithLyrics, index);
          elem.translationIndex = translationText.push(elem) - 1;
        }
        indexOffset += m[0].length;
        __altTranslationRegex.exec();
      }
      if (lyricText === "" && alText.length === 0) continue;

      if (notationWithLyrics === null)
        return new ChantMapping(word, notations, sourceIndex);

      if (alText.length) notationWithLyrics.alText = alText;

      if (translationText.length) {
        notationWithLyrics.translationText = translationText;
        for (i = 0; i < translationText.length; ++i) {
          let transText = translationText[i];
          if (transText.textAnchor === "end" && lastTranslationNeumes[0]) {
            let lastTranslationText =
              lastTranslationNeumes[0].translationText[i];
            if (lastTranslationText)
              lastTranslationText.endNeume = notationWithLyrics;
          }
        }
        lastTranslationNeumes[0] = notationWithLyrics;
      }

      if (lyricText === "") continue;

      var proposedLyricType;

      // if it's not a neume or a TextOnly notation, then make the lyrics a directive
      if (!cne.isNeume && cne.constructor !== TextOnly)
        proposedLyricType = LyricType.Directive;
      // otherwise trye to guess the lyricType for the first lyric anyway
      else if (currSyllable === 0 && j === matches.length - 1)
        proposedLyricType = LyricType.SingleSyllable;
      else if (currSyllable === 0 && j < matches.length - 1)
        proposedLyricType = LyricType.BeginningSyllable;
      else if (j === matches.length - 1)
        proposedLyricType = LyricType.EndingSyllable;
      else proposedLyricType = LyricType.MiddleSyllable;

      currSyllable++;

      var lyrics = this.createSyllableLyrics(
        ctxt,
        lyricText,
        proposedLyricType,
        notationWithLyrics,
        items,
        sourceIndex + match.index
      );

      if (lyrics === null || lyrics.length === 0) continue;

      notationWithLyrics.lyrics = lyrics;
    }

    return new ChantMapping(word, notations, sourceIndex);
  }

  // returns an array of lyrics (an array because each syllable can have multiple lyrics)
  static createSyllableLyrics(
    ctxt,
    text,
    proposedLyricType,
    notation,
    notations,
    sourceIndex
  ) {
    var lyrics = [];

    // an extension to gabc: multiple lyrics per syllable can be separated by a |
    var lyricTexts = text.split("|");

    for (var i = 0; i < lyricTexts.length; i++) {
      var lyricText = lyricTexts[i];

      if (i > 0) {
        if (lyricText.match(/\s$/)) {
          lyricText = lyricText.replace(/s+$/, "");
          proposedLyricType = LyricType.EndingSyllable;
        } else {
          proposedLyricType = LyricType.MiddleSyllable;
        }
      }

      // gabc allows lyrics to indicate the centering part of the text by
      // using braces to indicate how to center the lyric. So a lyric can
      // look like "f{i}re" or "{fenced}" to center on the i or on the entire
      // word, respectively. Here we determine if the lyric should be spaced
      // manually with this method of using braces.
      // however, we don't want to consider any braces inside of v tags, so we
      // do a bit of text processing here:
      var lyricTextWithoutVTags = lyricText;
      const vtagRegex = /<v>[\s\S]*?<\/v>/;
      let match;
      const vtags = [];
      while ((match = vtagRegex.exec(lyricTextWithoutVTags))) {
        let index = match.index;
        let length = match[0].length;
        vtags[index] = length;
        lyricTextWithoutVTags =
          lyricTextWithoutVTags.slice(0, index) +
          lyricTextWithoutVTags.slice(index + length);
      }
      var centerStartIndex = lyricTextWithoutVTags.indexOf("{");
      var centerLength = 0;

      if (centerStartIndex >= 0) {
        let indexClosingBracket = lyricTextWithoutVTags.indexOf("}");

        if (
          indexClosingBracket >= 0 &&
          indexClosingBracket > centerStartIndex
        ) {
          const getTrueIndex = (indexWithoutVTags) => {
            // map indices back to the lyricText with the V tags:
            let accum = 0;
            for (let index in vtags) {
              if (vtags.hasOwnProperty(index) && indexWithoutVTags >= index) {
                accum += vtags[index];
              } else {
                break;
              }
            }
            return indexWithoutVTags + accum;
          };
          centerStartIndex = getTrueIndex(centerStartIndex);
          indexClosingBracket = getTrueIndex(indexClosingBracket);
          centerLength = indexClosingBracket - centerStartIndex - 1;

          // strip out the brackets:
          lyricText =
            lyricText.substring(0, centerStartIndex) +
            lyricText.substring(centerStartIndex + 1, indexClosingBracket) +
            lyricText.substring(indexClosingBracket + 1, lyricText.length);
        } else centerStartIndex = -1; // if there's no closing bracket, don't enable centering
      }

      var lyric = this.makeLyric(
        ctxt,
        lyricText,
        proposedLyricType,
        notation,
        notations,
        sourceIndex
      );

      if (centerStartIndex >= 0) {
        // update indices in case there had been any tags, etc.
        let textIndex = 0,
          centerEndIndex = -1;
        for (let span of lyric.spans) {
          if (
            centerStartIndex >= span.index &&
            centerStartIndex <= span.index + span.text.length
          ) {
            centerEndIndex = centerStartIndex + centerLength;
            centerStartIndex += textIndex - span.index;
          }
          if (
            centerEndIndex >= 0 &&
            centerEndIndex >= span.index &&
            centerEndIndex <= span.index + span.text.length
          ) {
            centerEndIndex += textIndex - span.index;
            centerLength = centerEndIndex - centerStartIndex;
            centerEndIndex = -1;
            break;
          }
          textIndex += span.text.length;
        }
        if (centerEndIndex >= 0) {
          centerEndIndex = textIndex;
          centerLength = centerEndIndex - centerStartIndex;
        }
      }

      // if we have manual lyric centering, then set it now
      if (centerStartIndex >= 0) {
        lyric.centerStartIndex = centerStartIndex;
        lyric.centerLength = centerLength;
      }

      lyric.lyricIndex = lyrics.push(lyric) - 1;
      sourceIndex += lyricText.length + 1;
    }
    notation.lyrics = lyrics;
    return lyrics;
  }

  static makeLyric(ctxt, text, lyricType, notation, notations, sourceIndex) {
    var elides = false;
    var forceConnector = false;
    if (text.length > 1) {
      if (text[text.length - 1] === "-") {
        forceConnector = true;
        if (lyricType === LyricType.EndingSyllable)
          lyricType = LyricType.MiddleSyllable;
        else if (lyricType === LyricType.SingleSyllable)
          lyricType = LyricType.BeginningSyllable;

        text = text.slice(0, -1);
      } else if (text[text.length - 1] === " ") {
        if (lyricType === LyricType.MiddleSyllable)
          lyricType = LyricType.EndingSyllable;
        else if (lyricType === LyricType.BeginningSyllable)
          lyricType = LyricType.SingleSyllable;

        text = text.slice(0, -1);
      } else if (/<\/i>$/.test(text)) {
        // must be an elision
        elides = true;
      }
    }

    if (text.match(/^(?:[*†]+|i+j|\d+)\.?$/)) lyricType = LyricType.Directive;

    var lyric = new Lyric(
      ctxt,
      text,
      lyricType,
      notation,
      notations,
      sourceIndex
    );
    lyric.elidesToNext = elides;
    if (forceConnector) lyric.setForceConnector(true);

    return lyric;
  }

  // takes a string of gabc notations and creates exsurge objects out of them.
  // returns an array of notations.
  static parseNotations(ctxt, data, sourceIndex, insertionIndex) {
    // if there is no data, then this must be a text only object
    if (!data) return [new TextOnly(sourceIndex, 0)];

    var baseSourceIndex = sourceIndex;
    var sourceLength = 0;
    var notations = [];
    var notes = [];
    var trailingSpace = DefaultTrailingSpace;

    var addToLastSourceGabc = (gabc) => {
      if (notes.length > 0) {
        notes[notes.length - 1].sourceGabc += gabc;
      }
    };
    var addNotation = (notation) => {
      // first, if we have any notes left over, we create a neume out of them
      if (notes.length > 0) {
        // create neume(s)
        var neumes = this.createNeumesFromNotes(ctxt, notes, trailingSpace);
        for (var i = 0; i < neumes.length; i++) notations.push(neumes[i]);

        notes = [];
      }

      // reset the trailing space
      trailingSpace = DefaultTrailingSpace;

      // then, if we're passed a notation, let's add it
      // also, perform chant logic here
      if (notation !== null) {
        let prevNotation = notations[notations.length - 1];
        notation.sourceIndex = sourceIndex;
        notation.sourceGabc = match[0];
        if (notation.isClef) {
          ctxt.activeClef = notation;
          if (
            prevNotation &&
            prevNotation.trailingSpace.isDefault &&
            prevNotation.isDivider
          ) {
            prevNotation.trailingSpace = TrailingSpaceForAccidental;
          }
        } else if (notation.isAccidental) {
          ctxt.activeClef.activeAccidental = notation;
        } else if (
          notation.trailingSpace.isDefault &&
          notation instanceof Custos
        ) {
          notation.trailingSpace = TrailingSpaceForAccidental;
        } else if (notation.resetsAccidentals)
          ctxt.activeClef.resetAccidentals();

        notations.push(notation);
      }
    };

    var regex = new RegExp(__notationsRegex);
    var match;

    while ((match = regex.exec(data))) {
      sourceIndex = baseSourceIndex + match.index;
      sourceLength = match[0].length;
      var atom = match[0];
      var bar = match[__notationsRegex_group_bar];

      let barWithCarryover = !!bar && bar.endsWith("_");
      if (barWithCarryover) {
        atom = atom.slice(0, -1);
      }

      // handle the clefs and dividers here
      switch (atom) {
        case ",":
          addNotation(new QuarterBar(barWithCarryover));
          break;
        case "`":
          addNotation(new Virgula(barWithCarryover));
          break;
        case ";":
          addNotation(new HalfBar(barWithCarryover));
          break;
        case ";1":
        case ";2":
        case ";3":
        case ";4":
        case ";5":
        case ";6":
        case ";7":
        case ";8":
        case ",1":
        case ",2":
        case ",3":
        case ",4":
        case ",5":
        case ",6":
        case ",7":
        case ",8":
          addNotation(new DominicanBar(parseInt(atom[1], 10)));
          break;
        case ":":
          addNotation(new FullBar(barWithCarryover));
          break;
        case "::":
          addNotation(new DoubleBar());
          break;
        // other gregorio dividers are not supported yet

        case "c1":
        case "c2":
        case "c3":
        case "c4":
        case "c5":
          addNotation(
            (ctxt.activeClef = new DoClef(2 * parseInt(atom[1], 10) - 1, 2))
          );
          break;
        case "f1":
        case "f2":
        case "f3":
        case "f4":
        case "f5":
          addNotation(
            (ctxt.activeClef = new FaClef(2 * parseInt(atom[1], 10) - 1, 2))
          );
          break;
        case "treble1":
        case "treble2":
        case "treble3":
        case "treble4":
        case "treble5":
        case "treble-1":
        case "treble-2":
        case "treble-3":
        case "treble-4":
        case "treble-5":
          addNotation(
            (ctxt.activeClef = new TrebleClef(
              2 * parseInt(atom.slice(-1), 10) - 1,
              2,
              null,
              atom[6] === "-"
            ))
          );
          break;
        case "xp1":
        case "xp2":
        case "xp3":
        case "xp4":
        case "xp5":
        case "xp-1":
        case "xp-2":
        case "xp-3":
        case "xp-4":
        case "xp-5":
          addNotation(
            (ctxt.activeClef = new ChiRhoClef(
              2 * parseInt(atom.slice(-1), 10) - 1,
              2,
              null,
              atom.slice(-2, -1) === "-"
            ))
          );
          break;
        case "cb1":
        case "cb2":
        case "cb3":
        case "cb4":
        case "cb5":
          {
            const line = 2 * parseInt(atom[2], 10) - 1;
            addNotation(
              (ctxt.activeClef = new DoClef(
                line,
                2,
                new Accidental(line - 1, AccidentalType.Flat)
              ))
            );
          }
          break;

        case "z":
          addNotation(new ChantLineBreak(true));
          break;
        case "Z":
          addNotation(new ChantLineBreak(false));
          break;
        case "z0":
          addNotation(new Custos(true));
          break;

        // spacing indicators
        case "!":
          trailingSpace = 0;
          addToLastSourceGabc(atom);
          addNotation(null);
          break;
        case " ":
          // fixme: is this correct? logically what is the difference in gabc
          // between putting a space between notes vs putting '//' between notes?
          trailingSpace = TrailingSpaceMultiple(2);
          addToLastSourceGabc(atom);
          addNotation(null);
          break;

        default:
          // might be a number of slashes, a custos, might be an accidental, or might be a note
          if (atom[0] === "/") {
            trailingSpace = TrailingSpaceMultiple(atom.length);
            addToLastSourceGabc(atom);
            addNotation(null);
          } else if (atom.length > 1 && atom.endsWith("+")) {
            // custos
            var custos = new Custos();

            this.setStaffPositionAndOffset(custos, atom);

            addNotation(custos);
          } else if (atom.length > 1 && /[xy#]/.test(atom[1])) {
            var accidentalType;

            switch (atom[1]) {
              case "y":
                accidentalType = AccidentalType.Natural;
                break;
              case "#":
                accidentalType = AccidentalType.Sharp;
                break;
              default:
                accidentalType = AccidentalType.Flat;
                break;
            }

            var noteArray = [];
            this.createNoteFromData(
              ctxt,
              ctxt.activeClef,
              atom,
              noteArray,
              sourceIndex
            );
            var accidental = new Accidental(
              noteArray[0].staffPosition,
              accidentalType
            );
            accidental.pitch = ctxt.activeClef.staffPositionToPitch(
              this.getIntegerStaffPosition(noteArray[0])
            );
            accidental.sourceIndex = sourceIndex;
            accidental.sourceLength = sourceLength;
            accidental.trailingSpace = TrailingSpaceForAccidental;

            ctxt.activeClef.activeAccidental = accidental;

            addNotation(accidental);
          } else if (atom.length > 1 && atom[0] === "{") {
            trailingSpace = 0;
            addNotation(null);
            let bracketedNotations = this.parseNotations(
              ctxt,
              match[__notationsRegex_group_insideBraces],
              sourceIndex + 1
            );
            // Set the width of these notations to 0
            bracketedNotations.forEach((neume) => {
              neume.hasNoWidth = true;
              neume.firstWithNoWidth = bracketedNotations[0];
            });
            notations.push(...bracketedNotations);
          } else {
            // looks like it's a note
            if (insertionIndex === -1) {
              trailingSpace = TrailingSpaceMultiple(1);
              addNotation(null);
            }
            this.createNoteFromData(
              ctxt,
              ctxt.activeClef,
              atom,
              notes,
              sourceIndex
            );
            --insertionIndex;
          }
          break;
      }
    }

    // finish up any remaining notes we have left
    addNotation(null);

    return notations;
  }

  static createNeumesFromNotes(ctxt, notes, finalTrailingSpace) {
    var neumes = [];
    var firstNoteIndex = 0;
    var currNoteIndex = 0;

    // here we use a simple finite state machine to create the neumes from the notes
    // createNeume is helper function which returns the next state after a neume is created
    // (unknownState). Each state object has a neume() function and a handle() function.
    // neume() allows us to create the neume of the state in the event that we run out
    // of notes. handle() gives the state an opportunity to examine the currNote and
    // determine what to do...either transition to a different neume/state, or
    // continue building the neume of that state. handle() returns the next state

    var createNeume = function (
      neume,
      includeCurrNote,
      includePrevNote = true
    ) {
      // add the notes to the neume
      var lastNoteIndex;
      if (includeCurrNote) lastNoteIndex = currNoteIndex;
      else if (includePrevNote) lastNoteIndex = currNoteIndex - 1;
      else lastNoteIndex = currNoteIndex - 2;

      if (lastNoteIndex < 0) return;

      while (firstNoteIndex <= lastNoteIndex) {
        let note = notes[firstNoteIndex++];
        neume.addNote(note);
        if (note.alText) {
          if (!neume.alText) neume.alText = [];
          neume.alText.push(note.alText);
          note.alText.noteIndex = firstNoteIndex - 1;
        }
      }

      neumes.push(neume);

      if (includeCurrNote === false) {
        currNoteIndex--;

        if (includePrevNote === false) currNoteIndex--;

        neume.keepWithNext = true;
        if (notes[currNoteIndex + 1].shape === NoteShape.Quilisma)
          neume.trailingSpace = 0;
        else {
          neume.trailingSpace = TrailingSpaceMultiple(1);
          neume.allowLineBreakBeforeNext = true;
        }
      }

      return unknownState;
    };

    var unknownState = {
      neume: function () {
        return new Punctum();
      },
      handle: function (currNote, prevNote) {
        if (currNote.shape === NoteShape.Virga) return virgaState;
        else if (currNote.shape === NoteShape.Stropha) return apostrophaState;
        else if (currNote.shape === NoteShape.Oriscus) return oriscusState;
        else if (currNote.shape === NoteShape.Inclinatum)
          return punctaInclinataState;
        else if (currNote.shapeModifiers & NoteShapeModifiers.Cavum)
          return createNeume(new Punctum(), true);
        else return punctumState;
      }
    };

    var punctumState = {
      neume: function () {
        return new Punctum();
      },
      handle: function (currNote, prevNote, notesRemaining) {
        if (currNote.shape || prevNote.liquescent === LiquescentType.Small) {
          var neume = new Punctum();
          var state = createNeume(neume, false);
          // if the current note is on a space within the staff AND the previous note is on the line below AND the previous note has a mora,
          // then we went the trailing space at its default of intraNeumeSpacing to prevent the dot from running up into the current note.
          // Otherwise, we want no trailing space.
          if (
            currNote.staffPosition > prevNote.staffPosition &&
            (currNote.staffPosition % 2 === 1 ||
              prevNote.staffPosition !== currNote.staffPosition - 1 ||
              !prevNote.morae ||
              prevNote.morae.length === 0)
          )
            neume.trailingSpace = 0;
          return state;
        }

        if (currNote.staffPosition > prevNote.staffPosition) {
          if (currNote.ictus)
            currNote.ictus.positionHint = MarkingPositionHint.Above;
          return podatusState;
        } else if (currNote.staffPosition < prevNote.staffPosition) {
          if (prevNote.ictus)
            prevNote.ictus.positionHint = MarkingPositionHint.Above;
          if (currNote.shape === NoteShape.Inclinatum) return climacusState;
          else {
            return clivisState;
          }
        } else if (!prevNote.morae || !prevNote.morae.length) {
          return distrophaState;
        }
        return createNeume(new Punctum(), false);
      }
    };

    var punctaInclinataState = {
      neume: function () {
        return new PunctaInclinata();
      },
      handle: function () {
        if (currNote.shape !== NoteShape.Inclinatum)
          return createNeume(new PunctaInclinata(), false);
        else return punctaInclinataState;
      }
    };

    var oriscusState = {
      neume: function () {
        return new Oriscus();
      },
      handle: function (currNote, prevNote) {
        if (currNote.shape === NoteShape.Default) {
          if (currNote.staffPosition > prevNote.staffPosition) {
            prevNote.shapeModifiers |= NoteShapeModifiers.Ascending;
            return createNeume(new PesQuassus(), true);
          } else if (currNote.staffPosition < prevNote.staffPosition) {
            prevNote.shapeModifiers |= NoteShapeModifiers.Descending;
            return createNeume(new Clivis(), true);
          }
        }
        // stand alone oriscus
        var neume = new Oriscus(),
          state = createNeume(neume, false);
        // if the current note is on a space within the staff AND the previous note is on the line below AND the previous note has a mora,
        // then we went the trailing space at its default of intraNeumeSpacing to prevent the dot from running up into the current note.
        // Otherwise, we want no trailing space.
        if (
          currNote.staffPosition > prevNote.staffPosition &&
          (currNote.staffPosition % 2 === 1 ||
            prevNote.staffPosition !== currNote.staffPosition - 1 ||
            !prevNote.morae ||
            prevNote.morae.length === 0)
        )
          neume.trailingSpace = 0;
        return state;
      }
    };

    var podatusState = {
      neume: function () {
        return new Podatus();
      },
      handle: function (currNote, prevNote) {
        if (currNote.staffPosition > prevNote.staffPosition) {
          if (currNote.ictus)
            currNote.ictus.positionHint = MarkingPositionHint.Above;
          if (prevNote.ictus)
            prevNote.ictus.positionHint = MarkingPositionHint.Below;

          if (prevNote.shape === NoteShape.Oriscus) return salicusState;
          else return scandicusState;
        } else if (currNote.staffPosition < prevNote.staffPosition) {
          if (currNote.shape === NoteShape.Inclinatum)
            return pesSubpunctisState;
          else return torculusState;
        } else return createNeume(new Podatus(), false);
      }
    };

    var clivisState = {
      neume: function () {
        return new Clivis();
      },
      handle: function (currNote, prevNote) {
        if (
          currNote.shape === NoteShape.Default &&
          currNote.staffPosition > prevNote.staffPosition
        ) {
          if (currNote.ictus)
            currNote.ictus.positionHint = MarkingPositionHint.Above;
          return porrectusState;
        } else if (
          currNote.staffPosition < prevNote.staffPosition &&
          currNote.liquescent & LiquescentType.Small
        ) {
          return createNeume(new Ancus(), true);
        } else {
          return createNeume(new Clivis(), false);
        }
      }
    };

    var climacusState = {
      neume: function () {
        return new Climacus();
      },
      handle: function (currNote, prevNote) {
        if (currNote.shape !== NoteShape.Inclinatum)
          return createNeume(new Climacus(), false);
        else return state;
      }
    };

    var porrectusState = {
      neume: function () {
        return new Porrectus();
      },
      handle: function (currNote, prevNote) {
        if (
          currNote.shape === NoteShape.Default &&
          currNote.staffPosition < prevNote.staffPosition
        )
          return createNeume(new PorrectusFlexus(), true);
        else return createNeume(new Porrectus(), false);
      }
    };

    var pesSubpunctisState = {
      neume: function () {
        return new PesSubpunctis();
      },
      handle: function (currNote, prevNote) {
        if (currNote.shape !== NoteShape.Inclinatum)
          return createNeume(new PesSubpunctis(), false);
        else return state;
      }
    };

    var salicusState = {
      neume: function () {
        return new Salicus();
      },
      handle: function (currNote, prevNote) {
        if (currNote.staffPosition < prevNote.staffPosition)
          return salicusFlexusState;
        else return createNeume(new Salicus(), false);
      }
    };

    var salicusFlexusState = {
      neume: function () {
        return new SalicusFlexus();
      },
      handle: function (currNote, prevNote) {
        return createNeume(new SalicusFlexus(), false);
      }
    };

    var scandicusState = {
      neume: function () {
        return new Scandicus();
      },
      handle: function (currNote, prevNote) {
        if (
          prevNote.shape === NoteShape.Virga &&
          currNote.shape === NoteShape.Inclinatum &&
          currNote.staffPosition < prevNote.staffPosition
        ) {
          // if we get here, then it seems we have a podatus, now being followed by a climacus
          // rather than a scandicus. react accordingly
          return createNeume(new Podatus(), false, false);
        } else if (
          currNote.shape === NoteShape.Default &&
          currNote.staffPosition < prevNote.staffPosition
        )
          return scandicusFlexusState;
        else return createNeume(new Scandicus(), false);
      }
    };

    var scandicusFlexusState = {
      neume: function () {
        return new ScandicusFlexus();
      },
      handle: function (currNote, prevNote) {
        return createNeume(new ScandicusFlexus(), false);
      }
    };

    var virgaState = {
      neume: function () {
        return new Virga();
      },
      handle: function (currNote, prevNote) {
        if (
          currNote.shape === NoteShape.Inclinatum &&
          currNote.staffPosition < prevNote.staffPosition
        )
          return climacusState;
        else if (
          currNote.shape === NoteShape.Virga &&
          currNote.staffPosition === prevNote.staffPosition
        )
          return bivirgaState;
        else return createNeume(new Virga(), false);
      }
    };

    var bivirgaState = {
      neume: function () {
        return new Bivirga();
      },
      handle: function (currNote, prevNote) {
        if (
          currNote.shape === NoteShape.Virga &&
          currNote.staffPosition === prevNote.staffPosition
        )
          return createNeume(new Trivirga(), true);
        else return createNeume(new Bivirga(), false);
      }
    };

    var apostrophaState = {
      neume: function () {
        return new Apostropha();
      },
      handle: function (currNote, prevNote) {
        if (currNote.staffPosition === prevNote.staffPosition)
          return distrophaState;
        else return createNeume(new Apostropha(), false);
      }
    };

    var distrophaState = {
      neume: function () {
        return new Distropha();
      },
      handle: function (currNote, prevNote) {
        if (currNote.staffPosition === prevNote.staffPosition) {
          if (prevNote.morae && prevNote.morae.length) {
            return createNeume(new Distropha(), false);
          } else {
            return tristrophaState;
          }
        } else return createNeume(new Apostropha(), false, false);
      }
    };

    var tristrophaState = {
      neume: function () {
        return new Tristropha();
      },
      handle: function (currNote, prevNote) {
        // we only create a tristropha when the note run ends after three
        // and the neume() function of this state is called. Otherwise
        // we always interpret the third note to belong to the next sequence
        // of notes.
        //
        // fixme: gabc allows any number of punctum/stropha in succession...
        // is this a valid neume type? Or is it just multiple *stropha neumes
        // in succession? Should we simplify the apostropha/distropha/
        // tristropha classes to a generic stropha neume that can have 1 or
        // more successive notes?
        return createNeume(new Distropha(), false, false);
      }
    };

    var torculusState = {
      neume: function () {
        return new Torculus();
      },
      handle: function (currNote, prevNote) {
        if (
          currNote.shape === NoteShape.Default &&
          currNote.staffPosition > prevNote.staffPosition
        ) {
          let prevNoteButOne = notes[currNoteIndex - 2];
          if (
            prevNoteButOne &&
            prevNoteButOne.staffPosition - prevNote.staffPosition <= 4
          ) {
            if (currNote.ictus)
              currNote.ictus.positionHint = MarkingPositionHint.Above;
            return torculusResupinusState;
          }
        }
        return createNeume(new Torculus(), false);
      }
    };

    var torculusResupinusState = {
      neume: function () {
        return new TorculusResupinus();
      },
      handle: function (currNote, prevNote) {
        if (
          currNote.shape === NoteShape.Default &&
          currNote.staffPosition < prevNote.staffPosition
        )
          return createNeume(new TorculusResupinusFlexus(), true);
        else return createNeume(new TorculusResupinus(), false);
      }
    };

    var state = unknownState;

    while (currNoteIndex < notes.length) {
      var prevNote = currNoteIndex > 0 ? notes[currNoteIndex - 1] : null;
      var currNote = notes[currNoteIndex];

      state = state.handle(
        currNote,
        prevNote,
        notes.length - 1 - currNoteIndex
      );

      // if we are on the last note, then try to create a neume if we need to.
      if (currNoteIndex === notes.length - 1 && state !== unknownState)
        createNeume(state.neume(), true);

      currNoteIndex++;
    }

    if (neumes.length > 0) {
      if (!finalTrailingSpace.isDefault) {
        neumes[neumes.length - 1].trailingSpace = finalTrailingSpace;
        neumes[neumes.length - 1].keepWithNext = true;

        if (finalTrailingSpace > 0)
          neumes[neumes.length - 1].allowLineBreakBeforeNext = neumes[
            neumes.length - 1
          ].keepWithNext = true;
      }
    }

    return neumes;
  }

  // appends any notes created to the notes array argument
  static createNoteFromData(ctxt, clef, data, notes, sourceIndex) {
    var note = new Note();
    note.sourceIndex = sourceIndex;
    note.sourceGabc = data;

    if (data.length < 1) throw "Invalid note data: " + data;

    if (data[0] === "-") {
      // liquescent initio debilis
      note.liquescent = LiquescentType.InitioDebilis;
      data = data.substring(1);
    }

    if (data.length < 1) throw "Invalid note data: " + data;

    if (data[0] === data[0].toUpperCase()) note.shape = NoteShape.Inclinatum;

    this.setStaffPositionAndOffset(note, data);
    note.pitch = clef.staffPositionToPitch(this.getIntegerStaffPosition(note));

    var mark;

    var episemaNoteIndex = notes.length;
    var episemaNote = note;

    // process the modifiers
    for (var i = 1; i < data.length; i++) {
      var c = data[i];
      var lookahead = "\0";

      var haveLookahead = i + 1 < data.length;
      if (haveLookahead) lookahead = data[i + 1];

      switch (c) {
        // rhythmic markings
        case ".":
          mark = null;

          // gabc supports putting up to two morae on each note, by repeating the
          // period. here, we check to see if we've already created a mora for the
          // note, and if so, we simply force the second one to have an Above
          // position hint. if a user decides to try to put position indicators
          // on the double morae (such as 1 or 2), then really the behavior is
          // not defined by gabc, so it's on the user to figure it out.
          if (note.morae.length > 0 && notes.length) {
            var previousNote = notes.slice(-1)[0];
            var previousMora = note.morae.slice(-1)[0];
            previousMora.note = previousNote;
          }

          mark = new Mora(ctxt, note);
          if (haveLookahead && lookahead === "1")
            mark.positionHint = MarkingPositionHint.Above;
          else if (haveLookahead && lookahead === "0")
            mark.positionHint = MarkingPositionHint.Below;

          note.morae.push(mark);
          break;

        case "_":
          var episemaHadModifier = false;

          mark = new HorizontalEpisema(episemaNote);
          while (haveLookahead) {
            if (lookahead === "0")
              mark.positionHint = MarkingPositionHint.Below;
            else if (lookahead === "1")
              mark.positionHint = MarkingPositionHint.Above;
            else if (lookahead === "2") mark.terminating = true;
            // episema terminates
            else if (lookahead === "3")
              mark.alignment = HorizontalEpisemaAlignment.Left;
            else if (lookahead === "4")
              mark.alignment = HorizontalEpisemaAlignment.Center;
            else if (lookahead === "5")
              mark.alignment = HorizontalEpisemaAlignment.Right;
            else break;

            // the gabc definition for episemata is so convoluted...
            // - double underscores create episemata over multiple notes.
            // - unless the _ has a 0, 1, 3, 4, or 5 modifier, which means
            //   another underscore puts a second episema on the same note
            // - (when there's a 2 lookahead, then this is treated as an
            //   unmodified underscore, so another underscore would be
            //   added to previous notes
            if (
              mark.alignment !== HorizontalEpisemaAlignment.Default &&
              mark.positionHint !== MarkingPositionHint.Below
            )
              episemaHadModifier = true;

            i++;
            haveLookahead = i + 1 < data.length;

            if (haveLookahead) lookahead = data[i + 1];
          }

          // since gabc allows consecutive underscores which is a shortcut to
          // apply the episemata to previous notes, we keep track of that here
          // in order to add the new episema to the correct note.

          if (episemaNote) episemaNote.episemata.push(mark);

          if (episemaNote === note && episemaHadModifier) episemaNote = note;
          else if (episemaNoteIndex >= 0 && notes.length > 0)
            episemaNote = notes[--episemaNoteIndex];

          break;

        case "'":
          mark = new Ictus(ctxt, note);
          if (haveLookahead && lookahead === "1")
            mark.positionHint = MarkingPositionHint.Above;
          else if (haveLookahead && lookahead === "0")
            mark.positionHint = MarkingPositionHint.Below;
          else if (note.shape === NoteShape.Virga)
            // ictus on a virga goes above by default:
            mark.positionHint = MarkingPositionHint.Above;

          note.ictus = mark;
          break;

        case "|":
          note.inclinataFlags = (note.inclinataFlags || 0) + 1;
          break;

        //note shapes
        case "r":
          if (haveLookahead && /^[0-5]$/.test(lookahead)) {
            switch (lookahead) {
              case "0":
                note.shapeModifiers |= NoteShapeModifiers.Cavum;
                note.shapeModifiers |= NoteShapeModifiers.Linea;
                break;
              case "1":
                note.accent = new Accent(
                  ctxt,
                  note,
                  GlyphCode.AcuteAccent
                );
                break;
              case "2":
                note.accent = new Accent(
                  ctxt,
                  note,
                  GlyphCode.GraveAccent
                );
                break;
              case "3":
                note.accent = new Accent(ctxt, note, GlyphCode.Circle);
                break;
              case "4":
                note.accent = new Accent(
                  ctxt,
                  note,
                  GlyphCode.Semicircle
                );
                break;
              case "5":
                note.accent = new Accent(
                  ctxt,
                  note,
                  GlyphCode.ReversedSemicircle
                );
                break;
            }
            i++;
          } else note.shapeModifiers |= NoteShapeModifiers.Cavum;
          break;

        case "R":
          note.shapeModifiers |= NoteShapeModifiers.Linea;
          break;

        case "s":
          if (note.shape === NoteShape.Stropha) {
            // if we're already a stropha, that means this is gabc's
            // quick stropha feature (e.g., gsss). create a new note
            let newNote = new Note();
            newNote.sourceIndex = sourceIndex + i;
            newNote.sourceGabc = "s";
            newNote.staffPosition = note.staffPosition;
            newNote.pitch = note.pitch;
            notes.push(note);
            note = newNote;
            episemaNoteIndex++; // since a new note was added, increase the index here
          }

          note.shape = NoteShape.Stropha;
          break;

        case "v":
          if (note.shape === NoteShape.Virga) {
            // if we're already a stropha, that means this is gabc's
            // quick virga feature (e.g., gvvv). create a new note
            let newNote = new Note();
            newNote.sourceIndex = sourceIndex + i;
            newNote.sourceGabc = "v";
            newNote.staffPosition = note.staffPosition;
            newNote.pitch = note.pitch;
            notes.push(note);
            note = newNote;
            episemaNoteIndex++; // since a new note was added, increase the index here
          }

          note.shape = NoteShape.Virga;
          break;

        case "V":
          note.shape = NoteShape.Virga;
          note.shapeModifers |= NoteShapeModifiers.Reverse;
          break;

        case "w":
          note.shape = NoteShape.Quilisma;
          break;

        case "o":
          note.shape = NoteShape.Oriscus;
          if (haveLookahead && lookahead === "<") {
            note.shapeModifiers |= NoteShapeModifiers.Ascending;
            i++;
          } else if (haveLookahead && lookahead === ">") {
            note.shapeModifiers |= NoteShapeModifiers.Descending;
            i++;
          }
          break;

        case "O":
          note.shape = NoteShape.Oriscus;
          if (haveLookahead && lookahead === "<") {
            note.shapeModifiers |=
              NoteShapeModifiers.Ascending | NoteShapeModifiers.Stemmed;
            i++;
          } else if (haveLookahead && lookahead === ">") {
            note.shapeModifiers |=
              NoteShapeModifiers.Descending | NoteShapeModifiers.Stemmed;
            i++;
          } else note.shapeModifiers |= NoteShapeModifiers.Stemmed;
          break;

        // liquescents
        case "~":
          if (note.shape === NoteShape.Inclinatum)
            note.liquescent |= LiquescentType.Small;
          else if (note.shape === NoteShape.Oriscus)
            note.liquescent |= LiquescentType.Large;
          else note.liquescent |= LiquescentType.Small;
          break;
        case "<":
          note.liquescent |= LiquescentType.Ascending;
          break;
        case ">":
          note.liquescent |= LiquescentType.Descending;
          break;

        // accidentals
        case "x":
          if (note.pitch.step === Step.Mi) note.pitch.step = Step.Me;
          else if (note.pitch.step === Step.Ti) note.pitch.step = Step.Te;
          break;
        case "y":
          if (note.pitch.step === Step.Te) note.pitch.step = Step.Ti;
          else if (note.pitch.step === Step.Me) note.pitch.step = Step.Mi;
          else if (note.pitch.step === Step.Du) note.pitch.step = Step.Do;
          else if (note.pitch.step === Step.Fu) note.pitch.step = Step.Fa;
          break;
        case "#":
          if (note.pitch.step === Step.Do) note.pitch.step = Step.Du;
          else if (note.pitch.step === Step.Fa) note.pitch.step = Step.Fu;
          break;

        // gabc special item groups
        case "[":
          // read in the whole group and parse it
          var startIndex = ++i;
          while (i < data.length && data[i] !== "]") i++;

          this.processInstructionForNote(
            ctxt,
            note,
            data.substring(startIndex, i),
            startIndex
          );
          break;
      }
    }

    if (
      this.needToEndBrace &&
      !note.braceStart &&
      !note.braceEnd &&
      !/[xy#]/.test(c)
    ) {
      note.braceEnd = new BracePoint(
        note,
        this.needToEndBrace.isAbove,
        this.needToEndBrace.shape,
        this.needToEndBrace.attachment === BraceAttachment.Left
          ? BraceAttachment.Right
          : BraceAttachment.Left
      );
      note.braceEnd.automatic = true;
      delete this.needToEndBrace;
    }

    notes.push(note);
  }

  // an instruction in this context is referring to a special gabc coding found after
  // notes between ['s and ]'s. choral signs and braces fall into this
  // category.
  //
  // currently only brace instructions are supported here!
  static processInstructionForNote(ctxt, note, instruction, sourceIndexOffset) {
    var results = instruction.match(__bracketedCommandRegex);
    if (results === null) return;
    var cmd = results[1];
    var data = results[2];
    switch (cmd) {
      case "cs":
        note.choralSign = new ChoralSign(
          ctxt,
          data,
          note,
          note.sourceIndex + sourceIndexOffset,
          instruction.length
        );
        return;
      case "alt":
        note.alText = new AboveLinesText(
          ctxt,
          data,
          note,
          note.sourceIndex + sourceIndexOffset,
          instruction.length
        );
        return;
    }

    results = instruction.match(__braceSpecRegex);

    if (results === null) return;

    // see the comments at the definition of __braceSpecRegex for the
    // capturing groups
    var above = results[1] === "o";
    var shape = BraceShape.CurlyBrace; // default

    switch (results[2]) {
      case "b":
        shape = BraceShape.RoundBrace;
        break;
      case "cb":
        shape = BraceShape.CurlyBrace;
        break;
      case "cba":
        shape = BraceShape.AccentedCurlyBrace;
        break;
    }

    var attachmentPoint =
      results[3] === "1"
        ? BraceAttachment.Left
        : BraceAttachment.Right;

    if (results[4] === "{" || results[5])
      note.braceStart = new BracePoint(
        note,
        above,
        shape,
        attachmentPoint
      );
    else
      note.braceEnd = new BracePoint(
        note,
        above,
        shape,
        attachmentPoint
      );

    // just have the next note end a brace that uses length;
    if (results[5]) {
      note.braceStart.automatic = true;
      this.needToEndBrace = note.braceStart;
    }
  }

  // takes raw gabc text source and parses it into words. For example, passing
  // in a string of "me(f.) (,) ma(fff)num(d!ewf) tu(fgF'E)am,(f.)" would return
  // an array of four strings: ["me(f.)", "(,)", "ma(fff)num(d!ewf)", "tu(fgF'E)am,(f.)"]
  static splitWords(gabcNotations) {
    // split the notations on whitespace boundaries, as long as the space
    // immediately follows a set of parentheses. Prior to doing that, we replace
    // all whitespace with spaces, which prevents tabs and newlines from ending
    // up in the notation data.
    gabcNotations = gabcNotations
      // .trim()
      // .replace(/\s/g, " ")
      .replace(/\)\s(?=[^\)]*(?:\(|$))/g, ")\n");
    return gabcNotations.split(/\n/g);
  }

  static parseSource(gabcSource) {
    return this.parseWords(this.splitWords(gabcSource));
  }

  // gabcWords is an array of strings, e.g., the result of splitWords above
  static parseWords(gabcWords) {
    var words = [];

    for (var i = 0; i < gabcWords.length; i++)
      words.push(this.parseWord(gabcWords[i]));

    return words;
  }

  // returns an array of objects, each of which has the following properties
  //  - notations (string)
  //  - lyrics (array of strings)
  static parseWord(gabcWord) {
    var syllables = [];
    var matches = [];

    syllables.wordLength = gabcWord.length;

    while ((match = __syllablesRegex.exec(gabcWord))) matches.push(match);

    for (var j = 0; j < matches.length; j++) {
      var match = matches[j];

      var lyrics = match[1].trim().split("|");
      var notations = match[2];

      syllables.push({
        notations: notations,
        lyrics: lyrics
      });
    }

    return syllables;
  }

  /**
   *
   * @param {*} gabcHeight gabc letter a through m
   * @returns pitch
   */
  static gabcHeightToExsurgeHeight(gabcHeight) {
    return gabcHeight.toLowerCase().charCodeAt(0) - "c".charCodeAt(0);
  }

  /**
   *
   * @param {*} staffPosition
   * @param {*} zeroOrNine 0 or 9 or nothing, to shift a little down or up
   * @returns staffposition offset
   */
  static getStaffPositionOffset(staffPosition, zeroOrNine) {
    let offset = 0;
    if (/0|9/.test(zeroOrNine)) {
      const basis = staffPosition % 2 ? 2 : 1;
      offset = (Number(zeroOrNine) ? basis : -basis) / 3;
    }
    return offset;
  }

  /**
   *
   * @param {*} note to set staffPosition and staffPositionOffset on
   * @param {*} gabcAtom gabc letter from a to m with modifiers
   */
  static setStaffPositionAndOffset(note, gabcAtom) {
    const staffPosition = this.gabcHeightToExsurgeHeight(gabcAtom[0]);
    note.staffPositionOffset = this.getStaffPositionOffset(
      staffPosition,
      gabcAtom[1]
    );
    note.staffPosition = staffPosition + note.staffPositionOffset;
  }

  /**
   * Recovers the integer staff position of a note, which is what determines
   * its pitch.
   *
   * note.staffPosition *includes* note.staffPositionOffset, the fractional
   * one third or two thirds nudge that the gabc 0 and 9 modifiers apply for
   * engraving reasons. Pitch belongs to the line or space the note actually
   * sits on, so that nudge has to come back off before asking a clef for a
   * pitch -- and the result has to be rounded, because the round trip
   * through binary floating point does not always land back on the integer
   * (g9 comes back as 3.9999999999999996).
   *
   * Getting this wrong is not a rounding error in the output: a non-integer
   * reaches Pitch.staffOffsetToStep, which uses it to index an array and so
   * returns undefined, leaving the note with a NaN pitch.
   *
   * @param {*} note to read staffPosition and staffPositionOffset from
   * @returns integer staff position
   */
  static getIntegerStaffPosition(note) {
    return Math.round(note.staffPosition - (note.staffPositionOffset || 0));
  }
}

//
// Author(s):
// Benjamin Bloomfield <benjamin@sourceandsummit.com>
//
// Copyright (c) 2019
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


class Titles extends ChantLayoutElement {
  constructor(
    ctxt,
    score,
    { supertitle, title, subtitle, textLeft, textRight } = {}
  ) {
    super();
    this.score = score;
    this.setSupertitle(ctxt, supertitle);
    this.setTitle(ctxt, title);
    this.setSubtitle(ctxt, subtitle);
    this.setTextLeft(ctxt, textLeft);
    this.setTextRight(ctxt, textRight);
  }

  setBoundsX(ctxt, elementName, width) {
    let element = this[elementName];
    switch (ctxt.textStyles[elementName].alignment) {
      case "left":
        element.textAnchor = "start";
        element.bounds.x = 0;
        break;
      case "right":
        element.textAnchor = "end";
        element.bounds.x = width;
        break;
      case "center":
      default:
        element.textAnchor = "middle";
        element.bounds.x = width / 2;
    }
  }

  /**
   * Lays out the titles, and returns their total height
   * @param  {ChantContext} ctxt
   * @return {number}      the tottal height of titles laid out
   */
  layoutTitles(ctxt, width) {
    this.bounds = new Rect(0, 0, 0, 0);
    let y = 0;
    if (this.supertitle) {
      this.supertitle.recalculateMetrics(ctxt);
      this.supertitle.setMaxWidth(ctxt, width);

      this.setBoundsX(ctxt, "supertitle", width);
      this.supertitle.bounds.y = y;
      this.bounds.union(this.supertitle.bounds);
      this.supertitle.bounds.y += this.supertitle.origin.y;
      y += this.supertitle.bounds.height + this.supertitle.padding(ctxt);
    }
    if (this.title) {
      if (y) y += this.title.padding(ctxt);
      this.title.recalculateMetrics(ctxt);
      this.title.setMaxWidth(ctxt, width);
      this.setBoundsX(ctxt, "title", width);
      this.title.bounds.y = y;
      this.bounds.union(this.title.bounds);
      this.title.bounds.y += this.title.origin.y;
      y += this.title.bounds.height + this.title.padding(ctxt);
    }
    if (this.subtitle) {
      if (y) y += this.subtitle.padding(ctxt);
      this.subtitle.recalculateMetrics(ctxt);
      this.subtitle.setMaxWidth(ctxt, width);
      this.setBoundsX(ctxt, "subtitle", width);
      this.subtitle.bounds.y = y;
      this.bounds.union(this.subtitle.bounds);
      this.subtitle.bounds.y += this.subtitle.origin.y;
      y += this.subtitle.bounds.height + this.subtitle.padding(ctxt);
    }
    let finalY = y,
      textLeft = this.score.overrideTextLeft || this.textLeft;
    if (textLeft) {
      textLeft.recalculateMetrics(ctxt);
      textLeft.bounds.y = y;
      this.bounds.union(textLeft.bounds);
      textLeft.bounds.y += textLeft.origin.y;
      finalY = y + textLeft.bounds.height + textLeft.padding(ctxt);
    }
    if (this.textRight) {
      this.textRight.recalculateMetrics(ctxt);
      this.textRight.bounds.x = width;
      this.textRight.bounds.y = y;
      this.bounds.union(this.textRight.bounds);
      this.textRight.bounds.y += this.textRight.origin.y;
      finalY = Math.max(
        finalY,
        y + this.textRight.bounds.height + this.textRight.padding(ctxt)
      );
    }
    return finalY;
  }

  setSupertitle(ctxt, supertitle) {
    this.supertitle = supertitle ? new Supertitle(ctxt, supertitle) : null;
  }
  setTitle(ctxt, title) {
    this.title = title ? new Title(ctxt, title) : null;
  }
  setSubtitle(ctxt, subtitle) {
    this.subtitle = subtitle ? new Subtitle(ctxt, subtitle) : null;
  }
  setTextLeft(ctxt, textLeft) {
    this.textLeft = textLeft
      ? new TextLeftRight(ctxt, textLeft, "textLeft")
      : null;
  }
  setTextRight(ctxt, textRight) {
    this.textRight = textRight
      ? new TextLeftRight(ctxt, textRight, "textRight")
      : null;
  }

  hasSupertitle(ctxt, supertitle) {
    return !!this.supertitle;
  }
  hasTitle(ctxt, title) {
    return !!this.title;
  }
  hasSubtitle(ctxt, subtitle) {
    return !!this.subtitle;
  }
  hasTextLeft(ctxt, textLeft) {
    return !!this.textLeft;
  }
  hasTextRight(ctxt, textRight) {
    return !!this.textRight;
  }

  draw(ctxt, scale = 1) {
    var canvasCtxt = ctxt.canvasCtxt;
    canvasCtxt.translate(this.bounds.x, this.bounds.y);

    for (let el of [
      this.supertitle,
      this.title,
      this.subtitle,
      this.score.overrideTextLeft || this.textLeft,
      this.textRight
    ]) {
      if (el) el.draw(ctxt, scale);
    }

    canvasCtxt.translate(-this.bounds.x, -this.bounds.y);
  }

  getInnerNodes(ctxt, functionName = "createSvgNode") {
    var nodes = [];

    for (let el of [
      this.supertitle,
      this.title,
      this.subtitle,
      this.score.overrideTextLeft || this.textLeft,
      this.textRight
    ]) {
      if (el) nodes.push(el[functionName](ctxt));
    }
    return nodes;
  }

  createSvgNode(ctxt) {
    var nodes = this.getInnerNodes(ctxt, "createSvgNode");

    var node = QuickSvg.createNode("g", { class: "Titles" }, nodes);

    node.source = this;
    this.svg = node;

    return node;
  }

  createSvgTree(ctxt) {
    var nodes = this.getInnerNodes(ctxt, "createSvgTree");

    return QuickSvg.createSvgTree(
      "g",
      { class: "Titles", source: this },
      ...nodes
    );
  }

  createSvgFragment(ctxt) {
    var fragment = "";

    for (let el of [
      this.supertitle,
      this.title,
      this.subtitle,
      this.score.overrideTextLeft || this.textLeft,
      this.textRight
    ]) {
      if (el) fragment += el.createSvgFragment(ctxt);
    }

    fragment = QuickSvg.createFragment("g", { class: "Titles" }, fragment);
    return fragment;
  }
}

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


var LiquescentType = {
  None: 0,

  // flags that can be combined, though of course it
  // it doesn't make sense to combine some!
  Large: 1 << 0,
  Small: 1 << 1,
  Ascending: 1 << 2,
  Descending: 1 << 3,
  InitioDebilis: 1 << 4,

  // handy liquescent types
  LargeAscending: (1 << 0) | (1 << 2),
  LargeDescending: (1 << 0) | (1 << 3),
  SmallAscending: (1 << 1) | (1 << 2),
  SmallDescending: (1 << 1) | (1 << 3)
};

var NoteShape = {
  // shapes
  Default: 0,
  Virga: 1,
  Inclinatum: 2,
  Quilisma: 3,
  Stropha: 4,
  Oriscus: 5
};

var NoteShapeModifiers = {
  // flags which modify the shape
  // not all of them apply to every shape of course
  None: 0,
  Ascending: 1 << 0,
  Descending: 1 << 1,
  Cavum: 1 << 2,
  Stemmed: 1 << 3,
  Linea: 1 << 4,
  Reverse: 1 << 5
};

/**
 * @class
 */
class Note extends ChantLayoutElement {
  /**
   * @para {Pitch} pitch
   */
  constructor(pitch) {
    super();

    if (typeof pitch !== "undefined") this.pitch = pitch;
    else this.pitch = null;

    this.glyphVisualizer = null;

    // The staffPosition on a note is an integer that indicates the vertical position on the staff.
    // 0 is the space just below the lowest line on the staff (equivalent to gabc 'c'). Positive numbers go up
    // the staff, and negative numbers go down, i.e., 1 is gabc 'd', 2 is gabc 'e', -1 is gabc 'b', etc.
    this.staffPosition = 4;
    this.liquescent = LiquescentType.None;
    this.shape = NoteShape.Default;
    this.shapeModifiers = NoteShapeModifiers.None;

    // notes keep track of the neume they belong to in order to facilitate layout
    // this.neume gets set when a note is added to a neume via Neume.addNote()
    this.neume = null;

    // various markings that can exist on a note, organized by type
    // for faster access and simpler code logic
    this.episemata = [];
    this.morae = []; // silly to have an array of these, but gabc allows multiple morae per note!

    // these are set on the note when they are needed, otherwise, they're undefined
    // this.ictus
    // this.accuteAccent
    // this.braceStart
    // this.braceEnd
  }

  setGlyph(ctxt, glyphCode) {
    if (this.glyphVisualizer) this.glyphVisualizer.setGlyph(ctxt, glyphCode);
    else this.glyphVisualizer = new GlyphVisualizer(ctxt, glyphCode);

    this.glyphVisualizer.setStaffPosition(ctxt, this.staffPosition);

    // assign glyphvisualizer metrics to this note
    this.bounds.x = this.glyphVisualizer.bounds.x;
    this.bounds.y = this.glyphVisualizer.bounds.y;
    this.bounds.width = this.glyphVisualizer.bounds.width;
    this.bounds.height = this.glyphVisualizer.bounds.height;

    this.origin.x = this.glyphVisualizer.origin.x;
    this.origin.y = this.glyphVisualizer.origin.y;
  }

  // a utility function for modifiers
  shapeModifierMatches(shapeModifier) {
    if (shapeModifier === NoteShapeModifiers.None)
      return this.shapeModifier === NoteShapeModifiers.None;
    else return this.shapeModifier & (shapeModifier !== 0);
  }

  draw(ctxt) {
    this.glyphVisualizer.bounds.x = this.bounds.x;
    this.glyphVisualizer.bounds.y = this.bounds.y;

    this.glyphVisualizer.draw(ctxt);
  }

  createSvgNode(ctxt) {
    this.glyphVisualizer.bounds.x = this.bounds.x;
    this.glyphVisualizer.bounds.y = this.bounds.y;
    this.svgNode = this.glyphVisualizer.createSvgNode(ctxt, this);
    return this.svgNode;
  }
  createSvgTree(ctxt) {
    this.glyphVisualizer.bounds.x = this.bounds.x;
    this.glyphVisualizer.bounds.y = this.bounds.y;
    return this.glyphVisualizer.createSvgTree(ctxt, this);
  }

  createSvgFragment(ctxt) {
    this.glyphVisualizer.bounds.x = this.bounds.x;
    this.glyphVisualizer.bounds.y = this.bounds.y;
    return this.glyphVisualizer.createSvgFragment(ctxt, this);
  }
}

class Clef extends ChantNotationElement {
  constructor(staffPosition, octave, defaultAccidental = null) {
    super();

    this.isClef = true;
    this.staffPosition = staffPosition;
    this.octave = octave;
    this.defaultAccidental = defaultAccidental;
    this.activeAccidental = defaultAccidental;
    this.keepWithNext = true;
  }

  resetAccidentals() {
    this.activeAccidental = this.defaultAccidental;
  }

  pitchToStaffPosition(pitch) {}

  performLayout(ctxt) {
    ctxt.activeClef = this;

    if (this.defaultAccidental) this.defaultAccidental.performLayout(ctxt);

    super.performLayout(ctxt);
  }

  finishLayout(ctxt) {
    // if we have a default accidental, then add a glyph for it now
    if (this.defaultAccidental) {
      var accidentalGlyph = this.defaultAccidental.createGlyphVisualizer(ctxt);
      accidentalGlyph.bounds.x +=
        this.visualizers[0].bounds.right() + ctxt.intraNeumeSpacing;
      this.addVisualizer(accidentalGlyph);
    }

    super.finishLayout(ctxt);
  }

  static default() {
    return __defaultDoClef;
  }

  clone() {
    if (this.model) return this.model.clone();
    let clone = new this.constructor(
      this.staffPosition,
      this.octave,
      this.defaultAccidental
    );
    clone.small = this.small;
    clone.sans = this.sans;
    clone.sourceGabc = this.sourceGabc;
    clone.sourceIndex = this.sourceIndex;
    clone.elementIndex = this.elementIndex;
    clone.model = this;
    return clone;
  }
}

class DoClef extends Clef {
  constructor(staffPosition, octave, defaultAccidental = null) {
    super(staffPosition, octave, defaultAccidental);

    this.leadingSpace = 0;
  }

  pitchToStaffPosition(pitch) {
    return (
      (pitch.octave - this.octave) * 7 +
      this.staffPosition +
      Pitch.stepToStaffOffset(pitch.step) -
      Pitch.stepToStaffOffset(Step.Do)
    );
  }

  staffPositionToPitch(staffPosition) {
    var offset = staffPosition - this.staffPosition;
    var octaveOffset = Math.floor(offset / 7);

    var step = Pitch.staffOffsetToStep(offset);

    if (
      this.activeAccidental &&
      this.activeAccidental.staffPosition === staffPosition
    )
      step += this.activeAccidental.accidentalType;

    return new Pitch(step, this.octave + octaveOffset);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    var glyph = new GlyphVisualizer(ctxt, GlyphCode.DoClef);
    glyph.setStaffPosition(ctxt, this.staffPosition);
    this.addVisualizer(glyph);

    this.finishLayout(ctxt);
  }
}

var __defaultDoClef = new DoClef(7, 2);

class FaClef extends Clef {
  constructor(staffPosition, octave, defaultAccidental = null) {
    super(staffPosition, octave, defaultAccidental);

    this.leadingSpace = 0;
  }

  pitchToStaffPosition(pitch) {
    return (
      (pitch.octave - this.octave) * 7 +
      this.staffPosition +
      Pitch.stepToStaffOffset(pitch.step) -
      Pitch.stepToStaffOffset(Step.Fa)
    );
  }

  staffPositionToPitch(staffPosition) {
    var offset = staffPosition - this.staffPosition + 3; // + 3 because it's a fa clef (3 == offset from Do)
    var octaveOffset = Math.floor(offset / 7);

    var step = Pitch.staffOffsetToStep(offset);

    if (
      this.activeAccidental &&
      this.activeAccidental.staffPosition === staffPosition
    )
      step += this.activeAccidental.accidentalType;

    return new Pitch(step, this.octave + octaveOffset);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    var glyph = new GlyphVisualizer(ctxt, GlyphCode.FaClef);
    glyph.setStaffPosition(ctxt, this.staffPosition);
    this.addVisualizer(glyph);

    this.finishLayout(ctxt);
  }
}

class TrebleClef extends Clef {
  constructor(staffPosition, octave, defaultAccidental = null, small = false) {
    super(staffPosition, octave, defaultAccidental);

    this.leadingSpace = 0;
    this.small = small;
  }

  pitchToStaffPosition(pitch) {
    return (
      (pitch.octave - this.octave) * 7 +
      this.staffPosition +
      Pitch.stepToStaffOffset(pitch.step) -
      Pitch.stepToStaffOffset(Step.So)
    );
  }

  staffPositionToPitch(staffPosition) {
    var offset = staffPosition - this.staffPosition + 4; // + 4 because it's a sol clef (4 == offset from Do)
    var octaveOffset = Math.floor(offset / 7);

    var step = Pitch.staffOffsetToStep(offset);

    if (
      this.activeAccidental &&
      this.activeAccidental.staffPosition === staffPosition
    )
      step += this.activeAccidental.accidentalType;

    return new Pitch(step, this.octave + octaveOffset);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    var glyph = new GlyphVisualizer(
      ctxt,
      this.small ? GlyphCode.TrebleClefSmall : GlyphCode.TrebleClef
    );
    glyph.setStaffPosition(ctxt, this.staffPosition);
    this.addVisualizer(glyph);

    this.finishLayout(ctxt);
  }
}

class ChiRhoClef extends Clef {
  constructor(staffPosition, octave, defaultAccidental = null, sans = false) {
    super(staffPosition, octave, defaultAccidental);

    this.leadingSpace = 0;
    this.sans = sans;
  }

  // TODO: actually handle this correctly?
  pitchToStaffPosition(pitch) {
    return (
      (pitch.octave - this.octave) * 7 +
      this.staffPosition +
      Pitch.stepToStaffOffset(pitch.step) -
      Pitch.stepToStaffOffset(Step.Do)
    );
  }

  // TODO: actually handle this correctly?
  staffPositionToPitch(staffPosition) {
    var offset = staffPosition - this.staffPosition;
    var octaveOffset = Math.floor(offset / 7);

    var step = Pitch.staffOffsetToStep(offset);

    if (
      this.activeAccidental &&
      this.activeAccidental.staffPosition === staffPosition
    )
      step += this.activeAccidental.accidentalType;

    return new Pitch(step, this.octave + octaveOffset);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    var glyph = new GlyphVisualizer(
      ctxt,
      this.sans ? GlyphCode.ChiRhoClefSans : GlyphCode.ChiRhoClef
    );
    glyph.setStaffPosition(ctxt, this.staffPosition);
    this.addVisualizer(glyph);

    this.finishLayout(ctxt);
  }
}

/*
 * TextOnly
 */
class TextOnly extends ChantNotationElement {
  constructor(sourceIndex, sourceLength) {
    super();
    this.sourceIndex = sourceIndex;
    this.sourceLength = sourceLength;
    this.sourceGabc = "";
    this.trailingSpace = 0;
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    // add an empty glyph as a placeholder
    this.addVisualizer(new GlyphVisualizer(ctxt, GlyphCode.None));

    this.origin.x = 0;
    this.origin.y = -ctxt.staffInterval;

    this.finishLayout(ctxt);
  }
}

class ChantLineBreak extends ChantNotationElement {
  constructor(justify) {
    super();
    this.calculatedTrailingSpace = this.trailingSpace = 0;
    this.justify = justify;
  }

  performLayout(ctxt) {
    // reset the bounds before doing a layout
    this.bounds = new Rect(0, 0, 0, 0);
  }

  clone() {
    var lb = new ChantLineBreak();
    lb.justify = this.justify;

    return lb;
  }
}

// a chant mapping is a lightweight format independent way of
// tracking how a chant language (e.g., gabc) has been
// mapped to exsurge notations.
class ChantMapping {
  // source can be any object type. in the case of gabc, source is a text
  // string that maps to a gabc word (e.g.: "no(g)bis(fg)").
  // notations is an array of ChantNotationElements
  constructor(source, notations, sourceIndex) {
    this.source = source;
    this.notations = notations;
    this.sourceIndex = sourceIndex;
  }
}

/*
 * Score, document
 */
class ChantScore {
  // mappings is an array of ChantMappings.
  constructor(ctxt, mappings = [], useDropCap) {
    this.mappings = mappings;

    this.lines = [];
    this.notes = [];
    this.staffLineCount = 4;
    if (ctxt) this.titles = new Titles(ctxt, this);

    this.startingClef = null;

    this.useDropCap = useDropCap;
    this.dropCap = null;

    this.annotation = null;

    this.compiled = false;

    this.autoColoring = true;
    this.needsLayout = true;
    this.extendLastSystemStaffLines = true;

    // valid after chant lines are created...
    this.bounds = new Rect();

    if (ctxt) this.updateNotations(ctxt);
  }

  /**
   * Make a copy of the score, only including the specified lines
   * @param  {number} startLine starting index
   * @param  {number} endLine   ending index
   * @return {ChantScore}           the partial score
   */
  copyLines(startLine, endLine) {
    let result = new ChantScore();
    result.lines = this.lines.slice(startLine, endLine);
    result.bounds = this.bounds.clone();
    let lastLine = result.lines.slice(-1)[0];
    result.bounds.height = lastLine.bounds.bottom() - lastLine.origin.y;
    if (startLine === 0) {
      result.titles = this.titles;
      result.dropCap = this.dropCap;
      result.annotation = this.annotation;
    }
    return result;
  }

  updateSelection(selection) {
    this.selection = selection;
    const elementSelection = (selection && selection.element) || {
      indices: []
    };
    const selectedIndices = elementSelection.indices;
    let insertion = elementSelection.insertion;
    if (
      !insertion &&
      selectedIndices.length === 1 &&
      this.notes[selectedIndices[0]] instanceof TextOnly
    ) {
      // if there is only one selection, and its a text only, it should display as an insertion cursor:
      insertion = { afterElementIndex: selectedIndices[0] };
    }
    // update the selected elements so that they can be given a .selected class when rendered
    for (let i = 0; i < this.notes.length; ++i) {
      let element = this.notes[i];
      element.selected = selectedIndices.includes(i);
    }
    (this.startingClef.model || this.startingClef).selected =
      selectedIndices.includes(-1);
    for (let i = 0; i < this.lines.length; ++i) {
      this.lines[i].insertionCursor = null;
    }
    // update the insertion cursor, so it can be drawn on the correct system
    this.insertionElement = null;
    let insertionLine = null;
    if (insertion) {
      if (typeof insertion.chantLine === "number") {
        insertionLine = this.lines[insertion.chantLine];
        this.insertionElement = insertionLine.startingClef;
        insertionLine.insertionCursor = new InsertionCursor();
      } else if (typeof insertion.afterElementIndex === "number") {
        this.insertionElement = this.notes[insertion.afterElementIndex];
        if (!this.insertionElement) {
          insertionLine = this.lines[0];
          this.insertionElement = insertionLine.startingClef;
        } else if (this.insertionElement.neume) {
          this.insertionElement = this.insertionElement.neume;
        }
        if (!insertionLine) {
          insertionLine =
            this.insertionElement.line || this.lines[this.lines.length - 1];
        }
        insertionLine.insertionCursor = new InsertionCursor();
      }
    }
  }

  updateNotations(ctxt) {
    var i, j, mapping, notation;

    // flatten all mappings into one array for N(0) access to notations
    this.notations = [];
    this.notes = [];
    this.hasLyrics = false;
    this.hasAboveLinesText = false;
    this.hasTranslations = false;
    const elementSelection = (this.selection && this.selection.element) || {
      indices: []
    };
    const selectedIndices = elementSelection.indices;
    let nonNoteElementCount = 0;

    // find the starting clef...
    // start with a default clef in case the notations don't provide one.
    this.startingClef = null;

    for (i = 0; i < this.mappings.length; i++) {
      mapping = this.mappings[i];
      for (j = 0; j < mapping.notations.length; j++) {
        notation = mapping.notations[j];
        notation.score = this;
        notation.mapping = mapping;

        if (!this.startingClef) {
          if (notation.isNeume) {
            this.startingClef = Clef.default();
          } else if (notation.isClef) {
            this.startingClef = notation;
            continue;
          }
        }

        notation.notationIndex = this.notations.push(notation) - 1;
        if (!this.hasLyrics && notation.hasLyrics()) this.hasLyrics = true;
        if (!this.hasAboveLinesText && notation.alText)
          this.hasAboveLinesText = true;
        if (!this.hasTranslations && notation.translationText)
          this.hasTranslations = true;

        // Update this.notes and find element indices:
        let elements = notation.notes || [notation];
        for (let element of elements) {
          let elementIndex = (element.elementIndex =
            this.notes.push(element) - 1);
          if (element instanceof Note) {
            element.noteIndex = elementIndex - nonNoteElementCount;
          } else {
            ++nonNoteElementCount;
          }

          element.selected = selectedIndices.includes(elementIndex);
        }
      }
    }

    // if we've reached this far and we *still* don't have a clef, then there aren't even
    // any neumes in the score. still, set the default clef just for good measure
    if (!this.startingClef) this.startingClef = Clef.default();
    this.startingClef.elementIndex = -1;

    // update drop cap
    if (this.useDropCap) this.recreateDropCap(ctxt);
    else this.dropCap = null;

    this.needsLayout = true;
  }

  recreateDropCap(ctxt) {
    this.dropCap = null;

    // find the first notation with lyrics to use
    for (var i = 0; i < this.notations.length; i++) {
      if (
        this.notations[i].hasLyrics() &&
        this.notations[i].lyrics[0] !== null &&
        this.notations[i].lyrics[0].spans &&
        this.notations[i].lyrics[0].spans.length
      ) {
        let notation = this.notations[i],
          lyrics = notation.lyrics[0];
        if (this.useDropCap) {
          this.dropCap = lyrics.generateDropCap(ctxt);
        } else {
          lyrics.dropCap = null;
          lyrics.generateSpansFromText(ctxt, lyrics.originalText);
        }
        notation.needsLayout = true;
        return;
      }
    }
  }

  /**
   * Shared layout initialization method for performLayout() and performLayoutAsync()
   * @param  {ChantContext} ctxt
   */
  initializeLayout(ctxt) {
    // setup the context
    ctxt.activeClef = this.startingClef;
    ctxt.notations = this.notations;
    ctxt.currNotationIndex = 0;
    ctxt.staffLineCount = this.staffLineCount;

    if (this.dropCap) this.dropCap.recalculateMetrics(ctxt);

    if (this.annotation) this.annotation.recalculateMetrics(ctxt);
  }

  // this is the the synchronous version of performLayout that
  // process everything without yielding to any other workers/threads.
  // good for server side processing or very small chant pieces.
  performLayout(ctxt, force) {
    if (!force && this.needsLayout === false) return; // nothing to do here!

    ctxt.updateHyphenWidth();

    this.initializeLayout(ctxt);

    for (let i = 0; i < this.notations.length; i++) {
      let notation = this.notations[i];
      if (force || notation.needsLayout) {
        ctxt.currNotationIndex = i;
        notation.performLayout(ctxt);
      }
    }

    this.needsLayout = false;
  }

  // for web applications, probably performLayoutAsync would be more
  // apppropriate that the above performLayout, since it will process
  // the notations without locking up the UI thread.
  performLayoutAsync(ctxt, finishedCallback) {
    if (this.needsLayout === false) {
      if (finishedCallback) setTimeout(() => finishedCallback(), 0);

      return; // nothing to do here!
    }

    if (ctxt.onFontLoaded) {
      ctxt.onFontLoaded.push(() =>
        this.performLayoutAsync(ctxt, finishedCallback)
      );
      return;
    }

    // check for sane value of hyphen width:
    ctxt.updateHyphenWidth();
    if (
      !ctxt.hyphenWidth ||
      ctxt.hyphenWidth / ctxt.textStyles.lyric.size > 0.6
    ) {
      setTimeout(() => {
        this.performLayoutAsync(ctxt, finishedCallback);
      }, 100);
      return;
    }

    this.initializeLayout(ctxt);

    setTimeout(() => this.layoutElementsAsync(ctxt, 0, finishedCallback), 0);
  }

  layoutElementsAsync(ctxt, index, finishedCallback) {
    if (index >= this.notations.length) {
      this.needsLayout = false;

      if (finishedCallback) setTimeout(() => finishedCallback(), 0);

      return;
    }

    if (index === 0) ctxt.activeClef = this.startingClef;

    var timeout = new Date().getTime() + 50; // process for fifty milliseconds
    do {
      var notation = this.notations[index];
      if (notation.needsLayout) {
        ctxt.currNotationIndex = index;
        notation.performLayout(ctxt);
      }

      index++;
    } while (index < this.notations.length && new Date().getTime() < timeout);

    // schedule the next block of processing
    setTimeout(
      () => this.layoutElementsAsync(ctxt, index, finishedCallback),
      0
    );
  }

  layoutChantLines(ctxt, width, finishedCallback) {
    this.lines = [];

    if (ctxt.mergeAnnotationWithTextLeft && this.annotation && !this.dropCap) {
      let annotation = this.annotation,
        annotationSpans = annotation.annotations
          ? annotation.annotations.map((annotation) => annotation.spans)
          : [annotation.spans];
      this.overrideTextLeft = new TextLeftRight(ctxt, "", "textLeft");
      if (ctxt.mapAnnotationSpansToTextLeft) {
        annotationSpans = annotationSpans.map(
          ctxt.mapAnnotationSpansToTextLeft
        );
      }
      this.overrideTextLeft.spans = ctxt.mergeAnnotationWithTextLeft(
        ...annotationSpans,
        this.titles.textLeft && this.titles.textLeft.spans
      );
    } else {
      this.overrideTextLeft = null;
    }

    var y = width > 0 ? this.titles.layoutTitles(ctxt, width) : 0;
    var currIndex = 0;

    ctxt.activeClef = this.startingClef;

    var spaceBetweenSystems = ctxt.staffInterval * ctxt.spaceBetweenSystems;

    do {
      var line = new ChantLine(this);

      line.buildFromChantNotationIndex(ctxt, currIndex, width);
      currIndex = line.notationsStartIndex + line.numNotationsOnLine;
      line.performLayout(ctxt);
      line.elementIndex = this.lines.length;
      this.lines.push(line);

      line.bounds.y = -line.bounds.y + y;
      y += line.bounds.height + spaceBetweenSystems;
    } while (currIndex < this.notations.length);

    var firstLine = this.lines[0];

    this.bounds.x = 0;
    this.bounds.y = 0;
    this.bounds.width = firstLine.bounds.width;
    this.bounds.height = y - spaceBetweenSystems;

    this.pages = [this];

    if (this.selection) {
      this.updateSelection(this.selection);
    }

    if (finishedCallback) finishedCallback(this);
  }

  paginate(height) {
    if (!height) return;
    this.pages = [];
    let pageHeightOffset = 0,
      startLineIndex = 0;
    for (let i = 1; i < this.lines.length; ++i) {
      let line = this.lines[i];
      let pageHeight = line.bounds.bottom() - pageHeightOffset - line.origin.y;

      if (pageHeight > height) {
        // this line will be the first on the new page
        this.pages.push(this.copyLines(startLineIndex, i));
        startLineIndex = i;
        pageHeightOffset = line.bounds.y - line.origin.y;
        line.bounds.y = line.origin.y;
      } else {
        // not a new page yet...update the bounds:
        line.bounds.y -= pageHeightOffset;
      }
    }
    this.pages.push(this.copyLines(startLineIndex, this.lines.length));
  }

  draw(ctxt, scale = 1) {
    ctxt.setCanvasSize(this.bounds.width, this.bounds.height, scale);

    var canvasCtxt = ctxt.canvasCtxt;

    canvasCtxt.clearRect(0, 0, ctxt.canvas.width, ctxt.canvas.height);

    canvasCtxt.translate(this.bounds.x, this.bounds.y);

    if (this.titles) this.titles.draw(ctxt);

    for (var i = 0; i < this.lines.length; i++) this.lines[i].draw(ctxt);

    canvasCtxt.translate(-this.bounds.x, -this.bounds.y);
  }

  getSvgProps(ctxt, zoom) {
    let width =
        typeof zoom === "number"
          ? zoom * this.bounds.width
          : zoom
            ? undefined
            : this.bounds.width,
      height = zoom ? undefined : this.bounds.height;

    return {
      xmlns: QuickSvg.ns,
      "xmlns:xlink": QuickSvg.xlink,
      version: "1.1",
      class:
        "Exsurge ChantScore" + (ctxt.editable ? " EditableChantScore" : ""),
      width,
      height,
      viewBox: [0, 0, this.bounds.width, this.bounds.height].join(" ")
    };
  }

  createSvgNode(ctxt) {
    // create defs section
    var node = [ctxt.defsNode.cloneNode(true)];
    node[0].appendChild(ctxt.createStyleNode());

    if (this.titles) node.push(this.titles.createSvgNode(ctxt));

    for (var i = 0; i < this.lines.length; i++)
      node.push(this.lines[i].createSvgNode(ctxt));

    node = QuickSvg.createNode("g", {}, node);

    node = QuickSvg.createNode("svg", this.getSvgProps(ctxt), node);

    node.source = this;
    this.svg = node;

    return node;
  }

  createSvgTree(ctxt, zoom) {
    // create defs section
    var node = [
      QuickSvg.createSvgTree(
        "defs",
        {},
        ...ctxt.makeDefs.map((makeDef) => makeDef.makeSvgTree()),
        ctxt.createStyleTree()
      )
    ];

    if (this.titles) node.push(this.titles.createSvgTree(ctxt));

    for (var i = 0; i < this.lines.length; i++)
      node.push(this.lines[i].createSvgTree(ctxt));

    node = QuickSvg.createSvgTree("g", {}, ...node);
    let svgProps = this.getSvgProps(ctxt, zoom);
    svgProps.source = this;
    node = QuickSvg.createSvgTree("svg", svgProps, node);

    return node;
  }

  createSvg(ctxt) {
    var fragment = "";

    // create defs section
    for (var def in ctxt.defs)
      if (ctxt.defs.hasOwnProperty(def)) fragment += ctxt.defs[def];
    fragment += ctxt.createStyle();

    fragment = QuickSvg.createFragment("defs", {}, fragment);

    if (this.titles) fragment += this.titles.createSvgFragment(ctxt);

    for (var i = 0; i < this.lines.length; i++)
      fragment += this.lines[i].createSvgFragment(ctxt);

    fragment = QuickSvg.createFragment("g", {}, fragment);

    fragment = QuickSvg.createFragment("svg", this.getSvgProps(ctxt), fragment);

    return fragment;
  }

  createSvgNodeForEachLine(ctxt) {
    var node = [];

    var top = 0;
    for (var i = 0; i < this.lines.length; i++) {
      var lineFragment = [
        ctxt.defsNode.cloneNode(true),
        this.lines[i].createSvgNode(ctxt, top)
      ];
      lineFragment[0].appendChild(ctxt.createStyleNode());
      var height = this.lines[i].bounds.height + ctxt.staffInterval * 1.5;
      lineFragment = QuickSvg.createNode("g", {}, lineFragment);
      lineFragment = QuickSvg.createNode(
        "svg",
        {
          xmlns: QuickSvg.ns,
          version: "1.1",
          class: "Exsurge ChantScore",
          width: this.bounds.width,
          height: height,
          viewBox: [0, 0, this.bounds.width, height].join(" ")
        },
        lineFragment
      );
      node.push(lineFragment);
      top += height;
    }
    return node;
  }

  createSvgForEachLine(ctxt) {
    var fragment = "",
      fragmentDefs = "";

    // create defs section
    for (var def in ctxt.defs)
      if (ctxt.defs.hasOwnProperty(def)) fragmentDefs += ctxt.defs[def];
    fragmentDefs += ctxt.createStyle();

    fragmentDefs = QuickSvg.createFragment("defs", {}, fragmentDefs);
    var top = 0;
    for (var i = 0; i < this.lines.length; i++) {
      var lineFragment =
        fragmentDefs + this.lines[i].createSvgFragment(ctxt, top);
      var height = this.lines[i].bounds.height + ctxt.staffInterval * 1.5;
      lineFragment = QuickSvg.createFragment("g", {}, lineFragment);
      lineFragment = QuickSvg.createFragment(
        "svg",
        {
          xmlns: QuickSvg.ns,
          version: "1.1",
          "xmlns:xlink": QuickSvg.xlink,
          class: "Exsurge ChantScore",
          width: this.bounds.width,
          height: height
        },
        lineFragment
      );
      fragment += lineFragment;
      top += height;
    }
    return fragment;
  }

  unserializeFromJson(data, ctxt) {
    this.autoColoring = data["auto-coloring"];

    if (data.annotation !== null && data.annotation !== "") {
      // create the annotation
      this.annotation = new Annotation(ctxt, data.annotation);
    } else this.annotation = null;

    var createDropCap = data["drop-cap"] === "auto" ? true : false;

    Gabc.parseChantNotations(data.notations, this, createDropCap);
  }

  serializeToJson() {
    var data = {};

    data["type"] = "score";
    data["auto-coloring"] = true;

    if (this.annotation !== null)
      data.annotation = this.annotation.unsanitizedText;
    else data.annotation = "";

    return data;
  }
}

class ChantDocument {
  constructor() {
    var defaults = {
      layout: {
        units: "mm",
        "default-font": {
          "font-family": "Crimson",
          "font-size": 14
        },
        page: {
          width: 8.5,
          height: 11,
          "margin-left": 0,
          "margin-top": 0,
          "margin-right": 0,
          "margin-bottom": 0
        }
      },
      scores: []
    };

    // default layout
    this.copyLayout(this, defaults);

    this.scores = defaults.scores;
  }

  copyLayout(to, from) {
    to.layout = {
      units: from.layout.units,
      "default-font": {
        "font-family": from.layout["default-font"]["font-family"],
        "font-size": from.layout["default-font"]["font-size"]
      },
      page: {
        width: from.layout.page.width,
        height: from.layout.page.height,
        "margin-left": from.layout.page["margin-left"],
        "margin-top": from.layout.page["margin-top"],
        "margin-right": from.layout.page["margin-right"],
        "margin-bottom": from.layout.page["margin-bottom"]
      }
    };
  }

  unserializeFromJson(data) {
    this.copyLayout(this, data);

    this.scores = [];

    // read in the scores
    for (var i = 0; i < data.scores.length; i++) {
      var score = new ChantScore();

      score.unserializeFromJson(data.scores[i]);
      this.scores.push(score);
    }
  }

  serializeToJson() {
    var data = {};

    this.copyLayout(data, this);

    data.scores = [];

    // save scores...
    for (var i = 0; i < this.scores.length; i++)
      data.scores.push(this.scores[i].serializeToJson());

    return data;
  }
}

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


// Gabc clefs are always constructed at octave 2 (see Gabc.parseNotations), so
// Pitch(Step.Do, 2) is the Do that the clef itself names, whichever staff line
// the clef happens to sit on. That makes it the natural anchor for tuning:
// `tuning` is, quite literally, the frequency at which C is played.
var DoReferenceInt = new Pitch(Step.Do, 2).toInt(); // === 24

// One pulse is the Solesmes chronos protos -- the indivisible beat that every
// note is worth by default. Chant carries no notated durations, so everything
// below is interpretive. The three tables in this file are the single place to
// change if you disagree with the interpretation.
//
// Every entry is a MULTIPLIER except `perMora`, which is ADDITIVE: a mora dot
// lengthens a note by adding a pulse, so a note that is both episema'd and
// mora'd is worth 1.3 + 1.0 = 2.3 pulses, not 1.3 * 2.0 = 2.6.
var PlaybackDurations = {
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
var PlaybackRests = {
  virgula: 0.5,
  quarterBar: 1.0,
  dominicanBar: 1.0,
  halfBar: 2.0,
  fullBar: 3.0,
  doubleBar: 4.0
};

// Gain multipliers. These never affect duration.
var PlaybackVelocities = {
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
 * @param {Divider} divider
 * @return {string|null} a key into PlaybackRests, or null if it never sounds
 */
function classifyDivider(divider) {
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
function pitchIntToFrequency(pitchInt, tuning, transpose) {
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
function pitchToFrequency(pitch, tuning, transpose) {
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
function secondsPerPulse(speedPercent, basePulseSeconds) {
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
 * @param {ChantScore} score
 * @param {object} [options] durations, restWeights, velocities, classifyDivider
 * @return {object} { events, totalPulses, eventIndexByNoteIndex }
 */
function createPlaybackEvents(score, options) {
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

    if (s.noteIndex !== null)
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
class Voice {
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
class PianoInstrument {
  constructor() {
    this.name = "piano";
  }

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
var Instruments = {
  piano: new PianoInstrument()
};

/**
 * Resolves an instrument option, which may be a key into Instruments or an
 * object implementing the instrument interface directly.
 *
 * @param {string|object} spec
 * @return {object} an instrument
 */
function resolveInstrument(spec) {
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


var SVG_NS = "http://www.w3.org/2000/svg";

// distinguishes one player's injected css from another's on the same page
var __playerSerial = 0;

var PlaybackDefaults = {
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
  // this is the knob for moving a piece into a comfortable range.
  transpose: 0,

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

  // clicking somewhere other than a note, while stopped, does nothing
  playOnBackgroundClick: false,

  // supply your own context to share it with other audio on the page. If you
  // do, the player will never close it.
  audioContext: null,

  lookaheadSeconds: 0.25,
  tickIntervalMs: 40,

  // partial overrides of the tables in Exsurge.Playback.Timeline.js
  durations: null,
  restWeights: null,
  velocities: null,

  onStart: null, // (player)
  onStop: null, // (player, reason) reason: 'user' | 'end' | 'destroy'
  onEnd: null, // (player) fired before onStop when playback runs out
  onNoteChange: null, // (noteIndex | null, event, player)
  onError: null // (error, player)
};

function toArray(value) {
  if (!value) return [];
  if (Object.prototype.toString.call(value) === "[object Array]") return value;
  return [value];
}

function addClass(element, className) {
  var existing = element.getAttribute("class") || "";
  if ((" " + existing + " ").indexOf(" " + className + " ") >= 0) return;
  element.setAttribute(
    "class",
    existing ? existing + " " + className : className
  );
}

function removeClass(element, className) {
  var existing = element.getAttribute("class") || "";
  var parts = existing.split(/\s+/);
  var kept = [];
  for (var i = 0; i < parts.length; i++)
    if (parts[i] && parts[i] !== className) kept.push(parts[i]);
  element.setAttribute("class", kept.join(" "));
}

function hasClass(element, className) {
  var existing = element.getAttribute("class") || "";
  return (" " + existing + " ").indexOf(" " + className + " ") >= 0;
}

/**
 * Plays a rendered ChantScore, one note at a time, highlighting as it goes.
 *
 * @class
 */
class ChantPlayer {
  /**
   * @param {ChantScore} score a score whose updateNotations has run
   * @param {SVGElement|SVGElement[]} [svgNode] output of score.createSvgNode
   * @param {object} [options] see PlaybackDefaults
   */
  constructor(score, svgNode, options) {
    this.score = score;
    this.options = Object.assign({}, PlaybackDefaults, options || {});

    this.timeline = createPlaybackEvents(score, this.options);

    this.audioContext = this.options.audioContext || null;
    this.__ownsContext = false;
    this.__masterGain = null;
    this.__compressor = null;
    this.__instrument = resolveInstrument(this.options.instrument);

    this.__state = "stopped";
    this.__currentNoteIndex = null;
    this.__currentElement = null;

    this.__roots = [];
    this.__styleNodes = [];
    this.__noteElements = [];
    this.__rootClass = "exsurge-player-" + ++__playerSerial;

    this.__secondsPerPulse = secondsPerPulse(
      this.options.speed,
      this.options.basePulseSeconds
    );
    this.__originTime = 0;
    this.__scheduleIndex = 0;
    this.__highlightIndex = 0;
    this.__endPulse = 0;

    this.__voices = [];
    this.__lastVoice = null;
    this.__lastFrequency = 0;

    this.__tickTimer = null;
    this.__rafId = null;

    var self = this;
    this.__boundClick = function (evt) {
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

  setSpeed(percent) {
    this.setOptions({ speed: percent });
  }

  setTuning(hz) {
    this.setOptions({ tuning: hz });
  }

  setTranspose(semitones) {
    this.setOptions({ transpose: semitones });
  }

  setInstrument(spec) {
    this.setOptions({ instrument: spec });
  }

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

    if ("volume" in partial && this.__masterGain)
      this.__masterGain.gain.value = this.__gainValue();

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
                this.options.transpose
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
          : window.AudioContext || window.webkitAudioContext;

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

  __startVoice(event, when) {
    var frequency = pitchIntToFrequency(
      event.pitchInt,
      this.options.tuning,
      this.options.transpose
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

  __setCurrent(noteIndex, event) {
    if (noteIndex === this.__currentNoteIndex) return;

    this.__applyHighlight(noteIndex);
    this.__fire("onNoteChange", [noteIndex, event || null, this]);
  }

  __applyHighlight(noteIndex) {
    var element = noteIndex === null ? null : this.__noteElements[noteIndex];

    // the two notes of a porrectus share one drawn glyph, so moving between
    // them must not toggle the class off and back on
    if (element !== this.__currentElement) {
      if (this.__currentElement)
        removeClass(this.__currentElement, this.options.highlightClass);
      if (element) addClass(element, this.options.highlightClass);
      this.__currentElement = element || null;
    }

    this.__currentNoteIndex = noteIndex;
  }

  __clearHighlight() {
    if (this.__currentElement)
      removeClass(this.__currentElement, this.options.highlightClass);

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

        this.__noteElements[owner.noteIndex] = element;
      }
    }
  }

  __styleText() {
    return (
      "svg." +
      this.__rootClass +
      " .note{cursor:pointer}" +
      "svg." +
      this.__rootClass +
      " .note." +
      this.options.highlightClass +
      "{fill:" +
      this.options.highlightColor +
      "}"
    );
  }

  __injectStyle(root) {
    // css inside inline svg is document global, so these rules are scoped by a
    // per player root class. Without that, two players on one page would fight
    // over the highlight color.
    var style = document.createElementNS(SVG_NS, "style");
    style.textContent = this.__styleText();
    root.appendChild(style);
    this.__styleNodes.push(style);
  }

  __refreshStyle(previousHighlightClass) {
    if (
      this.__currentElement &&
      previousHighlightClass &&
      previousHighlightClass !== this.options.highlightClass
    ) {
      removeClass(this.__currentElement, previousHighlightClass);
      addClass(this.__currentElement, this.options.highlightClass);
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

  __onClick(evt) {
    if (this.__state === "playing") {
      this.stop();
      return;
    }

    var element =
      evt.target && evt.target.closest ? evt.target.closest(".note") : null;

    if (!element) {
      if (this.options.playOnBackgroundClick) this.play(0);
      return;
    }

    var note = this.score.notes[Number(element.getAttribute("element-index"))];
    if (!note || typeof note.noteIndex !== "number") return;

    this.play(note.noteIndex);
  }

  //
  // internals: callbacks
  //

  __fire(name, args) {
    var callback = this.options[name];
    if (typeof callback !== "function") return;

    try {
      callback.apply(null, args);
    } catch (e) {
      // a throwing host callback must not take the scheduler down with it
      this.__fail(e);
    }
  }

  __fail(error) {
    if (typeof this.options.onError === "function") {
      this.options.onError(error, this);
      return;
    }
    throw error;
  }
}

/**
 * Renders gabc into a container and returns a player wired to it.
 *
 * Layout is asynchronous, so the player arrives via the callback rather than
 * as a return value.
 *
 *   Exsurge.createPlayableChant(ctxt, gabc, el, { speed: 90 }, function(player) {
 *     mySpeedSlider.oninput = function() { player.setSpeed(this.value); };
 *   });
 *
 * @param {ChantContext} ctxt
 * @param {string} gabcSource
 * @param {HTMLElement} container emptied and filled with the rendered score
 * @param {object} [options] see PlaybackDefaults, plus useDropCap and autoResize
 * @param {function} [onReady] receives the ChantPlayer
 */
function createPlayableChant(
  ctxt,
  gabcSource,
  container,
  options,
  onReady
) {
  var opts = options || {};

  var mappings = Gabc.createMappingsFromSource(ctxt, gabcSource);
  var score = new ChantScore(ctxt, mappings, opts.useDropCap !== false);

  var player = null;
  var resizeTimer = null;

  function render(callback) {
    score.layoutChantLines(ctxt, container.clientWidth, function () {
      while (container.firstChild) container.removeChild(container.firstChild);
      container.appendChild(score.createSvgNode(ctxt));
      callback();
    });
  }

  function onResize() {
    if (resizeTimer !== null) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resizeTimer = null;
      // only the second layout phase depends on width, and it changes neither
      // note order nor pitch -- so playback carries on across a resize
      render(function () {
        player.attach(container.firstChild);
      });
    }, 150);
  }

  score.performLayoutAsync(ctxt, function () {
    render(function () {
      player = new ChantPlayer(score, container.firstChild, opts);

      if (opts.autoResize !== false && typeof window !== "undefined") {
        window.addEventListener("resize", onResize);

        var innerDestroy = player.destroy;
        player.destroy = function () {
          window.removeEventListener("resize", onResize);
          if (resizeTimer !== null) clearTimeout(resizeTimer);
          innerDestroy.call(player);
        };
      }

      if (typeof onReady === "function") onReady(player);
    });
  });
}

export { AboveLinesText, Accent, Accidental, AccidentalType, Ancus, Annotation, Annotations, Apostropha, Bivirga, BraceAttachment, BracePoint, BraceShape, Centimeters, ChantContext, ChantDocument, ChantLayoutElement, ChantLine, ChantLineBreak, ChantMapping, ChantNotationElement, ChantPlayer, ChantScore, ChiRhoClef, ChoralSign, Clef, Climacus, Clivis, CurlyBraceVisualizer, Custos, DefaultTrailingSpace, DeviceIndependent, Distropha, Divider, DividerLineVisualizer, DoClef, DoReferenceInt, DominicanBar, DoubleBar, DropCap, English, FaClef, FullBar, Gabc, GabcHeader, GlyphCode, GlyphVisualizer, Glyphs, HalfBar, HorizontalEpisema, HorizontalEpisemaAlignment, Ictus, Inches, InsertionCursor, Instruments, Language, Latin, LineaVisualizer, LiquescentType, Lyric, LyricArray, LyricType, Margins, MarkingPositionHint, Millimeters, Mora, Neume, NeumeBeamVisualizer, NeumeLineVisualizer, Note, NoteShape, NoteShapeModifiers, Oriscus, PesQuassus, PesSubpunctis, PianoInstrument, Pitch, PlaybackDefaults, PlaybackDurations, PlaybackRests, PlaybackVelocities, Podatus, Point, Porrectus, PorrectusFlexus, PunctaInclinata, Punctum, QuarterBar, QuickSvg, Rect, RoundBraceVisualizer, Salicus, SalicusFlexus, Scandicus, ScandicusFlexus, Size, Spanish, Step, Subtitle, Supertitle, TextElement, TextLeftRight, TextMeasuringStrategy, TextOnly, TextSpan, TextTypes, TextTypesByClass, Title, TitleTextElement, Titles, ToCentimeters, ToInches, ToMillimeters, Torculus, TorculusResupinus, TorculusResupinusFlexus, TranslationText, TrebleClef, Tristropha, Trivirga, Units, Virga, VirgaLineVisualizer, Virgula, Voice, classifyDivider, createPlayableChant, createPlaybackEvents, generateRandomGuid, getCssForProperties, greextraGlyphs, language, pitchIntToFrequency, pitchToFrequency, resolveInstrument, secondsPerPulse };
//# sourceMappingURL=exsurge.mjs.map
