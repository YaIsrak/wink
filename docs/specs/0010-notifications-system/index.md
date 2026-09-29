# 0010. Notifications System

**Date**: 2026-09-29
**Status**: Accepted

## Summary

This specification establishes the comprehensive notification system for Wink. It allows community members to receive instant updates whenever another user likes their post, leaves a comment, or follows their account. An interactive notifications page at `/notifications` provides chronological filtering between all activities and unread updates, with one click action to mark all items as read. A live Supabase Realtime channel keeps notification counters in the desktop sidebar and mobile header synchronized instantly while presenting friendly toast notifications for active users.

## Requirements

**User stories**:
- As an active member, I want to receive a notification when another person likes my post, comments on my post, or follows my account so that I stay connected with community engagement.
- As an active member, I want to see a live badge indicator in the navigation bar when new notifications arrive so that I know there is fresh activity without refreshing the page.
- As an active member, I want to browse my notifications chronologically, switch between All and Unread views, and see clean previews of the actor, post, or comment content.
- As an active member, I want clicking a notification to navigate straight to the relevant profile or post while marking that notification as read.
- As an active member, I want to mark all unread notifications as read with a single click so that I can quickly clear my inbox.
- As a creator, I do not want to receive notifications for actions I take on my own content, such as liking or commenting on my own post.

**Acceptance criteria**:
- **AC-1**: Database schema includes a `Notification` model with an explicit enum `NotificationType` (`LIKE`, `COMMENT`, `FOLLOW`), foreign key relations to recipient, actor, post, and comment, and cascading deletions when posts or comments are deleted.
- **AC-2**: Supabase Row Level Security on the `notifications` table restricts SELECT, UPDATE, and DELETE operations strictly to rows where `auth.uid() = recipient_id`.
- **AC-3**: Liking a post creates a `LIKE` notification for the post author, unless the actor is the post author.
- **AC-4**: Unliking a post immediately removes the associated `LIKE` notification row so the recipient does not see ghost notifications.
- **AC-5**: Submitting a comment creates a `COMMENT` notification for the post author, unless the commenter is the post author.
- **AC-6**: Following a creator creates a `FOLLOW` notification for the followed user; unfollowing that creator immediately removes the notification.
- **AC-7**: Navigation shell components (`DesktopSidebar` and `MobileHeader`) display a live unread count badge powered by `useNotificationStore` and updated in real time via a Supabase Postgres changes subscription.
- **AC-8**: When a new notification arrives while the user is actively browsing another page, an unobtrusive Sonner toast displays the actor name and action summary.
- **AC-9**: The `/notifications` route renders a header with unread count summary, "Mark all as read" button, and tab filters for "All" and "Unread".
- **AC-10**: Each notification item renders the actor avatar, display name, handle, relative timestamp, action icon, descriptive text, and a thumbnail snippet of the referenced post or comment text.
- **AC-11**: Clicking a notification item optimistically marks it as read, decrements the unread count in `useNotificationStore`, and navigates to the target (the actor profile for follows, or the post on the author profile for likes and comments).
- **AC-12**: Clicking "Mark all as read" optimistically updates the unread count to zero and visually marks all listed notifications as read, rolling back with a Sonner toast if the server action fails.
- **AC-13**: Infinite scroll pagination fetches notifications in batches of 15 items using cursor pagination via `InfiniteScrollSentinel`.
- **AC-14**: Dedicated friendly empty states render when there are zero total notifications or zero unread notifications.

## Decision

**Chosen option**: Option 1: Dedicated Prisma Notification Model with Service Layer Dispatch and Client Supabase Realtime Subscription

We will implement a relational `Notification` model in Prisma with enum types, relational foreign keys, and cascading deletes. Notification generation will occur directly inside existing application service routines (`like.service.ts`, `comment.service.ts`, `follow.service.ts`) using Prisma queries. The user interface will query notifications through dedicated Server Actions in `actions/notification.ts`, coordinate client state through `useNotificationStore`, and maintain real time badge synchronization through a single Supabase postgres changes channel in the navigation shell.

**Implementation skills**: `shadcn` (`.agents/skills/shadcn/`) · `supabase` (`.agents/skills/supabase/`) · `supabase-postgres-best-practices` (`.agents/skills/supabase-postgres-best-practices/`)

## Rationale

Reasoning and options: see rationale.md

## Feature design

**Data model sketch**:

```prisma
enum NotificationType {
  LIKE
  COMMENT
  FOLLOW
}

model Notification {
  id          String           @id @default(uuid()) @db.Uuid
  recipientId String           @db.Uuid
  actorId     String           @db.Uuid
  type        NotificationType
  postId      String?          @db.Uuid
  commentId   String?          @db.Uuid
  read        Boolean          @default(false)
  createdAt   DateTime         @default(now())

  recipient   User             @relation("UserReceivedNotifications", fields: [recipientId], references: [id], onDelete: Cascade)
  actor       User             @relation("UserSentNotifications", fields: [actorId], references: [id], onDelete: Cascade)
  post        Post?            @relation(fields: [postId], references: [id], onDelete: Cascade)
  comment     Comment?         @relation(fields: [commentId], references: [id], onDelete: Cascade)

  @@index([recipientId, createdAt(sort: Desc)])
  @@index([recipientId, read])
  @@index([actorId])
  @@index([postId])
  @@index([commentId])
  @@map("notifications")
}
```

**State transitions**:
- `read`: `false` -> `true` (triggered when a user clicks an individual notification or clicks "Mark all as read"). Notifications stay read once acknowledged.

**API surface**:

| Endpoint or Action | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `getNotificationsAction` | Server Action | `filter?: 'all' \| 'unread'`, `cursor?: string`, `limit?: number` | `notifications: NotificationWithDetails[]`, `nextCursor: string \| null` | Authenticated session | 401 unauthorized, 500 server error |
| `getUnreadNotificationCountAction` | Server Action | none | `count: number` | Authenticated session | 401 unauthorized, 500 server error |
| `markNotificationAsReadAction` | Server Action | `notificationId: string` | `success: boolean` | Authenticated session (must own notification) | 401 unauthorized, 404 not found, 403 forbidden |
| `markAllNotificationsAsReadAction` | Server Action | none | `success: boolean`, `count: number` | Authenticated session | 401 unauthorized, 500 server error |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Notification item render | Actor avatar, display name, username | Joined `actor` User record (`actor.avatarUrl`, `actor.displayName`, `actor.username`) |
| Notification item render | Relative time string | Formatted `createdAt` timestamp from DB column |
| Notification item render | Unread indicator dot | DB column `read === false` |
| Notification item render | Action description message | Derived from `type`: "liked your post", "commented on your post", or "started following you" |
| Notification item render | Target content snippet or thumbnail | Joined `post.imageUrl`, `post.caption`, or `comment.content` |
| Notification click navigation | Target route link | Derived from `type`: `/profile/${actor.username}` for follow, `/profile/${post.author.username}` for like and comment |
| Badge counter update | Unread count number | Initial count from `getUnreadNotificationCountAction`, live increments from Realtime channel payload |
| Mark all as read | Updated count zero | Inferred from successful mutation on `recipientId` |

**Key invariants**:
- Users never receive notifications for their own actions (`actorId !== recipientId`).
- An actor cannot generate duplicate unread like notifications for the exact same post.
- An actor cannot generate duplicate unread follow notifications for the exact same creator.
- Deleting a post or comment automatically cascade deletes all associated notifications in Postgres.
- Reversing an action (unliking a post or unfollowing a user) deletes the associated notification row immediately.
- A user can only access, view, or mark as read notifications where `recipientId` matches their authenticated user id.

**Security model**:
- Row Level Security (RLS) enabled on `notifications` table in Supabase Postgres.
- Read policy: `CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);`
- Update policy: `CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = recipient_id);`
- Delete policy: `CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = recipient_id);`
- Insert operations executed via application service layer using the authenticated session or server client.

**Configuration required**:
- No new environment variables required. Existing `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `DATABASE_URL` are used.
- Supabase Postgres publication `supabase_realtime` must include the `notifications` table to broadcast insert and update events.

**Critical test scenarios**:
- Happy path: User B likes User A post. User A observes their unread badge increment instantly from 0 to 1 without refreshing. Navigating to `/notifications` shows User B like item with post preview. Clicking item navigates to post and marks notification read, verifying **AC-3**, **AC-7**, **AC-10**, and **AC-11**.
- Self action exclusion: User A comments on their own post. Zero notification records are created, verifying **AC-5** and **AC-6**.
- Undo action removal: User B follows User A, then unfollows User A five seconds later. The notification row is removed and User A unread count returns to previous state, verifying **AC-6**.
- Mark all as read: User A has 5 unread notifications, clicks "Mark all as read". UI immediately zeros badge and changes item states to read. Server action commits the update, verifying **AC-12**.
- Authorization isolation: User B attempts to mark User A notification as read via direct server action call. Action rejects with unauthorized error and leaves state untouched, verifying **AC-2**.

## Build plan

1. [x] Add `NotificationType` enum and `Notification` model to `prisma/schema.prisma` with indexes and relations, run Prisma db push, and verify schema synchronization, satisfies **AC-1**
2. [x] Enable Row Level Security on `notifications` table in Supabase Postgres with recipient scoped policies, and add `notifications` to `supabase_realtime` publication, satisfies **AC-2**, **AC-7**
3. [x] Create TypeScript interfaces and Zod validation schemas in `types/notification.ts` and `lib/validation/notification.ts`, satisfies **AC-1**
4. [x] Implement `notification.service.ts` in `lib/services/` for creating, deleting, querying with cursor pagination, and marking notifications as read, satisfies **AC-3**, **AC-4**, **AC-5**, **AC-6**, **AC-12**, **AC-13**
5. [x] Integrate notification creation and cleanup hooks into `like.service.ts`, `comment.service.ts`, and `follow.service.ts`, satisfies **AC-3**, **AC-4**, **AC-5**, **AC-6**
6. [x] Implement Server Actions in `actions/notification.ts` for querying notifications, getting unread counts, and marking individual or all notifications read, satisfies **AC-9**, **AC-11**, **AC-12**
7. [x] Extend `lib/store/notification-store.ts` with notification list cache, optimistic read actions, and batch sync methods, satisfies **AC-7**, **AC-11**, **AC-12**
8. [x] Create client hook `useNotificationSubscription` to listen to Supabase postgres changes and update badge counters and display Sonner toasts, satisfies **AC-7**, **AC-8**
9. [x] Build notification UI components in `components/notifications/`: item card (`notification-item.tsx`), filter tabs (`notification-tabs.tsx`), empty states (`notification-empty-state.tsx`), and main stream view (`notification-list.tsx`), satisfies **AC-9**, **AC-10**, **AC-14**
10. [x] Integrate infinite scroll pagination with `InfiniteScrollSentinel` in `notification-list.tsx`, satisfies **AC-13**
11. [x] Update `app/(main)/notifications/page.tsx` with server prefetching for initial notification batch and assemble complete notifications experience, satisfies **AC-9**, **AC-10**, **AC-11**, **AC-12**
12. [x] Mount notification real time subscription in `components/layout/navigation-shell.tsx` and verify live badge counters across desktop and mobile, satisfies **AC-7**, **AC-8**

## Consequences

**Positive**:
- Users receive instant feedback on community interactions without manual page refreshes.
- Relational integrity ensures no dangling notifications when posts or comments are deleted.
- Strict Row Level Security prevents any unauthorized access to private notification streams.
- Optimistic interface transitions provide immediate visual gratification when clearing notifications.

**Negative / tradeoffs**:
- Maintaining real time subscriptions adds persistent WebSocket connections to Supabase.
- Deleting like and follow notifications on reversal requires extra database delete queries during toggle actions.

**Neutral**:
- Notification volume scales with community engagement; high activity users will store hundreds of notification rows over time, well within Postgres capabilities for our target scale.

## Follow-up

- [x] Add `notifications` table to Supabase Realtime publication in the Supabase Dashboard or SQL editor during deployment
- [x] Register new notification components in `context/02-ui/ui-registry.md` upon completion
