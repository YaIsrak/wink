# 0010. Notifications System: Rationale

## Context

Social platforms thrive on feedback loops. When people share photos, write captions, or follow others, they expect to know when someone responds. Without a dedicated notification mechanism, members have no easy way to know that their post received likes or comments unless they manually navigate back to inspect each post. This creates friction, slows down conversations, and leaves people feeling disconnected.

Several technical forces shape how notifications should be built for Wink. First, our architecture relies on Next.js App Router, Prisma ORM, and Supabase Postgres. Data integrity is vital: if a user deletes a post or a comment, any notification referencing that item must disappear cleanly rather than producing broken links or database errors. Second, notification privacy is essential. Notifications contain private activity traces, so database policies must prevent anyone other than the recipient from reading or altering them.

Another key force is user experience responsiveness. When an active member receives a like or comment while browsing Wink, waiting for a full manual page refresh feels sluggish. The desktop navigation sidebar and mobile navigation header already feature notification bell icons with badge counter placeholders wired to `useNotificationStore`. The notification system must breathe life into these visual indicators smoothly, while avoiding excessive server resource drain or complex background message queues.

Finally, action reversals happen regularly in social networks. People accidentally tap like and immediately tap again to undo it. Or they follow and immediately unfollow. If the system permanently recorded every momentary tap as a persistent unread notification, members would see confusing phantom alerts for actions that no longer exist.

## Options considered

### Option 1: Dedicated Prisma Notification Model with Service Layer Dispatch and Client Supabase Realtime Subscription (Recommended)

In this approach, we define a relational `Notification` model in Prisma with explicit foreign keys to the recipient, actor, post, and comment. Notification creation and removal logic lives in our existing TypeScript service layer (`like.service.ts`, `comment.service.ts`, `follow.service.ts`). When an action occurs, the service writes a notification record using Prisma. On the client side, a single global React hook in the navigation shell listens to Supabase postgres changes on the notifications table for the active user id, updating Zustand badge counters and displaying a toast alert.

**Pros**:
- Full type safety and testability in TypeScript without managing complex database triggers or procedural SQL functions.
- Postgres foreign keys with cascade deletions guarantee zero dangling references when posts or comments are removed.
- Seamless integration with Supabase Realtime for instant notification delivery without extra polling overhead.
- Direct alignment with our established project conventions across posts, comments, likes, and follows.

**Cons**:
- Service layer functions must remember to call notification helpers during mutations.
- Realtime WebSocket connections require modest active client connection resources on Supabase.

### Option 2: Database Triggers and Supabase Database Webhooks

In this approach, notifications are created automatically inside Postgres using database triggers on the `likes`, `comments`, and `follows` tables. A trigger function inserts rows into `notifications` whenever a row is added, and deletes rows when engagement records are removed.

**Pros**:
- Decouples notification creation from application code, guaranteeing notifications occur even if records are inserted via raw SQL or external tools.
- Centralizes creation logic inside the database engine.

**Cons**:
- SQL triggers split application business logic between TypeScript codebase and raw database migrations, making debugging and testing more cumbersome.
- Trigger errors can cause user facing mutations to fail unexpectedly with cryptic database error codes.
- Modifying notification rules or adding rich notification types requires writing and migrating PL/pgSQL procedures.

### Option 3: Periodic Client Polling without Realtime Subscriptions

In this approach, we create the Prisma model and service actions as in Option 1, but forego Supabase Realtime WebSocket subscriptions entirely. Instead, the browser runs a periodic timer (such as every 30 or 60 seconds) or refetches on route changes to refresh the unread notification count.

**Pros**:
- Avoids persistent WebSocket connections and channel state management.
- Simplest networking model with standard HTTP requests.

**Cons**:
- Noticeable latency: users may wait up to a minute before seeing that someone liked their post or commented.
- Wasteful network traffic from repeated polling when users are idle or when no new activity has occurred.
- Degrades the lively, responsive social feel of the app.

## Rationale

Option 1 is the most balanced and effective architecture for Wink. Our application logic already runs smoothly through modular service files in `lib/services/`. Keeping notification dispatch inside TypeScript alongside `toggleLike`, `createComment`, and `toggleFollow` keeps the codebase cohesive, transparent, and easy to maintain without maintaining separate database trigger scripts.

Using explicit foreign keys with `onDelete: Cascade` in Postgres gives us the best of both worlds: relational guarantees enforced by the database engine combined with simple TypeScript service calls. When a user deletes a post, Postgres immediately purges all like and comment notifications for that post in a single atomic transaction.

Furthermore, Supabase Realtime is already an approved foundational component of our tech stack. Subscribing to postgres changes on `public.notifications` filtered by `recipientId` gives our members immediate feedback the moment a peer engages with their profile, elevating Wink from a static site to a dynamic community.
