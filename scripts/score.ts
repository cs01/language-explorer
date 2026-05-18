#!/usr/bin/env bun
// Score a source file across all Language Explorer dimensions.

import { readFileSync } from 'fs';
import { basename } from 'path';
import { encodingForModel } from 'js-tiktoken';

const file = process.argv[2];
if (!file) {
  console.error('Usage: bun run scripts/score.ts <file>');
  process.exit(1);
}

const source = readFileSync(file, 'utf-8');
const lines = source.split('\n').filter(l => l.trim() !== '');

function scoreConciseness(src: string, nonBlankLines: string[]) {
  const loc = nonBlankLines.length;
  const tokens = nonBlankLines.join(' ').split(/\s+/).length;
  const chars = src.replace(/\s/g, '').length;

  const allTokens = nonBlankLines.join(' ').split(/\s+/);
  const uniqueTokens = new Set(allTokens).size;
  const halsteadVolume = allTokens.length * Math.log2(uniqueTokens || 1);

  const encoder = new TextEncoder();
  const compressed = Bun.gzipSync(encoder.encode(src));
  const compressionRatio = compressed.length / encoder.encode(src).length;

  return { loc, tokens, chars, halsteadVolume: Math.round(halsteadVolume), compressionRatio: +compressionRatio.toFixed(3) };
}

function scoreSigils(nonBlankLines: string[]) {
  const sigilPattern = /[^\w\s]/g;
  let totalSigils = 0;
  const sigilSet = new Set<string>();

  for (const line of nonBlankLines) {
    const matches = line.match(sigilPattern) || [];
    totalSigils += matches.length;
    matches.forEach(s => sigilSet.add(s));
  }

  return {
    sigilsPerLine: +(totalSigils / nonBlankLines.length).toFixed(2),
    uniqueSigilTypes: sigilSet.size,
    totalSigils,
  };
}

function scoreReadability(nonBlankLines: string[]) {
  const lineLengths = nonBlankLines.map(l => l.length);
  const avgLineLength = Math.round(lineLengths.reduce((a, b) => a + b, 0) / lineLengths.length);

  // Auto-detect indent unit from smallest non-zero leading whitespace
  const indents = nonBlankLines
    .map(l => {
      const m = l.match(/^(\t+)/);
      if (m) return m[1].length * 4;
      const s = l.match(/^( +)/);
      return s ? s[1].length : 0;
    })
    .filter(n => n > 0);

  let indentUnit = 2;
  if (indents.length > 0) {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    indentUnit = indents.reduce(gcd);
    if (indentUnit < 1) indentUnit = 2;
  }

  const nestings = nonBlankLines.map(l => {
    const m = l.match(/^(\t+)/);
    if (m) return m[1].length;
    const s = l.match(/^( +)/);
    return s ? Math.floor(s[1].length / indentUnit) : 0;
  });
  const maxNesting = Math.max(...nestings);

  const identifiers = nonBlankLines.join(' ').match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
  const avgIdentifierLength = identifiers.length
    ? +(identifiers.reduce((a, id) => a + id.length, 0) / identifiers.length).toFixed(1)
    : 0;

  const totalChars = nonBlankLines.join('\n').length;
  const nonWhitespace = nonBlankLines.join('\n').replace(/\s/g, '').length;
  const visualDensity = +(nonWhitespace / totalChars).toFixed(3);

  return { avgLineLength, maxNesting, avgIdentifierLength, visualDensity };
}

function scoreConcepts(src: string, nonBlankLines: string[]) {
  // Keywords used (language constructs the programmer must know)
  const keywordPattern = /\b(fn|func|fun|def|class|struct|enum|trait|impl|interface|type|import|from|use|module|package|let|var|val|const|mut|pub|pub\(crate\)|private|protected|static|async|await|spawn|go|chan|channel|match|switch|case|when|if|else|for|while|loop|do|return|break|continue|yield|try|catch|throw|throws|raise|rescue|defer|unsafe|where|in|is|as|new|self|this|super|nil|null|None|true|false|void|main|with|lambda|move|ref|dyn|box|impl|derive|macro|comptime|errdefer|orelse|unreachable)\b/g;
  const keywords = new Set<string>();
  for (const m of src.matchAll(keywordPattern)) {
    keywords.add(m[0]);
  }

  // Syntax patterns (distinct constructs beyond keywords)
  const patterns = new Set<string>();
  if (/=>/.test(src)) patterns.add('arrow_fn');
  if (/->/.test(src)) patterns.add('return_type');
  if (/<[A-Z]\w*>/.test(src)) patterns.add('generics');
  if (/\.\.\.|\.\./.test(src)) patterns.add('range');
  if (/\|[^|]/.test(src) && /closure|lambda|\{.*\|/.test(src)) patterns.add('closure');
  if (/match\s|case\s|when\s/.test(src)) patterns.add('pattern_match');
  if (/async|await|Future|Promise/.test(src)) patterns.add('async');
  if (/chan|channel|Channel/.test(src)) patterns.add('channels');
  if (/spawn|go\s|thread|Thread|Task\./.test(src)) patterns.add('concurrency');
  if (/Result|Option|Maybe|Either|\?/.test(src)) patterns.add('sum_types');
  if (/impl\s|trait\s|interface\s|protocol\s/.test(src)) patterns.add('interfaces');
  if (/&mut|&\w|borrowing|\*const|\*mut/.test(src)) patterns.add('references');
  if (/\bmap\b|\bfilter\b|\breduce\b|\bfold\b/.test(src)) patterns.add('higher_order');
  if (/struct\s|class\s|data\s+class/.test(src)) patterns.add('struct_def');
  if (/enum\s/.test(src)) patterns.add('enum_def');
  if (/import|use|from|require|include/.test(src)) patterns.add('imports');
  if (/\berr\b|\bError\b|rescue|except|catch/.test(src)) patterns.add('error_handling');

  // Unique stdlib/API identifiers (function calls from standard library)
  const callPattern = /\b([a-z][a-zA-Z0-9]*(?:\.[a-z][a-zA-Z0-9]*)?)\s*\(/g;
  const apiCalls = new Set<string>();
  for (const m of src.matchAll(callPattern)) {
    const call = m[1];
    if (!keywords.has(call) && call.length > 2) {
      apiCalls.add(call);
    }
  }

  return {
    keywords: keywords.size,
    syntaxPatterns: patterns.size,
    apiCalls: apiCalls.size,
    conceptCount: keywords.size + patterns.size,
  };
}

// Static language-level safety guardrails (not per-file — inherent to the language).
// 4-level scale per category:
//   1.0  = Prevented  — bug literally cannot happen (compile-time or runtime guarantee)
//   0.67 = Caught     — bug triggers defined behavior (panic/exception), not UB
//   0.33 = Opt-in     — tools/features available but not default
//   0    = None       — no protection
//
// Categories:
//   memory:   use-after-free, double-free, buffer overflow, uninitialized reads
//   null:     null/nil pointer dereference
//   race:     data races
//   overflow: integer overflow
//   coercion: implicit type coercions
type GLevel = { when: 'compile' | 'runtime' | 'none'; activation: 'default' | 'optin' }
type G = { memory: GLevel; null: GLevel; race: GLevel; overflow: GLevel; coercion: GLevel }

const C = (when: GLevel['when'], activation: GLevel['activation'] = 'default'): GLevel => ({ when, activation })
const NONE: GLevel = { when: 'none', activation: 'default' }

const guardrails: Record<string, G> = {
  c:          { memory: NONE,                  null: NONE,                  race: NONE,                  overflow: NONE,                  coercion: NONE                  },
  cpp:        { memory: C('runtime','optin'),  null: C('runtime','optin'),  race: NONE,                  overflow: NONE,                  coercion: NONE                  },
  zig:        { memory: C('runtime'),          null: C('compile'),          race: NONE,                  overflow: C('runtime'),          coercion: C('compile')          },
  rust:       { memory: C('compile'),          null: C('compile'),          race: C('compile'),          overflow: C('runtime'),          coercion: C('compile')          },
  milo:       { memory: C('compile'),          null: C('compile'),          race: C('compile'),          overflow: C('compile'),          coercion: C('compile')          },
  go:         { memory: C('compile'),          null: C('runtime'),          race: C('runtime','optin'),  overflow: NONE,                  coercion: C('compile')          },
  java:       { memory: C('compile'),          null: C('runtime','optin'),  race: C('runtime','optin'),  overflow: NONE,                  coercion: C('runtime')          },
  kotlin:     { memory: C('compile'),          null: C('compile'),          race: C('runtime','optin'),  overflow: NONE,                  coercion: C('compile')          },
  swift:      { memory: C('compile'),          null: C('compile'),          race: C('runtime','optin'),  overflow: C('runtime'),          coercion: C('compile')          },
  haskell:    { memory: C('compile'),          null: C('compile'),          race: C('compile'),          overflow: C('runtime'),          coercion: C('compile')          },
  elixir:     { memory: C('compile'),          null: C('compile'),          race: C('compile'),          overflow: C('compile'),          coercion: C('compile')          },
  python:     { memory: C('compile'),          null: C('runtime'),          race: NONE,                  overflow: C('compile'),          coercion: C('runtime')          },
  ruby:       { memory: C('compile'),          null: C('runtime'),          race: NONE,                  overflow: C('compile'),          coercion: C('runtime')          },
  javascript: { memory: C('compile'),          null: NONE,                  race: NONE,                  overflow: NONE,                  coercion: NONE                  },
  typescript: { memory: C('compile'),          null: C('compile','optin'),  race: NONE,                  overflow: NONE,                  coercion: C('compile','optin') },
  ada:        { memory: C('runtime'),          null: C('runtime'),          race: C('runtime','optin'),  overflow: C('compile'),          coercion: C('compile')          },
  x86_64:     { memory: NONE,                  null: NONE,                  race: NONE,                  overflow: NONE,                  coercion: NONE                  },
  llvm:       { memory: NONE,                  null: NONE,                  race: NONE,                  overflow: NONE,                  coercion: C('compile','optin')  },
  csharp:     { memory: C('compile'),          null: C('compile','optin'),  race: C('runtime','optin'),  overflow: C('runtime','optin'),  coercion: C('runtime')          },
  clojure:    { memory: C('compile'),          null: C('runtime'),          race: C('runtime'),          overflow: C('compile'),          coercion: C('runtime')          },
  erlang:     { memory: C('compile'),          null: C('runtime'),          race: C('compile'),          overflow: C('compile'),          coercion: C('compile')          },
  objc:       { memory: C('runtime','optin'),  null: NONE,                  race: NONE,                  overflow: NONE,                  coercion: NONE                  },
  zero:       { memory: C('compile'),          null: C('compile'),          race: C('compile'),          overflow: C('compile'),          coercion: C('compile')          },
}

// Convert 2-axis model to numeric score for weighting
function levelToScore(l: GLevel): number {
  if (l.when === 'none') return 0
  if (l.when === 'compile' && l.activation === 'default') return 1.0
  if (l.when === 'compile' && l.activation === 'optin') return 0.75
  if (l.when === 'runtime' && l.activation === 'default') return 0.67
  return 0.33 // runtime + optin
}

// Language surface area: how much a developer must learn to read arbitrary code.
// categories sum to concepts total; see methodology for category definitions
type Categories = {
  types: number        // primitives, compounds, type system, generics
  controlFlow: number  // if/match/for/while/pattern matching
  functions: number    // closures, higher-order, lambdas
  oopData: number      // classes, structs, interfaces, inheritance
  memory: number       // ownership, borrowing, GC, allocation
  concurrency: number  // async, channels, actors, threads
  metaprogramming: number // macros, decorators, reflection
  errorHandling: number   // exceptions, Result types, error flow
}
type SA = { keywords: number, concepts: number, categories: Categories }
const surfaceArea: Record<string, SA> = {
  //                                                  typ ctl fun oop mem con met err
  c:          { keywords: 44,  concepts: 60,  categories: { types: 12, controlFlow: 8,  functions: 6,  oopData: 4,  memory: 15, concurrency: 5,  metaprogramming: 6,  errorHandling: 4  } },
  cpp:        { keywords: 92,  concepts: 135, categories: { types: 25, controlFlow: 12, functions: 15, oopData: 22, memory: 20, concurrency: 12, metaprogramming: 18, errorHandling: 11 } },
  rust:       { keywords: 58,  concepts: 110, categories: { types: 22, controlFlow: 12, functions: 12, oopData: 12, memory: 22, concurrency: 10, metaprogramming: 10, errorHandling: 10 } },
  zig:        { keywords: 49,  concepts: 65,  categories: { types: 12, controlFlow: 10, functions: 6,  oopData: 5,  memory: 15, concurrency: 5,  metaprogramming: 5,  errorHandling: 7  } },
  milo:       { keywords: 30,  concepts: 49,  categories: { types: 8,  controlFlow: 6,  functions: 5,  oopData: 4,  memory: 8,  concurrency: 10, metaprogramming: 4,  errorHandling: 4  } },
  go:         { keywords: 25,  concepts: 58,  categories: { types: 10, controlFlow: 8,  functions: 6,  oopData: 8,  memory: 5,  concurrency: 10, metaprogramming: 3,  errorHandling: 8  } },
  java:       { keywords: 68,  concepts: 80,  categories: { types: 14, controlFlow: 10, functions: 8,  oopData: 18, memory: 4,  concurrency: 10, metaprogramming: 8,  errorHandling: 8  } },
  kotlin:     { keywords: 78,  concepts: 85,  categories: { types: 16, controlFlow: 10, functions: 12, oopData: 14, memory: 3,  concurrency: 10, metaprogramming: 8,  errorHandling: 12 } },
  swift:      { keywords: 98,  concepts: 110, categories: { types: 20, controlFlow: 12, functions: 12, oopData: 16, memory: 12, concurrency: 12, metaprogramming: 14, errorHandling: 12 } },
  haskell:    { keywords: 24,  concepts: 75,  categories: { types: 22, controlFlow: 8,  functions: 15, oopData: 3,  memory: 2,  concurrency: 8,  metaprogramming: 5,  errorHandling: 12 } },
  elixir:     { keywords: 15,  concepts: 62,  categories: { types: 8,  controlFlow: 8,  functions: 10, oopData: 4,  memory: 2,  concurrency: 14, metaprogramming: 10, errorHandling: 6  } },
  python:     { keywords: 39,  concepts: 75,  categories: { types: 8,  controlFlow: 10, functions: 10, oopData: 18, memory: 2,  concurrency: 10, metaprogramming: 12, errorHandling: 5  } },
  ruby:       { keywords: 41,  concepts: 65,  categories: { types: 6,  controlFlow: 10, functions: 10, oopData: 14, memory: 2,  concurrency: 5,  metaprogramming: 12, errorHandling: 6  } },
  javascript: { keywords: 46,  concepts: 65,  categories: { types: 6,  controlFlow: 8,  functions: 12, oopData: 10, memory: 2,  concurrency: 10, metaprogramming: 10, errorHandling: 7  } },
  typescript: { keywords: 67,  concepts: 100, categories: { types: 22, controlFlow: 10, functions: 12, oopData: 14, memory: 2,  concurrency: 10, metaprogramming: 14, errorHandling: 16 } },
  ada:        { keywords: 74,  concepts: 85,  categories: { types: 18, controlFlow: 10, functions: 8,  oopData: 12, memory: 10, concurrency: 12, metaprogramming: 6,  errorHandling: 9  } },
  x86_64:     { keywords: 1503, concepts: 45, categories: { types: 8,  controlFlow: 8,  functions: 2,  oopData: 0,  memory: 15, concurrency: 5,  metaprogramming: 5,  errorHandling: 2  } },
  llvm:       { keywords: 150,  concepts: 35, categories: { types: 10, controlFlow: 6,  functions: 4,  oopData: 0,  memory: 8,  concurrency: 2,  metaprogramming: 3,  errorHandling: 2  } },
  csharp:     { keywords: 118,  concepts: 120, categories: { types: 20, controlFlow: 12, functions: 12, oopData: 20, memory: 6,  concurrency: 12, metaprogramming: 22, errorHandling: 16 } },
  clojure:    { keywords: 16,   concepts: 65,  categories: { types: 8,  controlFlow: 6,  functions: 14, oopData: 6,  memory: 2,  concurrency: 12, metaprogramming: 12, errorHandling: 5  } },
  erlang:     { keywords: 28,   concepts: 55,  categories: { types: 6,  controlFlow: 8,  functions: 8,  oopData: 4,  memory: 2,  concurrency: 15, metaprogramming: 6,  errorHandling: 6  } },
  objc:       { keywords: 57,   concepts: 48,  categories: { types: 8,  controlFlow: 6,  functions: 4,  oopData: 10, memory: 8,  concurrency: 4,  metaprogramming: 5,  errorHandling: 3  } },
  zero:       { keywords: 32,   concepts: 50,  categories: { types: 10, controlFlow: 8,  functions: 6,  oopData: 6,  memory: 8,  concurrency: 2,  metaprogramming: 2,  errorHandling: 8  } },
}

// How much type information is statically available to tools reading the code
const typeCoverage: Record<string, number> = {
  c: 1.0, cpp: 1.0, rust: 1.0, zig: 1.0, milo: 1.0,
  go: 1.0, java: 1.0, kotlin: 1.0, swift: 1.0, ada: 1.0,
  csharp: 1.0, zero: 1.0,
  haskell: 0.75,
  typescript: 0.5, python: 0.5, objc: 0.5,
  ruby: 0.25, llvm: 0.25,
  javascript: 0.0, elixir: 0.0, erlang: 0.0, clojure: 0.0, x86_64: 0.0,
}

const extToLang: Record<string, string> = {
  py: 'python', ts: 'typescript', rs: 'rust', js: 'javascript',
  rb: 'ruby', kt: 'kotlin', hs: 'haskell', exs: 'elixir',
  c: 'c', cpp: 'cpp', go: 'go', swift: 'swift', zig: 'zig',
  java: 'java', milo: 'milo', adb: 'ada', ads: 'ada',
  asm: 'x86_64', s: 'x86_64', ll: 'llvm',
  cs: 'csharp', clj: 'clojure', erl: 'erlang', m: 'objc',
  '0': 'zero',
}

// Weights derived from CVE/CWE data: Microsoft + Chrome found ~70% of CVEs are memory safety.
// See: MSRC 2019, Chromium memory-safety project, CWE Top 25 (2025), CISA memory safety report.
const guardrailWeights = { memory: 0.45, null: 0.20, race: 0.15, overflow: 0.12, coercion: 0.08 }

function scoreGuardrails(filename: string) {
  const ext = filename.split('.').pop() || ''
  const lang = extToLang[ext] || ext
  const defaultG: G = { memory: NONE, null: NONE, race: NONE, overflow: NONE, coercion: NONE }
  const g = guardrails[lang] || defaultG

  const scores = {
    memory: levelToScore(g.memory),
    null: levelToScore(g.null),
    race: levelToScore(g.race),
    overflow: levelToScore(g.overflow),
    coercion: levelToScore(g.coercion),
  }

  const weighted = +(
    scores.memory * guardrailWeights.memory +
    scores.null * guardrailWeights.null +
    scores.race * guardrailWeights.race +
    scores.overflow * guardrailWeights.overflow +
    scores.coercion * guardrailWeights.coercion
  ).toFixed(2)
  const guardrailScore = +(weighted * 5).toFixed(1)

  return {
    ...scores,
    guardrailScore,
    grMemoryWhen: g.memory.when, grMemoryActivation: g.memory.activation,
    grNullWhen: g.null.when, grNullActivation: g.null.activation,
    grRaceWhen: g.race.when, grRaceActivation: g.race.activation,
    grOverflowWhen: g.overflow.when, grOverflowActivation: g.overflow.activation,
    grCoercionWhen: g.coercion.when, grCoercionActivation: g.coercion.activation,
  }
}

function scoreCeremony(src: string, nonBlankLines: string[]) {
  let ceremonyLines = 0;

  for (const line of nonBlankLines) {
    const t = line.trim();
    // Import/use/include/require/from/package statements
    if (/^(import|use|from|require|include|package|module)\b/.test(t)) { ceremonyLines++; continue; }
    // Main function signature and its closing brace
    if (/^(fn\s+main|func\s+main|def\s+main|public\s+static\s+void\s+main|int\s+main)/.test(t)) { ceremonyLines++; continue; }
    // Class/module wrappers that exist only to hold code
    if (/^(class\s+\w+\s*\{?|module\s+\w+\s+where|module\s+\w+\s+do)$/.test(t)) { ceremonyLines++; continue; }
    // Bare return 0/return statements at end of main
    if (/^return\s+0\s*;?$/.test(t)) { ceremonyLines++; continue; }
    // Lone opening/closing braces or 'end'
    if (/^[{}]$/.test(t) || /^end$/.test(t)) { ceremonyLines++; continue; }
    // Standalone defer/close cleanup
    if (/^defer\s/.test(t)) { ceremonyLines++; continue; }
    // Type-only lines (struct/type declarations with no logic)
    if (/^(struct|type|typedef|using)\s+\w+/.test(t) && !/=/.test(t)) { ceremonyLines++; continue; }
    // #include guards, pragma
    if (/^#(include|pragma|define|ifndef|endif)/.test(t)) { ceremonyLines++; continue; }
    // @import / @_
    if (/^@(import|_)/.test(t)) { ceremonyLines++; continue; }
    // const std = @import("std")
    if (/^const\s+std\s*=/.test(t)) { ceremonyLines++; continue; }
  }

  const ratio = +(ceremonyLines / nonBlankLines.length).toFixed(3);
  return { ceremonyLines, ceremonyRatio: ratio };
}

const defaultCategories: Categories = { types: 0, controlFlow: 0, functions: 0, oopData: 0, memory: 0, concurrency: 0, metaprogramming: 0, errorHandling: 0 }

function scoreSurfaceArea(filename: string) {
  const ext = filename.split('.').pop() || ''
  const lang = extToLang[ext] || ext
  const s = surfaceArea[lang] || { keywords: 0, concepts: 0, categories: defaultCategories }
  const catSum = Object.values(s.categories).reduce((a, b) => a + b, 0)
  if (s.concepts > 0 && catSum !== s.concepts) {
    throw new Error(`${lang}: category sum ${catSum} !== concepts ${s.concepts}`)
  }
  const keywordRatio = s.concepts > 0 ? +(s.keywords / s.concepts).toFixed(2) : 0
  return { ...s, keywordRatio }
}

const enc = encodingForModel('gpt-4o')

function scoreLLMTokens(src: string, loc: number) {
  const llmTokens = enc.encode(src).length
  return { llmTokens, llmTokensPerLine: +(llmTokens / loc).toFixed(2) }
}

function scoreTypeCoverage(filename: string) {
  const ext = filename.split('.').pop() || ''
  const lang = extToLang[ext] || ext
  return { typeCoverage: typeCoverage[lang] ?? 0 }
}

const conciseness = scoreConciseness(source, lines);
const sigils = scoreSigils(lines);
const readability = scoreReadability(lines);
const concepts = scoreConcepts(source, lines);
const guardrailResult = scoreGuardrails(basename(file));
const ceremony = scoreCeremony(source, lines);
const surface = scoreSurfaceArea(basename(file));
const llmTokenResult = scoreLLMTokens(source, conciseness.loc);
const typeCoverageResult = scoreTypeCoverage(basename(file));

const result = {
  file: basename(file),
  conciseness: { ...conciseness, tokensPerLine: +(conciseness.tokens / conciseness.loc).toFixed(2) },
  sigils,
  readability,
  concepts,
  guardrails: guardrailResult,
  ceremony,
  surfaceArea: surface,
  llmTokens: llmTokenResult,
  typeCoverage: typeCoverageResult,
};

console.log(JSON.stringify(result, null, 2));
