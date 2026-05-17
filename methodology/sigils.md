# Sigil Density

How much symbolic/operator noise exists in the code?

## Definition

A "sigil" is any non-alphanumeric, non-whitespace token that carries semantic meaning. Includes:
- Operators: `+ - * / % = == != < > <= >= && || ! ~ ^ & |`
- Punctuation with meaning: `; : , . :: -> => .. ..= ? #`
- Brackets: `( ) [ ] { } < >`
- Address/deref: `& * @`
- Type decorators: `' " \``

## Metrics

| Metric | Definition |
|--------|-----------|
| Sigils/line | Total sigil characters / LOC |
| Unique sigil types | Count of distinct sigil tokens in program |
| Halstead n1 | Distinct operators (Halstead's formal version) |
| Compound sigils | Multi-char operators (`::`, `->`, `=>`, `&mut`, `<'a>`) |
| Overloading factor | Meanings per sigil (e.g., `&` = reference, bitwise AND, pattern ref) |

## The Sigil Tax

Not all sigils are equal. Framework for evaluating:

**Good sigils**: appear frequently, have one meaning, visually distinct, guessable
- `=` assignment — universal, obvious
- `?` error propagation (Rust/Milo) — concise, one meaning, high frequency

**Bad sigils**: rare, overloaded, visually similar to other sigils, ungoogleable
- `<'a>` lifetime annotation — rare in simple code, hard to google, confusing with `<T>`
- `::` vs `:` vs `->` vs `=>` — four arrow-like things with unrelated meanings

**Key insight**: cognitive load scales with sigil *variety* (distinct symbols to learn), not sigil *frequency* (how often they appear).

## Scoring

```bash
bun run scripts/score.ts --metric sigils <file>
```

Output:
```json
{
  "sigils_per_line": 4.2,
  "unique_sigil_types": 18,
  "halstead_n1": 22,
  "compound_sigils": 7,
  "most_frequent": [";", ":", "(", ")", "{", "}"],
  "overloaded": [{"sigil": "&", "meanings": 3}]
}
```
