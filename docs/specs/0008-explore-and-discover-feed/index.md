# 0008. Explore and Discover Feed

**Date**: 2026-09-29
**Status**: Accepted

## Summary

This specification introduces the explore and discover feed for Wink. It allows any signed in member to discover popular posts and new creators from across the entire platform in a clean vertical stream. Posts load in smooth batches of ten using infinite scroll powered by a browser intersection observer (a visibility sensor). The feed ranking balances community engagement with recent activity so that popular discussions surface while fresh posts remain discoverable. All interactions like post likes, comments, and following creators update optimistically and stay synchronized with the global post store.

## Requirements

**User stories**:
- As an active user, I want to explore content from across the whole Wink community so that I can discover new creators and hot conversations beyond my following circle.
- As an active user, I want the explore feed to scroll infinitely in smooth batches of ten posts so that I can browse without manual pagination controls.
- As an active user, I want to follow authors directly from explore cards so that I can curate my home feed with creators I discover.
- As an active user, I want to like and comment on explore posts with instant optimistic feedback so that I can join community discussions without losing my reading position.

**Acceptance criteria**:
- **AC-1**: Visiting `/explore` displays an explore header with the compass icon and a vertical discovery feed rendering posts from across the platform in batches of ten.
- **AC-2**: The server pre renders the first batch of ten posts on initial visit, delivering fast initial page loads without empty layout shifts.
- **AC-3**: As the user scrolls down, a visibility sensor (intersection observer) detects when the user approaches the bottom of the current batch and fetches the next batch of ten posts automatically.
- **AC-4**: Feed ranking prioritizes community posts using a blended score of recency and engagement (likes and comments count), ensuring lively posts surface while recent posts remain discoverable.
- **AC-5**: The current session user's own posts are omitted from the explore feed query so the feed focuses strictly on community discovery.
- **AC-6**: Posts from creators the viewer already follows remain visible in explore, with follow buttons visible only for creators the viewer does not currently follow.
- **AC-7**: Liking or commenting on any post in the explore feed updates the interface optimistically and synchronizes with the global post store.
- **AC-8**: Rapid scrolling is protected by an in flight network guard that ignores duplicate trigger events while a batch request is pending.
- **AC-9**: If a network failure occurs during batch fetching, an inline error card appears at the bottom with a retry button and toast notification, keeping previously fetched posts intact.
- **AC-10**: When all posts across the platform have been loaded, an end of feed milestone card displays indicating the stream is complete, with a smooth button to return to the top.

## Decision

**Chosen option**: Option 1: Blended Engagement and Recency Ranking with Intersection Observer Batching and Post Store Integration

We will build the explore feed as a dedicated discovery surface using existing database models. The query calculates engagement weighted recency directly in PostgreSQL and excludes the session user's own posts. The client uses a native browser intersection observer to trigger server action batch fetches of ten posts at a time, managing feed state in an explore slice within the Zustand post store.

**Implementation skills**: `shadcn` (`.agents/skills/shadcn/`) · `supabase` (`.agents/skills/supabase/`) · `tailwind-css-patterns` (`.agents/skills/tailwind-css-patterns/`)

## Rationale

Reasoning and options: see rationale.md

## Feature design

**Data model sketch**:

No database schema migration is required. The feature utilizes the existing `Post`, `Like`, `Comment`, `User`, and `Follow` tables in `prisma/schema.prisma`.

```prisma
// Existing Post model with relations
model Post {
  id        String    @id @default(uuid()) @db.Uuid
  authorId  String    @db.Uuid
  caption   String?   @db.Text
  imageUrl  String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  author    User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  likes     Like[]
  comments  Comment[]

  @@index([authorId])
  @@index([createdAt(sort: Desc)])
  @@map("posts")
}
```

**Feed ranking formula**:

The query orders posts by combining engagement weight with creation recency:
`rank_score = (likesCount * 2) + (commentsCount * 3)`
Primary sort: `rank_score desc`
Secondary sort: `createdAt desc`
Tertiary sort: `id desc`

For keyset cursor pagination across batches of ten posts, the cursor encodes `lastRankScore`, `lastCreatedAt`, and `lastId` into an opaque string token. When no cursor is supplied, the query starts at the top of the ranked list.

**State machine**:

```
Explore Feed Infinite Scroll Lifecycle:
[Idle / Initial 10 Posts Rendered]
  │
  ▼ User scrolls to bottom sentinel
[Fetching Next Batch of 10] (in flight lock active, skeleton card visible at bottom)
  ├── Success (10 posts returned) ──> Append unique posts to store, update cursor, unlock ──> [Idle]
  ├── Success (< 10 posts or null cursor) ──> Append final posts, mark hasMore false ──> [Exhausted / End of Feed]
  └── Failure (network / server error) ──> Show retry button card, trigger toast ──> [Error Retry State]
```

**API surface**:

| Endpoint or Action | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `getExploreFeedPostsAction` | Server Action | `cursor?: string, limit?: number` (default 10, max 20) | `{ success: boolean, posts: PostWithAuthor[], nextCursor?: string, hasMore: boolean }` | Session user required | 401 (unauthorized), 500 (database error) |

**Value sourcing**:

| Action | Value produced or displayed | Source |
|---|---|---|
| Explore initial load | First batch of ten post cards | Server side query `getExplorePosts({ limit: 10, currentUserId })` |
| Explore batch pagination | Next batch of ten post cards | Client triggered call to `getExploreFeedPostsAction({ cursor })` |
| Post author identity | Name, handle, avatar | Joined `users` table via `authorId` foreign key |
| Post engagement metrics | Likes count and comments count | Count aggregation on `likes` and `comments` tables |
| Like active state | `isLikedByMe` boolean | Subquery checking `exists(likes where userId = sessionUser.id)` |
| Follow active state | `isFollowingAuthor` boolean | Subquery checking `exists(follows where followerId = sessionUser.id and followingId = authorId)` |
| Pagination cursor | Next page identifier | Computed opaque string token from the tenth post rank and identifier |
| Feed exhaustion | End of feed banner | Boolean derived from `posts.length < limit` or null next cursor |

**Key invariants**:
- Batch size limit: Default batch size is strictly ten items (`limit = 10`), capped at twenty items maximum.
- Self post exclusion: `authorId != sessionUser.id` holds for every post returned in explore queries.
- In flight request guard: At most one batch request may be active at any given moment. Subsequent intersection triggers during an active fetch are ignored.
- Deduplication: When new batches append to the client store, any incoming post whose ID already exists in the local array is filtered out.
- Consistent interactions: Liking or commenting on a post in explore updates the post in memory across all views via the unified Zustand store.

**Security model**:
- Route level protection: The `/explore` route is located within `app/(main)/layout.tsx` which verifies Supabase session authentication and redirects guests to `/login`.
- Row level security: Read queries respect Postgres Row Level Security on `posts`, `likes`, `comments`, and `follows`.
- Creator privacy: All posts in MVP are public community posts; private accounts or blocked relationships do not exist in the current data model.

**Configuration required**:
- None. Reuses existing Supabase Postgres database and authentication.

**Critical test scenarios**:
- Happy path initial load: User visits `/explore`, first ten ranked posts render immediately from server HTML with author info and engagement counts, verifying **AC-1**, **AC-2**, **AC-4**, **AC-5**.
- Infinite scroll batching: User scrolls to the tenth post, intersection observer triggers `getExploreFeedPostsAction`, ten more posts append cleanly without duplicate keys, verifying **AC-3**, **AC-8**.
- Self author exclusion: Explore feed does not contain any posts authored by the logged in user, verifying **AC-5**.
- Following relation indicators: Posts by authors the user already follows show no follow button; posts by unfamiliar creators display an active Follow button, verifying **AC-6**.
- Optimistic social actions: Clicking like or adding a comment on an explore post immediately increments counters and persists across navigation, verifying **AC-7**.
- Network failure and retry: Simulating an offline network while scrolling shows the inline retry card with toast error; clicking Retry successfully loads the pending batch, verifying **AC-9**.
- Stream completion: When database contains fewer than ten posts or the full catalog is fetched, the end of feed card displays with a functioning back to top button, verifying **AC-10**.

## Build plan

1. [x] Implement `getExplorePosts` query service in `lib/services/post.service.ts` with engagement blended ranking, self author exclusion, author follow status resolution, and cursor pagination for batches of ten items, satisfies **AC-4**, **AC-5**, **AC-6**
2. [x] Implement Server Action `getExploreFeedPostsAction` in `actions/post.ts` enforcing session authentication and parameter validation, satisfies **AC-1**, **AC-4**
3. [x] Extend Zustand `usePostStore` in `lib/store/post-store.ts` with explore feed state (`explorePosts`, `exploreCursor`, `hasMoreExplore`, `isLoadingExplore`, `setInitialExplorePosts`, `appendExplorePosts`), satisfies **AC-7**, **AC-8**
4. [x] Build `components/posts/infinite-scroll-sentinel.tsx` implementing a reusable browser intersection observer sentinel with loading skeletons, network retry card, and completion indicator, satisfies **AC-3**, **AC-8**, **AC-9**, **AC-10**
5. [x] Build `components/explore/explore-feed-view.tsx` containing the explore header, post stream, infinite scroll trigger, and back to top button, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-7**
6. [x] Update `app/(main)/explore/page.tsx` server component to pre fetch the initial ten posts and render `ExploreFeedView`, satisfies **AC-1**, **AC-2**

## Consequences

**Positive**:
- Provides a dedicated discovery channel for users to find active discussions and new creators outside their personal following graph.
- Smooth infinite scrolling in small batches of ten posts minimizes initial data payloads and keeps memory usage lean.
- Full reuse of existing post cards, like animations, comment drawers, and follow buttons maintains complete design and behavioral consistency.

**Negative / tradeoffs**:
- Dynamic engagement ranking on the database requires computing like and comment counts at read time, which may require a dedicated index or cached score column as post volume scales past hundreds of users.
- Infinite scroll retains loaded DOM elements, which requires monitoring DOM node counts on very long browsing sessions.

**Neutral**:
- No database migrations or schema adjustments needed.
- Reuses existing UI primitives (`Card`, `Button`, `Skeleton`, `Avatar`).

## Follow-up

- [x] Register new components `ExploreFeedView` and `InfiniteScrollSentinel` in `context/02-ui/ui-registry.md`.
- [ ] Monitor query latency for engagement rank calculation as community post counts expand.
- [ ] Connect search functionality in Phase 3 to index explored posts and creators.
