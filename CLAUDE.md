# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Dev server (VitePress docs site)
bun run docs:dev

# Build docs for production
bun run docs:build

# Score a single source file → outputs JSON
bun run score benchmarks/solutions/rust/a1-two-sum.rs

# Rescore all solutions (98 files)
bun run score:all

# Deploy: push to main triggers GitHub Pages via .github/workflows/pages.yml
```

## Architecture

**Scoring pipeline:** `scripts/score.ts` reads a source file, computes metrics (conciseness via Halstead/gzip, sigil density, readability), and outputs JSON. `scripts/score-all.ts` scores every solution. Results live in `data/{problem}-{lang}.json`.

**Presentation:** VitePress site in `docs/` with custom Vue components:
- `MetricsTable` — sortable heatmap table with language group filters
- `SolutionTabs` — tabbed code viewer loading from solution files
- `RadarChart` — SVG radar chart for language profiles
- `LanguageComparison` — side-by-side bar chart comparison picker

**Data loader:** `docs/data/metrics.data.ts` reads all JSON + solution files at build time, provides reactive data to Vue components. No manual transcription needed.

**Benchmark structure:** Problems defined in `benchmarks/problems/` as markdown specs. Solutions in `benchmarks/solutions/{lang}/` named `{problem-slug}.{ext}`. Currently 7 problems × 14 languages. `milo/` directory exists for a future language.

**Data flow:** score.ts → data/*.json → metrics.data.ts (build-time loader) → Vue components.

## Conventions

- Problem slugs: `{category}{number}-{name}` (e.g., `a1-two-sum`, `r4-concurrent-fetch`). Categories: `a` = algorithmic, `r` = real-world, `s` = systems.
- Solutions must be idiomatic for their language — no literal translations.
- Runtime is Bun (not Node). Uses `Bun.gzipSync` in scoring.
- Languages: Python, Ruby, JavaScript, TypeScript, Go, Rust, Swift, Zig, Java, Kotlin, Haskell, Elixir, C, C++.
