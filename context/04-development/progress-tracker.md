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

