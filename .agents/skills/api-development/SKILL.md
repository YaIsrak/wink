# Skill: API Development

How to add or change a Next.js API route in this project.

## Pattern

- Route handler (`app/api/.../route.ts`) responsibilities: parse/validate
  input (Zod), call the service layer, map the result to a response. Keep
  it thin.
- Business logic lives in `lib/services/<entity>.service.ts`.
- Ownership/authorization checks happen in the service layer.
- Errors follow the standard shape from `context/01-architecture/api-design.md`:
  `{ error: { message, code } }`.
- Successful responses return only the data the client needs — no leaking
  of internal fields.

## Steps

1. Check `context/01-architecture/api-design.md` for existing route/response
   conventions.
2. Check if a service function already covers this operation before writing
   a new one.
3. Define/reuse a Zod schema for the input.
4. Implement the route + service function.
5. Confirm the frontend caller handles the optimistic-update + rollback
   pattern (see `ui-development` skill) if this route backs a mutation.
