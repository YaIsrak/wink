# Decisions Log

Record of meaningful project decisions and the reasoning behind them.

## Format

```
## [Date] — [Decision]
- Context: why this came up
- Decision: what was decided
- Alternatives considered (if any)
```

---

## 2026-09-19 — Initial project setup

- Context: Project kickoff via Project Context Architect interview.
- Decision: Next.js monolith + Supabase (Auth/DB/Storage/Realtime) +
  Prisma + shadcn/ui + Zustand, deployed on Vercel. No automated testing.
  Weekly Vercel Cron ping to prevent Supabase Hobby-plan pause.
- Alternatives considered: separate backend service (rejected — unnecessary
  for scale); raw Supabase client only, no Prisma (rejected — wanted typed
  schema/migrations).

## 2026-09-20 — Next.js 16 proxy.ts & Prisma 6 Pinning

- Context: Supabase SSR integration and Prisma setup on Next.js 16.3.5.
- Decision: Used Next.js 16's official `proxy.ts` convention instead of deprecated `middleware.ts` for cookie session refresh. Pinned Prisma CLI and `@prisma/client` to stable v6.19.3 rather than v8-rc to maintain compatibility with standard Prisma ORM commands (`generate`, `validate`, `db push`).
- Alternatives considered: Prisma 8 RC (rejected — overhauled developer platform CLI lacking standard ORM generate/db commands).

## 2026-09-27 (Spec 0003: Onboarding and profile picture storage)

- Context: Newly registered users need to configure their display name, bio, and avatar before using the application.
- Decision: Direct browser upload to Supabase Storage avatars bucket using react-easy-crop inside a shadcn dialog modal, with profile updates persisted through Next.js Server Actions. Layout is strictly bounded to a max-w-xl container.
- Alternatives considered: Server action multipart streaming without cropping (rejected because avatars require consistent square framing and server streaming adds memory pressure), full client side database mutations (rejected to maintain Prisma schema validation).

