---
outline: deep
---

<script setup lang="ts">
import { data } from '../data/metrics.data'

const problem = 'r2-json-transform'
const metrics = data.metrics
  .filter(m => m.problem === problem)
  .map(m => ({
    language: m.language.charAt(0).toUpperCase() + m.language.slice(1),
    lines: m.loc,
    tokens: m.tokens,
    verbosity: m.halsteadVolume,
    'tok/line': m.tokensPerLine, 'symbols/line': m.sigilsPerLine, concepts: m.conceptCount,
    guardrails: m.guardrailScore, ceremony: m.ceremonyRatio,
  }))

const columns = [
  { key: 'lines', label: 'Lines' },
  { key: 'tokens', label: 'Tokens' },
  { key: 'verbosity', label: 'Verbosity' },
  { key: 'tok/line', label: 'Tok/Line' }, { key: 'symbols/line', label: 'Sym/Line' }, { key: 'concepts', label: 'Concepts' },
  { key: 'guardrails', label: 'Guardrails', lower: false }, { key: 'ceremony', label: 'Ceremony' },
]

const langLabels: Record<string, string> = {
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

# JSON Transform

**Real-World** — Parse JSON from stdin, filter + reshape, write to stdout.

Tests: JSON serde, struct/type definitions, array filtering, stdin/stdout.

## Results

<MetricsTable :data="metrics" :columns="columns" />

## The serde tax

This problem isolates one thing: **how much ceremony does your language require to parse and produce JSON?**

### Zero-schema languages (Python, Ruby, JavaScript, Elixir)
Dynamic types mean no struct definitions needed. Parse → get a dict/map → filter → dump. 10-14 lines.

### Schema languages (Go, Rust, Swift, Kotlin)
You define input AND output structs with field tags/attributes. Worth it for large codebases, but costs 5-10 lines of type ceremony on a small script.

### Manual JSON (C, Zig)
No built-in JSON. C with cJSON is surprisingly readable (library does the heavy lifting), but Zig's `std.json` requires manual traversal of a generic value tree — verbose and error-prone.

## Solutions

<SolutionTabs :solutions="solutions" />
