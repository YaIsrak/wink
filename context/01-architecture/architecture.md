# Architecture

## Overview

Single **Next.js (App Router, TypeScript) monolith** — frontend and backend
(API routes) in one deployable unit on Vercel. No separate backend service.

## Layers

```
app/            → routes, pages, API route handlers (thin)
components/     → UI components (shadcn-based + custom)
lib/
  services/     → business logic, called by API routes and/or server actions
  db/           → Prisma client instance
  supabase/     → Supabase client(s) — auth, storage, realtime
  validation/   → Zod schemas
actions/        → server actions (for mutations invoked directly from client)
```

- API route handlers and server actions stay thin: parse/validate input →
  call a service function → map result to response.
- All Postgres data access goes through **Prisma**. Supabase's JS client is
  used only for what Prisma doesn't cover: Auth, Storage, Realtime
  subscriptions.

## Authorization

Ownership-based: a user can only edit/delete their own posts, comments,
etc. Enforced in the service layer **and** via Supabase Row Level Security
— never the frontend alone.

## Error handling

All API errors return `{ error: { message, code } }`. See `api-design.md`.
Frontend surfaces these via Sonner toasts.

## Caching

Next.js built-in caching/revalidation only. No external cache layer.

## Background jobs

None, except a **weekly Vercel Cron job** hitting `/api/cron/keep-alive`
that performs a trivial Supabase read — this exists solely to prevent the
Supabase Hobby-plan project from auto-pausing due to inactivity.

## Real-time

Supabase Realtime powers:
- Direct messages (mutual follows only)
- Live notifications (likes, comments, follows, messages)

## Change policy

Any change to this document's structure requires explicit user approval
first (see `.agents/rules/architecture.md`).
