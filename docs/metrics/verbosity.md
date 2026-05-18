---
outline: deep
---

<script setup lang="ts">
import { data } from '../data/metrics.data'

const languages = [...new Set(data.metrics.map(m => m.language))]
const avgData = languages.map(lang => {
  const entries = data.metrics.filter(m => m.language === lang)
  return {
    language: lang.charAt(0).toUpperCase() + lang.slice(1),
    verbosity: Math.round(entries.reduce((s, e) => s + e.halsteadVolume, 0) / entries.length),
  }
})

const columns = [
  { key: 'verbosity', label: 'Avg Halstead Volume' },
]
</script>

# Verbosity

**How much total information does a solution contain?**

We use [Halstead Volume](https://en.wikipedia.org/wiki/Halstead_complexity_measures) — a metric from 1977 that measures the total information content of a program. Think of it as: *"how much stuff do you have to type and read to express this solution?"*

Formula: `N × log₂(n)` where `N` = total number of tokens and `n` = number of unique tokens.

## Results

<MetricsTable :data="avgData" :columns="columns" />

## Why C and Zig explode

On algorithmic problems, C/Zig are only ~2× Python. On real-world problems, they jump to **5-7×**. No standard library support for common operations means hand-building everything.

**Word frequency in C (Halstead: 1790):** No hash map → manual linear scan. No string split → character-by-character loop. No dynamic array → manual realloc. Every abstraction you build from scratch adds information the reader must process.

**Word frequency in Python (Halstead: 238):** `Counter(words).most_common(10)` — one line does what takes C 40 lines.

## Haskell: compact but verbose

Haskell's moderate LOC (20.5 avg) hides high token diversity. Pattern matching, guards, qualified imports (`Data.Map.Strict`), and type class instances introduce many unique tokens. The program is short but information-dense.

## Kotlin and Elixir: the sweet spot

Both achieve low verbosity (~280-294) despite having type systems and functional patterns. Their standard libraries absorb the verbosity — `groupingBy { it }.eachCount()` and `Enum.frequencies()` are single expressions that replace 10+ lines of manual logic.

## Go: surprisingly verbose

Go's Halstead Volume (463) is higher than Rust/TS despite Go's reputation for simplicity. Go uses *more tokens* to say the same thing (no operator overloading, explicit error checking, verbose sorting). More tokens × moderate vocabulary = high volume.

::: details What makes Halstead useful here?
Unlike LOC (which varies with formatting) or character count (which punishes long variable names), Halstead Volume measures **information content** — how many distinct building blocks the program uses and how many total operations it performs. A program that reuses the same few operations scores lower than one that introduces many unique operations.
:::
