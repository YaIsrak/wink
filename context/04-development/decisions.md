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
