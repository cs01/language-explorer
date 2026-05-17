# Concept Count

**How many distinct ideas do you need to learn to be productive?**

::: warning Coming soon
This dimension requires manual inventory — listing every concept a programmer must understand at each proficiency level. Automated scoring can't capture this; it requires human analysis of each language's learning curve.
:::

## The framework

Based on [Cognitive Dimensions of Notations](https://en.wikipedia.org/wiki/Cognitive_dimensions_of_notations) (Green & Petre, 1996) — an established framework for evaluating programming notation design.

We define four proficiency levels and count concepts needed at each:

| Level | Milestone | Example program |
|-------|-----------|----------------|
| L0 | Hello world | Print output |
| L1 | Useful CLI | File I/O, args, errors, collections |
| L2 | Library | Generics, traits/interfaces, modules |
| L3 | Concurrent | Threads/async, channels, synchronization |

## Preview: estimated concept counts

| Language | L0 | L1 | L2 | L3 |
|----------|-----|-----|-----|-----|
| Python | ~3 | ~9 | ~14 | ~17 |
| Go | ~4 | ~11 | ~14 | ~17 |
| TypeScript | ~4 | ~12 | ~18 | ~21 |
| Rust | ~5 | ~15 | ~22 | ~27 |
| C | ~4 | ~12 | ~15 | ~20 |

*These are preliminary estimates, not scored data. Formal inventory coming.*

## What counts as a "concept"?

A concept is a distinct mental model the programmer must hold — not syntax, but semantics:

- `if/else` = 1 concept (conditional flow)
- Ownership + borrowing = 2 concepts (they interact but are distinct models)
- Generics = 1 concept (regardless of how many times instantiated)
- Async/await = 1 concept, but *async + lifetimes* = a concept interaction that compounds difficulty
