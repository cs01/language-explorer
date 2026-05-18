---
outline: deep
---

<script setup>
import { data } from './data/metrics.data'

// Compute averages per language
const languages = [...new Set(data.metrics.map(m => m.language))]
const avgData = languages.map(lang => {
  const entries = data.metrics.filter(m => m.language === lang)
  const avg = (key) => +(entries.reduce((s, e) => s + e[key], 0) / entries.length).toFixed(1)
  return {
    language: lang.charAt(0).toUpperCase() + lang.slice(1),
    lines: avg('loc'),
    tokens: avg('tokens'),
    verbosity: Math.round(entries.reduce((s, e) => s + e.halsteadVolume, 0) / entries.length),
    'symbols/line': avg('sigilsPerLine'),
    'symbol types': Math.round(entries.reduce((s, e) => s + e.uniqueSigilTypes, 0) / entries.length),
  }
})

const columns = [
  { key: 'lines', label: 'Lines' },
  { key: 'tokens', label: 'Tokens' },
  { key: 'verbosity', label: 'Verbosity' },
  { key: 'symbols/line', label: 'Sym/Line' },
  { key: 'symbol types', label: 'Sym Types' },
]
</script>

# Key Findings

We implemented 7 programs in 14 languages and measured everything. Here's what the data says.

## The headline numbers

<MetricsTable :data="avgData" :columns="columns" />

<small>Averages across 7 benchmark problems (2 algorithmic, 4 real-world, 1 systems). Click columns to sort.</small>

## 2.9× : The conciseness gap

Zig and C require **~3× more code** than Python/Ruby for equivalent programs. On real-world tasks the gap widens — concurrent HTTP fetching takes 59-61 lines of Zig/C vs 19 lines of Python.

**Ruby** ties Python for fewest tokens (41 avg) and actually beats Python on verbosity (205 vs 212). Its regex-powered `scan` + `tally` idioms are remarkably dense.

**Kotlin** surprises at 18.5 lines avg — same as JavaScript, far less than Java (24.8). Extension functions and scope functions eliminate ceremony.

**Zig** lands where you'd expect for a "better C" — same LOC as C (37 vs 36.5) but with explicit error handling and allocator management baked in.

::: info Why this matters
Every line of code is a line that can contain a bug, needs to be read, and needs to be maintained. Language design directly affects how much code you write for the same outcome.
:::

## 6.4 : The symbol tax

Rust, TypeScript, Elixir, and Zig tie for highest **symbol noise** at 6.3-6.4 symbols per line. But the *reasons* differ:

- **Rust's symbols** — safety: `&`, `mut`, `Some()`, lifetime annotations, pattern matching sigils.
- **TypeScript's symbols** — type system: generics (`<>`), optional chaining (`?.`), non-null assertion (`!`).
- **Elixir's symbols** — pipeline-heavy: `|>`, pattern matching, `fn ->`, atoms (`:ok`).
- **Zig's symbols** — explicitness: `|captures|`, `orelse`, `.{}` struct literals, error unions.

**Ruby** has the lowest symbol noise (4.1/line) — beating even Go (4.3). Blocks, implicit returns, and English-like methods (`each`, `puts`, `empty?`) keep syntax minimal.

::: tip The tradeoff
Low symbols + high LOC (Go) vs high symbols + low LOC (Rust). Ruby manages both low symbols AND low LOC. Python is close behind. Both give up compile-time safety for it.
:::

## 5× : The verbosity explosion

[Halstead Volume](https://en.wikipedia.org/wiki/Halstead_complexity_measures) measures how much total information a program contains — think of it as "how much stuff does your brain have to process?"

C and Zig are **5× Python/Ruby**. On word-frequency: C scores 1790, Zig scores 1627, vs Python's 238 and Ruby's 227. No hash map in the standard library means manual data structures. No string splitting means character-by-character parsing.

**Haskell** is a surprise at 626 — high token count from pattern matching, guards, and qualified imports drives up Halstead volume despite moderate LOC (20.5).

**Kotlin and Elixir** cluster with Python/Ruby (~280-294) despite being typed/functional — their standard libraries do the heavy lifting.

## 12 vs 20 : Symbol vocabulary

Python uses only **12 unique symbol types** on average. C uses **20**. This is the "how many different squiggles do I need to learn?" metric.

**Haskell** surprises with only **14 symbol types** — fewer than most languages. Its vocabulary is small but *dense*: fewer symbols used more frequently. Contrast with C++/TypeScript/Zig at 18 — wide variety of punctuation across generics, templates, captures, and format specifiers.

More symbol variety = steeper learning curve. It's not about how *often* symbols appear (frequency), but how many *different* symbols you encounter (variety).

## By problem type

The gaps tell different stories for different problem types:

### Algorithmic problems (Two Sum, Valid Parens)
Languages cluster tightly — 7-26 LOC. Ruby (8 lines) and Kotlin (9 lines) edge out Python (7 lines) for two-sum. Zig balloons to 26 lines on valid-parens due to explicit stack management.

### Real-world problems (Word Freq, Concurrent Fetch)
Languages **diverge dramatically**. Zig explodes to 50-59 LOC (rivaling C). Swift's concurrent-fetch is 46 lines — the actor-based semaphore adds overhead vs languages with built-in bounded concurrency. Elixir stays compact (19-20 lines) thanks to `Task.async_stream` and `Enum.frequencies`.

::: warning The real lesson
For simple algorithms, language choice barely matters. For real programs with I/O, errors, and concurrency — **the language you pick determines how much code you write, how many symbols you juggle, and how much verbosity you carry.**
:::

## What's next

These metrics are automated. More dimensions coming:

- **Concept Count** — how many distinct ideas do you need to learn to be productive?
- **Type Ceremony** — how many annotations does the compiler demand?
- **Error Overhead** — what fraction of your code handles errors vs does actual work?

See [Methodology](/methodology) for how we measure, or browse individual [problems](/problems/two-sum).
