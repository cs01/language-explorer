---
outline: deep
---

<script setup>
import { data } from '../data/metrics.data'

const problem = 'a1-two-sum'
const metrics = data.metrics
  .filter(m => m.problem === problem)
  .map(m => ({
    language: m.language.charAt(0).toUpperCase() + m.language.slice(1),
    lines: m.loc,
    tokens: m.tokens,
    complexity: m.halsteadVolume,
    'tok/line': m.tokensPerLine, 'symbols/line': m.sigilsPerLine, concepts: m.conceptCount,
    safety: m.safetyPerLine, ceremony: m.ceremonyRatio,
  }))

const columns = [
  { key: 'lines', label: 'Lines' },
  { key: 'tokens', label: 'Tokens' },
  { key: 'complexity', label: 'Complexity' },
  { key: 'tok/line', label: 'Tok/Line' }, { key: 'symbols/line', label: 'Sym/Line' }, { key: 'concepts', label: 'Concepts' },
  { key: 'safety', label: 'Safety', lower: false }, { key: 'ceremony', label: 'Ceremony' },
]

const langLabels = {
  python: 'Python', typescript: 'TypeScript', rust: 'Rust', go: 'Go',
  c: 'C', cpp: 'C++', swift: 'Swift', zig: 'Zig', javascript: 'JavaScript',
  ruby: 'Ruby', java: 'Java', kotlin: 'Kotlin', haskell: 'Haskell', elixir: 'Elixir', milo: 'Milo',
}

const solutions = data.solutions
  .filter(s => s.problem === problem)
  .sort((a, b) => {
    const aLoc = data.metrics.find(m => m.problem === problem && m.language === a.language)?.loc ?? 99
    const bLoc = data.metrics.find(m => m.problem === problem && m.language === b.language)?.loc ?? 99
    return aLoc - bLoc
  })
  .map(s => ({ lang: s.language, label: langLabels[s.language] || s.language, code: s.code }))
</script>

# Two Sum

**Algorithmic** — Given an array and a target sum, find two numbers that add up to it.

Tests: HashMap, iteration, returning a compound value.

## Results

<MetricsTable :data="metrics" :columns="columns" />

## Observations

Simple problem — all languages cluster near 7-15 LOC. **Ruby** wins on tokens and complexity: `each_with_index` + implicit return + no type annotations = minimal syntax.

**Haskell** is interesting — only 10 lines but highest token count (58) due to pattern matching verbosity and qualified `Map.lookup`.

Python's `enumerate()` + dictionary lookup remains the gold standard for clarity.

## Solutions

<SolutionTabs :solutions="solutions" />
