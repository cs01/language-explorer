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

// Surface area: total concepts per language (static property)
const surfaceData = languages.map(lang => {
  const e = data.metrics.filter(m => m.language === lang)[0]
  if (!e) return null
  return {
    language: toDisplay(lang),
    concepts: e.langConcepts,
    keywords: e.langKeywords,
    keywordRatio: e.keywordRatio,
    catTypes: e.catTypes,
    catControlFlow: e.catControlFlow,
    catFunctions: e.catFunctions,
    catOopData: e.catOopData,
    catMemory: e.catMemory,
    catConcurrency: e.catConcurrency,
    catMetaprogramming: e.catMetaprogramming,
    catErrorHandling: e.catErrorHandling,
  }
}).filter(Boolean).sort((a, b) => a.concepts - b.concepts)

const surfaceColumns = [
  { key: 'concepts', label: 'Concepts', lower: true },
  { key: 'keywords', label: 'Keywords', lower: true },
  { key: 'keywordRatio', label: 'Keyword Ratio' },
]

// Per-solution concept usage (averaged across benchmarks)
const usageData = languages.map(lang => {
  const entries = data.metrics.filter(m => m.language === lang)
  const avg = (key: string) => +(entries.reduce((s, e) => s + e[key], 0) / entries.length).toFixed(1)
  return {
    language: toDisplay(lang),
    conceptCount: avg('conceptCount'),
    keywords: avg('keywords'),
    syntaxPatterns: avg('syntaxPatterns'),
    apiCalls: avg('apiCalls'),
  }
})

const usageColumns = [
  { key: 'conceptCount', label: 'Concepts Used' },
  { key: 'keywords', label: 'Keywords Used' },
  { key: 'syntaxPatterns', label: 'Syntax Patterns' },
]

const catLabels = ['Types','Control','Functions','OOP/Data','Memory','Concurrency','Metaprog','Errors']
const catKeys = ['catTypes','catControlFlow','catFunctions','catOopData','catMemory','catConcurrency','catMetaprogramming','catErrorHandling']
</script>

# Concept Count

**How much do you need to learn to read arbitrary code in this language?**

Two views: the language's total **surface area** (everything a developer might encounter), and how many concepts a typical solution actually **uses**.

## Surface Area — Total Concepts

The full inventory of distinct ideas a developer must learn. Curated across 8 categories: types, control flow, functions, OOP/data, memory, concurrency, metaprogramming, and error handling. Each concept warrants its own section in a language tutorial.

<MetricsTable :data="surfaceData" :columns="surfaceColumns" />

**Keyword ratio** = keywords / concepts. High ratio (Zig 0.75) means most concepts have dedicated syntax. Low ratio (Haskell 0.32) means concepts live in the type system, not reserved words.

## Concept Distribution

Same total can mean very different things. Where do each language's concepts live?

<div class="cat-table">
<table>
<thead>
<tr>
<th>Language</th>
<th v-for="label in catLabels" :key="label">{{ label }}</th>
</tr>
</thead>
<tbody>
<tr v-for="row in surfaceData" :key="row.language">
<td><strong>{{ row.language }}</strong></td>
<td v-for="(key, i) in catKeys" :key="key" class="num-cell">{{ row[key] }}</td>
</tr>
</tbody>
</table>
</div>

## Concepts Used Per Solution

How many concepts does a typical program actually exercise? Averaged across 7 benchmark problems. This measures what you need to *write* code, not what you need to *read* arbitrary code (that's surface area above).

<MetricsTable :data="usageData" :columns="usageColumns" />

## What drives the differences?

**C++ (135)** is the outlier — templates, SFINAE, move semantics, rule of five, coroutines, modules, concepts, ranges. The full surface area that makes C++ notoriously difficult to master.

**Haskell (75) vs Python (75)** — same total, opposite shapes. Python's concepts live in OOP & metaprogramming (classes, decorators, metaclasses). Haskell's live in types & functions (typeclasses, monads, higher-kinded types).

**Go (58)** — deliberately minimal. 25 keywords, no generics until recently, no exceptions, no inheritance. The language bets that a small surface area makes codebases more readable across large teams.

**Zig (65)** — similar to C's size but adds comptime, optional types, and safety checks. The low concept count is intentional — Zig's design philosophy rejects hidden control flow and implicit behavior.

**Elixir (62) vs Erlang (55)** — Elixir adds macros, protocols, and comprehensions on top of Erlang's model, trading a larger surface area for more expressiveness.

::: details What counts as a concept?
A concept is a distinct mental model the programmer must hold — not syntax, but semantics:

- `if/else` = 1 concept (conditional flow)
- Ownership + borrowing = 2 concepts (they interact but are distinct)
- Generics = 1 concept (regardless of instantiation count)
- `async/await` = 1 concept, but *async + lifetimes* = a compound interaction

**Keywords** are reserved words from the language spec. **Syntax patterns** are structural features detected in code (closures, pattern matching, generics, channels, etc.). **Concept count per solution** = keywords used + syntax patterns detected.

**Surface area** is a static language property — curated by analyzing each language's specification, standard library, and common idioms. See [methodology](../methodology#surface-area) for full details and per-language notes.
:::

<style>
.cat-table { overflow-x: auto; margin: 1rem 0; }
.cat-table table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.cat-table th { text-align: center; padding: 0.4rem 0.5rem; border-bottom: 2px solid var(--vp-c-divider); font-size: 0.72rem; color: var(--vp-c-text-2); }
.cat-table th:first-child { text-align: left; }
.cat-table td { padding: 0.35rem 0.5rem; border-bottom: 1px solid var(--vp-c-divider); text-align: center; }
.cat-table td:first-child { text-align: left; white-space: nowrap; }
.num-cell { font-variant-numeric: tabular-nums; font-size: 0.82rem; }
</style>
