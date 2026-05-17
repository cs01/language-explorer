# langmetrics

**How much does your language cost you?**

Same programs, 15 languages, measured automatically. Compares conciseness, complexity, symbol noise, concept count, safety guardrails, and ceremony.

**[View the dashboard →](https://cs01.github.io/langmetrics)**

## Languages

C, C++, Rust, Zig, Milo, Go, Java, Kotlin, Swift, Haskell, Elixir, Python, Ruby, JavaScript, TypeScript

## Quick start

```bash
bun run score benchmarks/solutions/rust/a1-two-sum.rs   # score one file
bun run score:all                                        # rescore everything
bun run docs:dev                                         # local dev server
```

## How it works

1. Define a problem in `benchmarks/problems/`
2. Write an idiomatic solution per language in `benchmarks/solutions/{lang}/`
3. `score.ts` computes metrics automatically → JSON in `data/`
4. VitePress site reads the JSON and renders tables, radar charts, and comparisons

See [Methodology](https://cs01.github.io/langmetrics/methodology) for how each metric is defined.
