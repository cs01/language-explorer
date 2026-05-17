---
outline: deep
---

<script setup lang="ts">
import { data } from '../data/metrics.data'

const languages = [...new Set(data.metrics.map(m => m.language))]
const avgData = languages.map(lang => {
  const entries = data.metrics.filter(m => m.language === lang)
  const avg = (key: string) => +(entries.reduce((s, e) => s + e[key], 0) / entries.length).toFixed(1)
  return {
    language: lang.charAt(0).toUpperCase() + lang.slice(1),
    lines: avg('loc'),
    tokens: avg('tokens'),
    'compression ratio': avg('compressionRatio'),
  }
})

const columns = [
  { key: 'lines', label: 'Avg Lines' },
  { key: 'tokens', label: 'Avg Tokens' },
  { key: 'compression ratio', label: 'Compression Ratio' },
]
</script>

# Code Size

**How much code does it take to express the same idea?**

We count three things: lines of code (LOC), tokens (whitespace-separated words), and compression ratio (gzip size / raw size — lower means more repetitive/boilerplate-y code).

## Results

<MetricsTable :data="avgData" :columns="columns" />

## What drives the differences?

**Ruby/Python** win because:
- No boilerplate (no main function, no imports for builtins, no type annotations required)
- Rich standard library (`Counter`, `tally`, `ThreadPoolExecutor` — one-liners for complex operations)
- Minimal syntax (whitespace blocks, implicit returns)

**C/Zig** lose because:
- No built-in collections (no HashMap, no dynamic array without manual allocation)
- Manual memory management
- No string operations (character-by-character parsing)
- Manual threading/concurrency infrastructure

**The interesting middle**: Kotlin (18.5) matches JavaScript despite being statically typed. Extension functions and expression-bodied syntax eliminate the ceremony you'd expect from a JVM language.

## The gap widens with complexity

On simple algorithmic problems, languages cluster within 2× of each other. On real-world problems with I/O, JSON, HTTP, and concurrency, the gap stretches to 3-5×. Real programs exercise the standard library, error model, and concurrency primitives — that's where languages diverge most.

::: details How we count
**LOC**: Non-blank lines. Includes imports and main function boilerplate.

**Tokens**: Whitespace-separated words. `let x: i32 = 5;` = 5 tokens.

**Compression Ratio**: gzip(source) / len(source). Lower means more repetitive code (boilerplate). Higher means more information-dense code.
:::
