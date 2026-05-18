#!/usr/bin/env bun
import { readdirSync } from 'fs';
import { join, basename } from 'path';
import { $ } from 'bun';

const solutionsDir = join(import.meta.dir, '../benchmarks/solutions');
const dataDir = join(import.meta.dir, '../data');

const extMap: Record<string, string> = {
  python: 'py', typescript: 'ts', rust: 'rs', go: 'go',
  c: 'c', cpp: 'cpp', swift: 'swift', zig: 'zig',
  javascript: 'js', ruby: 'rb', java: 'java', kotlin: 'kt',
  haskell: 'hs', elixir: 'exs', milo: 'milo',
  csharp: 'cs', erlang: 'erl', clojure: 'clj', objc: 'm',
};

let count = 0;
for (const lang of readdirSync(solutionsDir)) {
  const ext = extMap[lang];
  if (!ext) continue;
  const langDir = join(solutionsDir, lang);
  for (const file of readdirSync(langDir)) {
    if (!file.endsWith(`.${ext}`)) continue;
    const problem = basename(file, `.${ext}`);
    const outFile = join(dataDir, `${problem}-${lang}.json`);
    const srcFile = join(langDir, file);
    await $`bun run ${join(import.meta.dir, 'score.ts')} ${srcFile} > ${outFile}`.quiet();
    count++;
  }
}

console.log(`scored ${count} files`);
