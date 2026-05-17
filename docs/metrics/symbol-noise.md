# Symbol Noise

**How many special characters clutter each line of code?**

"Symbol noise" (formally: [sigil density](https://en.wikipedia.org/wiki/Sigil_(computer_programming))) counts non-alphanumeric, non-whitespace characters per line. Think: `& * < > :: -> => ? ! ; : { } [ ]`.

## Why it matters

Every special character is a micro-decision for the reader: *what does this symbol mean in this context?* Languages that overload symbols (`&` means reference AND bitwise-AND AND pattern-binding in Rust) impose more cognitive work per character.

## Results: symbols per line

| Problem | Python | TypeScript | Rust | Go | C |
|---------|--------|------------|------|-----|---|
| Two Sum | 4.4 | 5.7 | 5.3 | **3.3** | 5.2 |
| Valid Parens | **5.1** | 6.2 | 7.9 | 5.3 | 6.3 |
| Word Frequency | 4.7 | 7.3 | 6.7 | **4.3** | 6.0 |
| Concurrent Fetch | 5.1 | 6.3 | 5.8 | **4.5** | 5.3 |
| **Average** | 4.8 | **6.4** | **6.4** | **4.3** | 5.7 |

## Results: unique symbol types

This measures **how many different symbols you need to learn** — the vocabulary of squiggles.

| Language | Avg Unique Symbol Types |
|----------|----------------------|
| Python | **12** |
| Go | 15 |
| Rust | 17 |
| TypeScript | 18 |
| C | 21 |

## The two kinds of noise

**Rust's noise is safety-related.** The `&`, `mut`, `Some()`, `unwrap()`, lifetime annotations — they encode ownership and borrowing information. You're paying for compile-time memory safety. Each symbol carries real semantic weight.

**TypeScript's noise is syntactic.** Generics (`<number, number>`), non-null assertion (`!`), optional chaining (`?.`), type assertions (`: Type`) — these serve the type checker, not runtime behavior. The symbols don't prevent bugs at the same rate.

**Go avoids symbols by using words.** `make()` instead of `{}`, `append()` instead of `.push()`, explicit `if err != nil` instead of `?`. Lower symbol density, but more lines of code.

::: tip Key insight
Cognitive load scales with symbol **variety** (how many different symbols to learn), not symbol **frequency** (how often they appear). Seeing `&&&` is fine if `&` always means one thing. Seeing `& &mut &'a *const *mut` is five concepts in similar-looking syntax — that's expensive.
:::

::: details What counts as a symbol?
Everything that isn't a letter, digit, or whitespace: `+ - * / % = == != < > <= >= && || ! ~ ^ & | ; : , . :: -> => .. ..= ? # @ ' " ( ) [ ] { } < >`

We count both total symbols per line (density) and unique symbol types per program (vocabulary).
:::
