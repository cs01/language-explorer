# Benchmark Problems

Each problem has a precise spec: input contract, output contract, constraints. Solutions must be idiomatic for each language — no code golf, no over-engineering.

## Algorithmic (raw expressiveness)

| ID | Name | Key constructs tested |
|----|------|----------------------|
| A1 | [two-sum](a1-two-sum.md) | HashMap, iteration, return compound value |
| A2 | [reverse-linked-list](a2-reverse-linked-list.md) | Option/nullable, pointer manipulation, recursion |
| A3 | [valid-parens](a3-valid-parens.md) | Stack, string iteration, early return |
| A4 | [merge-sorted](a4-merge-sorted.md) | Indexing, comparison, building result collection |
| A5 | [binary-search](a5-binary-search.md) | While loop, arithmetic, Option return |

## Real-World (practical ergonomics)

| ID | Name | Key constructs tested |
|----|------|----------------------|
| R1 | [word-freq](r1-word-freq.md) | File I/O, HashMap, string splitting, sorting |
| R2 | [http-get-json](r2-http-get-json.md) | Networking, JSON parse, error handling |
| R3 | [cli-subcommands](r3-cli-subcommands.md) | Arg parsing, enums, match/dispatch |
| R4 | [concurrent-fetch](r4-concurrent-fetch.md) | Threads/async, channels, error collection |
| R5 | [kv-store](r5-kv-store.md) | Structs, serialization, file I/O, error propagation |

## Rules

- Idiomatic style for each language
- Use standard library where available
- Third-party deps only when idiomatic (e.g., Python requests, Rust serde)
- Include all imports/main boilerplate in measurements
- No compiler flags or feature gates that alter the language
