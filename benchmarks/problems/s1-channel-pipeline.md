# S1: Channel Pipeline

## Problem

Build a 3-stage concurrent pipeline:
1. **Producer** — sends integers 1 through 20 into a channel/queue
2. **Filter** — receives values, passes through only odd numbers
3. **Consumer** — receives filtered values, prints each one

## Output

```
1
3
5
7
9
11
13
15
17
19
```

## Constraints

- All 3 stages must run concurrently (not sequentially)
- Use the language's idiomatic channel/queue/stream mechanism
- Producer signals completion (close channel, send sentinel, etc.)
- Program exits cleanly after all values are consumed
- No shared mutable state — communication only through channels/queues

## What This Tests

- Channel/queue/stream creation
- Spawning concurrent workers
- Signaling completion (channel close, EOF)
- Pipeline composition
- The language's preferred concurrency communication model
- Cleanup/join semantics
