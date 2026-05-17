# Conciseness

How much code does it take to express an equivalent concept?

## Metrics

| Metric | Definition | Tool |
|--------|-----------|------|
| LOC | Non-blank, non-comment lines | line count |
| Tokens | Whitespace-separated tokens | tokenizer |
| Characters | Non-whitespace chars | char count |
| Halstead Volume | N × log₂(n) where N=total tokens, n=unique tokens | halstead() |
| Compression ratio | gzip(source).length / source.length | gzip proxy for Kolmogorov complexity |
| Boilerplate ratio | Lines not contributing to "the point" / total LOC | manual annotation |

## What Counts as Boilerplate

- Import/use statements
- Main function wrapper
- Type declarations that exist solely to satisfy the compiler
- Module declarations

What does NOT count:
- Type annotations that aid readability
- Error handling (scored separately)
- Variable declarations that do work

## Interpretation

Lower is not always better. The goal: find places where a language is verbose *without buying safety, clarity, or correctness*. Pure ceremony.

Compare:
```python
# Python: 1 LOC
words = open("f.txt").read().split()
```
```rust
// Rust: 3 LOC — but buys error handling + ownership clarity
let content = std::fs::read_to_string("f.txt")?;
let words: Vec<&str> = content.split_whitespace().collect();
```

The Rust version is more verbose but each token earns its place. The question is always: *does the verbosity buy something?*

## Scoring

```bash
bun run scripts/score.ts --metric conciseness <file>
```

Output:
```json
{
  "loc": 15,
  "tokens": 67,
  "chars": 312,
  "halstead_volume": 445.2,
  "compression_ratio": 0.38,
  "boilerplate_loc": 3,
  "boilerplate_ratio": 0.20
}
```
