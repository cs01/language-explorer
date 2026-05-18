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
    keywords: entries[0]?.langKeywords ?? 0,
    surface: entries[0]?.langConcepts ?? 0,
  }
})
</script>

# Compare Languages

Pick 2-4 languages to see them head-to-head. Bars show relative performance — shorter is better for all metrics.

<LanguageComparison :languages="langData" />

## How to read this

- **Lines** — average non-blank lines of code across all problems
- **Tokens** — words and symbols in the code
- **Complexity** — total information your brain processes ([Halstead Volume](https://en.wikipedia.org/wiki/Halstead_complexity_measures))
- **Sym/Line** — special characters per line (`{`, `->`, `&`, etc.)
- **Sym Types** — how many different special characters you need to recognize
- **Guardrails** — how many bugs the language prevents for you (0–5, [details](/methodology#guardrails))
- **Ceremony** — what fraction of code is overhead vs actual logic
- **Keywords** — reserved words in the language spec
- **Surface Area** — total distinct concepts a developer must learn

Lower is better for most metrics except Guardrails.
