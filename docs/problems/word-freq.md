---
outline: deep
---

<script setup>
import { data } from '../data/metrics.data'

const problem = 'r1-word-freq'
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

# Word Frequency

**Real-World** — Read a file, count word frequencies, print the top 10.

Tests: File I/O, error handling, HashMap, string splitting, sorting with custom comparator.

## Results

<MetricsTable :data="metrics" :columns="columns" />

## This is where languages diverge

On algorithmic problems, all languages stay within 2× of each other. Here, C is **4× Python** and Zig is **3.6× Python**. Real-world code exercises the standard library, and that's where the gap opens.

### Why Zig is 50 lines

Same story as C — no hash map, no string splitting, manual memory allocation. Zig makes you explicit about allocators but doesn't save you from rebuilding basic data structures.

### Why Go is 42 lines

Go's sorting requires: define a struct type, create a slice, populate it, write a custom `sort.Slice` comparator. ~15 lines just to sort a map by value. Python does it in one: `Counter(words).most_common(10)`.

### Ruby and Elixir match Python

Ruby's `scan(/[a-z]+/).tally` and Elixir's `Enum.frequencies()` give stdlib-level conciseness that rivals Python's `Counter`. Kotlin's `groupingBy { it }.eachCount()` is close behind.

## Solutions

<SolutionTabs :solutions="solutions" />
