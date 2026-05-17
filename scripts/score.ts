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

const conciseness = scoreConciseness(source, lines);
const sigils = scoreSigils(lines);
const readability = scoreReadability(lines);

const result = {
  file: basename(file),
  conciseness,
  sigils,
  readability,
};

console.log(JSON.stringify(result, null, 2));
