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
    'symbols/line': avg('sigilsPerLine'),
    'symbol types': Math.round(entries.reduce((s, e) => s + e.uniqueSigilTypes, 0) / entries.length),
  }
})

const columns = [
  { key: 'symbols/line', label: 'Avg Symbols/Line' },
  { key: 'symbol types', label: 'Avg Unique Symbol Types' },
]
</script>

# Symbol Noise

**How many special characters clutter each line of code?**

"Symbol noise" (formally: [sigil density](https://en.wikipedia.org/wiki/Sigil_(computer_programming))) counts non-alphanumeric, non-whitespace characters per line. Think: `& * < > :: -> => ? ! ; : { } [ ]`.

## Why it matters

Every special character is a micro-decision for the reader: *what does this symbol mean in this context?* Languages that overload symbols (`&` means reference AND bitwise-AND AND pattern-binding in Rust) impose more cognitive work per character.

## Results

<MetricsTable :data="avgData" :columns="columns" />

## The two dimensions of noise

**Symbols per line** (density) — how cluttered does each line look?

**Unique symbol types** (vocabulary) — how many different squiggles do you need to learn?

These don't always correlate. Haskell has low density (4.6/line) AND low vocabulary (14 types) — few symbols used sparsely. Elixir has high density (6.4/line) but moderate vocabulary (15 types) — a few symbols (`|>`, `&`) used heavily.

## Why each language is noisy (or not)

**Rust's noise is safety-related.** The `&`, `mut`, `Some()`, `unwrap()`, lifetime annotations — they encode ownership and borrowing. Each symbol carries real semantic weight.

**TypeScript's noise is syntactic.** Generics (`<number, number>`), non-null assertion (`!`), optional chaining (`?.`) — these serve the type checker, not runtime behavior.

**Elixir's noise is pipeline-driven.** The `|>` operator, pattern matching (`{:ok, val}`), anonymous functions (`&(&1 + 1)`) — dense but consistent.

**Go avoids symbols by using words.** `make()` instead of `{}`, `append()` instead of `.push()`. Lower symbol density, but more lines of code.

**Ruby minimizes both.** Blocks (`do |x| ... end`), English-like methods (`empty?`, `puts`, `each`), implicit returns — code reads almost like prose.

::: tip Key insight
Cognitive load scales with symbol **variety** (how many different symbols to learn), not symbol **frequency** (how often they appear). Seeing `&&&` is fine if `&` always means one thing. Seeing `& &mut &'a *const *mut` is five concepts in similar-looking syntax — that's expensive.
:::

::: details What counts as a symbol?
Everything that isn't a letter, digit, or whitespace: `+ - * / % = == != < > <= >= && || ! ~ ^ & | ; : , . :: -> => .. ..= ? # @ ' " ( ) [ ] { } < >`

We count both total symbols per line (density) and unique symbol types per program (vocabulary).
:::
