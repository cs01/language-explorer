# Complexity

**How much total information does your brain have to process?**

We use [Halstead Volume](https://en.wikipedia.org/wiki/Halstead_complexity_measures) — a metric from 1977 that measures the total information content of a program. Think of it as: *"if I had to transmit this program as pure information, how many bits would it take?"*

Formula: `N × log₂(n)` where `N` = total number of tokens and `n` = number of unique tokens.

## Results

| Problem | Python | TypeScript | Rust | Go | C |
|---------|--------|------------|------|-----|---|
| Two Sum | **146** | 233 | 219 | 216 | 310 |
| Valid Parens | **203** | 271 | 331 | 327 | 445 |
| Word Frequency | **238** | 473 | 404 | 801 | 1790 |
| Concurrent Fetch | **259** | 463 | 501 | 508 | 1587 |
| **Average** | **212** | 360 | 364 | 463 | 1033 |

## Why C explodes

On algorithmic problems, C is only ~2× Python. On real-world problems, it jumps to **5-7×**. The reason: C has no standard library support for common operations.

**Word frequency in C (Halstead: 1790):** No hash map → manual linear scan. No string split → character-by-character loop. No dynamic array → manual realloc. Every abstraction the language doesn't provide, you build from scratch — and every hand-written line adds information that the reader must process.

**Word frequency in Python (Halstead: 238):** `Counter(words).most_common(10)` — one line does what takes C 40 lines. The abstraction is built into the language; the programmer doesn't carry the complexity.

## Rust ≈ TypeScript

Despite very different syntax and safety models, Rust (364) and TypeScript (360) have nearly identical average complexity. They pack similar information into different-looking code:

- Rust: fewer tokens but higher information per token (symbols carry ownership semantics)
- TypeScript: more tokens but lower information per token (type annotations are often redundant)

## Go: verbose but not complex?

Go's Halstead Volume (463) is higher than Rust/TS despite Go's reputation for simplicity. The reason: Go uses *more tokens* to say the same thing (no operator overloading, explicit error checking, verbose sorting). More tokens × moderate vocabulary = high volume.

::: details What makes Halstead useful here?
Unlike LOC (which varies with formatting) or character count (which punishes long variable names), Halstead Volume measures **information content** — how many distinct building blocks the program uses and how many total operations it performs. A program that reuses the same few operations scores lower than one that introduces many unique operations.
:::
