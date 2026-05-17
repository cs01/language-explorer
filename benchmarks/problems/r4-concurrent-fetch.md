# R4: Concurrent URL Fetcher

## Problem

Given a list of URLs, fetch them all concurrently (max 4 at a time), collect results, print status code and byte length for each. Handle individual failures gracefully without aborting others.

## Input

- Hardcoded list of 5+ URLs (no CLI args needed)

## Output

- One line per URL: `<url>: <status> (<bytes> bytes)` or `<url>: error: <message>`
- Order doesn't matter (concurrency)

## Constraints

- True concurrent/parallel execution (not sequential)
- Bounded concurrency (max 4 in-flight)
- Individual failures don't crash the program

## What This Tests

- Concurrency primitives (threads, async, goroutines, etc.)
- Error handling under concurrency
- Collection of results from parallel work
- Bounded parallelism (semaphore/pool)
- String formatting with mixed success/failure
