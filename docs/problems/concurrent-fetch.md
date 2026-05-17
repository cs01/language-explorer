---
outline: deep
---

<script setup>
import { data } from '../data/metrics.data'

const problem = 'r4-concurrent-fetch'
const metrics = data.metrics
  .filter(m => m.problem === problem)
  .map(m => ({
    language: m.language.charAt(0).toUpperCase() + m.language.slice(1),
    lines: m.loc,
    tokens: m.tokens,
    complexity: m.halsteadVolume,
    'tok/line': m.tokensPerLine, 'symbols/line': m.sigilsPerLine, concepts: m.conceptCount,
  }))

const columns = [
  { key: 'lines', label: 'Lines' },
  { key: 'tokens', label: 'Tokens' },
  { key: 'complexity', label: 'Complexity' },
  { key: 'tok/line', label: 'Tok/Line' }, { key: 'symbols/line', label: 'Sym/Line' }, { key: 'concepts', label: 'Concepts' },
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

# Concurrent Fetch

**Real-World** — Fetch 5 URLs concurrently (max 4 in-flight), print results, handle individual failures.

Tests: concurrency primitives, HTTP, error handling under parallelism, bounded concurrency.

## Results

<MetricsTable :data="metrics" :columns="columns" />

## The concurrency tax

This problem reveals each language's concurrency cost:

### The compact group (19-26 lines)
**Python** (19) — `ThreadPoolExecutor(max_workers=4)` + `pool.map()`. Two lines handle all concurrency.
**Elixir** (20) — `Task.async_stream_nolink(4, fn)` is built-in bounded concurrency. The BEAM was born for this.
**TypeScript** (25) — `fetch()` + `Promise.all` with manual batching.
**Ruby** (26) — Threads + Queue as semaphore. Simple and readable.

### The mid group (31-35 lines)
**JavaScript** (31) — Promise.race pool pattern for bounded concurrency. More verbose than TS batching.
**Rust** (32) — `tokio::spawn` + `Arc<Semaphore>` + `async move`. Five concepts for one task.
**Kotlin** (32) — coroutines + Semaphore. Clean but verbose setup.
**Haskell** (32) — `async` + `QSem`. Elegant but needs library imports.
**Go** (35) — goroutines + WaitGroup + channel semaphore. Go's strength, but ceremony adds up.
**Java** (34) — `ExecutorService` + `HttpClient`. Enterprise patterns are wordy.

### The verbose group (46-61 lines)
**Swift** (46) — actor-based async semaphore adds 15 lines of boilerplate. TaskGroup alone doesn't bound concurrency.
**Zig** (59) — Manual threads, manual HTTP, manual batching. Everything is explicit.
**C** (61) — `pthread` + `libcurl` + manual buffer management. Peak verbosity.

## Solutions

<SolutionTabs :solutions="solutions" />
