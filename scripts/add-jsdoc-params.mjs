#!/usr/bin/env node
/**
 * Mechanical helper: for each TS7006 "Parameter 'X' implicitly has an 'any'
 * type" error in a file, ensure the enclosing function has a matching
 * `@param {…} X` JSDoc tag. Types are chosen from a name→type map; unknown
 * names get `*`. Never rewrites executable code — only inserts/extends
 * block comments immediately above the function/method/constructor.
 *
 * Usage: node scripts/add-jsdoc-params.mjs <file> [<file> ...]
 * Reads errors from stdin (tsc --pretty false output) or from
 * /tmp/any-src.txt if stdin is empty.
 */
import fs from "node:fs";

const TYPE_BY_PARAM = {
  ctxt: 'import("./Exsurge.Drawing.js").ChantContext',
  _ctxt: 'import("./Exsurge.Drawing.js").ChantContext',
  score: 'import("./Exsurge.Chant.js").ChantScore',
  note: 'import("./Exsurge.Chant.js").Note',
  currNote: 'import("./Exsurge.Chant.js").Note',
  prevNote: 'import("./Exsurge.Chant.js").Note',
  _prevNote: 'import("./Exsurge.Chant.js").Note',
  firstNote: 'import("./Exsurge.Chant.js").Note',
  secondNote: 'import("./Exsurge.Chant.js").Note',
  bottomNote: 'import("./Exsurge.Chant.js").Note',
  topNote: 'import("./Exsurge.Chant.js").Note',
  pitch: 'import("./Exsurge.Core.js").Pitch',
  notation: 'import("./Exsurge.Drawing.js").ChantNotationElement',
  neume: 'import("./Exsurge.Chant.Neumes.js").Neume',
  mappings: 'import("./Exsurge.Chant.js").ChantMapping[]',
  mapping: 'import("./Exsurge.Chant.js").ChantMapping',
  lyricArray: 'import("./Exsurge.Drawing.js").Lyric[]',
  lyrics: 'import("./Exsurge.Drawing.js").Lyric[]',
  notes: 'import("./Exsurge.Chant.js").Note[]',
  notations: 'import("./Exsurge.Drawing.js").ChantNotationElement[]',
  text: "string",
  s: "string",
  word: "string",
  data: "string",
  source: "*",
  gabc: "string",
  gabcSource: "string",
  newGabcSource: "string",
  name: "string",
  glyph: "string",
  glyphCode: "string",
  width: "number",
  height: "number",
  x: "number",
  y: "number",
  x1: "number",
  x2: "number",
  y1: "number",
  y2: "number",
  n: "number",
  i: "number",
  index: "number",
  sourceIndex: "number",
  sourceLength: "number",
  staffPosition: "number",
  octave: "number",
  step: "number",
  scale: "number",
  _scale: "number",
  zoom: "number",
  force: "boolean",
  justify: "boolean",
  isAbove: "boolean",
  auto: "boolean",
  withCarryover: "boolean",
  useDropCap: "boolean",
  lower: "boolean",
  l: "*",
  element: "*",
  finishedCallback: "Function",
  errorCallback: "Function",
  callback: "Function",
  defaultAccidental: "*",
  staffPosition0: "number",
  staffPosition1: "number",
  divider: "*",
  left: "number",
  top: "number",
  right: "number",
  bottom: "number",
  inputUnits: "number",
  outputUnits: "number",
  units: "number",
  point: 'import("./Exsurge.Core.js").Point',
  rect: 'import("./Exsurge.Core.js").Rect',
  margins: 'import("./Exsurge.Core.js").Margins',
  size: 'import("./Exsurge.Core.js").Size',
  other: "*",
  warning: "*",
  warn: "Function",
  vowel: "string",
  vowels: "string",
  options: "object",
  svgNode: "*",
  container: "*",
  onReady: "Function",
  partial: "object",
  fromNoteIndex: "number",
  noteIndex: "number",
  error: "unknown",
  when: "number",
  velocity: "number",
  frequency: "number",
  audioContext: "*",
  destination: "*",
  output: "*",
  parts: "*",
  endTime: "number",
  spec: "*",
  language: "*",
  properties: "object",
  fontFamily: "*",
  fontSize: "*",
  textAnchor: "string",
  sourceGabc: "string",
  fontDictionary: "*",
  baseStyle: "object",
  font: "*",
  color: "string",
  merge: "*",
  scaleDefs: "boolean",
  staffHeight: "number",
  glyphMultiplier: "number",
  glyphScaling: "number",
  length: "number",
  returnBBox: "boolean",
  resetNewLines: "boolean",
  maxWidth: "number",
  firstLineMaxWidth: "number",
  lyricType: "*",
  functionName: "string",
  children: "*",
  attributes: "object",
  child: "*",
  props: "object",
  sx: "number",
  sy: "number",
  node: "*",
  startLine: "number",
  endLine: "number",
  selection: "*",
  createDropCap: "boolean",
  insertionIndex: "number",
  oldInsertionIndex: "*",
  finalTrailingSpace: "*",
  instruction: "string",
  sourceIndexOffset: "number",
  zeroOrNine: "*",
  gabcHeight: "string",
  gabcAtom: "string",
  gabcWord: "string",
  gabcWords: "string[]",
  words: "string[]",
  before: "*",
  after: "*",
  match: "*",
  clef: "*",
  accidentalType: "number",
  shape: "*",
  attachment: "*",
  position: "*",
  marking: "*",
  alignment: "*",
  terminating: "boolean",
  multiplier: "number",
  includeCurrNote: "boolean",
  includePrevNote: "boolean",
  newElementStart: "number",
  doJustify: "boolean",
  condensableSpaces: "*",
  prevLyrics: "*",
  prev: "*",
  curr: "*",
  rightNotationBoundary: "number",
  startingX: "number",
  withLineTo: "boolean",
  startBrace: "*",
  endBrace: "*",
  line: "*",
  needs: "boolean",
  needsConnector: "*",
  connect: "*",
  supertitle: "string",
  title: "string",
  subtitle: "string",
  textLeft: "string",
  textRight: "string",
  titles: "object",
  elementName: "string",
  activeTags: "*",
  propertyArray: "*",
  extraProps: "*",
  startIndex: "number",
  tagName: "string",
  symbol: "string",
  extraProperties: "*",
  frame: "*",
  spans: "*",
  start: "number",
  end: "number",
  dropCapSpan: "*",
  dropCapLowerCase: "string",
  texts: "string[]",
  textType: "*",
  semitones: "number",
  tuning: "number",
  transpose: "number",
  temperament: "*",
  speedPercent: "number",
  basePulseSeconds: "number",
  dividerKind: "string",
  events: "*",
  pulse: "number",
  reason: "string",
  state: "*",
  voice: "*",
  roots: "*",
  className: "string",
  el: "*",
  root: "*",
  map: "*",
  key: "string",
  value: "*",
  a: "*",
  b: "*",
  c: "*",
  d: "*",
  e: "*",
  f: "*",
  g: "*",
  h: "*",
  j: "*",
  k: "*",
  m: "*",
  o: "*",
  p: "*",
  q: "*",
  r: "*",
  t: "*",
  u: "*",
  v: "*",
  w: "*",
  z: "*"
};

function typeFor(file, param) {
  let t = TYPE_BY_PARAM[param] || "*";
  // Same-file references shouldn't use import() of self when avoidable,
  // but import() of self is fine in TS. For Drawing.js, prefer bare ChantContext.
  if (file.endsWith("Exsurge.Drawing.js")) {
    t = t.replace('import("./Exsurge.Drawing.js").', "");
  }
  if (file.endsWith("Exsurge.Core.js")) {
    t = t.replace('import("./Exsurge.Core.js").', "");
  }
  if (file.endsWith("Exsurge.Chant.js")) {
    t = t.replace('import("./Exsurge.Chant.js").', "");
  }
  return t;
}

function findFunctionStart(lines, errorLine) {
  // Walk up from the error line to the function/method/constructor header.
  // errorLine is 1-based.
  let i = errorLine - 1;
  while (i >= 0) {
    const line = lines[i];
    if (
      /^\s*(?:export\s+)?(?:async\s+)?(?:function\s+\w+|class\s+\w+)/.test(
        line
      ) ||
      /^\s*(?:static\s+|get\s+|set\s+)?[#\w]+\s*\([^)]*\)\s*\{/.test(line) ||
      /^\s*constructor\s*\(/.test(line) ||
      /^\s*(?:export\s+)?(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\(/.test(
        line
      ) ||
      /^\s*\w+\s*\([^)]*\)\s*\{/.test(line) ||
      /^\s*(?:static\s+)?\w+\s*\(/.test(line)
    ) {
      // Prefer the closest header at or above the error that contains the param
      // list. Keep walking up if this line is clearly not a header.
      if (
        line.includes("(") ||
        /^\s*(?:export\s+)?(?:async\s+)?function\b/.test(line) ||
        /^\s*constructor\b/.test(line)
      ) {
        return i;
      }
    }
    i--;
  }
  return -1;
}

function existingJsdocRange(lines, funcLine) {
  // Returns [start, end] inclusive of an immediately preceding /** ... */ block,
  // or null.
  let end = funcLine - 1;
  while (end >= 0 && lines[end].trim() === "") end--;
  if (end < 0) return null;
  if (!lines[end].trim().endsWith("*/")) return null;
  let start = end;
  while (start >= 0 && !lines[start].includes("/**")) start--;
  if (start < 0) return null;
  // Must be contiguous with the function (only blank lines between)
  for (let i = end + 1; i < funcLine; i++) {
    if (lines[i].trim() !== "") return null;
  }
  return [start, end];
}

function parseParamsFromHeader(lines, funcLine) {
  // Collect the parameter list text, which may span lines.
  let text = "";
  let depth = 0;
  let started = false;
  for (let i = funcLine; i < Math.min(lines.length, funcLine + 30); i++) {
    for (const ch of lines[i]) {
      if (ch === "(") {
        depth++;
        started = true;
        continue;
      }
      if (ch === ")") {
        depth--;
        if (started && depth === 0) return text;
        continue;
      }
      if (started && depth >= 1) text += ch;
    }
  }
  return text;
}

function paramNames(paramText) {
  // Split on top-level commas; strip defaults and rest/destructure to a name.
  const names = [];
  let cur = "";
  let depth = 0;
  for (const ch of paramText) {
    if (ch === "(" || ch === "{" || ch === "[") depth++;
    if (ch === ")" || ch === "}" || ch === "]") depth--;
    if (ch === "," && depth === 0) {
      names.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) names.push(cur.trim());
  return names
    .map((p) => {
      p = p.replace(/\/\*.*?\*\//g, "").trim();
      if (!p) return null;
      if (p.startsWith("...")) p = p.slice(3);
      p = p.split("=")[0].trim();
      // skip destructuring patterns
      if (p.startsWith("{") || p.startsWith("[")) return null;
      return p;
    })
    .filter(Boolean);
}

function ensureParams(jsdocLines, needed, indent) {
  const have = new Set();
  for (const l of jsdocLines) {
    const m = l.match(/@param\s+(?:\{[^}]*\}\s+)?(\w+)/);
    if (m) have.add(m[1]);
  }
  const out = [...jsdocLines];
  // Insert before the closing */
  const closeIdx = out.findIndex((l) => l.trim() === "*/");
  const insertAt = closeIdx >= 0 ? closeIdx : out.length;
  for (const [name, type] of needed) {
    if (have.has(name)) continue;
    out.splice(insertAt, 0, `${indent} * @param {${type}} ${name}`);
    have.add(name);
  }
  return out;
}

function processFile(file, errorsForFile) {
  const original = fs.readFileSync(file, "utf8");
  const lines = original.split("\n");
  // Group needed params by function-start line
  /** @type {Map<number, Map<string, string>>} */
  const byFunc = new Map();
  for (const { line, param } of errorsForFile) {
    const funcLine = findFunctionStart(lines, line);
    if (funcLine < 0) {
      console.warn(`${file}:${line}: could not find function for param ${param}`);
      continue;
    }
    if (!byFunc.has(funcLine)) byFunc.set(funcLine, new Map());
    byFunc.get(funcLine).set(param, typeFor(file, param));
  }

  // Apply from bottom to top so line numbers stay valid
  const funcLines = [...byFunc.keys()].sort((a, b) => b - a);
  for (const funcLine of funcLines) {
    const needed = [...byFunc.get(funcLine).entries()];
    // Also add types for other params on the same header that we know about,
    // so we don't leave siblings untyped and get a second pass of errors.
    const headerParams = paramNames(parseParamsFromHeader(lines, funcLine));
    for (const p of headerParams) {
      if (!byFunc.get(funcLine).has(p) && TYPE_BY_PARAM[p]) {
        needed.push([p, typeFor(file, p)]);
      }
    }
    const indentMatch = lines[funcLine].match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : "";
    const range = existingJsdocRange(lines, funcLine);
    if (range) {
      const [start, end] = range;
      const block = lines.slice(start, end + 1);
      const updated = ensureParams(block, needed, indent);
      lines.splice(start, end - start + 1, ...updated);
    } else {
      const block = [
        `${indent}/**`,
        ...needed.map(([name, type]) => `${indent} * @param {${type}} ${name}`),
        `${indent} */`
      ];
      lines.splice(funcLine, 0, ...block);
    }
  }

  const next = lines.join("\n");
  if (next !== original) {
    fs.writeFileSync(file, next);
    return true;
  }
  return false;
}

function main() {
  let errorText = "";
  if (!process.stdin.isTTY) {
    errorText = fs.readFileSync(0, "utf8");
  }
  if (!errorText.trim() && fs.existsSync("/tmp/any-src.txt")) {
    errorText = fs.readFileSync("/tmp/any-src.txt", "utf8");
  }
  const targets = new Set(process.argv.slice(2));
  /** @type {Map<string, {line:number, param:string}[]>} */
  const byFile = new Map();
  for (const line of errorText.split("\n")) {
    const m = line.match(
      /^(.*)\((\d+),\d+\): error TS7006: Parameter '(\w+)' implicitly/
    );
    if (!m) continue;
    const [, file, lineNo, param] = m;
    if (targets.size && !targets.has(file)) continue;
    if (!byFile.has(file)) byFile.set(file, []);
    byFile.get(file).push({ line: Number(lineNo), param });
  }

  let changed = 0;
  for (const [file, errs] of byFile) {
    if (!fs.existsSync(file)) {
      console.warn("missing", file);
      continue;
    }
    if (processFile(file, errs)) {
      console.log("updated", file, `(${errs.length} params)`);
      changed++;
    } else {
      console.log("unchanged", file);
    }
  }
  console.log(`done: ${changed} files changed`);
}

main();
