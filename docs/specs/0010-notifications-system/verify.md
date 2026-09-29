# Verify: Notifications System · spec 0010 · updated 2026-09-29

_Steps derived from spec 0010 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [ ] Inspect database schema and Postgres policies → `notifications` table has foreign keys, cascade delete, and RLS enabled restricting SELECT, UPDATE, and DELETE to `auth.uid() = recipient_id` → AC-1, AC-2
- [ ] User B likes User A post → User A receives `LIKE` notification, unread badge in navigation increments from 0 to 1 in real time, and Sonner toast appears if browsing another page → AC-3, AC-7, AC-8
- [ ] User B unlikes User A post → the notification row is deleted, and User A unread count returns to previous value → AC-4
- [ ] User B comments on User A post → User A receives `COMMENT` notification with comment preview text snippet → AC-5, AC-10
- [ ] User B follows User A → User A receives `FOLLOW` notification; User B unfollows User A and notification is removed → AC-6
- [ ] User A likes or comments on their own post → zero notification rows are generated → AC-3, AC-5
- [ ] Visit `/notifications` while signed in → page renders header with unread count, "Mark all as read" button, and All/Unread filter tabs → AC-9
- [ ] Inspect notification item → displays actor avatar, display name, handle, relative timestamp, action icon, descriptive text, and target preview thumbnail → AC-10
- [ ] Click notification item → marks item as read, decrements unread badge in navigation, and navigates to target profile or post → AC-11
- [ ] Click "Mark all as read" button → optimistically sets unread count to 0 and updates all visible items to read state → AC-12
- [ ] Disconnect network and click "Mark all as read" → state rolls back to previous unread count and displays Sonner error toast → AC-12
- [ ] Scroll through notifications list when count exceeds 15 → infinite scroll loads next batch smoothly via `InfiniteScrollSentinel` → AC-13
- [ ] Switch to Unread tab when all notifications are read → displays friendly empty state card with all caught up illustration → AC-14
- [ ] Clear all notifications or test new account → displays empty notifications stream card with helpful explanation → AC-14

## Commands

- [ ] `npx prisma db push` → syncs Prisma schema with Supabase Postgres database with zero errors → AC-1
- [ ] `npx tsc --noEmit` → TypeScript compiler reports zero type errors across notification services, actions, and components → AC-1..AC-14
- [ ] `npm run build` → Next.js Turbopack production build succeeds with `/notifications` route generated → AC-9

## Acceptance criteria coverage

- AC-1 covered by UI step 1 and Command step 1
- AC-2 covered by UI step 1
- AC-3 covered by UI steps 2, 6
- AC-4 covered by UI step 3
- AC-5 covered by UI steps 4, 6
- AC-6 covered by UI step 5
- AC-7 covered by UI step 2
- AC-8 covered by UI step 2
- AC-9 covered by UI step 7 and Command step 3
- AC-10 covered by UI steps 4, 8
- AC-11 covered by UI step 9
- AC-12 covered by UI steps 10, 11
- AC-13 covered by UI step 12
- AC-14 covered by UI steps 13, 14
