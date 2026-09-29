# 0006. Optimistic Likes and Post Comments

**Date**: 2026-09-29
**Status**: In Progress

## Summary

This specification introduces interactive engagement for posts through optimistic likes and flat comments. Users can instantly like posts with immediate heart animation and optimistic counter updates, open a likers modal to inspect who liked a post, and write text comments up to 280 characters. The post card previews two recent comments inline and expands to reveal full chronological conversations with moderation deletion rights for both comment authors and post owners. All mutations provide instant client updates with safe rollback on error.

## Requirements

**User stories**:
- As an authenticated user, I want to tap the heart icon on any post so that I can show appreciation with instant visual feedback.
- As an authenticated user, I want to click the like count on a post so that I can see the list of people who liked it.
- As an authenticated user, I want to write short comments on posts so that I can participate in conversations with other members.
- As a comment author, I want to delete my own comments if I change my mind.
- As a post author, I want to delete any comment on my post so that I can moderate discussions under my content.
- As a reader in the feed, I want to see a preview of the newest comments on each post card with the ability to expand the full comment list when interested.

**Acceptance criteria**:
- **AC-1**: Tapping the like button instantly toggles the heart icon state and increments or decrements the post like count optimistically on the client, persisting the toggle state via a Next.js server action.
- **AC-2**: If a like toggle mutation fails or is rejected, the client rolls back the heart icon and count to their prior values and displays a Sonner error toast.
- **AC-3**: Clicking the like counter opens a dialog modal showing the list of likers with their avatars, display names, and profile links.
- **AC-4**: An authenticated user can submit a text comment up to 280 characters, which appends optimistically to the post comment stream and increments the comment count immediately.
- **AC-5**: Submitting empty text, whitespace only text, or text exceeding 280 characters is prevented by Zod client validation and server action validation.
- **AC-6**: If a comment creation fails on the server, the optimistic comment is removed from the post feed, the draft text is restored to the input box, and a Sonner error toast is shown.
- **AC-7**: Comment authors can delete their own comments, and post authors can delete any comment on their post, with optimistic removal from the UI and server side cascade verification.
- **AC-8**: The post card displays the comment count and up to two recent preview comments, with a toggle button that opens an inline drawer containing all comments in chronological order (oldest to newest) plus the comment composer input.
- **AC-9**: Database integrity is protected by unique constraint on post and user for likes, cascade deletions on parent post or user removal, and Supabase Row Level Security policies.

## Decision

**Chosen option**: Option 1: Unified Prisma Relation Slices with Client Store Optimistic Handlers and CSS Animations

We will implement Like and Comment models in Prisma with foreign keys cascading from Post and User, compute post counts dynamically using Prisma relation count queries, and manage client optimistic updates directly inside our existing Zustand post store with in flight request tracking.

**Implementation skills**: `supabase` (`supabase/agent-skills`, `.agents/skills/supabase/`) · `tailwind-utility-classes` (`tailwindlabs/agent-skills`, `.agents/skills/tailwind-utility-classes/`)

## Rationale

Reasoning and options: see rationale.md

## Feature design

**Data model sketch**:

```prisma
model Like {
  id        String   @id @default(uuid()) @db.Uuid
  postId    String   @db.Uuid
  userId    String   @db.Uuid
  createdAt DateTime @default(now())

  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([postId, userId])
  @@index([postId])
  @@index([userId])
  @@map("likes")
}

model Comment {
  id        String   @id @default(uuid()) @db.Uuid
  postId    String   @db.Uuid
  authorId  String   @db.Uuid
  content   String   @db.VarChar(280)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([postId, createdAt])
  @@index([authorId])
  @@map("comments")
}
```

**State transitions**:

Like interaction state machine:
- Unliked -> Optimistic Liked -> Confirmed Liked
- Liked -> Optimistic Unliked -> Confirmed Unliked
- Any Optimistic State -> Error Rollback to previous confirmed state

Comment lifecycle state machine:
- Idle -> Submitting (Optimistic Append) -> Confirmed (Reconcile Temp ID with Real DB Record)
- Submitting (Optimistic Append) -> Error (Rollback removal from store, restore input draft text)
- Existing -> Deleting (Optimistic Removal) -> Confirmed Deletion
- Deleting -> Error (Rollback reinsertion, Sonner error toast)

**API surface**:

| Function / Action | Method | Key inputs | Key outputs | Auth | Key errors |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `toggleLikeAction` | Server Action (POST) | `postId: string` | `{ liked: boolean, likesCount: number }` | Authenticated session | `UNAUTHORIZED`, `POST_NOT_FOUND`, `INTERNAL_ERROR` |
| `getPostLikesAction` | Server Action (POST) | `postId: string` | `{ users: Array<{ id, username, displayName, avatarUrl, createdAt }> }` | Authenticated session | `UNAUTHORIZED`, `POST_NOT_FOUND` |
| `createCommentAction` | Server Action (POST) | `postId: string`, `content: string` | `{ comment: CommentWithAuthor }` | Authenticated session | `UNAUTHORIZED`, `VALIDATION_ERROR`, `POST_NOT_FOUND` |
| `deleteCommentAction` | Server Action (POST) | `commentId: string` | `{ success: boolean, commentId: string, postId: string }` | Authenticated session | `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND` |
| `getPostCommentsAction`| Server Action (POST) | `postId: string` | `{ comments: CommentWithAuthor[] }` | Authenticated session | `UNAUTHORIZED`, `POST_NOT_FOUND` |

**Value sourcing**:

| Action | Value produced / displayed | Source |
| :--- | :--- | :--- |
| `toggleLikeAction` | `liked: boolean` | Derived from whether Like record was inserted or deleted |
| `toggleLikeAction` | `likesCount: number` | Computed from Prisma `_count.likes` on post |
| `getFeedPostsAction` | `isLikedByMe: boolean` | Computed via Prisma `likes: { where: { userId: session.user.id } }` presence |
| `getFeedPostsAction` | `likesCount: number` | Computed from Prisma `_count.likes` |
| `getFeedPostsAction` | `commentsCount: number` | Computed from Prisma `_count.comments` |
| `getFeedPostsAction` | `previewComments` | Top 2 newest comments ordered by `createdAt desc` |
| `getPostLikesAction` | Likers list array | Querying `Like` join `User` ordered by `createdAt desc` |
| `createCommentAction` | `comment.author` | Authenticated session user profile record in database |
| `createCommentAction` | `comment.createdAt` | PostgreSQL server timestamp `now()` |
| `deleteCommentAction` | Authorization decision | Checked against `comment.authorId == session.user.id` or `post.authorId == session.user.id` |

**Key invariants**:
- A user cannot like the same post more than once; the composite unique index on `(postId, userId)` guarantees this at the database level.
- Comments cannot be blank or contain solely whitespace characters, and length cannot exceed 280 characters.
- Only the comment author or the post owner may delete a comment; any other user receives an explicit forbidden error.
- Post likes count and comments count never drift because they are aggregated dynamically from source tables rather than relying on mutable denormalized integer counters.

**Security model**:
- Supabase Row Level Security policies:
  - `likes`: Enable RLS. Authenticated users can select all likes. Authenticated users can insert rows where `userId = auth.uid()`. Authenticated users can delete rows where `userId = auth.uid()`.
  - `comments`: Enable RLS. Authenticated users can select all comments. Authenticated users can insert rows where `authorId = auth.uid()`. Authenticated users can delete rows where `authorId = auth.uid()` or where `postId IN (SELECT id FROM posts WHERE authorId = auth.uid())`.
- Server Action layer checks:
  - Every action verifies session through `@supabase/ssr` server client before touching Prisma.
  - Delete comment service verifies ownership or post authorship explicitly before issuing the delete statement.

**Configuration required**:
- None. Uses existing Supabase Postgres connection, Prisma schema, and `@supabase/ssr` setup.

**Critical test scenarios**:
- Happy path: User clicks heart icon, heart pops red and count increments instantly; user types comment and presses Enter, comment appears instantly at bottom of comment list, verifies **AC-1**, **AC-4**.
- Failure case: Database disconnects or post gets deleted during like toggle, state reverts smoothly with toast notification, verifies **AC-2**, **AC-6**.
- Likers modal: Clicking like counter opens dialog with list of users who liked the post, verifies **AC-3**.
- Validation rejection: Submitting 300 characters or whitespace produces inline error without network request, verifies **AC-5**.
- Authorization check: Non author non owner attempting to delete another user's comment is rejected with forbidden error, verifies **AC-7**.
- Feed display: Post card displays heart, like count, comment bubble, comment count, and two preview comments, expanding cleanly when toggled, verifies **AC-8**.
- Cascading purge: Deleting a post automatically purges all related likes and comments, verifies **AC-9**.

## Build plan

- [x] 1. Add `Like` and `Comment` models to `prisma/schema.prisma` with foreign key relations, cascade delete behavior, composite indexes, and run migration to Supabase Postgres, satisfies **AC-9**.
- [x] 2. Apply Supabase Row Level Security policies on `likes` and `comments` tables for select, insert, and delete permissions, satisfies **AC-7**, **AC-9**.
- [x] 3. Create Zod validation schema `lib/validation/comment.ts` enforcing 280 character limit and trimmed non empty strings, satisfies **AC-5**.
- [x] 4. Implement `lib/services/like.service.ts` for toggling likes, querying likers, and checking user like status, satisfies **AC-1**, **AC-3**.
- [x] 5. Implement `lib/services/comment.service.ts` for adding comments, deleting comments with moderation ownership checks, and fetching chronological comment threads, satisfies **AC-4**, **AC-7**.
- [x] 6. Implement Server Actions in `actions/like.ts` (`toggleLikeAction`, `getPostLikesAction`) and `actions/comment.ts` (`createCommentAction`, `deleteCommentAction`, `getPostCommentsAction`), satisfies **AC-1**, **AC-3**, **AC-4**, **AC-7**.
- [x] 7. Update `lib/services/post.service.ts` and `types/post.ts` to enrich feed posts with `likesCount`, `commentsCount`, `isLikedByMe`, and `previewComments`, satisfies **AC-8**.
- [x] 8. Extend Zustand store `lib/store/post-store.ts` with optimistic like toggling, in flight lock management, optimistic comment insertion, temporary ID reconciliation, and rollback helpers, satisfies **AC-1**, **AC-2**, **AC-4**, **AC-6**.
- [x] 9. Build `components/posts/likers-dialog.tsx` modal for viewing users who liked the post, satisfies **AC-3**.
- [x] 10. Build `components/posts/comment-item.tsx` and `components/posts/comments-section.tsx` with chronological list, preview mode, expand trigger, and delete confirmation, satisfies **AC-7**, **AC-8**.
- [x] 11. Update `components/posts/post-card.tsx` with animated heart toggle button, likers trigger, comment counter trigger, and expandable comments section, satisfies **AC-1**, **AC-8**.

## Consequences

**Positive**:
- Users get instantaneous tactile engagement without waiting for network round trips.
- Dynamic counts eliminate counter drift and race conditions.
- Post authors gain moderation authority over their posts, fostering safe community discussions.
- Two preview comments provide immediate context without cluttering the main feed stream.

**Negative / tradeoffs**:
- Dynamic counts require join aggregations during feed fetching, though performance is optimal for our 100 user scale.
- Optimistic updates require robust client state rollback logic when network calls fail.

**Neutral**:
- Comments are text only with no nesting or image attachments in this milestone, keeping UI and data structures clean.

## Follow-up

- [ ] Add real time Supabase subscriptions for live comment broadcasts in Phase 3.
- [ ] Connect like and comment events to the user notification feed once notification infrastructure is implemented.
