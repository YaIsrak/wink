# API Design

## Conventions

- REST-ish routes under `app/api/<resource>/...`, plus server actions
  (`actions/`) for client-invoked mutations where that's more ergonomic
  than a route handler.
- Route handlers are thin — validate input, call `lib/services/*`, shape the
  response.

## Response shapes

**Success**
```json
{ "data": { ... } }
```

**Error**
```json
{ "error": { "message": "Human-readable message", "code": "SOME_CODE" } }
```

- Use meaningful `code` values (e.g. `NOT_FOUND`, `FORBIDDEN`,
  `VALIDATION_ERROR`) so the frontend can branch on them if needed, but
  always show `message` via a Sonner toast for the user.

## Validation

All input validated with Zod before reaching the service layer. Return
`VALIDATION_ERROR` with a clear message on failure.

## Auth

Requests are authenticated via Supabase session (cookie-based in Next.js
middleware/route handlers). Unauthenticated requests to protected routes
return `401` with `{ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }`.

## Ownership

Mutating routes (edit/delete post, comment, etc.) check that the
authenticated user owns the resource; otherwise return `403 FORBIDDEN`.
