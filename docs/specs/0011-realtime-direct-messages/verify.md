# Verify: Realtime Direct Messages and Message Requests (spec 0011, updated 2026-09-30)

_Steps derived from spec 0011 acceptance criteria. Run to verify functionality._

## UI and manual checks

- [ ] Inspect database schema and Postgres policies: `conversations` and `messages` tables exist with foreign keys, cascade deletes, and RLS restricting SELECT and UPDATE to participants, with physical delete blocked (AC-1, AC-2)
- [ ] User A follows User B, and User B follows User A (mutual follows): User A clicks Message on User B profile, opening conversation with status `ACCEPTED` (AC-3)
- [ ] User A sends a message: message appears immediately in chat window with a clock icon, updates to a single checkmark upon server save, and updates to double checkmarks when User B views it (AC-6, AC-15)
- [ ] User A attaches a photo to a message: image uploads to Supabase Storage `messages` bucket and displays inline in the chat bubble (AC-7)
- [ ] User A edits a sent message: message updates inline and displays an edited label visible to both participants (AC-8)
- [ ] User A deletes a sent message: message content is replaced with a deleted notice on both User A and User B screens while the record persists in Postgres (AC-9)
- [ ] User A follows User C (one way follow): User A initiates a conversation; conversation status is set to `PENDING` (AC-4)
- [ ] User C opens `/messages`: Requests tab displays badge counter indicating one pending request, and opening Requests tab displays the thread preview (AC-12)
- [ ] User C clicks Accept: conversation transitions to `ACCEPTED` and moves into the main All messages list (AC-5)
- [ ] User C clicks Decline: conversation transitions to `DECLINED` and is removed from the pending list (AC-5)
- [ ] Test desktop view: `/messages` renders side by side two pane layout with conversation search on left and active chat thread on right (AC-10)
- [ ] Test mobile view: `/messages` renders conversation list, tapping a conversation navigates to `/messages/[conversationId]` with top header and back button (AC-11)
- [ ] Realtime delivery: while User A and User B have the conversation open, messages sent by one user appear live on the other user screen without refreshing (AC-13)
- [ ] Presence: online green beacon appears on user avatar when other participant is active (AC-13)
- [ ] Browser notifications: when a message arrives while browser tab is hidden or user is on another route, a browser notification appears (AC-14)

## Commands

- [ ] `npx prisma db push` pushes updated schema to Supabase Postgres with zero errors (AC-1)
- [ ] `npx tsc --noEmit` verifies complete TypeScript compilation with zero errors across messaging services, actions, and components (AC-1 to AC-15)
- [ ] `npm run build` verifies Next.js production build succeeds with `/messages` and `/messages/[conversationId]` routes generated (AC-10, AC-11)

## Acceptance criteria coverage

- AC-1 covered by manual step 1 and Command step 1
- AC-2 covered by manual step 1
- AC-3 covered by manual step 2
- AC-4 covered by manual step 7
- AC-5 covered by manual steps 9, 10
- AC-6 covered by manual step 3
- AC-7 covered by manual step 4
- AC-8 covered by manual step 5
- AC-9 covered by manual step 6
- AC-10 covered by manual step 11 and Command step 3
- AC-11 covered by manual step 12 and Command step 3
- AC-12 covered by manual step 8
- AC-13 covered by manual steps 13, 14
- AC-14 covered by manual step 15
- AC-15 covered by manual step 3
