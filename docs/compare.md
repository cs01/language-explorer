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
  }
})
</script>

# Compare Languages

Pick 2-4 languages to see them head-to-head. Bars show relative performance — shorter is better for all metrics.

<LanguageComparison :languages="langData" />

## How to read this

- **Lines** — average non-blank lines of code across all problems
- **Tokens** — whitespace-separated tokens (measures information density)
- **Complexity** — Halstead Volume (total information content your brain processes)
- **Sym/Line** — special characters per line (punctuation tax)
- **Sym Types** — unique symbol varieties (learning curve)

Lower is better for all metrics. A language with shorter bars across the board gives you more expressive power per keystroke.
