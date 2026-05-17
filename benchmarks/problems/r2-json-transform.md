# R2: JSON Transform

## Problem

Read a JSON array of user objects from stdin, filter to active users over age 18, reshape into a simplified format, and write the result to stdout.

## Input (stdin)

```json
[
  {"name": "Alice", "age": 30, "active": true, "email": "alice@example.com"},
  {"name": "Bob", "age": 17, "active": true, "email": "bob@example.com"},
  {"name": "Charlie", "age": 25, "active": false, "email": "charlie@example.com"},
  {"name": "Diana", "age": 22, "active": true, "email": "diana@example.com"}
]
```

## Output (stdout)

```json
[{"name":"Alice","email":"alice@example.com"},{"name":"Diana","email":"diana@example.com"}]
```

## Constraints

- Read from stdin, write to stdout
- Filter: `active == true` AND `age > 18`
- Output: only `name` and `email` fields
- Output must be valid compact JSON (no pretty-printing)
- Handle malformed JSON gracefully (print error to stderr, exit non-zero)

## What This Tests

- JSON parsing (deserialization)
- JSON generation (serialization)
- Struct/type definition for shaped data
- Array filtering and transformation
- Stdin/stdout I/O
- Error handling for parse failures
