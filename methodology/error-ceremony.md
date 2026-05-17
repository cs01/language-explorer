# Error Handling Ceremony

How much code exists solely to handle errors vs. the happy path?

## Formal Basis

No established metric exists — this is a novel contribution. Inspired by the Go community's well-known complaint that "50% of Go code is `if err != nil`."

## Metrics

| Metric | Definition |
|--------|-----------|
| Error LOC ratio | Lines dedicated to error handling / total LOC |
| Happy path clarity | Can you read the success path without interruption? (1-5 scale) |
| Error type LOC | Lines defining error types + conversions |
| Propagation cost | Tokens per error propagation (Go: ~15, Rust: 1 `?`) |
| Error visibility | Are fallible operations visually marked at call site? |

## What Counts as Error Handling LOC

- `if err != nil { return err }` — error handling
- `match result { Err(e) => ..., }` — error handling
- `?` — does NOT count as a line (it's 1 char on the happy-path line)
- `try { } catch { }` — the catch block counts
- Custom error enum/struct definitions — error type LOC
- `impl From<X> for MyError` — error type LOC

## Patterns Compared

| Language | Pattern | Propagation cost | Happy path clarity |
|----------|---------|-----------------|-------------------|
| Rust | `Result<T,E>` + `?` | 1 token | High (linear read) |
| Go | `if err != nil` | ~15 tokens × N calls | Low (constant interruption) |
| Python | `try/except` | 0 at call site | High (but errors invisible) |
| TypeScript | `try/catch` or union | varies | Medium |
| Milo | `Result<T,E>` + `?` | 1 token | High |

## Scoring

```bash
bun run scripts/score.ts --metric error-ceremony <file>
```

Output:
```json
{
  "total_loc": 45,
  "error_handling_loc": 8,
  "error_ratio": 0.18,
  "error_type_loc": 6,
  "propagation_cost_avg": 1,
  "happy_path_clarity": 4
}
```
