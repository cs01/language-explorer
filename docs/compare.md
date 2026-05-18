---
outline: deep
---

<script setup lang="ts">
import { data } from './data/metrics.data'

const languages = [...new Set(data.metrics.map(m => m.language))]
const langData = languages.map(lang => {
  const entries = data.metrics.filter(m => m.language === lang)
  const avg = (key: string) => +(entries.reduce((s, e) => s + e[key], 0) / entries.length).toFixed(1)
  return {
    language: lang.charAt(0).toUpperCase() + lang.slice(1),
    lines: avg('loc'),
    tokens: avg('tokens'),
    complexity: Math.round(entries.reduce((s, e) => s + e.halsteadVolume, 0) / entries.length),
    sigilsPerLine: avg('sigilsPerLine'),
    symbolTypes: Math.round(entries.reduce((s, e) => s + e.uniqueSigilTypes, 0) / entries.length),
    guardrails: entries[0]?.guardrailScore ?? 0,
    ceremony: avg('ceremonyRatio'),
  }
})
</script>

# Compare Languages

Pick 2-4 languages to see them head-to-head. Bars show relative performance — shorter is better for all metrics.

<LanguageComparison :languages="langData" />

## How to read this

Bigger = better, everywhere.

- **Concise** — fewer lines of code
- **Terse** — fewer tokens (words and symbols)
- **Simple** — less complexity ([Halstead Volume](https://en.wikipedia.org/wiki/Halstead_complexity_measures))
- **Clear** — fewer special characters per line (`{`, `->`, `&`, etc.)
- **Clean** — fewer distinct special character types to recognize
- **Safe** — more bugs prevented by the language (0–5, [details](/methodology#guardrails))
- **Efficient** — less ceremony (imports, boilerplate) vs actual logic
