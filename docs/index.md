---
outline: deep
---

<script setup lang="ts">
import { data } from './data/metrics.data'

const languages = [...new Set(data.metrics.map(m => m.language))]
const displayName: Record<string, string> = {
  cpp: 'C++', csharp: 'C#', objc: 'Objective-C', javascript: 'JavaScript', typescript: 'TypeScript',
}
const toDisplay = (lang: string) => displayName[lang] ?? lang.charAt(0).toUpperCase() + lang.slice(1)

// Per-program metrics (averaged across benchmark problems)
const expressData = languages.map(lang => {
  const entries = data.metrics.filter(m => m.language === lang)
  const avg = (key) => +(entries.reduce((s, e) => s + e[key], 0) / entries.length).toFixed(1)
  return {
    language: toDisplay(lang),
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
const profileData = [
  ...languages.map(lang => {
    const entries = data.metrics.filter(m => m.language === lang)
    return {
      language: toDisplay(lang),
      guardrails: entries[0]?.guardrailScore ?? 0,
      keywords: entries[0]?.langKeywords ?? 0,
      surface: entries[0]?.langConcepts ?? 0,
    }
  }),
  // Languages with profile data but no benchmark solutions yet
  { language: 'Ada', guardrails: 3.4, keywords: 74, surface: 85 },
  { language: 'LLVM IR', guardrails: 0.1, keywords: 150, surface: 35 },
  { language: 'Zero', guardrails: 5.0, keywords: 32, surface: 50 },
]

const expressColumns = [
  { key: 'lines', label: 'Lines' },
  { key: 'complexity', label: 'Complexity' },
  { key: 'ceremony', label: 'Ceremony' },
]

const profileColumns = [
  { key: 'guardrails', label: 'Guardrails', lower: false },
  { key: 'keywords', label: 'Keywords' },
  { key: 'surface', label: 'Surface Area' },
]

// Concept category radars for paired comparisons
const catKeys = ['catTypes','catControlFlow','catFunctions','catOopData','catMemory','catConcurrency','catMetaprogramming','catErrorHandling'] as const
const catLabels = ['Types','Control','Functions','OOP/Data','Memory','Concurrency','Metaprog','Errors']

function conceptRadarFor(lang: string) {
  const entries = data.metrics.filter(m => m.language === lang)
  const allMax = catKeys.map(k => Math.max(...languages.map(l => {
    const e = data.metrics.filter(m => m.language === l)
    return e[0]?.[k] ?? 0
  }), 1))
  return catLabels.map((label, i) => ({
    label,
    value: entries[0]?.[catKeys[i]] ?? 0,
    max: allMax[i],
  }))
}

const pairs = [
  { left: 'python', right: 'haskell', why: 'Same total concepts (75), opposite shapes' },
  { left: 'rust', right: 'go', why: 'Systems safety vs simplicity' },
  { left: 'cpp', right: 'milo', why: 'Kitchen sink (135) vs minimal (40)' },
]

const pairRadars = pairs.map(p => ({
  ...p,
  leftLabel: p.left.charAt(0).toUpperCase() + p.left.slice(1),
  rightLabel: p.right.charAt(0).toUpperCase() + p.right.slice(1),
  leftData: conceptRadarFor(p.left),
  rightData: conceptRadarFor(p.right),
}))
</script>

# Language Explorer

A quantitative explorer of programming languages — their properties, features, explicitness, and safety guardrails. Two views: what the language demands as a learner, and what it demands as a writer.

---

## Language Profile

Properties of the language itself — independent of any specific program. These don't change per solution.

- **Guardrails** — how many bugs the language prevents for you (0–5, [details](/methodology#guardrails)). E.g., Rust prevents use-after-free; JavaScript allows `"5" + 3 → "53"`
- **Keywords** — reserved words in the language spec (`fn`, `class`, `async`, `match`, `defer`, …)
- **Surface Area** — total distinct concepts a developer must learn ([details](/methodology#surface-area)). E.g., generics, pattern matching, closures, ownership, decorators

<MetricsTable :data="profileData" :columns="profileColumns" />

<small>Static properties from language specs. Guardrails: higher is better. Keywords and Surface Area: lower means less to learn.</small>

---

## Concept Shape

Where does each language's complexity live? Same total concepts can mean radically different things. These radars break surface area into 8 categories — the *shape* of what you have to learn.

<div v-for="pair in pairRadars" :key="pair.left" class="concept-pair">
<div class="pair-header"><strong>{{ pair.leftLabel }}</strong> vs <strong>{{ pair.rightLabel }}</strong> — {{ pair.why }}</div>
<div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
<RadarChart :data="pair.leftData" :label="pair.leftLabel" color="#3b82f6" :size="220" />
<RadarChart :data="pair.rightData" :label="pair.rightLabel" color="#f97316" :size="220" />
</div>
</div>

<small>Each axis shows one concept category, normalized across all languages. Bigger = more concepts in that area. See individual [language pages](/languages/python) for full breakdowns.</small>

---

## Expressiveness

How concise is the code? Averaged across 7 benchmark problems. Lower is better.

- **Lines** — non-blank lines of code
- **Complexity** — total information your brain processes ([Halstead Volume](https://en.wikipedia.org/wiki/Halstead_complexity_measures))
- **Ceremony** — fraction of code that's overhead (imports, boilerplate) vs logic

<MetricsTable :data="expressData" :columns="expressColumns" />

<small>Averages across 7 benchmark problems. Full metrics on the [Compare](/compare) page.</small>


<style>
.concept-pair {
  margin-bottom: 2rem;
  padding: 1rem;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}
.pair-header {
  text-align: center;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}
</style>
