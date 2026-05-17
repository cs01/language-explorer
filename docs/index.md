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
    'tok/line': avg('tokensPerLine'),
    complexity: Math.round(entries.reduce((s, e) => s + e.halsteadVolume, 0) / entries.length),
    'symbols/line': avg('sigilsPerLine'),
    concepts: Math.round(entries.reduce((s, e) => s + e.conceptCount, 0) / entries.length),
    guardrails: entries[0]?.guardrailScore ?? 0,
    ceremony: avg('ceremonyRatio'),
  }
})

const columns = [
  { key: 'lines', label: 'Lines' },
  { key: 'tokens', label: 'Tokens' },
  { key: 'tok/line', label: 'Tok/Line' },
  { key: 'complexity', label: 'Complexity' },
  { key: 'symbols/line', label: 'Sym/Line' },
  { key: 'concepts', label: 'Concepts' },
  { key: 'guardrails', label: 'Guardrails', lower: false },
  { key: 'ceremony', label: 'Ceremony' },
]

const groupDefs = [
  { label: 'Systems', languages: ['c', 'cpp', 'rust', 'zig', 'milo'] },
  { label: 'Scripting', languages: ['python', 'ruby', 'javascript', 'typescript'] },
  { label: 'JVM', languages: ['java', 'kotlin'] },
  { label: 'Functional', languages: ['haskell', 'elixir'] },
  { label: 'Static', languages: ['typescript', 'rust', 'go', 'c', 'cpp', 'swift', 'zig', 'java', 'kotlin', 'haskell', 'milo'] },
  { label: 'Dynamic', languages: ['python', 'ruby', 'javascript', 'elixir'] },
  { label: 'GC', languages: ['python', 'ruby', 'javascript', 'typescript', 'java', 'kotlin', 'go', 'haskell', 'elixir'] },
]

function filterByGroup(langs: string[]) {
  return avgData.filter(r => langs.includes(r.language.toLowerCase()))
}

const systemsData = filterByGroup(['c', 'cpp', 'rust', 'zig', 'milo'])
const scriptingData = filterByGroup(['python', 'ruby', 'javascript', 'typescript'])
const jvmData = filterByGroup(['java', 'kotlin'])
const functionalData = filterByGroup(['haskell', 'elixir'])
const gcData = filterByGroup(['python', 'ruby', 'javascript', 'typescript', 'java', 'kotlin', 'go', 'haskell', 'elixir', 'swift'])
const staticData = filterByGroup(['typescript', 'rust', 'go', 'c', 'cpp', 'swift', 'zig', 'java', 'kotlin', 'haskell', 'milo'])
const dynamicData = filterByGroup(['python', 'ruby', 'javascript', 'elixir'])
</script>

# langmetrics

**How much does your language cost you?** Same programs, measured automatically. Lower is better (except Guardrails).

- **Lines** — non-blank lines of code
- **Tokens** — words and symbols in the code
- **Tok/Line** — how much information is packed into each line
- **Complexity** — total information your brain processes ([Halstead Volume](https://en.wikipedia.org/wiki/Halstead_complexity_measures))
- **Sym/Line** — special characters per line (`{`, `->`, `&`, etc.)
- **Concepts** — how many different language features you need to know
- **Guardrails** — how many bugs the language prevents for you (0–5, [details](/methodology#guardrails))
- **Ceremony** — what fraction of code is overhead (imports, setup, boilerplate) vs actual logic

<MetricsTable :data="avgData" :columns="columns" />

<small>Averages across 7 benchmark problems. Click any column to sort. Green = best, red = worst.</small>

---

### Systems

<MetricsTable :data="systemsData" :columns="columns" />

---

### Scripting

<MetricsTable :data="scriptingData" :columns="columns" />

---

### JVM

<MetricsTable :data="jvmData" :columns="columns" />

---

### Functional

<MetricsTable :data="functionalData" :columns="columns" />

---

### GC Languages

<MetricsTable :data="gcData" :columns="columns" />

---

### Static Types

<MetricsTable :data="staticData" :columns="columns" />

---

### Dynamic Types

<MetricsTable :data="dynamicData" :columns="columns" />

---


## Explore by problem

- [Two Sum](/problems/two-sum) — HashMap + iteration (algorithmic)
- [Valid Parentheses](/problems/valid-parens) — Stack + pattern matching (algorithmic)
- [Word Frequency](/problems/word-freq) — File I/O + sorting (real-world)
- [JSON Transform](/problems/json-transform) — Parse, filter, reshape (real-world)
- [HTTP Server](/problems/http-server) — Routing + JSON responses (real-world)
- [Concurrent Fetch](/problems/concurrent-fetch) — HTTP + bounded parallelism (real-world)
- [Channel Pipeline](/problems/channel-pipeline) — Producer/filter/consumer (systems)

See [Methodology](/methodology) for how we measure.
