# AGENTS.md

## What this project is

A social media web app (working title: **Wink**) — users sign up, complete
a profile, post photos/captions, like/comment, follow each other, message
mutual follows in real time, and get notified of activity. Personal
portfolio project, built to comfortably support ~100 users.

Stack: Next.js (App Router, TypeScript) + Prisma + Supabase (Postgres, Auth,
Realtime, Storage) + Tailwind + shadcn/ui + Zustand. Full stack details in
`context/03-technical/tech-stack.md`.

## Where context lives

| Need to know about...                    | Read                       |
| ---------------------------------------- | -------------------------- |
| What we're building, MVP scope           | `context/00-project/`      |
| Folder structure, data model, API shape  | `context/01-architecture/` |
| Design system, component reuse, UX rules | `context/02-ui/`           |
| Exact stack, dependency policy           | `context/03-technical/`    |
| Build plan, progress, past decisions     | `context/04-development/`  |
| Hard constraints                         | `.agents/rules/`           |
| How to do a recurring task               | `.agents/skills/`          |

Read `context/00-project/vision.md` and `context/01-architecture/architecture.md`
before starting any non-trivial task if you haven't already this session.

## Rules you must follow

All files in `.agents/rules/` are binding. In short:

- Don't change architecture, data model, or add a major dependency without
  asking the user first.
- Don't create a new UI component without checking `context/02-ui/ui-registry.md`
  and the codebase first.
- Follow kebab-case file naming and the established folder structure.
- Every mutation is optimistic on the frontend; every data-fetching view has
  a skeleton state.
- Users may only modify/delete their own content (ownership checks, backed by
  Supabase RLS).

## How to approach a task

1. Understand the request.
2. Inspect relevant `context/` files.
3. Inspect existing code (search before creating — see `ui-registry.md` /
   relevant skill).
4. For a non-trivial feature: write a short plan and show the user before
   implementing.
5. Implement.
6. Verify your own work if asked; otherwise state what should be checked.
7. Update `context/04-development/progress-tracker.md`.
8. Log any notable decision in `context/04-development/decisions.md`.

## When to stop and ask for approval

- Any architecture or data-model change.
- Any new _major_ dependency (auth provider swap, new framework/library
  class — small utility packages are fine without asking).
- Anything not covered by existing context/rules where a wrong guess would
  be costly.

If unsure how a library behaves, research docs/web before deciding — don't
guess and don't silently assume.

## Verification

Verify only when the user asks. When you do, check against the checklist in
`context/04-development/build-plan.md` (Definition of Done): works, handles
errors, responsive, no console errors.

## Documentation

Update `progress-tracker.md` automatically as you complete work. Record
non-obvious decisions in `decisions.md`. Don't duplicate context content here
— this file stays a pointer, not a copy.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
