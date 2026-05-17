# Adding a Problem

## Steps

1. Write a problem spec in `benchmarks/problems/<name>.md` with input/output contract
2. Implement idiomatic solutions in `benchmarks/solutions/<lang>/<name>.<ext>`
3. Score: `bun run scripts/score.ts <file>` → save JSON to `data/`
4. Add a page in `docs/problems/<name>.md` with results table, observations, and code
5. Update `docs/.vitepress/config.ts` sidebar

## Problem categories

**Algorithmic (A-prefix):** Pure logic. Same algorithm in every language. Tests raw expressiveness.

**Real-World (R-prefix):** Practical tasks with I/O, errors, concurrency. Tests ecosystem and ergonomics.

## Solution rules

- Idiomatic for the language (how a proficient developer would write it)
- Use standard library where available
- No code golf — aim for readable, maintainable code
- No over-engineering — solve the problem, nothing more
- Include all imports and boilerplate in the solution file
