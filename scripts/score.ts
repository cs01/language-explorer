#!/usr/bin/env bun
// Score a source file across all langmetrics dimensions.

import { readFileSync } from 'fs';
import { basename } from 'path';

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
// Scored per category: 0 = not available, 0.5 = available but opt-in, 1 = enforced by default.
//   memory:   use-after-free, double-free, buffer overflow, uninitialized reads
//   null:     null/nil pointer dereference (Option/Maybe required)
//   race:     data races prevented at compile time
//   overflow: integer overflow trapped (not silent wrap)
//   coercion: no implicit type coercions
type G = { memory: number; null: number; race: number; overflow: number; coercion: number }
const guardrails: Record<string, G> = {
  c:          { memory: 0,   null: 0,   race: 0, overflow: 0, coercion: 0   },
  cpp:        { memory: 0.5, null: 0.5, race: 0, overflow: 0, coercion: 0   },
  zig:        { memory: 0.5, null: 0.5, race: 0, overflow: 1, coercion: 1   },
  rust:       { memory: 1,   null: 1,   race: 1, overflow: 1, coercion: 1   },
  milo:       { memory: 1,   null: 1,   race: 1, overflow: 1, coercion: 1   },
  go:         { memory: 1,   null: 0,   race: 0, overflow: 0, coercion: 1   },
  java:       { memory: 1,   null: 0.5, race: 0, overflow: 0, coercion: 0.5 },
  kotlin:     { memory: 1,   null: 1,   race: 0, overflow: 0, coercion: 1   },
  swift:      { memory: 1,   null: 1,   race: 1, overflow: 1, coercion: 1   },
  haskell:    { memory: 1,   null: 1,   race: 1, overflow: 1, coercion: 1   },
  elixir:     { memory: 1,   null: 1,   race: 1, overflow: 1, coercion: 1   },
  python:     { memory: 1,   null: 0,   race: 0, overflow: 1, coercion: 1   },
  ruby:       { memory: 1,   null: 0,   race: 0, overflow: 1, coercion: 1   },
  javascript: { memory: 1,   null: 0,   race: 0, overflow: 0, coercion: 0   },
  typescript: { memory: 1,   null: 0.5, race: 0, overflow: 0, coercion: 1   },
  ada:        { memory: 0.5, null: 0.5, race: 0.5, overflow: 1, coercion: 1 },
  x86_64:     { memory: 0,   null: 0,   race: 0, overflow: 0, coercion: 0   },
  llvm:       { memory: 0,   null: 0,   race: 0, overflow: 0, coercion: 0.5 },
}

// Language surface area: how much a developer must learn to read arbitrary code.
// keywords = reserved/special words from language spec (verified against official docs)
// concepts = distinct features a developer must learn (curated across 13 categories:
//   variables, types, compounds, type system, control flow, functions, OOP,
//   generics, error handling, memory, concurrency, modules, metaprogramming)
type SA = { keywords: number, concepts: number }
const surfaceArea: Record<string, SA> = {
  c:          { keywords: 44,  concepts: 60  },
  cpp:        { keywords: 92,  concepts: 135 },
  rust:       { keywords: 58,  concepts: 110 },
  zig:        { keywords: 49,  concepts: 65  },
  milo:       { keywords: 30,  concepts: 40  },
  go:         { keywords: 25,  concepts: 58  },
  java:       { keywords: 68,  concepts: 80  },
  kotlin:     { keywords: 78,  concepts: 85  },
  swift:      { keywords: 98,  concepts: 110 },
  haskell:    { keywords: 24,  concepts: 75  },
  elixir:     { keywords: 15,  concepts: 62  },
  python:     { keywords: 39,  concepts: 75  },
  ruby:       { keywords: 41,  concepts: 65  },
  javascript: { keywords: 46,  concepts: 65  },
  typescript: { keywords: 67,  concepts: 100 },
  ada:        { keywords: 74,  concepts: 85  },
  x86_64:     { keywords: 1503, concepts: 45 },
  llvm:       { keywords: 150,  concepts: 35 },
}

const extToLang: Record<string, string> = {
  py: 'python', ts: 'typescript', rs: 'rust', js: 'javascript',
  rb: 'ruby', kt: 'kotlin', hs: 'haskell', exs: 'elixir',
  c: 'c', cpp: 'cpp', go: 'go', swift: 'swift', zig: 'zig',
  java: 'java', milo: 'milo', adb: 'ada', ads: 'ada',
  asm: 'x86_64', s: 'x86_64', ll: 'llvm',
}

// Weights derived from CVE/CWE data: Microsoft + Chrome found ~70% of CVEs are memory safety.
// See: MSRC 2019, Chromium memory-safety project, CWE Top 25 (2025), CISA memory safety report.
const guardrailWeights = { memory: 0.45, null: 0.20, race: 0.15, overflow: 0.12, coercion: 0.08 }

function scoreGuardrails(filename: string) {
  const ext = filename.split('.').pop() || ''
  const lang = extToLang[ext] || ext
  const g = guardrails[lang] || { memory: 0, null: 0, race: 0, overflow: 0, coercion: 0 }
  const unweighted = g.memory + g.null + g.race + g.overflow + g.coercion
  const weighted = +(
    g.memory * guardrailWeights.memory +
    g.null * guardrailWeights.null +
    g.race * guardrailWeights.race +
    g.overflow * guardrailWeights.overflow +
    g.coercion * guardrailWeights.coercion
  ).toFixed(2)
  // Normalize weighted to 0-5 scale (max raw weighted = 1.0 when all categories are 1)
  const guardrailScore = +(weighted * 5).toFixed(1)
  return { ...g, guardrailScore }
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

function scoreSurfaceArea(filename: string) {
  const ext = filename.split('.').pop() || ''
  const lang = extToLang[ext] || ext
  const s = surfaceArea[lang] || { keywords: 0, concepts: 0 }
  return { ...s }
}

const conciseness = scoreConciseness(source, lines);
const sigils = scoreSigils(lines);
const readability = scoreReadability(lines);
const concepts = scoreConcepts(source, lines);
const guardrailResult = scoreGuardrails(basename(file));
const ceremony = scoreCeremony(source, lines);
const surface = scoreSurfaceArea(basename(file));

const result = {
  file: basename(file),
  conciseness: { ...conciseness, tokensPerLine: +(conciseness.tokens / conciseness.loc).toFixed(2) },
  sigils,
  readability,
  concepts,
  guardrails: guardrailResult,
  ceremony,
  surfaceArea: surface,
};

console.log(JSON.stringify(result, null, 2));
