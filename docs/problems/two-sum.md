# Two Sum

**Algorithmic** — Given an array and a target sum, find two numbers that add up to it.

Tests: HashMap, iteration, returning a compound value.

## Results

| Language | Lines | Tokens | Complexity | Symbols/Line |
|----------|-------|--------|------------|-------------|
| **Python** | **7** | **31** | **146** | 4.4 |
| TypeScript | 11 | 45 | 233 | 5.7 |
| Rust | 12 | 43 | 219 | 5.3 |
| Go | 12 | 44 | 216 | 3.3 |
| C | 12 | 60 | 310 | 5.2 |

## Observations

This is a simple problem — all languages cluster near 7-12 LOC. C can't use a hash map (no stdlib support) so it falls back to O(n²) nested loops, which is actually *shorter* in code but has 2× the complexity score.

Python's `enumerate()` + dictionary lookup is hard to beat for elegance.

## Solutions

::: code-group
```python [Python]
def two_sum(nums: list[int], target: int) -> tuple[int, int]:
    seen = {}
    for i, n in enumerate(nums):
        complement = target - n
        if complement in seen:
            return (seen[complement], i)
        seen[n] = i
```

```typescript [TypeScript]
function twoSum(nums: number[], target: number): [number, number] {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }
    seen.set(nums[i], i);
  }
  throw new Error("no solution");
}
```

```rust [Rust]
use std::collections::HashMap;

fn two_sum(nums: &[i32], target: i32) -> (usize, usize) {
    let mut seen = HashMap::new();
    for (i, &n) in nums.iter().enumerate() {
        let complement = target - n;
        if let Some(&j) = seen.get(&complement) {
            return (j, i);
        }
        seen.insert(n, i);
    }
    unreachable!()
}
```

```go [Go]
func twoSum(nums []int, target int) (int, int) {
	seen := make(map[int]int)
	for i, n := range nums {
		complement := target - n
		if j, ok := seen[complement]; ok {
			return j, i
		}
		seen[n] = i
	}
	return -1, -1
}
```

```c [C]
#include <stdlib.h>

struct Result { int i; int j; };

struct Result two_sum(int *nums, int len, int target) {
    for (int i = 0; i < len; i++) {
        for (int j = i + 1; j < len; j++) {
            if (nums[i] + nums[j] == target) {
                return (struct Result){i, j};
            }
        }
    }
    return (struct Result){-1, -1};
}
```
:::
