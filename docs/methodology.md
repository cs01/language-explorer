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
**[Halstead Volume](https://en.wikipedia.org/wiki/Halstead_complexity_measures)** — `N × log₂(n)` where `N` = total tokens, `n` = unique tokens. Measures total information content. Invented by Maurice Halstead in 1977. Widely used in software engineering research.

### Compression ratio
**gzip ratio** — `compressed_size / original_size`. A practical proxy for [Kolmogorov complexity](https://en.wikipedia.org/wiki/Kolmogorov_complexity). Low ratio = repetitive/predictable code. High ratio = dense/novel code.

## Dimensions not yet automated

| Dimension | Why it's hard to automate |
|-----------|--------------------------|
| Concept Count | Requires human judgment about what constitutes a "concept" |
| Type Annotation Burden | Needs language-specific parsers to distinguish required vs optional annotations |
| Error Handling Overhead | Requires semantic understanding of which lines are error handling |
| Safety Ceremony | Requires understanding which tokens serve memory safety vs other purposes |

## Academic references

- **Halstead (1977)** — *Elements of Software Science*. Defined Volume, Difficulty, Effort metrics.
- **Green & Petre (1996)** — *Cognitive Dimensions of Notations*. 14-axis framework for evaluating programming notations.
- **Buse & Weimer (2010)** — *Learning a Metric for Code Readability* (IEEE TSE). Machine-learned readability model from 120 annotators.
- **Ore et al. (2018)** — *Assessing the Type Annotation Burden* (ASE). Formal study of annotation time and accuracy.
- **Nanz & Furia (2015)** — *A Comparative Study of Programming Languages in Rosetta Code* (ICSE). 7,087 programs across 8 languages.
