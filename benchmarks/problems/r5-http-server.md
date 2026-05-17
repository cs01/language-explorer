# R5: HTTP Server

## Problem

Start an HTTP server on port 8080 that responds to `GET /hello?name=X` with a JSON greeting, and returns 404 for all other routes.

## Endpoints

### GET /hello?name=World

Response (200):
```json
{"greeting": "Hello, World!"}
```

If `name` parameter is missing, default to "World".

### Everything else

Response (404):
```json
{"error": "not found"}
```

## Constraints

- Listen on port 8080
- Content-Type: application/json for all responses
- Proper HTTP status codes (200, 404)
- Graceful shutdown not required (can block forever)
- Use the language's stdlib or most common/idiomatic HTTP library

## What This Tests

- HTTP server setup and routing
- Query parameter parsing
- JSON response construction
- String interpolation/formatting
- Library/framework ceremony
- Import/dependency overhead
