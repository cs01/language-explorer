# Word Frequency

**Real-World** — Read a file, count word frequencies, print the top 10.

Tests: File I/O, error handling, HashMap, string splitting, sorting with custom comparator.

## Results

| Language | Lines | Tokens | Complexity | Symbols/Line |
|----------|-------|--------|------------|-------------|
| **Python** | **14** | **45** | **238** | 4.7 |
| TypeScript | 21 | 80 | 473 | 7.3 |
| Rust | 25 | 72 | 404 | 6.7 |
| Go | 42 | 126 | 801 | 4.3 |
| C | 56 | 263 | **1790** | 6.0 |

## This is where languages diverge

On algorithmic problems, all languages stay within 2× of each other. Here, C is **4× Python** and Go is **3× Python**. Real-world code exercises the standard library, and that's where the gap opens.

### Why Go is 42 lines

Go's sorting requires: define a struct type, create a slice of that type, populate it, write a custom `sort.Slice` with a comparator function. That's ~15 lines just to sort a map by value. Python does it in one: `Counter(words).most_common(10)`.

### Why C is 56 lines

No hash map → manual linear scan through an array of structs. No string split → character-by-character `fgetc()` loop with manual word boundary detection. No dynamic array → fixed-size `#define MAX_WORDS 10000`. Every missing abstraction costs ~10 lines.

### The TypeScript symbol problem

TypeScript hits **7.3 symbols/line** here — highest of any language on any problem except Rust's valid-parens. The `Map<string, number>`, spread operator `[...entries()]`, arrow functions, regex `/[^a-zA-Z]+/`, and nullish coalescing `??` add up.

## Solutions

::: code-group
```python [Python]
import sys
from collections import Counter

def main():
    try:
        text = open(sys.argv[1]).read().lower()
    except (IndexError, FileNotFoundError) as e:
        print(f"error: {e}", file=sys.stderr)
        sys.exit(1)

    words = [w for w in text.split() if w.isalpha()]
    counts = Counter(words)
    for word, count in counts.most_common(10):
        print(f"{word}: {count}")

if __name__ == "__main__":
    main()
```

```rust [Rust]
use std::collections::HashMap;
use std::env;
use std::fs;
use std::process;

fn main() {
    let path = env::args().nth(1).unwrap_or_else(|| {
        eprintln!("error: no file argument");
        process::exit(1);
    });

    let text = fs::read_to_string(&path).unwrap_or_else(|e| {
        eprintln!("error: {e}");
        process::exit(1);
    });

    let mut counts: HashMap<&str, usize> = HashMap::new();
    for word in text.split(|c: char| !c.is_alphabetic()) {
        if !word.is_empty() {
            *counts.entry(word).or_insert(0) += 1;
        }
    }

    let mut sorted: Vec<_> = counts.into_iter().collect();
    sorted.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(&b.0)));

    for (word, count) in sorted.iter().take(10) {
        println!("{word}: {count}");
    }
}
```

```typescript [TypeScript]
import { readFileSync } from "fs";

const path = process.argv[2];
if (!path) {
  console.error("error: no file argument");
  process.exit(1);
}

let text: string;
try {
  text = readFileSync(path, "utf-8");
} catch (e: any) {
  console.error(`error: ${e.message}`);
  process.exit(1);
}

const counts = new Map<string, number>();
for (const word of text.toLowerCase().split(/[^a-zA-Z]+/)) {
  if (word) counts.set(word, (counts.get(word) ?? 0) + 1);
}

const sorted = [...counts.entries()]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

for (const [word, count] of sorted.slice(0, 10)) {
  console.log(`${word}: ${count}`);
}
```

```go [Go]
package main

import (
	"fmt"
	"os"
	"sort"
	"strings"
	"unicode"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintln(os.Stderr, "error: no file argument")
		os.Exit(1)
	}

	data, err := os.ReadFile(os.Args[1])
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}

	counts := make(map[string]int)
	for _, word := range strings.FieldsFunc(
		strings.ToLower(string(data)),
		func(c rune) bool { return !unicode.IsLetter(c) },
	) {
		counts[word]++
	}

	type pair struct {
		word  string
		count int
	}
	pairs := make([]pair, 0, len(counts))
	for w, c := range counts {
		pairs = append(pairs, pair{w, c})
	}
	sort.Slice(pairs, func(i, j int) bool {
		if pairs[i].count != pairs[j].count {
			return pairs[i].count > pairs[j].count
		}
		return pairs[i].word < pairs[j].word
	})

	for i := 0; i < 10 && i < len(pairs); i++ {
		fmt.Printf("%s: %d\n", pairs[i].word, pairs[i].count)
	}
}
```
:::

<small>C solution omitted for space — 56 lines of manual character parsing and linear search. See <a href="https://github.com/cs01/langmetrics/blob/main/benchmarks/solutions/c/r1-word-freq.c">source</a>.</small>
