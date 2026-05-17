---
outline: deep
---

<script setup lang="ts">
import { data } from '../data/metrics.data'

const problem = 'r5-http-server'
const metrics = data.metrics
  .filter(m => m.problem === problem)
  .map(m => ({
    language: m.language.charAt(0).toUpperCase() + m.language.slice(1),
    lines: m.loc,
    tokens: m.tokens,
    complexity: m.halsteadVolume,
    'symbols/line': m.sigilsPerLine,
  }))

const columns = [
  { key: 'lines', label: 'Lines' },
  { key: 'tokens', label: 'Tokens' },
  { key: 'complexity', label: 'Complexity' },
  { key: 'symbols/line', label: 'Symbols/Line' },
]

const langLabels: Record<string, string> = {
  python: 'Python', typescript: 'TypeScript', rust: 'Rust', go: 'Go',
  c: 'C', cpp: 'C++', swift: 'Swift', zig: 'Zig', javascript: 'JavaScript',
  ruby: 'Ruby', java: 'Java', kotlin: 'Kotlin', haskell: 'Haskell', elixir: 'Elixir',
}

const solutions = data.solutions
  .filter(s => s.problem === problem)
  .sort((a, b) => {
    const aLoc = data.metrics.find(m => m.problem === problem && m.language === a.language)?.loc ?? 99
    const bLoc = data.metrics.find(m => m.problem === problem && m.language === b.language)?.loc ?? 99
    return aLoc - bLoc
  })
  .map(s => ({ lang: s.language, label: langLabels[s.language] || s.language, code: s.code }))
</script>

# HTTP Server

**Real-World** — Minimal HTTP server: JSON greeting on `/hello`, 404 everywhere else.

Tests: server setup, routing, query params, JSON response, library ceremony.

## Results

<MetricsTable :data="metrics" :columns="columns" />

## The framework question

This problem answers: **how much boilerplate does "hello world" cost in web dev?**

JavaScript/TypeScript win — `createServer` + URL parsing is 13 lines. No imports, no types, no frameworks.

Go is famously good here — `net/http` stdlib gives you routing and JSON encoding in 24 lines. No third-party dependency.

Rust (axum) and Kotlin (ktor) require framework imports but deliver clean, type-safe routing. The Rust version needs 5 derive macros and explicit async runtime setup.

Java uses `com.sun.net.httpserver` (stdlib since Java 6) — functional but verbose. Manual query string parsing is painful.

C with libmicrohttpd is readable but the callback signature alone is 4 parameters.

## Solutions

<SolutionTabs :solutions="solutions" />
