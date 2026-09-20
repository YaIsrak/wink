# Progress Tracker

Living log of completed work. Updated automatically as features are
finished. Not a planning document — see `build-plan.md` for that.

## Format

```
## [Date] — [Feature/Task]
- What was done
- Status: Done | In Progress | Blocked
```

---

## 2026-09-20 — Phase 0: Tailwind v4 & /theme Design System Page

- Configured Tailwind CSS v4 using CSS-first `@theme` and `@custom-variant dark` in `app/globals.css`
- Mapped design tokens, monochrome palette, typography scale (Inter), and micro-radii from `context/design/code/DESIGN.md`
- Built core UI primitives (`Button`, `Input`, `Textarea`, `Badge`, `Card`, `Skeleton`, `Avatar`, `Dialog`, `DropdownMenu`, `ThemeToggle`)
- Registered primitives in `context/02-ui/ui-registry.md`
- Integrated Sonner toast notifications in `app/layout.tsx`
- Built comprehensive `/theme` living source-of-truth preview page with interactive states, toasts, dialogs, inputs, skeletons, and light/dark toggle
- Refined geometry: increased roundness on buttons (`rounded-lg`/`rounded-xl`), cards & dialogs (`rounded-xl`), inputs (`rounded-lg`), removed sticky header navbar from `/theme`, and updated UI registry
- Status: Done

## 2026-09-20 — Phase 0: Supabase Initialization & Environment Setup

- Linked project ref `vscdkxryxsbswisebmvl` across environment files and root `.mcp.json`
- Created `.env.example`, `.env.local`, and `.env` with prefilled Supabase URL and key placeholders
- Updated `.gitignore` to allow `.env.example` while keeping `.env*` ignored
- Installed `@supabase/supabase-js`, `@supabase/ssr`, `@prisma/client`, and `prisma` CLI
- Configured browser client in `lib/supabase/client.ts` and async SSR server client in `lib/supabase/server.ts`
- Added session refresh helper `lib/supabase/middleware.ts` and Next.js 16 `proxy.ts`
- Initialized `prisma/schema.prisma` with User model matching `data-model.md` and singleton client in `lib/db/index.ts`
- Generated Prisma client and verified build with `npx tsc --noEmit` and `npm run build`
- Status: Done

## 2026-09-20 — Phase 0: Zustand Store Scaffold & Supabase Keep-Alive Cron

- Deliberated and ratified build spec `docs/specs/0001-zustand-scaffold-and-supabase-keep-alive.md`
- Installed `zustand` and configured modular client stores:
  - `lib/store/ui-store.ts` with `persist` middleware synchronizing navigation/modal state to localStorage
  - `lib/store/auth-store.ts` for memory-only session and user state
  - `lib/store/notification-store.ts` for real-time counters and badges
  - `lib/store/index.ts` barrel export
- Built `/api/cron/keep-alive` route handler in `app/api/cron/keep-alive/route.ts` performing a lightweight read query (`prisma.user.findFirst`)
- Configured weekly Sunday midnight schedule in `vercel.json` (`0 0 * * 0`) to prevent Supabase Hobby plan pausing
- Verified end-to-end database query execution and Next.js production build
- Status: Done


