/**
 * @class
 */
export class Language {
  /**
   * @param {string} name
   */
  constructor(name) {
    this.name = typeof name !== "undefined" ? name : "<unknown>";
    this.centerNeume = false;
  }

  /**
   * @param {String} text The string to parsed into words.
   * @return {string[][]} the resulting parsed words from syllabification
   */
  /**
   * Subclasses must implement this.
   *
   * @param {string} word
   * @returns {any}
   */
  // eslint-disable-next-line no-unused-vars
  syllabifyWord(word) {
    throw new Error(
      "exsurge: " + this.name + " does not implement syllabifyWord"
    );
  }

  /**
   * @param {string} text
   */
  syllabify(text) {
    /** @type {any[]} */
    var parsedWords = [];

    if (typeof text === "undefined" || text === "") return parsedWords;

    // Divide the text into words separated by whitespace
    var words = text.split(/[\s]+/);

    for (var i = 0, end = words.length; i < end; i++)
      parsedWords.push(this.syllabifyWord(words[i]));

    return parsedWords;
  }
}

export class English extends Language {
  constructor() {
    super("English");
    this.centerNeume = true;
    // The class deliberately includes the combining diacritical range
    // U+0300 to U+036F alongside the base letters, and is quantified with +,
    // so a base letter and its combining marks are consumed together as one
    // run.
    // eslint-disable-next-line no-misleading-character-class
    this.regexLetter = /[a-z\u00c0-\u02af\u0300-\u036f\u1e00-\u1eff‿]+/i;
  }

  /**
   * @param {String} s the string to search
   * @param {Number} startIndex The index at which to start searching for a vowel in the string
   * @returns {{found: boolean, startIndex: number, length: number}}
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
export class Latin extends Language {
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
    // "e̊" and "o̊" are each two code points, a base vowel plus U+030A
    // COMBINING RING ABOVE, so they cannot live in the character class below:
    // there they would decompose into the separate members e, o and U+030A and
    // never match as units. They lead the alternation instead, so that they are
    // tried before the single-character class can consume the bare vowel and
    // leave the ring outside the segment.
    this.regexVowel =
      /(i|(?:[qg]|^)u)?(e̊|o̊|[eé][iu]|[uú]i|[ao][eé]|[aá]u|[aeiouáéíóúäëïöüāēīōūăĕĭŏŭåůæœǽyýÿ])/gi;

    // some words that are simply exceptions to standard syllabification rules!
    var wordExceptions = new Object();

    // ui combos pronounced as diphthongs
    /** @type {any} */ (wordExceptions)["huius"] = ["hui", "us"];
    /** @type {any} */ (wordExceptions)["cuius"] = ["cui", "us"];
    /** @type {any} */ (wordExceptions)["huic"] = ["huic"];
    /** @type {any} */ (wordExceptions)["cui"] = ["cui"];
    /** @type {any} */ (wordExceptions)["hui"] = ["hui"];

    // eu combos pronounced as diphthongs
    /** @type {any} */ (wordExceptions)["euge"] = ["eu", "ge"];
    /** @type {any} */ (wordExceptions)["seu"] = ["seu"];

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
  /**
   * @param {*} c
   */
  isVowel(c) {
    for (var i = 0, end = this.vowels.length; i < end; i++)
      if (this.vowels[i] === c) return true;

    return false;
  }

  /**
   * @param {*} c
   */
  isVowelThatMightBeConsonant(c) {
    for (var i = 0, end = this.vowelsThatMightBeConsonants.length; i < end; i++)
      if (this.vowelsThatMightBeConsonants[i] === c) return true;

    return false;
  }

  // substring should be a vowel and the character following
  /**
   * @param {*} substring
   */
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
   * @param {string} word
   * @returns {any}
   */
  syllabifyWord(word) {
    var /** @type {any[]} */ syllables = [];
    var haveCompleteSyllable = false;
    var previousWasVowel = false;
    var workingString = word.toLowerCase();
    var startSyllable = 0;

    var c, lookahead, haveLookahead;

    // a helper function to create syllables
    var makeSyllable = function (/** @type {*} */ length) {
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
      /** @type {any[]} */
      syllables[syllables.length - 1] += word.substr(startSyllable);

    return syllables;
  }

  /**
   * @param {String} s the string to search
   * @param {Number} startIndex The index at which to start searching for a vowel in the string
   * @param {Array<{index: Number, endIndex: Number}>} [ignore] ranges, relative to startIndex, that a match may not overlap
   * @returns {{found: boolean, startIndex: number, length: number}}
   */
  findVowelSegment(s, startIndex, ignore) {
    this.regexVowel.lastIndex = 0;
    let stringSlice = s.slice(startIndex);
    var match = this.regexVowel.exec(stringSlice);
    var isIgnoredMatch = (
      /** @type {{index: number, endIndex: number}} */ { index, endIndex }
    ) =>
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
export class Spanish extends Language {
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
  /**
   * @param {*} c
   */
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

  /**
   * @param {string} text
   */
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
   * @param {string} word
   * @returns {any}
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
        if (!haveCompleteSyllable) {
          // do nothing since we don't have a complete syllable yet...
        } else {
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
   * @returns {{found: boolean, startIndex: number, length: number}}
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

// Combining diacritical marks. Swedish å, ä and ö are single code points when
// they arrive precomposed (NFC) but a base vowel plus U+030A or U+0308 when
// they arrive decomposed (NFD), which is what macOS filesystems and a number of
// text pipelines hand out. Every pattern below that matches a vowel allows the
// marks to trail it, so that both forms are treated as one letter.
const COMBINING_MARKS = "[\\u0300-\\u036f]*";

// Inflectional endings that may follow the -tion/-sion suffix. Used to keep the
// rule for its non-syllabic i (see Swedish.syllabifyWord) to that suffix rather
// than to any word that happens to contain the same letters.
const ION_ENDINGS =
  "(?:er(?:na)?|en|ens|ers|s|ell(?:a|t)?|är(?:a|en)?|ism|ist(?:er)?)?";

/**
 * @class
 *
 * Swedish. The vowel side of the problem is unusually simple: Swedish has no
 * diphthongs, so every vowel letter is the nucleus of its own syllable, and
 * <y> is a full vowel that never doubles as a consonant the way Latin <i> and
 * <u> do — that job belongs to <j>. All of the difficulty is on the consonant
 * side, in deciding where between two vowels the break falls.
 *
 * The one thing no rule here can get right is the compound word, which Swedish
 * forms freely and writes solid. A compound divides at its seam, and finding
 * the seam needs a dictionary: this class will divide *hus-jungfru* as
 * *hu-sjungfru*, because <sj> spelling a single sound is the better guess in
 * every word that is not a compound. Where a compound matters, hyphenate it in
 * the source text and the hyphen will be honoured as a break.
 */
export class Swedish extends Language {
  constructor() {
    super("Swedish");

    // The nine vowels of Swedish, followed by the accented and foreign vowel
    // letters that turn up in loanwords and names: idé, kafé, à la, Müller,
    // Møller.
    this.vowels = [
      "a",
      "e",
      "i",
      "o",
      "u",
      "y",
      "å",
      "ä",
      "ö",
      "á",
      "à",
      "â",
      "é",
      "è",
      "ê",
      "í",
      "ì",
      "ó",
      "ò",
      "ô",
      "ú",
      "ù",
      "û",
      "ý",
      "ø",
      "æ",
      "œ",
      "ü"
    ];

    // Consonant groups that are not divided, and so begin a syllable as a unit,
    // longest first. Deliberately absent:
    //
    //   - <sk>, which is divided even where it spells /ɧ/: män-nis-ka, fis-ken.
    //   - <ck>, which is divided c-k: flic-ka, bac-ken.
    //   - <gn>, which is divided g-n: reg-na, väl-sig-na.
    //   - <dj>, <lj>, <hj> and <gj>, whose first letter is silent only at the
    //     start of a word (djup, ljus, hjärta), where no division is at stake.
    //     Between vowels they are divided like any other cluster: vil-ja,
    //     ol-ja, gläd-je, tred-je.
    //   - <stj> and <skj>, so that the two-letter groups inside them win. The
    //     trigraphs are all but confined to the start of a word (stjärna,
    //     skjorta), while medially the sequence is nearly always a compound
    //     seam with the <s> closing the first element: guds-tjänst.
    this.onsetDigraphs = ["sch", "sj", "tj", "kj", "ch"];

    const vowelClass = "[" + this.vowels.join("") + "]";

    // One base character plus any combining marks that follow it.
    this.regexLetterUnit = new RegExp("[\\s\\S]" + COMBINING_MARKS, "g");

    this.regexIsVowel = new RegExp(
      "^" + vowelClass + COMBINING_MARKS + "$",
      "i"
    );

    // <ti>, <si>, <ssi> and <xi> spell /ɧ/ in the borrowed suffix -tion, whose
    // <i> is therefore not a vowel: na-tion, mis-sion, sta-tio-ner. The pattern
    // is narrow on purpose — the group may not start the word, and only a
    // known inflectional ending may follow it — so that words where the same
    // letters really are two syllables are left alone: ti-on-de, år-ti-on-de.
    // Group 1 is everything up to the <i>, so its length is the index of the i.
    this.regexNonSyllabicI = new RegExp(
      "^(.+?(?:ss|[tsx]))ion" + ION_ENDINGS + "$"
    );

    // Group 1, when it matches, is skipped over: it is the non-syllabic <i>
    // above together with the consonant that spells /ɧ/ with it, which must not
    // be mistaken for the vowel of the syllable. Group 2 is the vowel segment
    // itself — a single vowel, since Swedish has no diphthongs, plus any
    // combining marks belonging to it.
    this.regexVowel = new RegExp(
      "((?:ss|[tsx])i(?=on" +
        ION_ENDINGS +
        "$))?(" +
        vowelClass +
        COMBINING_MARKS +
        ")",
      "gi"
    );
  }

  /**
   * @param {String} c The character to test, with any combining marks that
   *                   belong to it; case is not significant
   * @return {boolean} true if c is a vowel
   */
  isVowel(c) {
    return this.regexIsVowel.test(c);
  }

  /**
   * Splits a word into letter units of one base character plus any combining
   * marks that follow it, each with its index into the original string.
   *
   * @param {String} word
   * @return {{text: String, index: Number}[]}
   */
  splitIntoLetters(word) {
    var letters = [];

    this.regexLetterUnit.lastIndex = 0;

    var match;
    while ((match = this.regexLetterUnit.exec(word)) !== null)
      letters.push({ text: match[0], index: match.index });

    return letters;
  }

  /**
   * Finds where the syllable whose vowel is at `nucleus` begins, given that the
   * previous syllable's vowel is at `previousNucleus`.
   *
   * @param {String[]} letters the whole word, lowercased, one letter per entry
   * @param {Number} previousNucleus index of the previous syllable's vowel
   * @param {Number} nucleus index of this syllable's vowel
   * @return {Number} index of the letter this syllable starts on
   */
  findSyllableStart(letters, previousNucleus, nucleus) {
    // Two vowels in a row are two syllables, since nothing here is a diphthong:
    // be-ak-ta, ti-on-de, Le-a.
    if (nucleus === previousNucleus + 1) return nucleus;

    var lastConsonant = nucleus - 1;

    // A vowel letter here is one that is not a nucleus: the non-syllabic <i> of
    // -tion. It and the consonant it spells /ɧ/ with are one sound and go with
    // the following syllable together: na-tion, mis-sion.
    if (this.isVowel(letters[lastConsonant]))
      return Math.max(lastConsonant - 1, previousNucleus + 1);

    // <x> spells /ks/, half of which belongs to the syllable it closes, so it
    // never moves right: väx-a, box-en, tax-ar.
    if (letters[lastConsonant] === "x") return nucleus;

    // <ng> spells a single /ŋ/ closing the preceding syllable. Dividing it n-g
    // would put a /g/ on the second syllable that is not pronounced there:
    // sjung-a, ing-en, ung-e-fär.
    if (
      letters[lastConsonant] === "g" &&
      letters[lastConsonant - 1] === "n" &&
      lastConsonant - 1 > previousNucleus
    )
      return nucleus;

    // An undivided group carries over whole: du-schen, guds-tjänst,
    // för-sjunken.
    for (var i = 0; i < this.onsetDigraphs.length; i++) {
      var digraph = this.onsetDigraphs[i];
      var start = nucleus - digraph.length;

      if (
        start > previousNucleus &&
        letters.slice(start, nucleus).join("") === digraph
      )
        return start;
    }

    // Otherwise the enkonsonantsregeln: however many consonants stand between
    // the two vowels, exactly one of them goes with the following syllable.
    // hu-set, vand-ra, kris-ten-dom, tack-sä-gel-se.
    return lastConsonant;
  }

  /**
   * Rules for Swedish syllabification (Svenska skrivregler, §§ on avstavning)
   *
   * 1. Every vowel letter is a syllable nucleus. Swedish has no diphthongs, so
   *    adjacent vowels always belong to different syllables (be-ak-ta).
   * 2. Between two vowels, exactly one consonant goes with the second syllable
   *    — the enkonsonantsregeln (hu-set, flyt-ta, vand-ra, kris-ten-dom).
   *
   * Exceptions:
   *   1. A consonant group that is not divided starts the second syllable as a
   *      unit: sch, sj, tj, kj, ch (du-schen, guds-tjänst). <ck>, <sk>, <gn>,
   *      <dj> and <lj> are divided normally.
   *   2. <ng> spells a single /ŋ/ that closes the first syllable, so it is not
   *      divided and does not move: sjung-a, ing-en.
   *   3. <x> spells /ks/ and stays with the first syllable: väx-a, box-en.
   *   4. In the borrowed suffix -tion (and -sion, -ssion, -xion) the <i> is
   *      part of the /ɧ/ spelling rather than a vowel: na-tion, mis-sion.
   *
   * A hyphen in the source forces a break wherever it stands, and is dropped
   * from the syllables — the way to divide a compound at its seam.
   * @param {string} word
   * @returns {any}
   */
  syllabifyWord(word) {
    // an explicit hyphen forces a break
    /**
     * @param {*} part
     * @param {*} syllables
     */
    if (word.indexOf("-") >= 0)
      return word
        .split("-")
        .filter((/** @type {*} */ part) => part.length > 0)
        .reduce(
          (/** @type {*} */ syllables, /** @type {*} */ part) =>
            syllables.concat(this.syllabifyWord(part)),
          []
        );

    if (word.length === 0) return [];

    var letters = this.splitIntoLetters(word);
    var lowercased = letters.map((letter) => letter.text.toLowerCase());

    // the -tion suffix, whose i is not a vowel. The suffix is all ASCII, so the
    // index of group 1's end is an index into the original string too.
    var suffix = this.regexNonSyllabicI.exec(word.toLowerCase());
    var nonSyllabicIndex = suffix ? suffix[1].length : -1;

    var nuclei = [];
    for (var i = 0; i < letters.length; i++)
      if (this.isVowel(lowercased[i]) && letters[i].index !== nonSyllabicIndex)
        nuclei.push(i);

    // nothing to divide: no vowel at all, or a single syllable
    if (nuclei.length < 2) return [word];

    var starts = [0];
    for (var n = 1; n < nuclei.length; n++)
      starts.push(this.findSyllableStart(lowercased, nuclei[n - 1], nuclei[n]));

    var syllables = [];
    for (n = 0; n < starts.length; n++) {
      var from = letters[starts[n]].index;
      var to =
        n + 1 < starts.length ? letters[starts[n + 1]].index : word.length;
      syllables.push(word.substring(from, to));
    }

    return syllables;
  }

  /**
   * @param {String} s the string to search
   * @param {Number} startIndex The index at which to start searching for a vowel in the string
   * @param {Array<{index: Number, endIndex: Number}>} [ignore] ranges, relative to startIndex, that a match may not overlap
   * @returns {{found: boolean, startIndex: number, length: number}}
   */
  findVowelSegment(s, startIndex, ignore) {
    this.regexVowel.lastIndex = 0;
    let stringSlice = s.slice(startIndex);
    var match = this.regexVowel.exec(stringSlice);
    var isIgnoredMatch = (
      /** @type {{index: number, endIndex: number}} */ { index, endIndex }
    ) =>
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
        // the first group should be ignored: it is the consonant plus the
        // non-syllabic i of the -tion suffix, not the vowel of the syllable.
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

export const language = {
  english: new English(),
  latin: new Latin(),
  spanish: new Spanish(),
  swedish: new Swedish()
};
