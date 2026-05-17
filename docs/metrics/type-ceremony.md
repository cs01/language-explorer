# Type Ceremony

**How many annotations does the compiler demand that you could figure out yourself?**

::: warning Coming soon
This dimension requires language-aware parsing to distinguish required vs optional annotations. Manual analysis in progress.
:::

## The formal basis

[Ore et al. (ASE 2018)](https://dl.acm.org/doi/10.1145/3238147.3238173) coined **"Type Annotation Burden"** and found: developers average **136 seconds** per correct annotation and get it right only **51% of the time**.

Annotations are expensive. The question is: which ones earn their keep?

## What makes type burden high

1. **Redundancy**: `let x: Vec<i32> = Vec::new()` — both sides state the type
2. **Call-site generics**: `.collect::<Vec<_>>()` — the "turbofish" tax
3. **Lifetime annotations**: `fn foo<'a>(x: &'a str) -> &'a str` — noise when obvious
4. **Nested generics**: `HashMap<String, Vec<Box<dyn Fn(&str) -> Result<(), Error>>>>` — unreadable

## What makes type burden acceptable

- Annotations at API boundaries (function signatures) — they serve as documentation
- Annotations that disambiguate genuinely ambiguous code
- Annotations that catch real bugs the programmer would miss
