# Readability

Composite score: how quickly can a competent programmer understand unfamiliar code?

## Formal Basis

Buse & Weimer (IEEE TSE 2010) — trained a model on 120 human annotators rating Java snippets. Achieved 80% agreement with humans. Features that predict readability:

- Average line length
- Average identifier length
- Max nesting depth
- Blank line density
- Comment density
- Token entropy (information density per token)
- Indentation consistency

## Metrics

| Metric | Definition | Good range |
|--------|-----------|-----------|
| Avg line length | chars / LOC | 40-80 |
| Max nesting | deepest `{}` or indent level | ≤4 |
| Identifier clarity | avg identifier length (too short = cryptic, too long = noisy) | 4-15 chars |
| Token entropy | Shannon entropy of token distribution | lower = more repetitive/predictable |
| Visual density | non-whitespace chars / total chars per line | 0.3-0.6 |
| Vertical rhythm | blank lines between logical blocks | regular spacing |

## Cross-Language Considerations

Buse-Weimer was trained on Java. For cross-language comparison we adapt:
- Normalize for language-mandated style (Python indentation vs braces)
- Weight features by universality (nesting depth matters in all languages)
- Add sigil density as a readability feature (not in original model)

## Scoring

```bash
bun run scripts/score.ts --metric readability <file>
```

Output:
```json
{
  "avg_line_length": 52,
  "max_nesting": 3,
  "avg_identifier_length": 8.2,
  "token_entropy": 4.1,
  "visual_density": 0.48,
  "blank_line_ratio": 0.12,
  "composite_score": 7.2
}
```

## Limitations

Readability is subjective and expertise-dependent. A Rust expert finds `impl<T: Clone>` readable; a beginner doesn't. We score for "competent programmer unfamiliar with this specific code" — not expert, not beginner.
