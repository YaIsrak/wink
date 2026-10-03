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

## 2026-09-30 (Spec 0012: Getting Started Checklist Widget)

- Context: Phase 3 gamification feature providing new members with clear onboarding milestones on the home feed.
- Decision: Milestone states are dynamically queried from live database tables (profiles, follows, posts, and messages) rather than maintaining duplicated boolean columns, preventing state drift. Once all four milestones are completed, a permanent dismissal writes a timestamp to `checklistDismissedAt` on the `User` table, syncing dismissal across all devices. View collapsing is persisted client side via Zustand `useUiStore`.
- Alternatives considered: Pure client side local storage tracking (rejected because dismissal does not sync across mobile and desktop devices and clearing browser data resurrects the widget), dedicated tracking table with audit rows for each step (rejected as unnecessary complexity and synchronization overhead for a portfolio scale application).

## 2026-10-01 — Heroicons & Theme-Adaptive Logo Migration

- Context: Standardizing the visual design language with Heroicons and rendering the custom Wink brand mark using `public/logo-dark.png` and `public/logo-light.png` based on the active theme.
- Decision: Replaced `lucide-react` with `@heroicons/react/24/outline` and `@heroicons/react/24/solid`. Built a dedicated `<Logo size={...} />` component that renders `logo-dark.png` with `dark:hidden` and `logo-light.png` with `hidden dark:block`. This pure CSS approach relies on the root `.dark` class set before hydration, guaranteeing 0ms flicker/flash on initial SSR/CSR load and seamless instant switching without client state re-render lag.
- Alternatives considered: React `useEffect` + state checking `useTheme` or `localStorage` to switch `<Image src={isDark ? ... : ...} />` (rejected due to initial render hydration mismatch and noticeable image swap flash).

## 2026-10-01 — Theme Tokens: Lime Primary (#c9f997), Magenta Secondary (#e92ed3), and Monochromatic Surfaces

- Context: Updating the application color scheme to feature `#c9f997` (lime) as primary and `#e92ed3` (magenta) as secondary, while keeping `#fefefe` / `#000000` for backgrounds and text.
- Decision: Set `--primary: #c9f997` with `--primary-foreground: #000000` for high contrast text readability. Constrained primary usage to interactive action buttons (`Button` default variant, mobile create action, active unread counter badges, and focus rings) to avoid visual fatigue. Set `--secondary: #e92ed3` with `--secondary-foreground: #ffffff` exclusively as a sparse highlight accent (text highlights, small milestone percentages, sparkle icons, and highlight badge variants). Migrated general neutral UI surfaces from `bg-secondary` to `bg-muted` to prevent unintentional saturation across chat bubbles, avatars, and lists.
- Alternatives considered: Applying primary color as large surface cards or headers (rejected to preserve clean readability and comply with user request "Dont use it too much").

## 2026-10-01 — App Router Loading Skeletons and Suspense Streaming Across All Routes

- Context: Server-side async data queries (Supabase auth session, profile fetching, feed queries, conversations, notifications, and search results) caused perceptible route transition delays where the UI froze before displaying the target page.
- Decision: Implemented Next.js App Router `loading.tsx` files for every route segment (`(main)/feed`, `(main)/notifications`, `(main)/messages`, `(main)/messages/[conversationId]`, `(main)/profile/[username]`, `(main)/profile`, `(main)/search`, `(main)/settings`, `(main)` fallback, `(onboarding)/onboarding`, and root fallback). Next.js automatically wraps each page in a React `<Suspense fallback={<Loading />}>` boundary under `NavigationShell`. The navigation shell remains completely interactive and responsive while the main content area renders high-fidelity skeletons immediately upon link click. In addition, internal dialog spinners and pagination spinners were upgraded to skeleton row placeholders.
- Alternatives considered: Client-side only loading flags inside components with manual fetch on mount (rejected — ruins SEO, introduces waterfall delays, and doesn't leverage Next.js streaming SSR).

## 2026-10-03 (Spec 0013: Premium Landing Page & Authenticated Redirect)

- Context: Unauthenticated visitors were previously bounced straight to `/login` when opening the root `/` URL, leaving no promotional or educational surface to discover Wink. Meanwhile, signed in users need immediate access to `/feed` without marketing delays.
- Decision: Configured `lib/supabase/middleware.ts` to recognize `/` as a public route for unauthenticated visitors while automatically redirecting active Supabase sessions to `/feed`. Reinforced this in server component `app/page.tsx` for zero flash navigation. Built a self contained landing experience with pure CSS electric mesh gradients, keyframe typography cycler, interactive mock preview cards, and bento grid using local typed fixtures, eliminating database queries and external image network dependencies on page load.
- Alternatives considered: Client side session evaluation inside a root layout wrapper (rejected due to jarring visual page flash for logged in members), separate marketing static subdomain (rejected due to unnecessary operational complexity and cross domain session friction).



