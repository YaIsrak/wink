# 0004. Responsive navigation shell with desktop sidebar and mobile navigation

**Date**: 2026-09-28
**Status**: Accepted

## Summary

This specification defines the responsive navigation shell for Wink. On desktop screens, a persistent left sidebar provides navigation to feed, explore, search, messages, notifications, and profile, alongside a create post button and a user card with logout. On mobile devices, a sticky top bar and a fixed bottom bar provide effortless thumb friendly navigation while keeping secondary actions in a profile sheet. Everything connects to our existing authentication actions and client stores without requiring new database changes.

## Requirements

**User stories**:
- As an authenticated user on desktop, I want a persistent left sidebar with clear links to feed, explore, search, messages, notifications, and profile so that I can move around the app effortlessly.
- As an authenticated user on desktop, I want my avatar, display name, handle, and a three dot menu with logout at the bottom of the sidebar so that I can see my active identity and sign out securely.
- As an authenticated user on desktop, I want a prominent Create Post button so that I can open the post composer dialog without losing my current view.
- As an authenticated user on mobile, I want a top bar with the Wink logo, notification bell, and direct message shortcuts so that I can see incoming activity immediately.
- As an authenticated user on mobile, I want a fixed bottom bar with Home, Explore, a center Create Post button, Inbox, and Profile so that I can navigate with one thumb.
- As an authenticated user on mobile, I want access to logout and account settings via a profile sheet or profile view so that the bottom bar stays clean and uncluttered.
- As a user, I want unread message and notification badge counters updated from the real time store so that I never miss new activity.

**Acceptance criteria**:
- **AC-1**: Desktop sidebar renders on screens with width 1024px and wider (Tailwind `lg` breakpoint), displaying the Wink logo, primary navigation links (Feed, Explore, Search, Messages, Notifications, Profile, Settings), a Create Post button, and a bottom user identity section.
- **AC-2**: The active navigation item is visually highlighted with a subtle container fill and high contrast text corresponding to the current URL pathname.
- **AC-3**: The desktop sidebar footer displays the authenticated user avatar (with presence indicator), display name, username `@handle`, and a three dot trigger opening a dropdown menu with profile link, settings link, theme toggle, and a functional Logout button that invokes `logoutAction`.
- **AC-4**: On mobile screens narrower than 1024px, the desktop sidebar is hidden, replaced by a sticky top header bar and a fixed bottom navigation bar with safe area padding.
- **AC-5**: The mobile top header bar displays the Wink logo and brand wordmark on the left, plus direct action icons for Notifications and Messages (with live unread badge counters) on the right.
- **AC-6**: The mobile bottom bar displays five items: Home (`/feed`), Explore (`/explore`), Center Create Post button, Inbox (`/messages`), and Profile (`/profile`).
- **AC-7**: Clicking the Create Post button on either desktop or mobile dispatches an open event to the UI store or modal manager, opening a shared modal dialog overlay without navigating away.
- **AC-8**: Clicking Search on either desktop or mobile navigates cleanly to `/search`.
- **AC-9**: Badge counters on Notifications and Messages render real numbers from `useNotificationStore` when greater than zero, and render compact red dots when space is constrained.
- **AC-10**: The base layout (`app/(main)/layout.tsx`) wraps all main application routes, providing server fetched user profile context and redirecting unauthenticated visitors to `/login` and uncompleted users to `/onboarding`.

## Decision

**Chosen option**: Option 1: Shared server layout shell with responsive client navigation subcomponents and Zustand modal coordination

The navigation shell lives in `app/(main)/layout.tsx` as a Server Component that validates session and onboarding status, fetches the authenticated user profile, and renders a client layout container. Desktop views render a persistent 260px wide left sidebar. Mobile views render a sticky top bar and fixed bottom navigation bar. Create Post triggers an interactive dialog modal, while Logout runs through the existing `logoutAction`.

**Implementation skills**: `tailwind-css-patterns` (`tailwindlabs/tailwindcss`, `.agents/skills/tailwind-css-patterns/SKILL.md`) · `shadcn` (`shadcn/ui`, `.agents/skills/shadcn/SKILL.md`) · `supabase` (`supabase/supabase-js`, `.agents/skills/supabase/SKILL.md`)

## Rationale

Reasoning and options: see rationale.md

## Feature design

**Data model sketch**:
No new database tables or columns are required. Navigation consumes existing `User` model fields from Prisma:
- `id`: string (UUID)
- `username`: string
- `displayName`: string
- `avatarUrl`: string (nullable)
- `onboardedAt`: DateTime (nullable)

Client state leverages existing Zustand stores:
- `useUiStore`: `sidebarOpen`, `activeModal`, `setActiveModal`, `closeModal`
- `useNotificationStore`: `unreadCount`, `unreadMessagesCount`

**State transitions**:
Navigation and modal states:
- `default`: Normal browsing view on any route under `app/(main)`.
- `create_post_open`: User clicked Create Post button, setting `activeModal = 'create-post'`. Post composer dialog overlay displays.
- `user_menu_open`: Desktop user clicked the three dot trigger on the sidebar footer card. DropdownMenu opens with Profile, Settings, Theme toggle, and Logout.
- `signing_out`: User clicked Logout. Action triggers pending loading spinner, executes `logoutAction`, displays success toast, and redirects to `/login`.

**API surface / Component architecture**:

| Component | Type | Location | Responsibilities |
|---|---|---|---|
| `MainLayout` | Server Component | `app/(main)/layout.tsx` | Enforces auth check, verifies `onboardedAt`, fetches user profile, wraps children |
| `NavigationShell` | Client Component | `components/layout/navigation-shell.tsx` | Coordinates responsive layout, handles safe areas, hosts dialog |
| `DesktopSidebar` | Client Component | `components/layout/desktop-sidebar.tsx` | Fixed left rail (width 260px), logo, nav list, Create Post, user footer |
| `MobileHeader` | Client Component | `components/layout/mobile-header.tsx` | Sticky top header, logo, notification bell with badge, DM icon with badge |
| `MobileBottomNav` | Client Component | `components/layout/mobile-bottom-nav.tsx` | Fixed bottom bar, 5 slots, center elevated plus button, active indicators |
| `UserNavCard` | Client Component | `components/layout/user-nav-card.tsx` | User avatar, name, handle, three dot trigger with DropdownMenu and Logout |
| `CreatePostDialog` | Client Component | `components/layout/create-post-dialog.tsx` | Controlled dialog modal wrapper hooked into `useUiStore` |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Verify user session | User authentication status | Supabase Server Client `supabase.auth.getUser()` in `layout.tsx` |
| Verify onboarding gate | `onboardedAt` timestamp | Prisma `User` record fetched via `getUserProfileById` |
| Display user identity in footer | Avatar URL, display name, handle | Prisma `User` record passed as props from Server Component |
| Render active tab highlight | Active boolean styling | Next.js client hook `usePathname()` comparing route path |
| Display notification badge count | Integer count or red dot | Zustand `useNotificationStore` state `unreadCount` |
| Display direct message badge count | Integer count or red dot | Zustand `useNotificationStore` state `unreadMessagesCount` |
| Open post composer | Dialog open state boolean | Zustand `useUiStore` state `activeModal === 'create-post'` |
| Execute sign out | Redirect to `/login` | Next.js Server Action `logoutAction` in `actions/auth.ts` |

**Key invariants**:
- The navigation shell must never trigger hydration mismatch errors between server rendered HTML and client rendered badge counters.
- Main page content must include appropriate left margin on desktop (`lg:pl-[260px]`) and bottom padding on mobile (`pb-20`) so content is never obscured by navigation rails.
- Unauthenticated visitors or users with null `onboardedAt` must be redirected before navigation components render.
- The mobile bottom bar must reserve proper space for mobile device home indicators (safe area inset bottom).

**Security model**:
- Route protection is enforced at the server layout level (`app/(main)/layout.tsx`) using `getUser()` and Prisma checks.
- Logout performs full session invalidation on the server via `supabase.auth.signOut()` before clearing browser state and redirecting.
- User data passed to navigation components is read directly from authenticated server sessions, preventing identity spoofing.

**Configuration required**:
- None. Uses existing Supabase and Next.js environment configuration.

**Critical test scenarios**:
- Happy path desktop: Authenticated user visits `/feed` on 1280px wide viewport, sees desktop sidebar with active feed link, user card with correct avatar and name, and clicks search link to navigate to `/search`, verifies **AC-1**, **AC-2**, **AC-3**, **AC-8**, **AC-10**.
- Happy path mobile: Authenticated user visits `/feed` on 375px wide viewport, verifies desktop sidebar is hidden, mobile header is visible with logo and badge icons, and bottom bar is present with 5 icons, verifies **AC-4**, **AC-5**, **AC-6**, **AC-10**.
- Create post modal trigger: User clicks Create Post button on desktop sidebar or center plus button on mobile bar, verifying that the modal dialog opens without page reload, verifies **AC-7**.
- User dropdown and logout: User clicks three dot button on desktop user card, sees dropdown menu, clicks Logout, verifies session is cleared and user is redirected to `/login`, verifies **AC-3**.
- Badges update: Zustand notification store unread count changes from 0 to 3, verifying that desktop message link and mobile header icon display badge pill '3', verifies **AC-9**.
- Auth security gate: Unauthenticated visitor attempts to navigate directly to `/feed` or `/explore`, verifying instant server redirection to `/login`, verifies **AC-10**.

## Build plan

1. [x] Create main server layout `app/(main)/layout.tsx` enforcing session authentication, onboarding completion check, and server user profile retrieval, satisfies **AC-10**.
2. [x] Build reusable navigation link component `components/layout/nav-item.tsx` supporting active route highlighting, hover states, and notification badge counters, satisfies **AC-2**, **AC-9**.
3. [x] Build user navigation card and dropdown component `components/layout/user-nav-card.tsx` rendering avatar, display name, handle, three dot trigger, DropdownMenu with settings and SignOutButton, satisfies **AC-3**.
4. [x] Build desktop sidebar component `components/layout/desktop-sidebar.tsx` with logo, navigation links, Create Post action button, and footer user card, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-7**, **AC-8**.
5. [x] Build mobile top header `components/layout/mobile-header.tsx` with Wink logo and notification/message action buttons with badge pills, satisfies **AC-4**, **AC-5**, **AC-9**.
6. [x] Build mobile bottom navigation bar `components/layout/mobile-bottom-nav.tsx` with five slots, elevated center create button, and safe area insets, satisfies **AC-4**, **AC-6**, **AC-7**, **AC-8**.
7. [x] Build post composer modal dialog container `components/layout/create-post-dialog.tsx` connected to `useUiStore`, satisfies **AC-7**.
8. [x] Assemble all layout components into `components/layout/navigation-shell.tsx` and connect inside `app/(main)/layout.tsx`, updating `app/(main)/feed/page.tsx` to remove temporary top header, satisfies **AC-1**, **AC-4**, **AC-10**.

## Consequences

**Positive**:
- Establishes the core user interface foundation and visual identity for all subsequent feature views (feed, explore, notifications, messages, profile).
- Faithful implementation of both desktop and mobile design references (`feed-desktop.png` and `feed-mobile.png`).
- Seamless responsive transition between desktop sidebar and mobile top/bottom bars.
- Zero database overhead or migrations required.
- Reuses existing UI primitives (`Avatar`, `Button`, `Badge`, `DropdownMenu`, `Dialog`) and authentication actions.

**Negative / tradeoffs**:
- Navigation wrapper adds client side shell complexity to coordinate active tabs and dialog state.
- Pages in `app/(main)` must account for responsive padding margins on both desktop and mobile.

**Neutral**:
- Search currently routes to `/search` which will need a dedicated page in Phase 3.
- Create Post modal shell will be populated with full photo upload and caption logic in Phase 2.

## Follow-up

- [x] Create stub page for `/search` in `app/(main)/search/page.tsx` so clicking search link does not trigger 404.
- [ ] Connect full post creation form into `CreatePostDialog` when implementing Phase 2 (post model and feed).
- [ ] Add real time Supabase channel listener to increment notification badges when events fire.
