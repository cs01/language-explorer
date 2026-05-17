# Type Annotation Burden

How much ceremony does the type system demand?

## Formal Basis

Ore et al. (ASE 2018) — "Assessing the Type Annotation Burden." Their finding: developers average 136 seconds per correct annotation and get it right only 51% of the time. Annotations are expensive.

## Metrics

| Metric | Definition |
|--------|-----------|
| Annotation ratio | Lines with explicit type annotations / total LOC |
| Required ratio | Annotations the compiler demands / total LOC |
| Optional ratio | Annotations that could be removed (inference handles it) / total annotations |
| Annotation length | Average char count of type expressions |
| Turbofish count | Call-site type parameters (`::<T>`, `: Type` on generics) |
| Redundancy | Annotations where both sides of `=` state the type |

## What Makes Type Burden High

1. **Redundancy**: `let x: Vec<i32> = Vec::new()` — compiler already knows
2. **Ceremony at call sites**: `.collect::<Vec<_>>()` — turbofish tax
3. **Lifetime annotations**: `fn foo<'a>(x: &'a str) -> &'a str` — noise when obvious
4. **Generic constraints repeating**: same `where T: Clone + Debug` on every impl
5. **Nested generics**: `HashMap<String, Vec<Box<dyn Fn(&str) -> Result<(), Error>>>>` — unreadable

## What Makes Type Burden Acceptable

- Annotations at API boundaries (function signatures) — documentation value
- Annotations that disambiguate genuinely ambiguous code
- Annotations that catch real bugs at compile time

## Scoring

```bash
bun run scripts/score.ts --metric type-burden <file>
```

Output:
```json
{
  "annotation_ratio": 0.35,
  "required_ratio": 0.20,
  "optional_ratio": 0.43,
  "avg_annotation_length": 12.4,
  "turbofish_count": 2,
  "redundant_annotations": 1,
  "longest_annotation": "HashMap<String, Vec<Result<Response, Error>>>"
}
```
