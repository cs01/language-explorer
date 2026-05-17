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
// Each category is binary: does the language prevent this class of bug by default?
//   memory:   use-after-free, double-free, buffer overflow, uninitialized reads
//   null:     null/nil pointer dereference (Option/Maybe required)
//   race:     data races prevented at compile time
//   overflow: integer overflow trapped (not silent wrap)
//   coercion: no implicit type coercions
const guardrails: Record<string, { memory: boolean; null: boolean; race: boolean; overflow: boolean; coercion: boolean }> = {
  c:          { memory: false, null: false, race: false, overflow: false, coercion: false },
  cpp:        { memory: false, null: false, race: false, overflow: false, coercion: false },
  zig:        { memory: false, null: false, race: false, overflow: true,  coercion: true },
  rust:       { memory: true,  null: true,  race: true,  overflow: true,  coercion: true },
  milo:       { memory: true,  null: true,  race: false, overflow: false, coercion: true },
  go:         { memory: true,  null: false, race: false, overflow: false, coercion: true },
  java:       { memory: true,  null: false, race: false, overflow: false, coercion: false },
  kotlin:     { memory: true,  null: true,  race: false, overflow: false, coercion: true },
  swift:      { memory: true,  null: true,  race: false, overflow: true,  coercion: true },
  haskell:    { memory: true,  null: true,  race: true,  overflow: true,  coercion: true },
  elixir:     { memory: true,  null: true,  race: true,  overflow: true,  coercion: true },
  python:     { memory: true,  null: false, race: false, overflow: true,  coercion: true },
  ruby:       { memory: true,  null: false, race: false, overflow: true,  coercion: true },
  javascript: { memory: true,  null: false, race: false, overflow: false, coercion: false },
  typescript: { memory: true,  null: false, race: false, overflow: false, coercion: true },
}

const extToLang: Record<string, string> = {
  py: 'python', ts: 'typescript', rs: 'rust', js: 'javascript',
  rb: 'ruby', kt: 'kotlin', hs: 'haskell', exs: 'elixir',
  c: 'c', cpp: 'cpp', go: 'go', swift: 'swift', zig: 'zig',
  java: 'java', milo: 'milo',
}

function scoreGuardrails(filename: string) {
  const ext = filename.split('.').pop() || ''
  const lang = extToLang[ext] || ext
  const g = guardrails[lang] || { memory: false, null: false, race: false, overflow: false, coercion: false }
  const score = [g.memory, g.null, g.race, g.overflow, g.coercion].filter(Boolean).length
  return { ...g, guardrailScore: score }
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

const conciseness = scoreConciseness(source, lines);
const sigils = scoreSigils(lines);
const readability = scoreReadability(lines);
const concepts = scoreConcepts(source, lines);
const guardrailResult = scoreGuardrails(basename(file));
const ceremony = scoreCeremony(source, lines);

const result = {
  file: basename(file),
  conciseness: { ...conciseness, tokensPerLine: +(conciseness.tokens / conciseness.loc).toFixed(2) },
  sigils,
  readability,
  concepts,
  guardrails: guardrailResult,
  ceremony,
};

console.log(JSON.stringify(result, null, 2));
