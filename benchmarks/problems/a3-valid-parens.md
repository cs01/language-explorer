# A3: Valid Parentheses

## Problem

Given a string containing only `()[]{}`, determine if the input is valid. Valid means every open bracket is closed by the same type in correct order.

## Input

- `s`: string of bracket characters

## Output

- Boolean: true if valid, false otherwise

## Constraints

- Empty string is valid
- O(n) solution using a stack

## What This Tests

- Stack (push/pop) — collection manipulation
- String character iteration
- Match/switch on character values
- Early return on failure
- HashMap or match for bracket pairing
