---
outline: deep
---

<script setup>
import { data } from '../data/metrics.data'

const problem = 'a3-valid-parens'
const metrics = data.metrics
  .filter(m => m.problem === problem)
  .map(m => ({
    language: m.language.charAt(0).toUpperCase() + m.language.slice(1),
    lines: m.loc,
    tokens: m.tokens,
    complexity: m.halsteadVolume,
    'symbols/line': m.sigilsPerLine,
  }))

const columns = [
  { key: 'lines', label: 'Lines' },
  { key: 'tokens', label: 'Tokens' },
  { key: 'complexity', label: 'Complexity' },
  { key: 'symbols/line', label: 'Sym/Line' },
]

const langLabels = {
  python: 'Python', typescript: 'TypeScript', rust: 'Rust', go: 'Go',
  c: 'C', cpp: 'C++', swift: 'Swift', zig: 'Zig', javascript: 'JavaScript',
  ruby: 'Ruby', java: 'Java', kotlin: 'Kotlin', haskell: 'Haskell', elixir: 'Elixir',
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

# Valid Parentheses

**Algorithmic** — Determine if a string of brackets `()[]{}` is properly nested.

Tests: Stack operations, string iteration, match/switch, early return.

## Results

<MetricsTable :data="metrics" :columns="columns" />

## Observations

**Rust hits its highest symbol noise here (7.9/line)** — pattern matching with `'('`, `Some()`, `|` alternatives pack symbols per line. **Elixir** is close at 7.4 due to pipeline operators and pattern-matched function clauses.

**Zig explodes to 26 lines** — explicit stack array, manual indexing, nested switch statements. No collections library means doing everything by hand.

**Ruby** wins on tokens (35) and complexity (172) — `each_char`, `push`/`pop`, and `empty?` are about as readable as pseudocode.

**Haskell** keeps symbol noise low (4.3) despite pattern matching — its symbols are few (`|`, `:`, `[]`) but meaningful.

## Solutions

<SolutionTabs :solutions="solutions" />
