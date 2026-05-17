# Key Findings

We implemented 4 programs in 6 languages and measured everything. Here's what the data says.

## The headline numbers

| Language | Avg Lines | Avg Tokens | Complexity | Symbols/Line | Symbol Types |
|----------|-----------|------------|------------|-------------|-------------|
| **Python** | **12.8** | **41** | **212** | 4.8 | **12** |
| TypeScript | 17.3 | 64 | 360 | 6.4 | 18 |
| Rust | 20.5 | 66 | 364 | 6.4 | 17 |
| Go | 26.3 | 79 | 463 | **4.3** | 15 |
| C | 36.5 | 157 | 1033 | 5.7 | 21 |
| C++ | 25.3 | 87 | 514 | 6.2 | 19 |

<small>Averages across 4 benchmark problems (2 algorithmic, 2 real-world). Green = best in column.</small>

## 2.8× : The conciseness gap

C requires **2.8× more code** than Python for equivalent programs. On real-world tasks the gap widens — concurrent HTTP fetching takes 61 lines of C vs 19 lines of Python. That's not just convenience; it's surface area for bugs.

Rust stays surprisingly compact (20.5 avg) despite being a systems language. Go pays for simplicity with verbosity — sorting a map takes 15 lines of boilerplate.

::: info Why this matters
Every line of code is a line that can contain a bug, needs to be read, and needs to be maintained. Language design directly affects how much code you write for the same outcome.
:::

## 6.4 : The symbol tax

Rust and TypeScript tie for highest **symbol noise** at 6.4 symbols per line. But the *reasons* are different:

- **Rust's symbols** are mostly safety-related: `&`, `mut`, `Some()`, lifetime annotations, pattern matching sigils. You're paying for memory safety.
- **TypeScript's symbols** are syntactic: generics (`<>`), optional chaining (`?.`), non-null assertion (`!`), type annotations (`: Type`). You're paying for the type system.

**Go** has the lowest symbol noise (4.3/line) — its simplicity philosophy shows. But it pays in LOC instead.

::: tip The tradeoff
Low symbols + high LOC (Go) vs high symbols + low LOC (Rust). Python manages both low symbols AND low LOC — but gives up compile-time safety.
:::

## 5× : The complexity explosion

[Halstead Volume](https://en.wikipedia.org/wiki/Halstead_complexity_measures) measures how much total information a program contains — think of it as "how much stuff does your brain have to process?"

C's complexity is **5× Python's**. On the word-frequency problem, C scores 1790 vs Python's 238. Why? No hash map in the standard library means manual linear search. No string splitting means character-by-character parsing. Every abstraction the language doesn't provide, you build by hand.

Rust and TypeScript cluster together (~360) — remarkably similar information density despite very different syntax and safety models.

## 12 vs 21 : Symbol vocabulary

Python uses only **12 unique symbol types** on average. C uses **21**. This is the "how many different squiggles do I need to learn?" metric.

More symbol variety = steeper learning curve. It's not about how *often* symbols appear (frequency), but how many *different* symbols you encounter (variety). The cognitive cost is in the variety.

## By problem type

The gaps tell different stories for different problem types:

### Algorithmic problems (Two Sum, Valid Parens)
Languages cluster tightly — 7-17 LOC. The logic is simple enough that language overhead is small. Even C is only 2× Python here.

### Real-world problems (Word Freq, Concurrent Fetch)
Languages **diverge dramatically**. C explodes to 56-61 LOC. Go's sorting ceremony adds 15 lines of boilerplate. These problems expose what the standard library gives you for free vs what you build by hand.

::: warning The real lesson
For simple algorithms, language choice barely matters. For real programs with I/O, errors, and concurrency — **the language you pick determines how much code you write, how many symbols you juggle, and how much complexity you carry.**
:::

## What's next

These metrics are automated. More dimensions coming:

- **Concept Count** — how many distinct ideas do you need to learn to be productive?
- **Type Ceremony** — how many annotations does the compiler demand?
- **Error Overhead** — what fraction of your code handles errors vs does actual work?

See [Methodology](/methodology) for how we measure, or browse individual [problems](/problems/two-sum).
