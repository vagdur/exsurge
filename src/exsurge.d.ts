declare module "exsurge" {
  // TODO: Add types for these:
  type ChantNotation = unknown;
  type ChantLine = unknown;
  type Note = unknown;
  type Clef = unknown;
  type DropCap = unknown;
  type Annotation = { recalculateMetrics: (ctxt: ChantContext) => void };
  type Rect = unknown;
  type ExsurgeLanguage = unknown;
  type ChantNotationElement = unknown;

  /** Steps are semitone offsets within an octave. Index 8 is intentionally unused. */
  export const Step: {
    Do: 0;
    Du: 1;
    Re: 2;
    Me: 3;
    Mi: 4;
    Fa: 5;
    Fu: 6;
    So: 7;
    La: 9;
    Te: 10;
    Ti: 11;
  };

  export class Pitch {
    constructor(step: number, octave?: number);
    step: number;
    octave: number;
    toInt(): number;
    transpose(step: number): Pitch;
    isHigherThan(pitch: Pitch): boolean;
    isLowerThan(pitch: Pitch): boolean;
    equals(pitch: Pitch): boolean;
    static stepToStaffOffset(step: number): number;
    static staffOffsetToStep(offset: number): number;
  }

  export class Titles extends ChantLayoutElement {
    constructor(
      ctxt: ChantContext,
      score: ChantScore,
      titles?: {
        supertitle?: string;
        title?: string;
        subtitle?: string;
        textLeft?: string;
        textRight?: string;
      }
    );
    score: ChantScore;
    setSupertitle(ctxt: ChantContext, supertitle: string): Supertitle;
    setTitle(ctxt: ChantContext, title: string): Title;
    setSubtitle(ctxt: ChantContext, subtitle: string): Subtitle;
    setTextLeft(ctxt: ChantContext, textLeft: string): TextLeftRight;
    setTextRight(ctxt: ChantContext, textRight: string): TextLeftRight;
    hasSupertitle(): boolean;
    hasTitle(): boolean;
    hasSubtitle(): boolean;
    hasTextLeft(): boolean;
    hasTextRight(): boolean;
    /** @returns the total height of the titles laid out */
    layoutTitles(ctxt: ChantContext, width: number): number;
    createSvgNode(ctxt: ChantContext): SVGElement;
    draw(ctxt: ChantContext, scale?: number): void;
  }

  // Base class of every drawable element. Declared only so that the classes
  // below can extend it, as they do at runtime; its members are not covered.
  export class ChantLayoutElement {}

  // The title block elements the setters above return.
  export class Supertitle {}
  export class Title {}
  export class Subtitle {}
  export class TextLeftRight {}

  export class Language {
    constructor(name?: string);
    name: string;
    centerNeume: boolean;
    syllabify(text: string): Array<Array<string>>;
    syllabifyWord(word: string): string[];
    findVowelSegment(
      text: string,
      startingIndex: number
    ): { found: boolean; startIndex: number; length: number };
  }
  export class English extends Language {
    regexLetter: RegExp;

    // English implements only findVowelSegment. It never supplied
    // syllabifyWord, so the inherited syllabify walks straight into
    // Language's abstract syllabifyWord and throws at runtime.
    //
    // The parameters are typed never rather than string so that calling
    // either one is a compile error instead of a runtime throw. Method
    // parameters are compared bivariantly, so English stays assignable to
    // Language and its working members are unaffected.

    /** @deprecated Not implemented on English; always throws. */
    syllabifyWord(word: never): never;
    /** @deprecated Not implemented on English; always throws, because syllabifyWord is missing. */
    syllabify(text: never): never;
  }
  export class Latin extends Language {
    diphthongs: string[];
    possibleDiphthongs: string[];
    vowels: string[];
    regexVowel: RegExp;
    isVowel(c: string): boolean;
    isDiphthong(s: string): boolean;
    isPossibleDiphthong(s: string): boolean;
  }
  export class Spanish extends Language {}
  export const language: {
    english: English;
    latin: Latin;
    spanish: Spanish;
  };

  export class TextSpan {
    text: string;
    properties: {
      newLine?: number | boolean;
      "font-weight"?: string;
      "font-style"?: string;
      "text-decoration"?: string;
      "font-variant"?: string;
      "font-variant-caps"?: string;
      "font-feature-settings"?: string;
      "-webkit-font-feature-settings"?: string;
    };
    activeTags: string[];
    index: number;
    clone: () => TextSpan;
  }

  export type AnnotationSpansToTextLeftMapper = (
    spans: TextSpan[]
  ) => TextSpan[];
  interface TextType {
    display: string;

    defaultSize(size: number): number;
    containedInScore(score: ChantScore): boolean;
    getFromScore(score: ChantScore): string;
  }

  interface TextTypeWithCssClass {
    cssClass: string;
  }

  interface TextTypeWithSvgElem {
    getFromSvgElem(score: any, elem: any): any;
  }

  interface TextTypeWithSvgAndCss
    extends TextTypeWithSvgElem, TextTypeWithCssClass {}

  export enum TextMeasuringStrategy {
    Svg,
    Canvas,
    /**
     * also used font fontkit
     */
    OpenTypeJS
  }

  export class Annotations {
    constructor(ctxt: ChantContext, ...texts: string[]);
    recalculateMetrics(ctxt: ChantContext): void;
  }

  class ChantMapping {
    source: string;
    notations: ChantNotation[];
    sourceIndex: number;
  }

  export class Gabc {
    static createMappingsFromSource(
      ctxt: ChantContext,
      gabcSource: string
    ): ChantMapping[];
    static updateMappingsFromSource(
      ctxt: ChantContext,
      mappings: ChantMapping[],
      newGabcSource: string,
      insertionIndex?: number,
      oldInsertionIndex?: number
    ): ChantMapping[];
  }

  export class GabcHeader {
    static getLength(gabc: string): number;
    constructor(text: string);
    toString(): string;
    // Headers appearing more than once are also collected into a parallel
    // "<name>Array" property, so a value is either a string or a string[].
    [key: string]: string | string[] | ((...args: any[]) => any);
  }

  export interface SvgTreeNode {
    name?: string;
    props?: {
      [key: string]: any;
    };
    children: SvgTreeNode[];
  }

  export class ChantScore {
    constructor(
      ctxt: ChantContext,
      mappings?: ChantMapping[],
      useDropCap?: boolean
    );

    mappings: ChantMapping[];
    lines: ChantLine[];
    staffLineCount: number;
    notes: Note[];
    titles?: Titles;
    startingClef: Clef;
    useDropCap: boolean;
    dropCap: DropCap;
    annotation: Annotation | null;
    compiled: boolean;
    autoColoring: boolean;
    needsLayout: boolean;
    extendLastSystemStaffLines: boolean;
    bounds: Rect;
    forceLayout: boolean;
    pages: ChantScore[];
    updateSelection(selection: Selection): void;
    createSvgNode(ctxt: ChantContext, zoom?: number): SVGElement;
    createSvgTree(ctxt: ChantContext, zoom?: number): SvgTreeNode;
    createSvg(ctxt: ChantContext): string;
    recreateDropCap(ctxt: ChantContext): void;
    updateNotations(ctxt: ChantContext): void;
    performLayout(ctxt: ChantContext, forceLayout?: boolean): void;
    performLayoutAsync(ctxt: ChantContext, finishedCallback?: () => void): void;
    layoutChantLines(
      ctxt: ChantContext,
      width: number,
      finishedCallback?: () => void
    ): void;
    draw(ctxt: ChantContext, scale?: number): void;
    paginate(height: number): void;
  }

  export const QuickSvg: {
    ns: string;
    xmlns: string;
    xlink: string;
    hasDOMAccess(): boolean;
    svg(width: number, height: number, children?: any): SVGElement;
    rect(width: number, height: number, options?: any): SVGElement;
    line(x1: number, y1: number, x2: number, y2: number): SVGElement;
    g(children?: any): SVGElement;
    text(options?: any, children?: any): SVGElement;
    tspan(text: string, options?: any): SVGElement;
    use(href: string, options?: any): SVGElement;
    svgFragmentForGlyph(glyph: any): string;
    nodesForGlyph(glyph: any): SVGElement[];
    createNode(name: string, attributes?: any, children?: any): SVGElement;
    createSvgTree(name: string, props?: any, ...children: any[]): SvgTreeNode;
    createFragment(name: string, attributes?: any, child?: any): string;
    parseFragment(fragment: string): SVGElement;
    translate(node: SVGElement, x: number, y: number): any;
    scale(node: SVGElement, sx: number, sy?: number): any;
  };

  export interface TextTypes {
    supertitle: TextType;
    title: TextType;
    subtitle: TextType;
    leftRight: TextType & TextTypeWithSvgAndCss;
    annotation: TextType;
    dropCap: TextType;
    al: TextType & TextTypeWithSvgAndCss;
    choralSign: TextType;
    lyric: TextType & TextTypeWithSvgElem;
    translation: TextType & TextTypeWithSvgElem;
  }

  export interface TextStyle {
    size: number;
    font: string;
    color?: string;
    /**
     * Currently only used on lyrics, translations, and above lines text
     * Defaults to 1.1
     */
    lineHeight?: number;
  }

  export interface TextStyleWithAlignment {
    alignment?: string;
  }
  export interface TextStyleWithPadding {
    padding?: number;
  }

  export type TextTypeStyles = {
    [K in keyof TextTypes]: TextStyle;
  } & {
    supertitle: TextStyleWithAlignment;
    title: TextStyleWithAlignment;
    subtitle: TextStyleWithAlignment;
    annotation: TextStyleWithPadding;
    dropCap: TextStyleWithPadding;
  };

  export class ChantContext {
    constructor(textMeasuringStrategy?: TextMeasuringStrategy);
    getFontFilenameForProperties: (
      properties?: {
        "font-style"?: string;
        "font-weight"?: string;
      },
      url?: string
    ) => string;

    textStyles: TextTypeStyles;

    textMeasuringStrategy: TextMeasuringStrategy;
    lyricTextColor: string;
    rubricColor: string;

    specialCharProperties: { [key: string]: string };
    specialCharText?: (char: string) => string;
    textBeforeSpecialChar: string;
    textAfterSpecialChar: string;
    specialCharMap: { [key in "℣" | "℟" | "*" | "+"]: string };
    asteriskProperties: { [key: string]: string };
    plusProperties: { [key: string]: string };
    fontStyleDictionary: {
      [tag: string]: {
        [cssProp: string]: string;
      };
    };
    editable: boolean;
    useExtraTextOnly: boolean;

    alTextStyle: string;
    translationTextStyle: string;

    dropCapPadding: number;

    annotationPadding: number;

    minLedgerSeparation: number;
    minSpaceAboveStaff: number;
    minSpaceBelowStaff: number;
    spaceBetweenSystems: number;

    minNotesLastLine: number;
    minSyllablesLastLine: number;

    glyphPunctumWidth: number;
    glyphPunctumHeight: number;

    maxExtraSpaceInStaffIntervals: number;

    activeClef: Clef;

    neumeLineColor: string;
    staffLineColor: string;
    dividerLineColor: string;

    defaultLanguage: ExsurgeLanguage;

    pixelRatio: number;

    svgTextMeasurer?: SVGElement;

    syllableConnector: string;

    scaleDefs: boolean;

    interSyllabicMultiplier: number;

    accidentalSpaceMultiplier: number;

    interVerbalMultiplier: number;

    drawGuides: boolean;
    drawDebuggingBounds: boolean;

    currNotationIndex: number;

    condensingTolerance: number;

    autoColor: boolean;
    staffLineCount: number;

    setFont(
      font: string,
      size: number,
      baseStyle?: any,
      fontDictionary?: { [key: string]: import("opentype.js").Font }
    ): void;
    setRubricColor(color: string): void;
    setMergeAnnotationWithTextLeft(merge: boolean): void;
    setScaleDefs(scaleDefs: boolean): void;
    createStyleCss(): string;
    createStyleNode(): HTMLOrSVGElement;
    createStyleTree(): SvgTreeNode;
    createStyle(): string;
    updateHyphenWidth(): void;
    setStaffHeight(staffHeight: number, glyphMultiplier?: number): void;
    calculateHeightFromStaffPosition(staffPosition: number): number;
    insertFontsInDoc(): void;
    findNextNeume(): ChantNotationElement;
    makeCanvasIfNeeded(): void;
    setCanvasSize(width: number, height: number, scale?: number): void;
    mapAnnotationSpansToTextLeft?: AnnotationSpansToTextLeftMapper;
    mergeAnnotationWithTextLeft?: (...annotationSpan: TextSpan[]) => TextSpan[];
  }

  export const TextTypes: TextTypes;

  export interface ElementSelection {
    indices: number[];
    insertion?: {
      afterElementIndex?: number;
      chantLine?: number;
    };
  }
  export interface Selection {
    element?: ElementSelection;
  }

  export const greextraGlyphs: {
    MedicaeaFlat: string;
    HufnagelCustosUpShort: string;
    HufnagelCustosUpLong: string;
    HufnagelCustosUpMedium: string;
    HufnagelCustosDownShort: string;
    HufnagelCustosDownLong: string;
    HufnagelCustosDownMedium: string;
    MedicaeaCustosUpShort: string;
    MedicaeaCustosUpLong: string;
    MedicaeaCustosUpMedium: string;
    MedicaeaCustosDownShort: string;
    MedicaeaCustosDownLong: string;
    MedicaeaCustosDownMedium: string;
    MensuralCustosUpShort: string;
    MensuralCustosUpLong: string;
    MensuralCustosUpMedium: string;
    MensuralCustosDownShort: string;
    MensuralCustosDownLong: string;
    MensuralCustosDownMedium: string;
    MensuralFlat: string;
    HufnagelFlat: string;
    MedicaeaCClef: string;
    MedicaeaCClefChange: string;
    MedicaeaFClef: string;
    MedicaeaFClefChange: string;
    HufnagelCClef: string;
    HufnagelCClefChange: string;
    HufnagelFClef: string;
    HufnagelFClefChange: string;
    HugnagelCFClef: string;
    HufnagelCFClefChange: string;
    MensuralFlatHole: string;
    HufnagelFlatHole: string;
    MedicaeaFlatHole: string;
    StarSix: string;
    Dagger: string;
    "Bar.alt": string;
    StarHeight: string;
    Cross: string;
    "RBar.alt": string;
    "VBar.alt": string;
    Drawing1: string;
    Drawing2: string;
    RWithBarGoth: string;
    VWithBarGoth: string;
    Line1: string;
    Line2: string;
    Line3: string;
    Line4: string;
    Line5: string;
    "Cross.alt": string;
    ABarCaption: string;
    RBarCaption: string;
    VBarCaption: string;
    ABarCaptionSC: string;
    RBarCaptionSC: string;
    VBarCaptionSC: string;
    ABar: string;
    RBar: string;
    VBar: string;
    ABarSC: string;
    RBarSC: string;
    VBarSC: string;
    ABarSmall: string;
    RBarSmall: string;
    VBarSmall: string;
    ABarSmallSC: string;
    RBarSmallSC: string;
    VBarSmallSC: string;
    "RBar.alt2": string;
    "VBar.alt2": string;
    ABarCaptionSlant: string;
    RBarCaptionSlant: string;
    VBarCaptionSlant: string;
    ABarSlant: string;
    RBarSlant: string;
    VBarSlant: string;
    ABarSmallSlant: string;
    RBarSmallSlant: string;
    VBarSmallSlant: string;
  };

  //
  // Playback
  //

  /** Frequency anchor: Pitch(Step.Do, 2).toInt(), i.e. 24. */
  export const DoReferenceInt: number;

  export type DividerKind =
    | "virgula"
    | "quarterBar"
    | "halfBar"
    | "fullBar"
    | "doubleBar"
    | "dominicanBar";

  export interface PlaybackEvent {
    kind: "note" | "rest";
    note: Note | null;
    /** dense over sounding notes; null for rests */
    noteIndex: number | null;
    elementIndex: number;
    /** Pitch.toInt(), or null for a note that has no pitch and stays silent */
    pitchInt: number | null;
    dividerKind: DividerKind | null;
    /** gain multiplier; never affects duration */
    velocity: number;
    startPulse: number;
    pulses: number;
  }

  export interface PlaybackTimeline {
    events: PlaybackEvent[];
    totalPulses: number;
    /** noteIndex -> index into events */
    eventIndexByNoteIndex: number[];
  }

  export interface PlaybackDurationTable {
    base: number;
    /** ADDITIVE: pulses added per mora dot */
    perMora: number;
    episema: number;
    ictus: number;
    quilisma: number;
    beforeQuilisma: number;
    liquescentSmall: number;
    liquescentLarge: number;
    initioDebilis: number;
    stropha: number;
    oriscus: number;
    finalNote: number;
    beforeDivider: { [K in DividerKind]: number };
  }

  export const PlaybackDurations: PlaybackDurationTable;
  export const PlaybackRests: { [K in DividerKind]: number };
  export const PlaybackVelocities: {
    base: number;
    ictus: number;
    accent: number;
    quilisma: number;
    liquescentSmall: number;
    initioDebilis: number;
  };

  export function classifyDivider(divider: unknown): DividerKind | null;

  export function pitchIntToFrequency(
    pitchInt: number,
    tuning: number,
    transpose?: number
  ): number;

  export function pitchToFrequency(
    pitch: Pitch | null,
    tuning: number,
    transpose?: number
  ): number | null;

  export function secondsPerPulse(
    speedPercent: number,
    basePulseSeconds?: number
  ): number;

  export function createPlaybackEvents(
    score: ChantScore,
    options?: Partial<ChantPlayerOptions>
  ): PlaybackTimeline;

  export interface Voice {
    /** audio time after which this voice is certainly silent */
    endTime: number;
    release(when: number): void;
    dispose(): void;
  }

  export interface Instrument {
    name: string;
    createVoice(
      audioContext: BaseAudioContext,
      destination: AudioNode,
      frequency: number,
      when: number,
      velocity: number
    ): Voice;
  }

  export class PianoInstrument implements Instrument {
    name: string;
    createVoice(
      audioContext: BaseAudioContext,
      destination: AudioNode,
      frequency: number,
      when: number,
      velocity: number
    ): Voice;
  }

  export const Instruments: {
    piano: PianoInstrument;
    [name: string]: Instrument;
  };

  export function resolveInstrument(spec: string | Instrument): Instrument;

  export interface ChantPlayerOptions {
    /** percentage of the base speed; higher is faster */
    speed: number;
    /** seconds per pulse at speed 100 */
    basePulseSeconds: number;
    /**
     * Frequency of Do, i.e. of Pitch(Step.Do, 2) -- the Do the clef names.
     * Note that on an f-clef the note on the clef line is Fa, so it sounds a
     * perfect fourth above this.
     */
    tuning: number;
    /** extra semitones, applied after tuning */
    transpose: number;
    instrument: string | Instrument;
    volume: number;
    loop: boolean;
    maxVoices: number;
    highlightClass: string;
    highlightColor: string;
    injectStyle: boolean;
    /** false keeps the last note lit through bar rests */
    clearHighlightOnRest: boolean;
    playOnBackgroundClick: boolean;
    /** supply your own and the player will never close it */
    audioContext: BaseAudioContext | null;
    lookaheadSeconds: number;
    tickIntervalMs: number;
    durations: Partial<PlaybackDurationTable> | null;
    restWeights: Partial<{ [K in DividerKind]: number }> | null;
    velocities: Partial<typeof PlaybackVelocities> | null;
    onStart: ((player: ChantPlayer) => void) | null;
    onStop:
      | ((player: ChantPlayer, reason: "user" | "end" | "destroy") => void)
      | null;
    onEnd: ((player: ChantPlayer) => void) | null;
    onNoteChange:
      | ((
          noteIndex: number | null,
          event: PlaybackEvent | null,
          player: ChantPlayer
        ) => void)
      | null;
    onError: ((error: Error, player: ChantPlayer) => void) | null;
  }

  export const PlaybackDefaults: ChantPlayerOptions;

  export class ChantPlayer {
    constructor(
      score: ChantScore,
      svgNode?: SVGElement | SVGElement[] | null,
      options?: Partial<ChantPlayerOptions>
    );

    score: ChantScore;
    options: ChantPlayerOptions;
    timeline: PlaybackTimeline;
    audioContext: BaseAudioContext | null;

    readonly state: "stopped" | "playing";
    readonly currentNoteIndex: number | null;
    readonly events: PlaybackEvent[];
    readonly noteCount: number;
    readonly svgNode: SVGElement | null;

    attach(svgNode: SVGElement | SVGElement[]): void;
    detach(): void;
    /** rebuild the timeline after the gabc changed; stops playback first */
    refresh(): void;
    destroy(): void;

    /** call from a user gesture the first time */
    play(fromNoteIndex?: number): void;
    stop(): void;
    toggleAt(noteIndex: number): void;
    /** create and resume the AudioContext from a user gesture */
    unlock(): boolean;

    setSpeed(percent: number): void;
    setTuning(hz: number): void;
    setTranspose(semitones: number): void;
    setInstrument(spec: string | Instrument): void;
    setVolume(v: number): void;
    setOptions(partial: Partial<ChantPlayerOptions>): void;

    /** the timeline resolved into seconds and hertz at the current settings */
    getTimeline(): Array<{
      noteIndex: number | null;
      frequency: number | null;
      startTime: number;
      duration: number;
    }>;
  }

  export function createPlayableChant(
    ctxt: ChantContext,
    gabcSource: string,
    container: HTMLElement,
    options?: Partial<ChantPlayerOptions> & {
      useDropCap?: boolean;
      autoResize?: boolean;
    },
    onReady?: (player: ChantPlayer) => void
  ): void;
}

// export const TextTypesByClass = {};
// Object.entries(TextTypes).forEach(([key, entry]) => {
//   let cssClass = (entry.cssClass = entry.cssClass || key);
//   entry.key = key;
//   TextTypesByClass[cssClass] = entry;
// });
//
// export const DefaultTrailingSpace = ctxt =>
//   ctxt.intraNeumeSpacing * ctxt.interSyllabicMultiplier;
// DefaultTrailingSpace.isDefault = true;
