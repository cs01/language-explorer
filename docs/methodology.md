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

### Verbosity
**[Halstead Volume](https://en.wikipedia.org/wiki/Halstead_complexity_measures)** — a classic software metric (1977) that measures total information content: how many things are in the code (`N` = total tokens) times how diverse they are (`log₂(n)` where `n` = unique tokens). More unique operations and variables = higher verbosity. We use whitespace-delimited tokens as an approximation — this preserves relative ranking across languages without needing language-specific parsers.

### Compression ratio
**gzip ratio** — `compressed_size / original_size`. How much the code shrinks when compressed. Repetitive, formulaic code compresses well (low ratio). Dense, novel code doesn't (high ratio). A practical measure of how predictable the code is.

### Concept Count
**Keywords** — distinct language keywords used in the solution (`fn`, `let`, `match`, `async`, etc.). **Syntax patterns** — distinct features like generics, closures, pattern matching, channels. **Concept count** = keywords + patterns. Measures how many different language features you need to know to read the code.

### Guardrails
**Guardrail score** — rates 5 safety categories on a 4-level scale:

| Category | What it prevents | Weight |
|----------|-----------------|--------|
| **Memory** | Use-after-free, double-free, buffer overflow, uninitialized reads | **45%** |
| **Null** | Null/nil pointer dereference (requires Option/Maybe to represent absence) | **20%** |
| **Data Races** | Two threads mutating shared state without the compiler stopping you | **15%** |
| **Overflow** | Integer overflow silently wrapping instead of being trapped | **12%** |
| **Coercion** | Implicit type coercions (e.g., `"5" + 3` silently producing `"53"`) | **8%** |

Each category is scored on a **4-level enforcement scale**:

| Score | Level | Meaning |
|:---:|-------|---------|
| **1.0** | Compile-time | Type system makes the bug unrepresentable. Can't compile invalid code. |
| **0.67** | Runtime | Bug triggers immediate panic/error, not silent corruption. On by default. |
| **0.33** | Opt-in | Mechanism exists but requires explicit flag, annotation, or mode. |
| **0** | None | Language provides no protection for this bug class. |

**Formula:** `(memory × 0.45 + null × 0.20 + race × 0.15 + overflow × 0.12 + coercion × 0.08) × 5`

Categories are **weighted by real-world impact**. Memory safety dominates because [Microsoft](https://msrc.microsoft.com/blog/2019/07/a-proactive-approach-to-more-secure-code/) and [Google Chrome](https://www.chromium.org/Home/chromium-security/memory-safety/) independently found ~70% of high-severity CVEs are memory safety bugs. Null dereference is the [#1 logged error](https://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare/) in most Java production environments. Race conditions account for [~44% of concurrency bugs](https://jisajournal.springeropen.com/articles/10.1186/s13174-017-0055-2) and 39% of patches are themselves incorrect. Integer overflow ([CWE-190](https://cwe.mitre.org/data/definitions/190.html)) dropped out of the [CWE Top 25 in 2025](https://cwe.mitre.org/top25/archive/2025/2025_cwe_top25.html). Type coercion bugs are mostly logic errors, not security vulnerabilities.

Score ranges from 0 (C) to 5 (Rust, Swift, Haskell, Elixir). Each language page has a detailed guardrail card showing per-category scores with explanations. This is a language-level property — it doesn't vary per solution.

### Ceremony
**Ceremony ratio** — what fraction of your code is overhead rather than problem-solving logic. Counts: imports, main function wrappers, class/module boilerplate, `return 0`, lone braces, type-only declarations, and preprocessor directives. Lower = less boilerplate standing between you and the algorithm.

**Tradeoff with surface area:** ceremony and surface area are in tension. Languages that reduce ceremony often do so by adding implicit behavior — which is another concept to learn. Go's explicit `if err != nil` is verbose (high ceremony) but requires zero new concepts. Ruby's implicit returns save a line but add a rule every new developer must learn. A language with low ceremony *and* low surface area is genuinely doing something right; low ceremony with high surface area might just be hiding complexity behind sugar.

### Surface Area
**Keywords** — reserved words from the language specification. Objective, verifiable count. Sources: ISO C11, ISO C++20, Rust Reference, Go Spec, Python 3.13, Ruby 3.3, ES2024, TypeScript 5.x, Java SE 21 JLS, Kotlin 2.x, Swift 5.9, Haskell 2010, Elixir 1.19, Zig 0.14.

**Concepts** — total distinct features a developer must learn to read arbitrary code written in the language. Curated across 13 categories: variables & binding, primitive types, compound types, type system features, control flow, functions, OOP & data abstraction, generics & polymorphism, error handling, memory management, concurrency, modules & visibility, and metaprogramming. Each concept represents something that would warrant its own section in a comprehensive language tutorial.

This is a language-level property — it doesn't vary per solution. Higher = more to learn before you can fluently read other people's code.

<div class="guardrail-table">

| | Keywords | Concepts |
|---|:---:|:---:|
| **x86_64 asm** | 1,503 | 45 |
| **LLVM IR** | 150 | 35 |
| **C++** | 92 | 135 |
| **C#** | 118 | 120 |
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
| **Clojure** | 16 | 65 |
| **Elixir** | 15 | 62 |
| **C** | 44 | 60 |
| **Erlang** | 28 | 55 |
| **Go** | 25 | 58 |
| **Zero** | 32 | 50 |
| **Objective-C** | 57 | 48 |
| **Milo** | 30 | 49 |

</div>

**Notes:**
- **Keywords** includes all reserved words, contextual keywords, and modifier keywords that have special meaning. For languages with multiple keyword categories (e.g., Kotlin's hard + soft + modifier), all are counted.
- **Elixir's** low keyword count (15) reflects that constructs like `def`, `if`, `case` are macros, not reserved words — but developers must still learn them (captured in Concepts).
- **C++** at 135 concepts reflects templates, SFINAE, move semantics, rule of five, coroutines, modules, concepts, ranges, etc. — the full surface area that makes C++ notoriously difficult to master.
- **Haskell** has only 24 keywords but 75 concepts because most complexity lives in the type system (type classes, monads, GADTs, kind system) rather than in reserved syntax.
- **x86_64** has 1,503 instruction mnemonics (per [Intel SDM analysis](https://stefanheule.com/blog/how-many-x86-64-instructions-are-there-anyway/)) but only 45 structural concepts — the complexity is in the sheer number of instructions, not conceptual depth.
- **LLVM IR** has 69 instruction opcodes plus ~80 keywords for types, attributes, and metadata. Coercion 0.5 because the verifier rejects type mismatches, but this is a compile-time check on IR, not a runtime guarantee.
- **C#** at 118 keywords includes 77 reserved + 41 contextual. 120 concepts reflects LINQ, async/await, properties, events, delegates, records, pattern matching, nullable reference types, extension methods, etc. Null safety 0.5: nullable reference types enabled by default since .NET 6 but produce warnings, not errors. Overflow 0.5: unchecked by default, `checked` context is opt-in.
- **Clojure** has only 16 special forms (`def`, `if`, `fn`, `let`, etc.) — most constructs are macros. Race 0.5: immutable-by-default with STM, but no static type system to enforce it.
- **Erlang** at 55 concepts reflects OTP patterns (gen_server, supervisors), binary pattern matching, ETS, and hot code loading. Race 1: process isolation with no shared mutable state. Null 0.5: `undefined` atoms serve as nil, pattern matching makes handling explicit, but Dialyzer is opt-in.
- **Objective-C** inherits C's safety profile. Memory 0.5: ARC prevents manual memory bugs but retain cycles and raw C pointers remain. 48 concepts is lower than C++ because Obj-C adds message passing, categories, and protocols but not templates/SFINAE/move semantics.
- **Zero** is a capability-based systems language. 32 keywords and 50 concepts for a language with `shape`, `choice`, `match`, explicit effects (`raises`/`check`), borrow tracking (`ref<T>`/`mutref<T>`), and `owned<T>` cleanup — all without hidden dispatch or runtime overhead.

## AI Readiness

Two metrics measuring how well a language works with AI coding tools.

### LLM Token Count

Each solution is tokenized using the cl100k_base encoding (used by GPT-4 and similar to Claude's tokenizer). This directly measures:
- **API cost** — tokens are what you pay for
- **Context window usage** — how much code fits in a single prompt
- **Token density** — tokens per line shows how efficiently the language packs information

Languages with high ceremony (Java, C++) burn tokens on boilerplate. Concise languages (Python, Ruby) use fewer tokens for equivalent logic.

### Type Coverage

A static per-language property scoring how much type information is available to tools reading the code:

| Score | Level | Languages |
|-------|-------|-----------|
| 1.0 | Fully static | C, C++, Rust, Zig, Milo, Go, Java, Kotlin, Swift, Ada, C#, Zero |
| 0.75 | Static + heavy inference | Haskell |
| 0.5 | Gradual / optional | TypeScript, Python, Objective-C |
| 0.25 | Mostly dynamic | Ruby, LLVM IR |
| 0.0 | Dynamic | JavaScript, Elixir, Erlang, Clojure, x86_64 asm |

Static types give AI more constraints — it can verify its output, catch errors, and make better suggestions. Dynamic languages require the AI to infer types from context, which is less reliable.

Haskell scores 0.75 rather than 1.0 because while all types are known to the compiler, they're often omitted from source code. An AI reading the file doesn't see them.

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
