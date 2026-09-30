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

## 2026-09-28 (Spec 0005: Post model and creation with optimistic UI)

- Context: Phase 2 core feature: authoring posts with text caption, photos, and optimistic feed updates.
- Decision: Direct client-side upload to public `posts` bucket in Supabase Storage with user-scoped RLS policies. Post records persisted via Next.js Server Action (`createPostAction`) with Zod validation. Feed state managed via Zustand `usePostStore` with optimistic prepend, temporary UUID, posting state, and rollback on error without loss of drafted text.
- Alternatives considered: Server Action multipart streaming (rejected due to 413 payload limits and increased serverless function execution costs), local React 19 `useOptimistic` (rejected due to multi-surface coordination across global modal and inline feed composer).
## 2026-09-30 (Spec 0011: Realtime Direct Messages and Message Requests)

* Context: Phase 6 core feature: enabling real time chat between users who follow each other, while routing non mutual follows into a Message Requests tab.
* Decision: Used Supabase Realtime postgres changes channel combined with Realtime Presence for live online indicator lights. Conversations enforce follow prerequisites in the database service layer. Messages support soft deletion preserving rows for moderation, inline message editing with an edited indicator, and photo attachments via Supabase Storage messages bucket. Web Notifications API provides desktop push alerts alongside in app notification badges.
* Alternatives considered: Pure polling via React Query or SWR (rejected because real time chat demands immediate feedback and presence tracking), hard deleting messages (rejected to prevent broken conversation history and keep audit records), allowing arbitrary user messaging without follow checks (rejected to protect users from unsolicited spam).
