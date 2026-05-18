# Error Overhead

**What fraction of your code exists just to handle errors?**

::: info Qualitative only
Quantifying error overhead requires language-aware parsing to distinguish error-handling lines from happy-path logic. The analysis below is qualitative — no scored data yet.
:::

## The spectrum

| Language | Pattern | Cost per error site | Happy-path clarity |
|----------|---------|--------------------|--------------------|
| Python | `try/except` | ~0 at call site | Excellent (but errors are invisible) |
| Rust | `Result<T,E>` + `?` | 1 character | Good (linear read) |
| TypeScript | `try/catch` | ~3 lines | Medium |
| Go | `if err != nil` | ~3 lines per call | Poor (constant interruption) |
| C | Return codes | ~3 lines + manual cleanup | Poor |

## The Go problem

The Go community's well-known observation: **~50% of Go code is `if err != nil`**. Our word-frequency solution has 42 lines — approximately 8 are pure error handling boilerplate. That's a 19% error overhead on a simple program. On a complex program with many fallible calls, it approaches the 50% claim.

## Rust's solution

Rust's `?` operator is arguably the best error propagation mechanism in any mainstream language. One character propagates errors up the call stack with full type safety. The cost is in defining error types — which is a one-time investment per module.
