# Concept Count

How many distinct mental models must a programmer hold to write idiomatic code?

## Formal Basis

Based on Green & Petre's Cognitive Dimensions of Notations (1996), specifically the "Hard Mental Operations" dimension. We operationalize it as a countable inventory.

## Definition

A "concept" is a distinct semantic rule or mental model. Not syntax — semantics.

- `if/else` = 1 concept (conditional flow)
- `for` loop = 1 concept (iteration)
- Ownership + borrowing = 2 concepts (they interact but are distinct models)
- Generics = 1 concept (parametric polymorphism, regardless of how many times instantiated)

## Levels

| Level | Milestone | Typical program |
|-------|-----------|----------------|
| L0 | Hello world | Print output |
| L1 | Useful CLI | File I/O, args, errors, collections |
| L2 | Library | Generics, traits/interfaces, modules, visibility |
| L3 | Concurrent | Threads/async, channels, synchronization |
| L4 | Unsafe/FFI | Raw pointers, extern, layout control |

## Methodology

For each language and level:
1. Write the simplest idiomatic program at that level
2. List every concept a programmer must understand to write AND read it
3. Count concepts
4. Note concept interactions (where concepts compose non-obviously)

## Concept Interaction Penalty

Some concepts compose cleanly (generics + structs = generic structs — no surprise).
Some interact badly (lifetimes + closures + async in Rust = head explosion).

Score: `total_concepts + interaction_penalties`

Where interaction penalty = pairs of concepts that produce surprising behavior when combined.

## Scoring

```bash
bun run scripts/score.ts --metric concepts <file>
```

Output:
```json
{
  "level": "L1",
  "concepts_used": ["variables", "mutation", "structs", "enums", "pattern_match", "result", "error_prop", "closures", "iterators"],
  "count": 9,
  "interactions": [{"pair": ["closures", "borrowing"], "surprise": "closure captures require lifetime reasoning"}],
  "interaction_penalty": 1,
  "total": 10
}
```
