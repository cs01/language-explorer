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

const ceremonyData = languages.map(lang => {
  const entries = data.metrics.filter(m => m.language === lang)
  const avg = (key: string) => +(entries.reduce((s, e) => s + e[key], 0) / entries.length).toFixed(3)
  return {
    language: toDisplay(lang),
    ceremonyRatio: avg('ceremonyRatio'),
    ceremonyLines: +(entries.reduce((s, e) => s + e.ceremonyLines, 0) / entries.length).toFixed(1),
    loc: +(entries.reduce((s, e) => s + e.loc, 0) / entries.length).toFixed(1),
  }
}).sort((a, b) => a.ceremonyRatio - b.ceremonyRatio)

const columns = [
  { key: 'ceremonyRatio', label: 'Ceremony Ratio' },
  { key: 'ceremonyLines', label: 'Ceremony Lines' },
  { key: 'loc', label: 'Total Lines' },
]
</script>

# Type Ceremony

**What fraction of your code is boilerplate rather than logic?**

Ceremony ratio = ceremony lines / total lines. Ceremony lines are imports, package declarations, main wrappers, lone closing braces, and type-only annotation lines. Lower means more of your code does actual work.

## Ceremony by Language

Averaged across 7 benchmark problems.

<MetricsTable :data="ceremonyData" :columns="columns" />

## What drives the differences?

**Python (10%)** — no imports for builtins, no main wrapper, no braces. Almost every line is logic.

**Java (40%)** — package declarations, class wrappers, `public static void main`, import statements, closing braces. Nearly half the code is scaffolding.

**Rust (32%)** vs **Zig (20%)** — Rust's `use` imports, `fn main()`, and match arm braces add up. Zig's `@import` is terser and comptime reduces boilerplate.

**Go (31%)** — `package main`, `import`, `func main()`, explicit `if err != nil` blocks. Error handling is ceremony by design — Go chose explicitness over conciseness.

**TypeScript (23%)** vs **JavaScript (22%)** — nearly identical. Type annotations don't count as ceremony since they carry semantic weight. The difference is mainly import style.

## What counts as ceremony?

Lines classified as ceremony:
- **Imports/includes** — `import`, `require`, `use`, `#include`
- **Package/module declarations** — `package main`, `module X`
- **Entry point wrappers** — `public static void main`, `fn main()`
- **Lone closing delimiters** — `}`, `end`, `)`
- **Type-only lines** — lines that exist solely for type annotations with no logic

Lines NOT counted as ceremony:
- Function signatures (they define behavior)
- Variable declarations with initialization
- Type annotations inline with logic
- Comments

::: details The formal basis
[Ore et al. (ASE 2018)](https://dl.acm.org/doi/10.1145/3238147.3238173) coined **"Type Annotation Burden"** and found: developers average **136 seconds** per correct annotation and get it right only **51% of the time**.

Annotations are expensive. Our ceremony metric captures the broader category — all structural lines that exist for the compiler rather than for expressing intent.
:::
