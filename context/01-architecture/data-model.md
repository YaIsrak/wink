# Data Model

Core entities (Prisma / Postgres via Supabase). Refine field-level detail
during implementation — this captures the shape, not the final schema.

## User (Profile)

- id, email, username, displayName, avatarUrl, bio
- profileCompletionFields (derived, not stored: used to compute completion %)
- createdAt, updatedAt
- Linked 1:1 to Supabase Auth user

## Post

- id, authorId → User
- caption (nullable), imageUrl (nullable) — at least one of the two required
- createdAt, updatedAt

## Like

- id, postId → Post, userId → User
- unique on (postId, userId)

## Comment

- id, postId → Post, authorId → User, content, createdAt

## Follow

- id, followerId → User, followingId → User
- unique on (followerId, followingId)

## Conversation

- id, participant ids (two-party for MVP)
- Only created/allowed between mutual follows — enforced at service +
  RLS layer

## Message

- id, conversationId → Conversation, senderId → User, content, createdAt,
  readAt (nullable)

## Notification

- id, recipientId → User, type (like | comment | follow | message),
  actorId → User, entityId (post/comment/message id), read (bool),
  createdAt

## RLS notes

- Posts/comments/likes: readable broadly, writable/deletable only by owner.
- Messages/conversations: readable/writable only by participants, and only
  creatable between mutual follows.
- Notifications: readable/writable only by the recipient.

Any structural change to this file counts as an architecture change —
requires approval (see `.agents/rules/architecture.md`).
