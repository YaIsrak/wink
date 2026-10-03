# 0013. Premium landing page and authenticated redirect

**Date**: 2026-10-03
**Status**: Accepted

## Summary

This specification introduces a public landing page for Wink at the root path while sending signed in users straight to their feed. Visitors meet an animated headline that cycles past internet clichés, backed by electric lime and magenta gradients, a floating mock post preview, and honest human copy. The page loads with zero database overhead because all preview cards use local fixtures. The middleware and server page work together to stop unauthenticated redirects to the login screen and eliminate visual flicker for active members.

## Context

Wink currently forces every visitor directly to the login screen or feed without an introductory home. Unauthenticated visitors who visit the root route get bounced to the login page by the Supabase session middleware, while the root page component itself contains a hardcoded redirect to the feed. Prospective users have no way to learn what Wink offers, what makes its community distinct, or why they should create an account.

A modern social platform needs a front door that communicates its identity immediately. At the same time, returning members must never wait on marketing graphics when they want to check new posts and direct messages. The landing experience must preserve the rapid loading speed of the existing application, align with the established dark and light design system, and maintain clean separation between public marketing content and authenticated application logic.

Failing to establish a dedicated landing surface leaves visitors confused and lowers conversion to registration. Building a marketing surface that relies on live database queries would risk slow initial loads and database connection fatigue on the Supabase Hobby tier. A self contained presentation layer solves both concerns while delivering a distinct human feel.

## Requirements

**User stories**:
* As an unauthenticated visitor, I want to explore what Wink is all about on the home page so that I can decide whether to create an account.
* As an authenticated member, I want to open the root URL and arrive immediately at my personal feed so that I never see promotional material meant for strangers.
* As a visitor on mobile or desktop, I want a responsive, fast loading experience with accessible theme controls and clear links to sign in or register.

**Acceptance criteria**:
* **AC-1**: Unauthenticated visitors loading the root route view the full landing page without being redirected to the login screen.
* **AC-2**: Authenticated visitors loading the root route get redirected immediately to the feed route on the server without client side page flash or visible layout shift.
* **AC-3**: The hero section displays an animated text cycler rotating through relatable internet phrases including 'brain rot', 'corporate cringe', 'endless doomscrolling', and 'fake influencers' using smooth CSS keyframe transitions.
* **AC-4**: The visual styling integrates electric lime (`#c9f997`) and magenta (`#e92ed3`) mesh gradient accents on dark and light backgrounds using semantic tokens from the design system.
* **AC-5**: The page displays an interactive mock post preview card and bento feature grid built with pure CSS graphics and static fixtures, requiring zero database queries or external network requests.
* **AC-6**: The navigation bar stays fixed at the top of the viewport, hides smoothly when the user scrolls down, and reappears when the user scrolls up, featuring brand logo, theme toggle, and registration triggers.

## Options considered

### Option 1: Middleware and server page session gate with self contained static preview components

The proxy middleware updates its routing table to treat the root route as public for guests while redirecting authenticated sessions to the feed. The root page component performs an async server session check as defense in depth. Marketing components live in dedicated client and server modules with static fixtures and CSS animations.

**Pros**:
* Zero client side flash for logged in members because redirects happen before HTML streaming starts.
* Instant time to first byte for new visitors because no database queries block page generation.
* Zero external asset dependencies through pure CSS geometric placeholders and local avatars.

**Cons**:
* Requires coordinating both the middleware matcher logic and the server page component.

### Option 2: Client side session evaluation inside a root layout wrapper

The root route serves a single client component that checks the Supabase session in a browser effect and executes a router push to the feed if a user session exists.

**Pros**:
* Simple single file implementation without touching middleware routing logic.

**Cons**:
* Causes noticeable visual flash where logged in members see the landing hero for a brief moment before jumping to the feed.
* Degrades search engine optimization and performance metrics.

### Option 3: Separate marketing subdomain with external static site generator

Host the landing page on a separate promotional site or static domain, pointing links back to the main application app router.

**Pros**:
* Completely isolates marketing assets from application source code.

**Cons**:
* Adds operational overhead, additional DNS configuration, and cross domain cookie handling complexity for a personal portfolio project.

## Decision

**Chosen option**: Option 1: Middleware and server page session gate with self contained static preview components

We implement server side session detection in the middleware and root page component, pairing it with self contained landing components that use pure CSS gradients, keyframe typography animations, and static fixtures.

**Implementation skills**: `shadcn` (community, `.agents/skills/shadcn/`) · `tailwind-utility-classes` (community, `.agents/skills/tailwind-utility-classes/`) · `tailwind-css-patterns` (community, `.agents/skills/tailwind-css-patterns/`)

## Rationale

Option 1 provides the cleanest user experience because authenticated members never experience a jarring flash of marketing text before their feed appears. Handling the session verification in `lib/supabase/middleware.ts` alongside an identical check in `app/page.tsx` guarantees that direct navigations, cached visits, and manual address bar inputs behave consistently.

Keeping the landing page self contained with pure CSS graphics and local fixtures avoids database queries on page load. This respects the connection limits of the Supabase Hobby plan and ensures that visitors on slow cellular connections receive an immediate visual response. The witty and human tone pairs naturally with the electric lime and magenta accents already defined in `app/globals.css`.

## Feature design

**Data model sketch**:
No new database models or migrations are required. The landing page is completely presentation oriented. Preview post cards, member testimonials, and creator statistics use typed static mock fixtures defined in `lib/data/landing-fixtures.ts`.

**State transitions**:
The landing page contains no stateful backend lifecycle. Client components maintain minimal local state:
* `isScrolledDown`: boolean state in the navigation bar to trigger hide or reveal transforms.
* `activePhraseIndex`: numeric index in the hero cycler advancing every three seconds.
* `mockLiked`: local optimistic boolean state on the preview post card for interactive engagement demonstration.

**API surface**:
| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| / | GET | none | HTML landing page stream | Public for guests, auto redirect for users | 500 server error |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Load root route as guest | Render landing hero and bento features | Static data fixtures in `lib/data/landing-fixtures.ts` |
| Load root route as member | Redirect HTTP 307 to `/feed` | Supabase auth cookie read in middleware and server page |
| Cycle hero highlight text | Animated phrase string | Local rotating array `['brain rot', 'corporate cringe', 'endless doomscrolling', 'fake influencers']` |
| Render preview post card | Author name, handle, caption, like counter | Local typed mock object in `lib/data/landing-fixtures.ts` |
| Scroll viewport | Header translateY transform class | Browser `window.scrollY` delta evaluated in client hook |

**Key invariants**:
* Authenticated members must never see the landing page contents under normal navigation.
* Unauthenticated visitors must never be blocked from reading the landing page by route middleware.
* The landing page must render with zero external image network dependencies so broken links cannot occur.
* The page must fully support both dark theme and light theme through semantic CSS tokens.

**Security model**:
The landing route is completely public. No sensitive user information or internal database identifiers are exposed. Calls to register or sign in route directly to the hardened authentication endpoints `/sign-up` and `/login`.

**Critical test scenarios**:
* Happy path guest: Unauthenticated visitor requests `/`, receives 200 OK with landing page hero, animated text cycler, and call to action buttons, verifies **AC-1**, **AC-3**, **AC-4**, **AC-5**
* Happy path member: User with valid Supabase session cookie requests `/`, receives 307 redirect directly to `/feed` with zero landing page markup rendered, verifies **AC-2**
* Navigation scroll reaction: Scrolling down past 80 pixels hides the top navigation bar, scrolling upward immediately brings it back into view, verifies **AC-6**
* Interactive preview: Clicking the heart button on the mock post preview increments the count with optimistic pop animation without sending a network request, verifies **AC-5**

## Build plan

1. [x] Update route protection in `lib/supabase/middleware.ts` to allow unauthenticated access to `/` while redirecting active sessions to `/feed`, satisfies **AC-1**, **AC-2**
2. [x] Update `app/page.tsx` to verify the Supabase session on the server, redirecting authenticated members to `/feed` and rendering the landing view for guests, satisfies **AC-1**, **AC-2**
3. [x] Create typed mock fixtures in `lib/data/landing-fixtures.ts` for preview posts, creator stats, and bento grid feature cards, satisfies **AC-5**
4. [x] Build `components/landing/landing-navbar.tsx` with hide on scroll behavior, brand logo, theme toggle, and auth navigation links, satisfies **AC-6**
5. [x] Build `components/landing/hero-section.tsx` with electric gradient mesh background, animated phrase cycler, and action buttons, satisfies **AC-3**, **AC-4**
6. [x] Build `components/landing/mock-post-card.tsx` with pure CSS graphics, interactive like button, and playful comment snippets, satisfies **AC-4**, **AC-5**
7. [x] Build `components/landing/bento-grid.tsx` showcasing mutuals only messaging, chronological feeds, and real time presence with quirky human copy, satisfies **AC-4**, **AC-5**
8. [x] Build `components/landing/landing-footer.tsx` with playful sign off copy, quick navigation links, and registration call to action, satisfies **AC-4**
9. [x] Assemble all components in `components/landing/landing-page-view.tsx` with responsive layout, semantic theme tokens, and smooth scroll transitions, satisfies **AC-1**, **AC-3**, **AC-4**, **AC-5**

## Consequences

**Positive**:
* Gives Wink an engaging, human front door that explains the platform before registration.
* Eliminates cold start database latency on the home page through static fixture architecture.
* Seamless transition for existing members who bypass the landing page entirely.
* Reinforces the brand identity with electric lime and magenta accents.

**Negative / tradeoffs**:
* Requires maintaining static mock fixtures if core post UI styling evolves significantly.
* Introduces scroll listener logic in the landing navigation bar that must be cleaned up on unmount.

**Neutral**:
* The root route changes from a pure redirect into an active page segment.
* Next.js metadata and open graph tags should be added to the root page for social link unfurling.

## Follow-up

- [ ] Add open graph preview metadata and twitter card images for the landing page in `app/page.tsx`
- [ ] Add automated Playwright integration test verifying unauthenticated access and authenticated redirect on root route
