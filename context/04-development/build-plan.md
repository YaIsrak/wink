# Build Plan

Phased, incremental plan. Each task should be small and independently
verifiable. Don't plan implementation details not yet necessary.

## Definition of Done (checklist, applies to every task/feature)

- [ ] Works as specified
- [ ] Errors are handled (API + UI, with a Sonner toast on failure)
- [ ] Responsive (mobile + desktop checked)
- [ ] No console errors/warnings
- [ ] Follows conventions in `context/01-architecture/` and `.agents/rules/`
- [ ] `progress-tracker.md` updated

---

## Phase 0 — Foundation

- Initialize Next.js (TS, App Router), Tailwind, shadcn/ui
- Set up Supabase project (Auth, Postgres, Storage, Realtime enabled)
- Set up Prisma, connect to Supabase Postgres, initial schema (User only)
- Set up Zustand store scaffold
- Build the **`/theme`** design-system preview page (text styles, buttons +
  animated states, toasts, dropdowns, modals, skeletons, light/dark toggle)
- Set up Vercel project + deployment pipeline
- Set up weekly Vercel Cron → `/api/cron/keep-alive`

## Phase 1 — Core infrastructure

- Supabase Auth integration (sign up / login, email-based)
- Onboarding flow (profile fields, avatar upload to Supabase Storage)
- Profile completion % calculation + banner component
- Base layout: navbar (mobile bottom nav + desktop sidebar), theme toggle

## Phase 2 — Core features

- Post model + create post (photo/caption) with optimistic UI
- Home feed (posts from follows) with skeleton loading
- Like (optimistic) + comment
- Follow / unfollow (optimistic)
- Profile page (own + others')

## Phase 3 — Secondary features

- Explore/discover feed
- Search (users, posts)
- Notifications (list + real-time updates)
- "Getting Started" checklist widget wired to real completion state

## Phase 4 — UI/UX refinement

- Empty states across all list views
- Motion/micro-interaction pass (like button pop, hover/press states)
- Full light/dark mode pass
- Accessibility pass (contrast, alt text, keyboard nav)

## Phase 5 — Testing

- Manual verification pass against Definition of Done for every screen
- (No automated tests per project decision)

## Phase 6 — Production readiness

- Real-time DMs (mutual-follows only) end-to-end, including RLS
  verification
- Final RLS audit across all tables
- Verify Vercel Cron keep-alive is working
- Final responsive + dark/light QA pass
- Deploy to production
