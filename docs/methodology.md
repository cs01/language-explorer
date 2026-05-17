# Methodology

## How we measure

1. **Define** a precise problem (input/output contract)
2. **Implement** an idiomatic solution in each language — no code golf, no over-engineering
3. **Score** automatically with `bun run scripts/score.ts`
4. **Compare** across languages and problems

## Rules for solutions

- Use standard library where available
- Third-party deps only when idiomatic (e.g., Rust's `reqwest` for HTTP, `tokio` for async)
- Include all imports, boilerplate, main function wrappers in line counts
- No compiler flags or feature gates that alter the language

## Metrics

### Code Size
**Lines of code (LOC)** — non-blank, non-comment lines. The most intuitive measure, but affected by formatting choices.

**Tokens** — whitespace-separated words. More stable than LOC (not affected by line breaks).

**Characters** — all non-whitespace characters. Measures raw typing volume.

### Symbol Noise
**Symbols per line** — count of non-alphanumeric, non-whitespace characters divided by LOC. Higher = more visual noise.

**Unique symbol types** — how many distinct symbol characters appear. Measures vocabulary size — how many different squiggles you need to learn.

### Complexity
**[Halstead Volume](https://en.wikipedia.org/wiki/Halstead_complexity_measures)** — `N × log₂(n)` where `N` = total tokens, `n` = unique tokens. Measures total information content. Invented by Maurice Halstead in 1977. Widely used in software engineering research. Our implementation uses whitespace-delimited tokens as a proxy for Halstead's operator/operand decomposition — a simplification that preserves relative ranking across languages while avoiding the need for language-specific parsers.

### Compression ratio
**gzip ratio** — `compressed_size / original_size`. A practical proxy for [Kolmogorov complexity](https://en.wikipedia.org/wiki/Kolmogorov_complexity). Low ratio = repetitive/predictable code. High ratio = dense/novel code.

### Concept Count
**Keywords** — distinct language keywords used in the solution (e.g., `fn`, `let`, `match`, `async`). **Syntax patterns** — distinct constructs like generics, closures, pattern matching, channels. **Concept count** = keywords + patterns. Measures how many distinct language features the programmer must know.

### Guardrails
**Guardrail score** — rates 5 safety guarantees on a 3-point scale: **0** = not available, **0.5** = available but opt-in, **1** = enforced by default.

| Guardrail | What it prevents |
|-----------|-----------------|
| **Memory safe** | Use-after-free, double-free, buffer overflow, uninitialized reads |
| **Null safe** | Null/nil pointer dereference (requires Option/Maybe to represent absence) |
| **Race safe** | Data races prevented at compile time (not just detected at runtime) |
| **Overflow safe** | Integer overflow trapped, not silently wrapped |
| **Coercion safe** | No implicit type coercions (e.g., `"5" + 3` doesn't silently produce `"53"`) |

Score ranges from 0 (C) to 5 (Rust, Swift, Haskell, Elixir). Half-points for languages with opt-in mechanisms (e.g., C++ smart pointers = 0.5 for memory, Java `Optional` = 0.5 for null). This is a language-level property — it doesn't vary per solution.

#### Full breakdown

- **Memory** — Can you access freed memory, overflow a buffer, or read uninitialized data?
- **Null** — Can a variable be `null`/`nil`/`None` without the type system knowing?
- **Race** — Can two threads mutate shared state without the compiler stopping you?
- **Overflow** — Does `255 + 1` silently become `0` (or wrap unpredictably)?
- **Coercion** — Does `"5" + 3` silently produce `"53"` or `8` instead of an error?

<div class="guardrail-table">

| | Memory | Null | Race | Overflow | Coercion | **Total** |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Rust** | 1 | 1 | 1 | 1 | 1 | **5** |
| **Swift** | 1 | 1 | 1 | 1 | 1 | **5** |
| **Haskell** | 1 | 1 | 1 | 1 | 1 | **5** |
| **Elixir** | 1 | 1 | 1 | 1 | 1 | **5** |
| **Kotlin** | 1 | 1 | 0 | 0 | 1 | **3** |
| **Milo** | 1 | 1 | 0 | 0 | 1 | **3** |
| **Python** | 1 | 0 | 0 | 1 | 1 | **3** |
| **Ruby** | 1 | 0 | 0 | 1 | 1 | **3** |
| **Zig** | 0.5 | 0.5 | 0 | 1 | 1 | **3** |
| **TypeScript** | 1 | 0.5 | 0 | 0 | 1 | **2.5** |
| **Go** | 1 | 0 | 0 | 0 | 1 | **2** |
| **Java** | 1 | 0.5 | 0 | 0 | 0.5 | **2** |
| **C++** | 0.5 | 0.5 | 0 | 0 | 0 | **1** |
| **JavaScript** | 1 | 0 | 0 | 0 | 0 | **1** |
| **C** | 0 | 0 | 0 | 0 | 0 | **0** |

</div>

**0** = not available. **0.5** = opt-in (e.g., C++ `unique_ptr`, Java `Optional`, TS `strictNullChecks`). **1** = enforced by default.

**Notes:**
- **Memory 0.5** (C++, Zig): Smart pointers / safety-checked allocators exist but don't prevent all categories — dangling references, iterator invalidation, and use-after-move still compile without error.
- **Race 1** (Haskell, Elixir): Haskell's purity prevents shared mutable state; `IORef` is unguarded but rarely accidental. Elixir's actor model with immutable data prevents shared-memory races by construction.
- **Overflow 1** (Python, Ruby): Core integers use arbitrary precision. `float` arithmetic can silently overflow to `inf`; numpy integers wrap.
- **Swift Race 1**: Swift 6 (2024) enforces compile-time data race safety via strict concurrency checking and `Sendable`.

### Ceremony
**Ceremony ratio** — proportion of lines that are language overhead rather than algorithm logic. Counts: import/use/include statements, main function signatures, class/module wrappers, `return 0`, lone braces/end keywords, defer statements, type-only declarations, and preprocessor directives. Lower = less boilerplate.

## Dimensions not yet automated

| Dimension | Why it's hard to automate |
|-----------|--------------------------|
| Type Annotation Burden | Needs language-specific parsers to distinguish required vs optional annotations |

## Academic references

- **Halstead (1977)** — *Elements of Software Science*. Defined Volume, Difficulty, Effort metrics.
- **Green & Petre (1996)** — *Cognitive Dimensions of Notations*. 14-axis framework for evaluating programming notations.
- **Buse & Weimer (2010)** — *Learning a Metric for Code Readability* (IEEE TSE). Machine-learned readability model from 120 annotators.
- **Ore et al. (2018)** — *Assessing the Type Annotation Burden* (ASE). Formal study of annotation time and accuracy.
- **Nanz & Furia (2015)** — *A Comparative Study of Programming Languages in Rosetta Code* (ICSE). 7,087 programs across 8 languages.
