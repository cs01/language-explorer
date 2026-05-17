# Code Size

**How much code does it take to express the same idea?**

We count three things: lines of code (LOC), tokens (whitespace-separated words), and characters. Each tells a slightly different story.

## Results

| Problem | Python | TypeScript | Rust | Go | C |
|---------|--------|------------|------|-----|---|
| Two Sum | **7** | 11 | 12 | 12 | 12 |
| Valid Parens | **11** | 12 | 13 | 16 | 17 |
| Word Frequency | **14** | 21 | 25 | 42 | 56 |
| Concurrent Fetch | **19** | 25 | 32 | 35 | 61 |
| **Average** | **12.8** | 17.3 | 20.5 | 26.3 | 36.5 |

## What drives the differences?

**Python** wins because:
- No boilerplate (no main function, no imports for builtins, no type annotations required)
- Rich standard library (`Counter`, `ThreadPoolExecutor` — one-liners for complex operations)
- Whitespace-delimited blocks (no `{}` to close)

**C** loses because:
- No built-in collections (no HashMap, no dynamic array without manual allocation)
- Manual memory management (malloc/free/realloc)
- No string operations (character-by-character parsing)
- Manual threading (pthread_create, pthread_join, semaphore management)

**The interesting middle**: Rust (20.5) vs Go (26.3). Rust is more concise despite being more complex — iterator chains and `?` propagation eliminate boilerplate that Go writes explicitly.

## The gap widens with complexity

On simple algorithmic problems, languages cluster within 2× of each other. On real-world problems with I/O, errors, and concurrency, the gap stretches to 3-4×. This is because real programs exercise the standard library, error model, and concurrency primitives — and that's where languages diverge most.

::: details How we count
**LOC**: Non-blank, non-comment lines. Includes imports and main function boilerplate.

**Tokens**: Whitespace-separated words. `let x: i32 = 5;` = 5 tokens.

**Characters**: All non-whitespace characters. Measures raw typing volume.
:::
