# 0001. Zustand Store Scaffold and Supabase Keep Alive Cron

**Date**: 2026-09-20
**Status**: Accepted

## Summary

This decision establishes client side global state management and database activity maintenance for the application. We use Zustand with multiple focused stores to manage client state, persisting user interface preferences to local storage while keeping authentication and notification data in memory. A scheduled weekly cron route performs a lightweight read on Supabase Postgres to prevent project pausing on the Hobby plan.

## Context

The application needs client state management for upcoming authentication, navigation, and notification flows. Next.js App Router keeps data fetching on the server, but client components require shared state for modals, active tabs, and optimistic updates without prop drilling.

At the same time, Supabase Hobby tier projects pause automatically after seven days of inactivity. Because Wink is currently in active development and early preview, prolonged pauses would cause connection delays or downtime for reviewers. We need an automated keep alive ping that executes a lightweight database query on a regular schedule through Vercel Cron.

## Requirements

**User stories**:
- As a visitor or user, I want my interface preferences (such as open modal states and active tab choices) preserved when I reload the page so that my navigation flow is not disrupted.
- As a developer, I want modular client stores for auth, ui, and notifications so that components only subscribe to the state they care about.
- As an administrator, I want the Supabase database kept active continuously so that the project never enters a paused state due to inactivity.

**Acceptance criteria**:
- **AC-1**: Zustand stores are created in `lib/store/` as modular stores: `useAuthStore` for session state, `useUiStore` for interface flags, and `useNotificationStore` for live alert indicators.
- **AC-2**: `useUiStore` uses Zustand persist middleware to synchronize interface preferences to browser localStorage with hydration safety in Next.js SSR.
- **AC-3**: Next.js route handler at `app/api/cron/keep-alive/route.ts` executes a minimal Prisma query (`prisma.user.findFirst`) and returns a JSON status response with timestamp.
- **AC-4**: `vercel.json` configures a cron job calling `/api/cron/keep-alive` every Sunday at midnight (`0 0 * * 0`).

## Options considered

### Option 1: Multiple Modular Stores with Local Storage Persistence for UI (Chosen)

Create independent store hooks in `lib/store/` (`auth-store.ts`, `ui-store.ts`, `notification-store.ts`) and persist only the UI slice to localStorage.

**Pros**:
- High modularity: components only re-render when their specific store changes.
- Avoids serializing transient or sensitive data like session tokens into localStorage.
- Clean hydration boundary for Next.js client components.

**Cons**:
- Slightly more boilerplate than a single global store file.

### Option 2: Single Monolithic Store with Full Memory Storage

Combine all slices into a single unified store without any localStorage persistence.

**Pros**:
- Single hook import across the application.
- No hydration mismatch considerations.

**Cons**:
- All UI preferences reset on every browser reload.
- Unrelated state changes can trigger unnecessary selector evaluations across components.

## Decision

**Chosen option**: Option 1: Multiple Modular Stores with Local Storage Persistence for UI.

We will create modular stores in `lib/store/` for auth, ui, and notifications, persisting UI preferences in browser storage, and implement a weekly Vercel Cron route at `/api/cron/keep-alive`.

**Implementation skills**: `supabase` (`supabase/agent-skills`, `.agents/skills/supabase/`)

## Rationale

Modular stores keep concerns clean and prevent unnecessary re-renders. Storing UI preferences in localStorage gives users a persistent feel without polluting server cookies or leaking session data into unencrypted storage.

For database keep alive, a public route handler executing `prisma.user.findFirst` on Sunday midnight provides the ideal frequency. It easily satisfies Supabase seven day inactivity rules without producing unnecessary query traffic or consuming serverless compute limits.

## Feature design

**Data model sketch**:
No new database tables are created. The keep alive endpoint queries the existing `users` table created in Phase 0.

**State transitions**:
- UI store: `sidebarOpen` toggles between true and false; `activeTab` switches between route categories; `activeModal` sets to modal identifier or null.
- Auth store: `setUser(user)` on login; `clearUser()` on sign out; `isLoading` flag during session hydration.
- Notification store: `unreadCount` increments on incoming events, resets on mark as read.

**API surface**:
| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| /api/cron/keep-alive | GET | None | `{ status: "ok", timestamp: string }` | Public | 500 database error |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Ping keep alive | Database connection check | Query result from `prisma.user.findFirst` |
| Ping keep alive | Execution timestamp | Server clock ISO string `new Date().toISOString()` |
| Persist UI state | Active tab and modal state | Browser localStorage via Zustand persist |

**Key invariants**:
- Keep alive route must always return JSON and never throw an unhandled exception that crashes the worker.
- Persistent UI store must handle Next.js client hydration cleanly without flashing mismatch warnings.

**Security model**:
- The cron route is public and performant, running an indexed read query with zero write permissions.
- Client stores never persist sensitive database passwords or auth tokens into browser storage.

**Configuration required**:
- `vercel.json`: registers crons array with path `/api/cron/keep-alive` and schedule `0 0 * * 0`.

**Critical test scenarios**:
- Happy path: `GET /api/cron/keep-alive` returns HTTP 200 with `{ status: "ok" }`, verifies **AC-3**.
- State persistence: changing a UI flag in `useUiStore` persists into localStorage and recovers after page refresh, verifies **AC-2**.
- Store segregation: updating `useNotificationStore` does not cause consumers of `useAuthStore` to re-render, verifies **AC-1**.
- Vercel Cron configuration: `vercel.json` validates with correct cron schedule syntax, verifies **AC-4**.

## Build plan

1. Install `zustand` dependency in `package.json`, satisfies **AC-1**.
2. Create `lib/store/ui-store.ts` with persist middleware for UI preferences, satisfies **AC-2**.
3. Create `lib/store/auth-store.ts` for user session memory state, satisfies **AC-1**.
4. Create `lib/store/notification-store.ts` for real time badge counters, satisfies **AC-1**.
5. Create barrel export in `lib/store/index.ts`, satisfies **AC-1**.
6. Create `app/api/cron/keep-alive/route.ts` with Prisma query and error handling, satisfies **AC-3**.
7. Create `vercel.json` with weekly cron schedule, satisfies **AC-4**.

## Consequences

**Positive**:
- Clear and predictable client state architecture ready for Phase 1 Auth and layout components.
- Automatic prevention of Supabase project dormancy.
- UI preferences survive page reloads.

**Negative / tradeoffs**:
- Storing state in localStorage requires hydration awareness in client components (such as checking mounted state before rendering persisted values).
- Public cron route could be pinged by external crawlers, though it performs only a single read query.

**Neutral**:
- Developers must import the specific store needed rather than relying on one catch all store.

## Follow-up

- [ ] Connect `useAuthStore` to Supabase client auth listener once Phase 1 Auth pages are built.
- [ ] Connect `useNotificationStore` to Supabase Realtime channel once Phase 3 Notifications are built.
