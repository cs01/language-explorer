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

const langData = languages.map(lang => {
  const entries = data.metrics.filter(m => m.language === lang)
  const avg = (key: string) => +(entries.reduce((s, e) => s + e[key], 0) / entries.length).toFixed(1)
  return {
    language: toDisplay(lang),
    lines: avg('loc'),
    tokens: avg('tokens'),
    tokensPerLine: avg('tokensPerLine'),
    complexity: Math.round(entries.reduce((s, e) => s + e.halsteadVolume, 0) / entries.length),
    sigilsPerLine: avg('sigilsPerLine'),
    guardrails: entries[0]?.guardrailScore ?? 0,
    ceremony: avg('ceremonyRatio'),
    catTypes: entries[0]?.catTypes ?? 0,
    catControlFlow: entries[0]?.catControlFlow ?? 0,
    catFunctions: entries[0]?.catFunctions ?? 0,
    catOopData: entries[0]?.catOopData ?? 0,
    catMemory: entries[0]?.catMemory ?? 0,
    catConcurrency: entries[0]?.catConcurrency ?? 0,
    catMetaprogramming: entries[0]?.catMetaprogramming ?? 0,
    catErrorHandling: entries[0]?.catErrorHandling ?? 0,
    grMemoryWhen: entries[0]?.grMemoryWhen ?? 'none',
    grNullWhen: entries[0]?.grNullWhen ?? 'none',
    grRaceWhen: entries[0]?.grRaceWhen ?? 'none',
    grOverflowWhen: entries[0]?.grOverflowWhen ?? 'none',
    grCoercionWhen: entries[0]?.grCoercionWhen ?? 'none',
  }
})

// Profile-only languages (no benchmark solutions yet — fingerprint only)
const profileOnly = [
  { language: 'Ada', lines: 0, tokens: 0, tokensPerLine: 0, complexity: 0, sigilsPerLine: 0, guardrails: 3.4, ceremony: 0, catTypes: 18, catControlFlow: 10, catFunctions: 8, catOopData: 12, catMemory: 10, catConcurrency: 12, catMetaprogramming: 6, catErrorHandling: 9, grMemoryWhen: 'runtime', grNullWhen: 'compile', grRaceWhen: 'runtime', grOverflowWhen: 'runtime', grCoercionWhen: 'compile' },
  { language: 'LLVM IR', lines: 0, tokens: 0, tokensPerLine: 0, complexity: 0, sigilsPerLine: 0, guardrails: 0.1, ceremony: 0, catTypes: 10, catControlFlow: 6, catFunctions: 4, catOopData: 0, catMemory: 8, catConcurrency: 2, catMetaprogramming: 3, catErrorHandling: 2, grMemoryWhen: 'none', grNullWhen: 'none', grRaceWhen: 'none', grOverflowWhen: 'none', grCoercionWhen: 'none' },
  { language: 'Zero', lines: 0, tokens: 0, tokensPerLine: 0, complexity: 0, sigilsPerLine: 0, guardrails: 5.0, ceremony: 0, catTypes: 10, catControlFlow: 8, catFunctions: 6, catOopData: 6, catMemory: 8, catConcurrency: 2, catMetaprogramming: 2, catErrorHandling: 8, grMemoryWhen: 'compile', grNullWhen: 'compile', grRaceWhen: 'compile', grOverflowWhen: 'runtime', grCoercionWhen: 'compile' },
]

const benchLangs = new Set(langData.map(l => l.language))
const allLangData = [...langData, ...profileOnly.filter(p => !benchLangs.has(p.language))]

const groups = [
  { label: 'Systems', languages: ['c', 'c++', 'rust', 'zig', 'milo', 'zero', 'objective-c'] },
  { label: 'Scripting', languages: ['python', 'ruby', 'javascript', 'typescript'] },
  { label: 'JVM', languages: ['java', 'kotlin', 'c#', 'clojure'] },
  { label: 'Functional', languages: ['haskell', 'elixir', 'clojure', 'erlang'] },
  { label: 'GC', languages: ['python', 'ruby', 'javascript', 'typescript', 'java', 'kotlin', 'go', 'haskell', 'elixir', 'swift', 'c#', 'clojure', 'erlang'] },
  { label: 'Static', languages: ['typescript', 'rust', 'go', 'c', 'c++', 'swift', 'zig', 'java', 'kotlin', 'haskell', 'milo', 'zero', 'c#', 'ada'] },
  { label: 'Dynamic', languages: ['python', 'ruby', 'javascript', 'elixir', 'clojure', 'erlang'] },
]
</script>

# Compare Languages

Pick 2-4 languages to see them head-to-head. Bigger polygon = more of that quality.

<LanguageComparison :languages="allLangData" :groups="groups" />

## How to read this

Bigger polygon = more of that quality. Whether that's good depends on what you value.

- **Fewer Lines** — total lines of code
- **Info per Line** — tokens per line (each line does more work)
- **Low Complexity** — lower [Halstead Volume](https://en.wikipedia.org/wiki/Halstead_complexity_measures) (less total information to process)
- **Low Noise** — fewer special characters per line (`{`, `->`, `&`, etc.)
- **Safe** — more bugs prevented by the language (0–5, [details](./methodology#guardrails))
- **Lightweight** — less ceremony (imports, boilerplate) vs actual logic
