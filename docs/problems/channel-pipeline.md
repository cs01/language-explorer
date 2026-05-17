---
outline: deep
---

<script setup lang="ts">
import { data } from '../data/metrics.data'

const problem = 's1-channel-pipeline'
const metrics = data.metrics
  .filter(m => m.problem === problem)
  .map(m => ({
    language: m.language.charAt(0).toUpperCase() + m.language.slice(1),
    lines: m.loc,
    tokens: m.tokens,
    complexity: m.halsteadVolume,
    'tok/line': m.tokensPerLine, 'symbols/line': m.sigilsPerLine, concepts: m.conceptCount,
    guardrails: m.guardrailScore, ceremony: m.ceremonyRatio,
  }))

const columns = [
  { key: 'lines', label: 'Lines' },
  { key: 'tokens', label: 'Tokens' },
  { key: 'complexity', label: 'Complexity' },
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

# Channel Pipeline

**Systems** — 3-stage concurrent pipeline: produce → filter → consume, communicating via channels.

Tests: channel creation, spawning workers, signaling completion, pipeline composition.

## Results

<MetricsTable :data="metrics" :columns="columns" />

## The concurrency communication spectrum

This problem reveals how each language thinks about inter-task communication:

### First-class channels (Go, Rust, Kotlin)
Go's channels are the gold standard — `make(chan int)`, `close()`, `range`. 27 lines. Rust's `mpsc::channel` is similarly clean. Kotlin's `produce {}` coroutine builder is the most elegant API.

### Async generators (JavaScript, TypeScript)
No actual concurrency here — `async function*` composes pipeline stages as lazy iterators. Minimal code (10 lines) but sequential execution. A valid design choice when parallelism isn't needed.

### Queues + threads (Python, Ruby, Java)
`Queue` with sentinel values for termination. Works but manual — you pick the sentinel, check for it, propagate it. Java's `BlockingQueue` is the same pattern with more types.

### Message passing (Elixir, Haskell)
Elixir uses process mailboxes — `send`/`receive` with pattern matching. Haskell uses `Chan` from `Control.Concurrent`. Both are clean but the termination signaling adds boilerplate.

### Build it yourself (C, C++, Zig)
C implements a bounded channel from scratch: mutex, two condition variables, circular buffer. 65 lines just for the infrastructure. C++ wraps it in a template class (cleaner API, same cost). Zig is similar.

## Solutions

<SolutionTabs :solutions="solutions" />
