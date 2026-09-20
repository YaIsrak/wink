# MEMORY.md

Lightweight memory of decisions, discoveries, and lessons. **Not a task
tracker** — see `context/04-development/progress-tracker.md` for that.

## Project decisions

- Working title: **Wink** (placeholder — rename when finalized).
- Single Next.js monolith; no separate backend service.
- Supabase covers DB + Auth + Realtime + Storage — avoid introducing a second
  service for any of these unless a real limitation is hit.
- Prisma is the only data access layer for Postgres; don't mix in raw
  Supabase client queries for data that Prisma already models.
- DMs are restricted to mutual follows only — enforce this both in the UI
  and at the API/RLS layer, not just the UI.
- `/theme` page is the design-system source of truth. Build it before other
  UI screens. Every reusable UI decision (button variants, text styles,
  toast style, modal style) is confirmed there first.

## Known constraints

- Supabase **Hobby plan** — project pauses after a period of inactivity.
  Mitigated with a weekly Vercel Cron job hitting `/api/cron/keep-alive`.
  Do not remove this without replacing the mitigation.
- Portfolio scale (~100 users) — do not introduce infrastructure sized for
  much larger scale (queues, multi-region, read replicas, etc.).
- No automated tests in this project by decision — don't assume test files
  exist or should be added unless the user asks.

## Things the AI should not repeat

- Don't propose a separate backend/service split — explicitly rejected.
- Don't propose Stories/video/live-streaming/groups/payments — explicitly
  out of scope.
- Don't silently add global state beyond what's needed — Zustand is for
  cases React state genuinely doesn't cover.
- Don't create a new component without checking `ui-registry.md` and the
  codebase first — reuse/extend before creating.

## Implementation discoveries

_(empty — fill in as real implementation surfaces library quirks, gotchas,
or Supabase/Prisma-specific behavior worth remembering)_

## Known issues

_(empty — track ongoing known bugs/limitations here as they appear)_
