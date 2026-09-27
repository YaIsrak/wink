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
## 2026-09-27 — Phase 1: Authentication & Route Protection
- Ratified build spec `docs/specs/0002-authentication-setup.md`
- Installed `zod` and configured schemas in `lib/validation/auth.ts` with strict password rules and live criteria evaluation
- Implemented `lib/services/auth.service.ts` for Prisma user profile provisioning and username/email availability checks
- Created server actions in `actions/auth.ts` for `signUpAction`, `loginAction`, and `logoutAction` using `@supabase/ssr`
- Built reusable `components/auth/password-input.tsx` with live criteria checklist and show/hide visibility toggle
- Built reusable `components/auth/auth-card.tsx` and `components/auth/sign-out-button.tsx`
- Created dedicated pages `app/(auth)/login/page.tsx`, `app/(auth)/sign-up/page.tsx`, and `app/(auth)/layout.tsx`
- Enforced route protection in `lib/supabase/middleware.ts` and `proxy.ts`: unauthenticated guests redirected to `/login`, authenticated users redirected to `/feed`
- Added placeholder landing views `app/(main)/feed/page.tsx` and `app/(onboarding)/onboarding/page.tsx`
## 2026-09-27 — Fix: Dark Mode Theming Across All Views
- Diagnosed root cause: `/feed` and `/onboarding` were hardcoded with `bg-zinc-50 dark:bg-black` and `bg-white/80 dark:bg-zinc-950/80` instead of semantic tokens; `:where()` in custom variant flattened specificity, allowing light classes to override dark backgrounds while text turned white on white
- Upgraded `app/globals.css`: added `@source` directives for `../app` and `../components`, upgraded `@custom-variant dark (&:is(.dark, .dark *))` to maintain proper variant specificity
- Added pre-hydration theme initialization script in `app/layout.tsx` `<head>` and corrected `suppressHydrationWarning` prop on `<html>` to eliminate theme flash
- Refactored `app/(main)/feed/page.tsx`, `app/(onboarding)/onboarding/page.tsx`, `app/(auth)/layout.tsx`, `app/(auth)/login/page.tsx`, `app/(auth)/sign-up/page.tsx`, and all UI primitives (`Button`, `Card`, `Input`, `Textarea`, `Dialog`, `DropdownMenu`, `Avatar`, `Badge`, `Skeleton`) to use semantic design tokens (`bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-muted-foreground`, etc.)
- Verified full Next.js Turbopack production build with zero errors
- Status: Done


