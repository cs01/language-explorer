# langmetrics

**[View the dashboard →](https://cs01.github.io/langmetrics)**

Quantitative framework for comparing programming language design across expressiveness, cognitive load, and ergonomics.

No existing tool does this. Academic literature has fragments (Halstead, Cognitive Dimensions, Buse-Weimer) but no unified scorecard. This repo is that scorecard.

## What This Measures

| Metric | Formal Basis | What It Captures |
|--------|-------------|-----------------|
| **Conciseness** | Halstead Volume, Kolmogorov (gzip proxy) | How much code to express a concept |
| **Sigil Density** | Halstead Vocabulary (n1) | Symbol/operator visual noise |
| **Concept Count** | Cognitive Dimensions framework | Mental models needed to be productive |
| **Type Burden** | Ore et al. (ASE 2018) | Annotation ceremony vs inference |
| **Error Ceremony** | (novel) | LOC spent on error handling vs happy path |
| **Readability** | Buse-Weimer metric | Composite readability score |

## Languages

Rust, TypeScript, Python, Go, Milo — with room to add more.

## Structure

```
langmetrics/
├── README.md
├── methodology/          # how each metric is defined and measured
│   ├── conciseness.md
│   ├── sigils.md
│   ├── concepts.md
│   ├── type-burden.md
│   ├── error-ceremony.md
│   └── readability.md
├── benchmarks/
│   ├── problems/         # problem definitions (input/output contracts)
│   └── solutions/        # implementations per language
│       ├── rust/
│       ├── typescript/
│       ├── python/
│       ├── go/
│       └── milo/
├── scripts/              # scoring + analysis tools
│   └── score.ts          # bun script: compute all metrics for a source file
├── data/                 # raw results (JSON), one file per problem×language
└── site/                 # static HTML/CSS/JS dashboard
    ├── index.html
    ├── style.css
    └── app.js
```

## Workflow

1. **Define** a benchmark problem in `benchmarks/problems/`
2. **Implement** idiomatic solutions in each language
3. **Score** with `bun run scripts/score.ts <file>` → outputs JSON to `data/`
4. **View** results on the dashboard (`site/index.html`)

## Running

```bash
# score a single file
bun run scripts/score.ts benchmarks/solutions/rust/two-sum.rs

# score all solutions for a problem
bun run scripts/score-all.ts two-sum

# serve the dashboard
open site/index.html
```

## References

- Halstead (1977) — Elements of Software Science
- Green & Petre (1996) — Cognitive Dimensions of Notations
- Buse & Weimer (2010) — Learning a Metric for Code Readability (IEEE TSE)
- Ore et al. (2018) — Assessing the Type Annotation Burden (ASE)
- Nanz & Furia (2015) — Comparative Study of Programming Languages in Rosetta Code (ICSE)
- Kolmogorov conciseness via compression — arxiv.org/pdf/2111.09728 (2021)
