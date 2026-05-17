# Concurrent Fetch

**Real-World** — Fetch 5 URLs concurrently (max 4 in-flight), print results, handle individual failures.

Tests: concurrency primitives, HTTP, error handling under parallelism, bounded concurrency.

## Results

| Language | Lines | Tokens | Complexity | Symbols/Line |
|----------|-------|--------|------------|-------------|
| **Python** | **19** | **48** | **259** | 5.1 |
| TypeScript | 25 | 80 | 463 | 6.3 |
| Rust | 32 | 87 | 501 | 5.8 |
| Go | 35 | 84 | 508 | 4.5 |
| C | **61** | **225** | **1587** | 5.3 |
| C++ | 32 | 92 | 543 | 6.5 |

## The concurrency tax

This problem shows the cost of concurrency in each language:

### Python (19 lines)
`ThreadPoolExecutor(max_workers=4)` + `pool.map(fetch, urls)`. Two lines handle all concurrency. The rest is the fetch function.

### TypeScript (25 lines)
`Promise.all(batch)` with manual batching. Native `fetch()` API means no HTTP library needed. Clean async/await.

### Rust (32 lines)
`tokio::spawn` + `Arc<Semaphore>` + `async move` blocks. Each concept is powerful but you need to understand: async runtime, Arc (shared ownership), Semaphore (bounded concurrency), move semantics in closures, and `.await` chaining. Five concepts for one task.

### Go (35 lines)
`go func()` + `sync.WaitGroup` + channel-based semaphore. Go's concurrency is its strength, but the ceremony is still 35 lines: `wg.Add(1)`, `defer wg.Done()`, `defer func() { <-sem }()`, anonymous goroutine with captured variable.

### C (61 lines)
`pthread_create` + `libcurl` + manual write callback + buffer management. 61 lines, 225 tokens. The write callback alone is 7 lines. Buffer reallocation is manual. Thread batching is manual. Everything is manual.

## Solutions

::: code-group
```python [Python]
from concurrent.futures import ThreadPoolExecutor
import urllib.request

urls = [
    "https://httpbin.org/get",
    "https://httpbin.org/status/404",
    "https://httpbin.org/delay/1",
    "https://httpbin.org/bytes/1024",
    "https://invalid.example.test",
]

def fetch(url):
    try:
        resp = urllib.request.urlopen(url, timeout=5)
        data = resp.read()
        return f"{url}: {resp.status} ({len(data)} bytes)"
    except Exception as e:
        return f"{url}: error: {e}"

with ThreadPoolExecutor(max_workers=4) as pool:
    for result in pool.map(fetch, urls):
        print(result)
```

```rust [Rust]
use std::sync::Arc;
use tokio::sync::Semaphore;

#[tokio::main]
async fn main() {
    let urls = vec![
        "https://httpbin.org/get",
        "https://httpbin.org/status/404",
        "https://httpbin.org/delay/1",
        "https://httpbin.org/bytes/1024",
        "https://invalid.example.test",
    ];

    let sem = Arc::new(Semaphore::new(4));
    let mut handles = Vec::new();

    for url in urls {
        let sem = sem.clone();
        let handle = tokio::spawn(async move {
            let _permit = sem.acquire().await.unwrap();
            match reqwest::get(url).await {
                Ok(resp) => {
                    let status = resp.status().as_u16();
                    let bytes = resp.bytes().await
                        .map(|b| b.len()).unwrap_or(0);
                    println!("{url}: {status} ({bytes} bytes)");
                }
                Err(e) => println!("{url}: error: {e}"),
            }
        });
        handles.push(handle);
    }

    for h in handles {
        let _ = h.await;
    }
}
```

```typescript [TypeScript]
const urls = [
  "https://httpbin.org/get",
  "https://httpbin.org/status/404",
  "https://httpbin.org/delay/1",
  "https://httpbin.org/bytes/1024",
  "https://invalid.example.test",
];

async function fetchUrl(url: string): Promise<string> {
  try {
    const resp = await fetch(url);
    const body = await resp.arrayBuffer();
    return `${url}: ${resp.status} (${body.byteLength} bytes)`;
  } catch (e: any) {
    return `${url}: error: ${e.message}`;
  }
}

async function main() {
  const results: string[] = [];
  for (let i = 0; i < urls.length; i += 4) {
    const batch = urls.slice(i, i + 4).map(fetchUrl);
    results.push(...(await Promise.all(batch)));
  }
  results.forEach((r) => console.log(r));
}

main();
```

```go [Go]
package main

import (
	"fmt"
	"io"
	"net/http"
	"sync"
)

func main() {
	urls := []string{
		"https://httpbin.org/get",
		"https://httpbin.org/status/404",
		"https://httpbin.org/delay/1",
		"https://httpbin.org/bytes/1024",
		"https://invalid.example.test",
	}

	sem := make(chan struct{}, 4)
	var wg sync.WaitGroup

	for _, url := range urls {
		wg.Add(1)
		sem <- struct{}{}
		go func(u string) {
			defer wg.Done()
			defer func() { <-sem }()

			resp, err := http.Get(u)
			if err != nil {
				fmt.Printf("%s: error: %v\n", u, err)
				return
			}
			defer resp.Body.Close()
			body, _ := io.ReadAll(resp.Body)
			fmt.Printf("%s: %d (%d bytes)\n",
				u, resp.StatusCode, len(body))
		}(url)
	}
	wg.Wait()
}
```

```cpp [C++]
#include <cpr/cpr.h>
#include <future>
#include <iostream>
#include <semaphore>
#include <string>
#include <vector>

int main() {
    std::vector<std::string> urls = {
        "https://httpbin.org/get",
        "https://httpbin.org/status/404",
        "https://httpbin.org/delay/1",
        "https://httpbin.org/bytes/1024",
        "https://invalid.example.test",
    };

    std::counting_semaphore<4> sem(4);
    std::vector<std::future<void>> futures;

    for (const auto& url : urls) {
        futures.push_back(std::async(std::launch::async, [&sem, url]() {
            sem.acquire();
            auto resp = cpr::Get(cpr::Url{url}, cpr::Timeout{5000});
            sem.release();

            if (resp.error) {
                std::cout << url << ": error: " << resp.error.message << "\n";
            } else {
                std::cout << url << ": " << resp.status_code
                          << " (" << resp.text.size() << " bytes)\n";
            }
        }));
    }

    for (auto& f : futures) f.get();
    return 0;
}
```
:::
