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

We measure two things: **what the language is** (language-level properties that don't change per program) and **what the code looks like** (per-program metrics measured from benchmark solutions).

### Language-level metrics

These are static properties of the language itself — they don't vary per solution. See [Guardrails](#guardrails), [Surface Area](#surface-area).

### Per-program metrics

Measured from actual code. Averaged across 7 benchmark problems for each language.

### Code Size
**Lines of code (LOC)** — non-blank lines. The most intuitive measure, but affected by formatting choices.

**Tokens** — words and symbols in the code. More stable than lines because it's not affected by where you put line breaks.

**Characters** — all non-whitespace characters. Measures raw typing volume.

### Symbol Noise
**Symbols per line** — special characters (`{`, `->`, `&`, `::`, etc.) divided by lines. Higher = more visual clutter to parse when reading.

**Unique symbol types** — how many *different* special characters appear. Fewer types = less to memorize when learning the language.

### Complexity
**[Halstead Volume](https://en.wikipedia.org/wiki/Halstead_complexity_measures)** — a classic software metric (1977) that measures total information content: how many things are in the code (`N` = total tokens) times how diverse they are (`log₂(n)` where `n` = unique tokens). More unique operations and variables = higher complexity. We use whitespace-delimited tokens as an approximation — this preserves relative ranking across languages without needing language-specific parsers.

### Compression ratio
**gzip ratio** — `compressed_size / original_size`. How much the code shrinks when compressed. Repetitive, formulaic code compresses well (low ratio). Dense, novel code doesn't (high ratio). A practical measure of how predictable the code is.

### Concept Count
**Keywords** — distinct language keywords used in the solution (`fn`, `let`, `match`, `async`, etc.). **Syntax patterns** — distinct features like generics, closures, pattern matching, channels. **Concept count** = keywords + patterns. Measures how many different language features you need to know to read the code.

### Guardrails
**Guardrail score** — rates 5 safety guarantees on a 3-point scale: **0** = not available, **0.5** = available but opt-in, **1** = enforced by default.

| Guardrail | What it prevents | Weight |
|-----------|-----------------|--------|
| **Memory safe** | Use-after-free, double-free, buffer overflow, uninitialized reads | **45%** |
| **Null safe** | Null/nil pointer dereference (requires Option/Maybe to represent absence) | **20%** |
| **Race safe** | Data races prevented at compile time (not just detected at runtime) | **15%** |
| **Overflow safe** | Integer overflow trapped, not silently wrapped | **12%** |
| **Coercion safe** | No implicit type coercions (e.g., `"5" + 3` doesn't silently produce `"53"`) | **8%** |

Categories are **weighted by real-world impact**, not treated equally. Memory safety dominates because [Microsoft](https://msrc.microsoft.com/blog/2019/07/a-proactive-approach-to-more-secure-code/) and [Google Chrome](https://www.chromium.org/Home/chromium-security/memory-safety/) independently found that ~70% of their high-severity CVEs are memory safety bugs. Null dereference is the [#1 logged error](https://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare/) in most Java production environments. Race conditions account for [~44% of concurrency bugs](https://jisajournal.springeropen.com/articles/10.1186/s13174-017-0055-2) and are notoriously hard to fix (39% of patches are themselves incorrect). Integer overflow ([CWE-190](https://cwe.mitre.org/data/definitions/190.html)) has caused RCE in WhatsApp and Chrome but dropped out of the [CWE Top 25 in 2025](https://cwe.mitre.org/top25/archive/2025/2025_cwe_top25.html). Type coercion bugs are mostly logic errors, not security vulnerabilities.

Score ranges from 0 (C) to 5 (Rust, Swift, Haskell, Elixir), normalized from the weighted sum. Half-points for languages with opt-in mechanisms (e.g., C++ smart pointers = 0.5 for memory, Java `Optional` = 0.5 for null). This is a language-level property — it doesn't vary per solution.

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
| **Milo** | 1 | 1 | 1 | 1 | 1 | **5** |
| **Kotlin** | 1 | 1 | 0 | 0 | 1 | **3** |
| **Python** | 1 | 0 | 0 | 1 | 1 | **3** |
| **Ruby** | 1 | 0 | 0 | 1 | 1 | **3** |
| **Ada** | 0.5 | 0.5 | 0.5 | 1 | 1 | **3.5** |
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
- **Memory 0.5** (C++, Zig): Tools like smart pointers exist, but you can still create dangling references, invalidate iterators, or use objects after moving them — the compiler won't stop you.
- **Race 1** (Haskell, Elixir): Haskell prevents shared mutable state by design — functions can't have side effects. Elixir uses isolated processes with immutable data, so threads can't accidentally access the same memory.
- **Overflow 1** (Python, Ruby): Integers grow as large as needed (arbitrary precision), so overflow is impossible. Note: `float` arithmetic can still silently produce `inf`, and numpy arrays wrap.
- **Swift Race 1**: Swift 6 (2024) checks for data races at compile time. New projects enforce this by default.
- **Ada 0.5** (Memory, Null, Race): Ada has bounds checking and default-null initialization, but `Unchecked_Deallocation` creates dangling pointers. `not null` access types are opt-in. Protected objects enforce mutual exclusion at runtime, but the compiler doesn't prevent all data races.

### Ceremony
**Ceremony ratio** — what fraction of your code is overhead rather than problem-solving logic. Counts: imports, main function wrappers, class/module boilerplate, `return 0`, lone braces, type-only declarations, and preprocessor directives. Lower = less boilerplate standing between you and the algorithm.

### Surface Area
**Keywords** — reserved words from the language specification. Objective, verifiable count. Sources: ISO C11, ISO C++20, Rust Reference, Go Spec, Python 3.13, Ruby 3.3, ES2024, TypeScript 5.x, Java SE 21 JLS, Kotlin 2.x, Swift 5.9, Haskell 2010, Elixir 1.19, Zig 0.14.

**Concepts** — total distinct features a developer must learn to read arbitrary code written in the language. Curated across 13 categories: variables & binding, primitive types, compound types, type system features, control flow, functions, OOP & data abstraction, generics & polymorphism, error handling, memory management, concurrency, modules & visibility, and metaprogramming. Each concept represents something that would warrant its own section in a comprehensive language tutorial.

This is a language-level property — it doesn't vary per solution. Higher = more to learn before you can fluently read other people's code.

<div class="guardrail-table">

| | Keywords | Concepts |
|---|:---:|:---:|
| **C++** | 92 | 135 |
| **Rust** | 58 | 110 |
| **Swift** | 98 | 110 |
| **TypeScript** | 67 | 100 |
| **Kotlin** | 78 | 85 |
| **Ada** | 74 | 85 |
| **Java** | 68 | 80 |
| **Python** | 39 | 75 |
| **Haskell** | 24 | 75 |
| **Ruby** | 41 | 65 |
| **JavaScript** | 46 | 65 |
| **Zig** | 49 | 65 |
| **Elixir** | 15 | 62 |
| **C** | 44 | 60 |
| **Go** | 25 | 58 |
| **Milo** | 30 | 40 |

</div>

**Notes:**
- **Keywords** includes all reserved words, contextual keywords, and modifier keywords that have special meaning. For languages with multiple keyword categories (e.g., Kotlin's hard + soft + modifier), all are counted.
- **Elixir's** low keyword count (15) reflects that constructs like `def`, `if`, `case` are macros, not reserved words — but developers must still learn them (captured in Concepts).
- **C++** at 135 concepts reflects templates, SFINAE, move semantics, rule of five, coroutines, modules, concepts, ranges, etc. — the full surface area that makes C++ notoriously difficult to master.
- **Haskell** has only 24 keywords but 75 concepts because most complexity lives in the type system (type classes, monads, GADTs, kind system) rather than in reserved syntax.

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
