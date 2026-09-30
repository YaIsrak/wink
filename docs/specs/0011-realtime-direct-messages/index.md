# 0011. Realtime Direct Messages and Message Requests

**Date**: 2026-09-30
**Status**: Accepted

## Summary

This specification establishes the realtime direct messaging system for Wink. Community members can send private text and photo messages to creators they follow. Mutual follows open an immediate active chat thread, while one way follows route initial conversations into a dedicated Message Requests tab. The conversation view includes instant message delivery, live online presence beacons, message editing with an edited label, soft deletion that hides message content across both participants while preserving database records, and optional browser push notifications.

## Requirements

**User stories**:
- As a community member, I want to message any creator I follow so that I can communicate privately.
- As a creator, I want messages from accounts I do not follow back to arrive in a Message Requests filter so that my primary inbox stays clean and focused on mutual friends.
- As a recipient of a message request, I want to preview the conversation and choose to Accept or Decline before moving it into my active messages list.
- As an active chatter, I want to see outgoing messages appear instantly with sending status indicators so that the conversation feels fast and responsive.
- As an active chatter, I want to attach photos to my messages so that I can share visual content privately.
- As an active chatter, I want to edit sent messages and have them marked with an edited badge on both screens so that typos can be corrected transparently.
- As an active chatter, I want to delete a sent message from view on both screens while keeping the record archived on the server.
- As a recipient, I want to receive live updates, unread navigation badges, and browser push notifications when new messages or requests arrive.

**Acceptance criteria**:
- **AC-1**: Database schema introduces `Conversation` and `Message` models with an explicit `ConversationStatus` enum (`PENDING`, `ACCEPTED`, `DECLINED`), cascade deletions on conversation removal, and unique composite index on participants ensuring one thread per pair.
- **AC-2**: Supabase Row Level Security on `conversations` and `messages` tables permits reads and writes strictly to verified conversation participants, with physical row deletion blocked.
- **AC-3**: Initiating a conversation with a mutual follow automatically sets status to `ACCEPTED` and opens the active chat window.
- **AC-4**: Initiating a conversation with a user you follow who does not follow you back sets status to `PENDING`, making it visible under the recipient's Message Requests filter.
- **AC-5**: Recipients can accept a pending request (transitioning status to `ACCEPTED`) or decline it (transitioning status to `DECLINED`), with the sender receiving live updates.
- **AC-6**: Message sending works optimistically: pending messages display immediately in the chat thread with a clock icon, transitioning to a single checkmark on server persistence, and double checkmarks when read.
- **AC-7**: Messages support optional image attachments uploaded to the Supabase Storage `messages` bucket with user folder isolation and five megabyte file size limits.
- **AC-8**: Senders can edit their own sent messages, updating content and setting an `isEdited` boolean flag that displays an edited label to both participants.
- **AC-9**: Senders can delete their own sent messages, setting an `isDeleted` flag that hides the message text and photo across both client screens while retaining the row in Postgres.
- **AC-10**: The desktop interface at `/messages` provides a two pane layout matching the design mockup, featuring a conversation list on the left and active chat window on the right.
- **AC-11**: The mobile interface splits navigation cleanly between `/messages` for the conversation list and `/messages/[conversationId]` for the dedicated chat screen with back navigation.
- **AC-12**: Conversation list filters provide tabs for All, Requests (with badge count of pending requests), and Unread.
- **AC-13**: Supabase Realtime channels broadcast live message inserts, edits, deletions, and active online presence beacons across participants.
- **AC-14**: Incoming messages increment the navigation bar Messages badge and display a browser push notification when page focus is inactive or the user is on another route.
- **AC-15**: Opening a conversation marks all unread incoming messages as read, updating message `readAt` timestamps and clearing unread badges.

## Decision

**Chosen option**: Option 1: Direct Messaging with Request Flow, Soft Deletes, Supabase Realtime, and Browser Push Notifications

We will introduce `Conversation` and `Message` models in Prisma linked directly to user accounts, with conversation status distinguishing mutual chats (`ACCEPTED`) from one way requests (`PENDING`). All mutations run through Next.js Server Actions with Zod validation, broadcasting live updates to participants via Supabase Realtime room channels. Messages support photo uploads to Supabase Storage, soft deletion hiding content on client views while keeping backend integrity, inline edits labeled for transparency, and Web Notification API integration for browser push alerts.

**Implementation skills**: `shadcn` (`.agents/skills/shadcn/`) · `supabase` (`.agents/skills/supabase/`) · `supabase-postgres-best-practices` (`.agents/skills/supabase-postgres-best-practices/`)

## Rationale

Reasoning and options: see rationale.md

## Feature design

**Data model sketch**:

```prisma
enum ConversationStatus {
  PENDING
  ACCEPTED
  DECLINED
}

model Conversation {
  id            String             @id @default(uuid()) @db.Uuid
  userAId       String             @map("user_a_id") @db.Uuid
  userBId       String             @map("user_b_id") @db.Uuid
  initiatorId   String             @map("initiator_id") @db.Uuid
  status        ConversationStatus @default(PENDING)
  lastMessageAt DateTime           @default(now()) @map("last_message_at")
  createdAt     DateTime           @default(now()) @map("created_at")
  updatedAt     DateTime           @updatedAt @map("updated_at")

  userA         User               @relation("ConversationUserA", fields: [userAId], references: [id], onDelete: Cascade)
  userB         User               @relation("ConversationUserB", fields: [userBId], references: [id], onDelete: Cascade)
  initiator     User               @relation("ConversationInitiator", fields: [initiatorId], references: [id], onDelete: Cascade)
  messages      Message[]

  @@unique([userAId, userBId])
  @@index([userAId, lastMessageAt(sort: Desc)])
  @@index([userBId, lastMessageAt(sort: Desc)])
  @@map("conversations")
}

model Message {
  id             String       @id @default(uuid()) @db.Uuid
  conversationId String       @map("conversation_id") @db.Uuid
  senderId       String       @map("sender_id") @db.Uuid
  content        String?
  imageUrl       String?      @map("image_url")
  isDeleted      Boolean      @default(false) @map("is_deleted")
  isEdited       Boolean      @default(false) @map("is_edited")
  readAt         DateTime?    @map("read_at")
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender         User         @relation(fields: [senderId], references: [id], onDelete: Cascade)

  @@index([conversationId, createdAt(sort: Asc)])
  @@index([senderId])
  @@map("messages")
}
```

**State transitions**:
- `PENDING` -> `ACCEPTED` (recipient clicks Accept, enabling direct chat thread)
- `PENDING` -> `DECLINED` (recipient clicks Decline, hiding the request)
- Initial state: `ACCEPTED` if sender and recipient follow each other; `PENDING` if only sender follows recipient

**API surface**:

| Function / Server Action | Method | Key inputs | Key outputs | Auth | Key errors |
| --- | --- | --- | --- | --- | --- |
| `getConversationsAction` | Server Action | filter: "ALL" \| "REQUESTS" \| "UNREAD" | conversations array, unreadRequestsCount | Authenticated session | 401 unauthorized |
| `getConversationByIdAction` | Server Action | conversationId: UUID | conversation object, otherUser, messages array | Authenticated participant | 401 unauthorized, 403 forbidden, 404 not found |
| `startConversationAction` | Server Action | targetUserId: UUID, initialMessage: string, imageUrl?: string | conversation object, message object | Authenticated follower | 400 not following, 401 unauthorized |
| `sendMessageAction` | Server Action | conversationId: UUID, content?: string, imageUrl?: string | message object | Authenticated participant | 400 empty message, 403 forbidden |
| `editMessageAction` | Server Action | messageId: UUID, newContent: string | updated message object | Authenticated sender | 403 not author, 400 deleted message |
| `softDeleteMessageAction` | Server Action | messageId: UUID | success boolean | Authenticated sender | 403 not author, 404 not found |
| `respondToRequestAction` | Server Action | conversationId: UUID, decision: "ACCEPT" \| "DECLINE" | updated conversation | Authenticated recipient | 403 not recipient, 400 invalid state |
| `markConversationReadAction` | Server Action | conversationId: UUID | readCount integer | Authenticated participant | 401 unauthorized, 403 forbidden |

**Value sourcing**:

| Action | Value produced / displayed | Source |
| --- | --- | --- |
| Display conversation item | Display name, handle, avatar, online beacon | Joined `User` record of counterpart participant |
| Display conversation item | Snippet preview and relative timestamp | Most recent `Message.content` or photo indicator, and `Message.createdAt` |
| Display conversation item | Unread message indicator | Count of messages where `senderId != currentUserId` and `readAt == null` |
| Display conversation item | Request badge count | Count of conversations where `status == PENDING` and `initiatorId != currentUserId` |
| Render chat message | Message text or photo attachment | `Message.content` and `Message.imageUrl` |
| Render chat message | Edited badge | `Message.isEdited` boolean flag |
| Render chat message | Deleted notice | `Message.isDeleted` boolean flag hiding original text on frontend |
| Render chat message | Sent and read checkmarks | Clock icon if optimistic, single check if saved, double check if `readAt != null` |
| Realtime presence | Active now or Active Xm ago | Supabase Realtime Presence channel state payload |

**Key invariants**:
- Exactly one `Conversation` row can exist between any two users, enforced by ordering `userAId < userBId` and a composite unique constraint.
- Senders can only message creators they actively follow; messaging someone you do not follow is prohibited.
- Deleted messages are never physically removed from Postgres; `isDeleted` hides text and media on all client interfaces.
- Message edits are restricted to the author and automatically mark `isEdited = true`.
- Supabase Storage avatar and message images are capped at five megabytes with mime type restrictions.

**Security model**:
- Row Level Security on `conversations` requires `auth.uid() = user_a_id OR auth.uid() = user_b_id` for SELECT and UPDATE.
- Row Level Security on `messages` requires caller to be a participant of the parent conversation for SELECT, and `auth.uid() = sender_id` for INSERT and UPDATE.
- Hard deletions on `messages` and `conversations` tables are blocked via RLS and service level constraints.
- Supabase Storage `messages` bucket limits write access to folders named after the authenticated user's ID.

**Configuration required**:
- Public Supabase Storage bucket named `messages` with file size limit of 5MB and allowed mime types (`image/jpeg`, `image/png`, `image/webp`).

**Critical test scenarios**:
- Happy path: User A follows User B (mutual follow), opens messages, sends text and photo, User B sees messages in realtime and reads them, updating read receipts, verifies **AC-1**, **AC-3**, **AC-6**, **AC-7**, **AC-13**, **AC-15**
- Message request path: User A follows User C (one way follow), sends message, message appears in User C Message Requests tab, User C accepts, thread moves to All messages, verifies **AC-4**, **AC-5**, **AC-12**
- Message edit and soft delete: Sender edits message, both participants see updated text and edited badge, sender deletes message, both participants see message hidden placeholder, verifies **AC-8**, **AC-9**
- Auth and permission: User D attempts to fetch or send messages to a conversation between User A and User B, server action denies access with 403 Forbidden, verifies **AC-2**

## Build plan

- [x] 1. Create Prisma migration adding `ConversationStatus` enum, `Conversation` model, and `Message` model, and push to Supabase Postgres, satisfies **AC-1**
- [x] 2. Enable Row Level Security policies on `conversations` and `messages` tables, satisfies **AC-2**
- [x] 3. Create public Supabase Storage bucket `messages` with user folder upload policies, satisfies **AC-7**
- [x] 4. Implement TypeScript interfaces and Zod validation schemas in `types/message.ts` and `lib/validation/message.ts`, satisfies **AC-1**, **AC-6**
- [x] 5. Implement database query functions in `lib/services/conversation.service.ts` and `lib/services/message.service.ts` supporting conversations, requests, messaging, edits, and soft deletes, satisfies **AC-3**, **AC-4**, **AC-5**, **AC-8**, **AC-9**
- [x] 6. Implement Server Actions in `actions/conversation.ts` and `actions/message.ts` with authentication and participant authorization, satisfies **AC-2**, **AC-3**, **AC-4**, **AC-5**, **AC-15**
- [x] 7. Create Zustand store in `lib/store/message-store.ts` managing active conversation, optimistic message streams, unread badges, and presence state, satisfies **AC-6**, **AC-12**, **AC-13**
- [x] 8. Build client hooks `use-chat-subscription.ts` and `use-presence.ts` for Supabase Realtime message broadcasting, typing state, and online beacons, satisfies **AC-13**, **AC-14**
- [x] 9. Implement browser push notification helper `lib/utils/notifications.ts` using the Web Notifications API, satisfies **AC-14**
- [x] 10. Build conversation list components: search filter, tabs for All, Requests, and Unread, and conversation list items, satisfies **AC-10**, **AC-12**
- [x] 11. Build chat window components: conversation header with mutual follow badge and presence dot, message bubbles with edited and deleted states, photo attachment lightbox, and composer footer, satisfies **AC-6**, **AC-7**, **AC-8**, **AC-9**, **AC-10**
- [x] 12. Build responsive layout pages: desktop two pane view on `app/(main)/messages/page.tsx` and mobile thread view on `app/(main)/messages/[conversationId]/page.tsx`, satisfies **AC-10**, **AC-11**
- [x] 13. Wire live message badge into navigation shell `DesktopSidebar` and `MobileHeader`, satisfies **AC-14**

## Consequences

**Positive**:
- Direct private messaging unlocks core social loop and fulfills portfolio MVP scope.
- Message requests protect users from spam while allowing creators to discover genuine outreach from followers.
- Soft deletion and edit badges provide privacy and transparency without destroying backend audit trails.
- Realtime presence and optimistic sending deliver a smooth, responsive messaging experience matching modern chat apps.

**Negative / tradeoffs**:
- Maintaining active realtime websocket channels and presence beacons incurs persistent client connections on Supabase.
- Two pane desktop layout requires coordinated synchronization between list selection and URL state.

**Neutral**:
- Web Notifications API requires explicit browser permission prompt from the user.
- Storage capacity must accommodate uploaded chat attachments.

## Follow-up

- [x] Complete Prisma schema update and push migration to Supabase Postgres
- [x] Create `messages` Supabase Storage bucket in Supabase dashboard
- [x] Connect direct message action into profile header "Message" button on mutual follow profiles
