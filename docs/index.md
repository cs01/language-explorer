---
outline: deep
---

<script setup lang="ts">
import { data } from './data/metrics.data'

const languages = [...new Set(data.metrics.map(m => m.language))]
const avgData = languages.map(lang => {
  const entries = data.metrics.filter(m => m.language === lang)
  const avg = (key) => +(entries.reduce((s, e) => s + e[key], 0) / entries.length).toFixed(1)
  return {
    language: lang.charAt(0).toUpperCase() + lang.slice(1),
    lines: avg('loc'),
    tokens: avg('tokens'),
    complexity: Math.round(entries.reduce((s, e) => s + e.halsteadVolume, 0) / entries.length),
    'symbols/line': avg('sigilsPerLine'),
    'symbol types': Math.round(entries.reduce((s, e) => s + e.uniqueSigilTypes, 0) / entries.length),
  }
})

const columns = [
  { key: 'lines', label: 'Avg Lines' },
  { key: 'tokens', label: 'Avg Tokens' },
  { key: 'complexity', label: 'Complexity' },
  { key: 'symbols/line', label: 'Symbols/Line' },
  { key: 'symbol types', label: 'Symbol Types' },
]

const groupDefs = [
  { label: 'Systems', languages: ['c', 'cpp', 'rust', 'zig'] },
  { label: 'Scripting', languages: ['python', 'ruby', 'javascript'] },
  { label: 'JVM', languages: ['java', 'kotlin'] },
  { label: 'Functional', languages: ['haskell', 'elixir'] },
  { label: 'Static', languages: ['typescript', 'rust', 'go', 'c', 'cpp', 'swift', 'zig', 'java', 'kotlin', 'haskell'] },
  { label: 'Dynamic', languages: ['python', 'ruby', 'javascript', 'elixir'] },
  { label: 'GC', languages: ['python', 'ruby', 'javascript', 'typescript', 'java', 'kotlin', 'go', 'haskell', 'elixir'] },
]

function filterByGroup(langs: string[]) {
  return avgData.filter(r => langs.includes(r.language.toLowerCase()))
}

const systemsData = filterByGroup(['c', 'cpp', 'rust', 'zig'])
const scriptingData = filterByGroup(['python', 'ruby', 'javascript'])
const jvmData = filterByGroup(['java', 'kotlin'])
const functionalData = filterByGroup(['haskell', 'elixir'])
const gcData = filterByGroup(['python', 'ruby', 'javascript', 'typescript', 'java', 'kotlin', 'go', 'haskell', 'elixir', 'swift'])
const staticData = filterByGroup(['typescript', 'rust', 'go', 'c', 'cpp', 'swift', 'zig', 'java', 'kotlin', 'haskell'])
const dynamicData = filterByGroup(['python', 'ruby', 'javascript', 'elixir'])
</script>

# langmetrics

**How much does your language cost you?** Quantitative comparison of 14 programming languages — same programs, measured automatically.

<MetricsTable :data="avgData" :columns="columns" />

<small>Averages across 7 benchmark problems. Click any column to sort. Green = best, red = worst.</small>

---

### Systems — C, C++, Rust, Zig

Does modern systems design save code? Rust is 44% fewer lines than C — while adding safety. Zig stays C-sized but trades manual memory bugs for explicit error handling.

<MetricsTable :data="systemsData" :columns="columns" />

---

### Scripting — Python, Ruby, JavaScript

The dynamic trio. Ruby edges Python on symbol noise and complexity. JavaScript is close but loses on tokens — `const`/`let`/`function` add up vs Python's minimal keywords.

<MetricsTable :data="scriptingData" :columns="columns" />

---

### JVM — Java, Kotlin

Kotlin cuts Java's lines by 25% and tokens by 27%. The `val`/`fun`/`it` brevity is real, not cosmetic.

<MetricsTable :data="jvmData" :columns="columns" />

---

### Functional — Haskell, Elixir

Elixir is more concise (16.5 vs 20.5 lines) but noisier (6.4 vs 4.6 symbols/line). Haskell's token count is high — pattern matching and type signatures are verbose but carry a lot of information per token.

<MetricsTable :data="functionalData" :columns="columns" />

---

### GC Languages — automatic memory management

<MetricsTable :data="gcData" :columns="columns" />

---

### Static Types — compile-time checked

<MetricsTable :data="staticData" :columns="columns" />

---

### Dynamic Types — runtime flexibility

<MetricsTable :data="dynamicData" :columns="columns" />

---

## Key observations

::: info Metric 1: Conciseness
Zig/C need **~3× more code** than Python/Ruby. Every missing stdlib abstraction costs ~10 lines. Kotlin matches JavaScript despite being statically typed.
:::

::: tip Metric 2: Symbol Noise
Rust, TypeScript, Elixir, Zig all hit 6.3-6.4 symbols/line — for different reasons (safety, types, pipelines, explicitness). Ruby (4.1) beats even Go (4.3).
:::

::: warning Metric 3: Complexity
Halstead Volume: C/Zig are 5× Python/Ruby. Haskell is surprisingly high (626) due to token-dense pattern matching. Kotlin/Elixir cluster with scripting languages (~280-294).
:::

::: danger Metric 4: Symbol Vocabulary
Python uses 12 unique symbol types. C uses 20. More variety = steeper learning curve. Haskell uses only 14 — few symbols, used densely.
:::

## Explore by problem

- [Two Sum](/problems/two-sum) — HashMap + iteration (algorithmic)
- [Valid Parentheses](/problems/valid-parens) — Stack + pattern matching (algorithmic)
- [Word Frequency](/problems/word-freq) — File I/O + sorting (real-world)
- [JSON Transform](/problems/json-transform) — Parse, filter, reshape (real-world)
- [HTTP Server](/problems/http-server) — Routing + JSON responses (real-world)
- [Concurrent Fetch](/problems/concurrent-fetch) — HTTP + bounded parallelism (real-world)
- [Channel Pipeline](/problems/channel-pipeline) — Producer/filter/consumer (systems)

## What's next

These metrics are automated. More dimensions coming:

- **Concept Count** — how many distinct ideas do you need to learn to be productive?
- **Type Ceremony** — how many annotations does the compiler demand?
- **Error Overhead** — what fraction of your code handles errors vs does actual work?

See [Methodology](/methodology) for how we measure.
