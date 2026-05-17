# Valid Parentheses

**Algorithmic** — Determine if a string of brackets `()[]{}` is properly nested.

Tests: Stack operations, string iteration, match/switch, early return.

## Results

| Language | Lines | Tokens | Complexity | Symbols/Line |
|----------|-------|--------|------------|-------------|
| **Python** | **11** | **40** | **203** | 5.1 |
| TypeScript | 12 | 51 | 271 | 6.2 |
| Rust | 13 | 63 | 331 | **7.9** |
| Go | 16 | 61 | 327 | 5.3 |
| C | 17 | 81 | 445 | 6.3 |

## Observations

**Rust hits its highest symbol noise here (7.9/line)** — pattern matching with `'('`, `Some()`, `|` alternatives, and `=> if` guards pack a lot of symbols per line. The code is readable for Rust programmers but dense for newcomers.

**Go's stack operations are verbose** — no `.pop()` method on slices, so `stack = stack[:len(stack)-1]` is the idiom. 16 characters to pop a stack.

**C uses the ternary operator** for bracket matching — compact but a readability tradeoff.

## Solutions

::: code-group
```python [Python]
def is_valid(s: str) -> bool:
    stack = []
    pairs = {")": "(", "]": "[", "}": "{"}
    for c in s:
        if c in pairs:
            if not stack or stack[-1] != pairs[c]:
                return False
            stack.pop()
        else:
            stack.append(c)
    return len(stack) == 0
```

```rust [Rust]
fn is_valid(s: &str) -> bool {
    let mut stack = Vec::new();
    for c in s.chars() {
        match c {
            '(' | '[' | '{' => stack.push(c),
            ')' => if stack.pop() != Some('(') { return false; },
            ']' => if stack.pop() != Some('[') { return false; },
            '}' => if stack.pop() != Some('{') { return false; },
            _ => {}
        }
    }
    stack.is_empty()
}
```

```typescript [TypeScript]
function isValid(s: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  for (const c of s) {
    if (c in pairs) {
      if (stack.pop() !== pairs[c]) return false;
    } else {
      stack.push(c);
    }
  }
  return stack.length === 0;
}
```

```go [Go]
func isValid(s string) bool {
	stack := []rune{}
	pairs := map[rune]rune{')': '(', ']': '[', '}': '{'}
	for _, c := range s {
		if open, ok := pairs[c]; ok {
			if len(stack) == 0 || stack[len(stack)-1] != open {
				return false
			}
			stack = stack[:len(stack)-1]
		} else {
			stack = append(stack, c)
		}
	}
	return len(stack) == 0
}
```

```c [C]
#include <stdbool.h>
#include <string.h>

bool is_valid(const char *s) {
    char stack[10000];
    int top = -1;
    for (int i = 0; s[i]; i++) {
        char c = s[i];
        if (c == '(' || c == '[' || c == '{') {
            stack[++top] = c;
        } else {
            if (top < 0) return false;
            char expected = c == ')' ? '(' : c == ']' ? '[' : '{';
            if (stack[top--] != expected) return false;
        }
    }
    return top == -1;
}
```
:::
