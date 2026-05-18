---
outline: deep
---

<script setup lang="ts">
import { data } from '../data/metrics.data'

const languages = [...new Set(data.metrics.map(m => m.language))]
const displayName: Record<string, string> = {
  cpp: 'C++', csharp: 'C#', objc: 'Objective-C', javascript: 'JavaScript', typescript: 'TypeScript',
}
const toDisplay = (lang: string) => displayName[lang] ?? lang.charAt(0).toUpperCase() + lang.slice(1)

const aiData = languages.map(lang => {
  const entries = data.metrics.filter(m => m.language === lang)
  const avg = (key: string) => +(entries.reduce((s, e) => s + e[key], 0) / entries.length).toFixed(1)
  return {
    language: toDisplay(lang),
    llmTokens: Math.round(entries.reduce((s, e) => s + e.llmTokens, 0) / entries.length),
    'tok/line': avg('llmTokensPerLine'),
    typeCoverage: entries[0]?.typeCoverage ?? 0,
  }
})

const columns = [
  { key: 'llmTokens', label: 'LLM Tokens' },
  { key: 'tok/line', label: 'Tok/Line' },
  { key: 'typeCoverage', label: 'Type Coverage', lower: false },
]
</script>

# AI Readiness

**How efficiently can an LLM process this language?**

Three metrics: total LLM tokens consumed per solution, token density per line, and how much static type information is available for the model to reason about. Averaged across 7 benchmark problems.

## Results

<MetricsTable :data="aiData" :columns="columns" />

## What the metrics mean

- **LLM Tokens** — tokens consumed when feeding code to a language model (cl100k_base tokenizer, GPT-4/Claude class). Lower = cheaper API calls, more code fits in context window.
- **Tok/Line** — token density per line of code. Higher means each line carries more information for the model to parse.
- **Type Coverage** — how much type information is statically available (0–1). Higher = more for AI to verify, infer from, and autocomplete against.

## What drives the differences?

**Python/Ruby** are cheap to tokenize (low token counts) but have low type coverage — the model has to infer types from context.

**Rust/Zig/Go** cost more tokens but provide full static type information, giving the model more to work with for verification and completion.

**Haskell** is an outlier — high token count (202 avg) due to verbose type signatures and operator-heavy syntax, but strong type coverage (0.75) from its type system. The gap from 1.0 reflects that Haskell's type inference means annotations are often omitted.

**JavaScript** is the worst combination for AI: moderate token cost with zero static type information. TypeScript fixes the type coverage (0.5) but at higher token cost.

::: details How we measure
**LLM Tokens**: Tokenized with [js-tiktoken](https://github.com/dqbd/tiktoken) using the cl100k_base encoding (used by GPT-4, Claude).

**Type Coverage**: Static property of the language — 1.0 for fully statically typed (Rust, Go, Java), 0.5 for optionally typed (TypeScript, Python with hints), 0 for dynamically typed (JavaScript, Elixir).
:::
