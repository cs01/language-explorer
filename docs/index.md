---
outline: deep
---

<script setup lang="ts">
import { data } from './data/metrics.data'

const languages = [...new Set(data.metrics.map(m => m.language))]

// Per-program metrics (averaged across benchmark problems)
const expressData = languages.map(lang => {
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
    ceremony: avg('ceremonyRatio'),
  }
})

// Per-language metrics (static properties of the language itself)
const profileData = languages.map(lang => {
  const entries = data.metrics.filter(m => m.language === lang)
  return {
    language: lang.charAt(0).toUpperCase() + lang.slice(1),
    guardrails: entries[0]?.guardrailScore ?? 0,
    keywords: entries[0]?.langKeywords ?? 0,
    surface: entries[0]?.langConcepts ?? 0,
  }
})

const expressColumns = [
  { key: 'lines', label: 'Lines' },
  { key: 'tokens', label: 'Tokens' },
  { key: 'tok/line', label: 'Tok/Line' },
  { key: 'complexity', label: 'Complexity' },
  { key: 'symbols/line', label: 'Sym/Line' },
  { key: 'concepts', label: 'Concepts' },
  { key: 'ceremony', label: 'Ceremony' },
]

const profileColumns = [
  { key: 'guardrails', label: 'Guardrails', lower: false },
  { key: 'keywords', label: 'Keywords' },
  { key: 'surface', label: 'Surface Area' },
]

function filterExpress(langs: string[]) {
  return expressData.filter(r => langs.includes(r.language.toLowerCase()))
}

const systemsData = filterExpress(['c', 'cpp', 'rust', 'zig', 'milo'])
const scriptingData = filterExpress(['python', 'ruby', 'javascript', 'typescript'])
const jvmData = filterExpress(['java', 'kotlin'])
const functionalData = filterExpress(['haskell', 'elixir'])
const gcData = filterExpress(['python', 'ruby', 'javascript', 'typescript', 'java', 'kotlin', 'go', 'haskell', 'elixir', 'swift'])
const staticData = filterExpress(['typescript', 'rust', 'go', 'c', 'cpp', 'swift', 'zig', 'java', 'kotlin', 'haskell', 'milo'])
const dynamicData = filterExpress(['python', 'ruby', 'javascript', 'elixir'])
</script>

# langmetrics

**How much does your language cost you?** Two views: what the language demands of you as a learner, and what it demands of you as a writer.

---

## Language Profile

Properties of the language itself — independent of any specific program. These don't change per solution.

- **Guardrails** — how many bugs the language prevents for you (0–5, [details](/methodology#guardrails))
- **Keywords** — reserved words in the language spec
- **Surface Area** — total distinct concepts a developer must learn ([details](/methodology#surface-area))

<MetricsTable :data="profileData" :columns="profileColumns" />

<small>Static properties from language specs. Guardrails: higher is better. Keywords and Surface Area: lower means less to learn.</small>

---

## Expressiveness

How concise and clean the code is — averaged across 7 benchmark problems. Lower is better for all metrics.

- **Lines** — non-blank lines of code
- **Tokens** — words and symbols in the code
- **Tok/Line** — how much information is packed into each line
- **Complexity** — total information your brain processes ([Halstead Volume](https://en.wikipedia.org/wiki/Halstead_complexity_measures))
- **Sym/Line** — special characters per line (`{`, `->`, `&`, etc.)
- **Concepts** — language features used per solution
- **Ceremony** — fraction of code that's overhead (imports, boilerplate) vs logic

<MetricsTable :data="expressData" :columns="expressColumns" />

<small>Averages across 7 benchmark problems. Click any column to sort. Green = best, red = worst.</small>

---

### Systems

<MetricsTable :data="systemsData" :columns="expressColumns" />

---

### Scripting

<MetricsTable :data="scriptingData" :columns="expressColumns" />

---

### JVM

<MetricsTable :data="jvmData" :columns="expressColumns" />

---

### Functional

<MetricsTable :data="functionalData" :columns="expressColumns" />

---

### GC Languages

<MetricsTable :data="gcData" :columns="expressColumns" />

---

### Static Types

<MetricsTable :data="staticData" :columns="expressColumns" />

---

### Dynamic Types

<MetricsTable :data="dynamicData" :columns="expressColumns" />

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
