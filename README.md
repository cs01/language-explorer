# Language Explorer

A quantitative explorer of programming languages — their properties, features, explicitness, and safety guardrails. Same programs, 23 languages, measured automatically.

**[View the dashboard →](https://cs01.github.io/language-explorer)**

## Languages

Ada, C, C#, C++, Clojure, Erlang, Milo, Objective-C, Rust, Zero, Zig, Go, Java, Kotlin, Swift, Haskell, Elixir, Python, Ruby, JavaScript, TypeScript, LLVM IR, x86_64 Assembly

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

See [Methodology](https://cs01.github.io/language-explorer/methodology) for how each metric is defined.
