# 0009. Search Feature and Page

**Date**: 2026-09-29
**Status**: Accepted

## Summary

This specification introduces the search feature and dedicated search page for Wink. It enables members to search across creator accounts and post captions through a unified live search bar. Results are organized into three tabs: Top (a blended view of the best account and post matches), Accounts (a paginated list of matching creators with instant follow buttons), and Posts (a paginated stream of matching posts). Queries execute with a 300 millisecond debounce as you type and synchronize with URL parameters for shareable links. When the query is empty, the page presents recent search history stored in the browser alongside suggested creators to follow.

## Requirements

**User stories**:
- As an active user, I want to search for people by their display name or username handle so that I can find my friends and favorite creators.
- As an active user, I want to search post captions for keywords and topics so that I can discover relevant discussions and photos.
- As an active user, I want search results to update smoothly as I type so that I get fast feedback without clicking a manual search button.
- As an active user, I want to see and manage my recent searches so that I can quickly return to frequent queries or clear them at will.
- As an active user, I want to follow creators directly from search result cards with instant optimistic feedback so that I can curate my feed effortlessly.

**Acceptance criteria**:
- **AC-1**: Navigating to `/search` renders a persistent search bar with a search icon, text input, clear button, and category tabs for Top, Accounts, and Posts.
- **AC-2**: When the search query input is empty, the search page displays recent search history from browser local storage with individual deletion and clear all controls, alongside suggested creators to follow.
- **AC-3**: Typing into the search bar debounces for 300 milliseconds before initiating server action search requests, updating the browser URL query parameter `?q=...` without a full page reload.
- **AC-4**: Tab selection updates the browser URL query parameter `?tab=...` and filters results across Top (blended top accounts and top posts), Accounts (matching creators), and Posts (matching captions).
- **AC-5**: The search query performs case insensitive substring matching across user handles (`username`), names (`displayName`), and post content (`caption`).
- **AC-6**: User search results display avatar, display name, handle, bio, follower count, and an interactive follow button that updates follow state optimistically.
- **AC-7**: Post search results display post author, creation timestamp, caption, image preview, engagement counts (likes and comments), and interactive lightbox or navigation.
- **AC-8**: Clicking any recent search chip or entry instantly populates the search bar and triggers the search query.
- **AC-9**: Submitting a search query adds the trimmed search query to recent searches in browser local storage, maintaining a cap of at most 10 recent searches with newest first.
- **AC-10**: The Accounts and Posts tabs support infinite scroll pagination in batches of 10 items using cursor pagination.
- **AC-11**: When a search query matches zero users and zero posts, a friendly empty state card appears with tips to try different keywords and a suggested creators list.
- **AC-12**: Network failures during search queries display an error state with a retry button and trigger a Sonner toast notification.

## Decision

**Chosen option**: Option 1: Prisma Case Insensitive Substring Search with Local Storage Recent History and URL State Sync

We will build the search page using existing Prisma client queries with case insensitive substring matching (`mode: 'insensitive'`) across User and Post tables. Search queries will run through dedicated Server Actions in `actions/search.ts` calling `lib/services/search.service.ts`. The UI will use debounced live search with URL query synchronization, browser local storage for recent queries, and interactive optimistic follow buttons on creator cards.

**Implementation skills**: `shadcn` (`.agents/skills/shadcn/`) · `supabase` (`.agents/skills/supabase/`) · `tailwind-css-patterns` (`.agents/skills/tailwind-css-patterns/`)

## Rationale

Reasoning and options: see rationale.md

## Feature design

**Data model sketch**:

No new database tables or schema migrations are required. The feature leverages the existing `User`, `Post`, `Like`, `Comment`, and `Follow` models in `prisma/schema.prisma`.

```prisma
// Existing User model queried on username and displayName
model User {
  id          String   @id @default(uuid()) @db.Uuid
  username    String   @unique
  displayName String
  avatarUrl   String?
  bio         String?
  followers   Follow[] @relation("UserFollowers")
  following   Follow[] @relation("UserFollowing")
  posts       Post[]
  @@map("users")
}

// Existing Post model queried on caption
model Post {
  id        String    @id @default(uuid()) @db.Uuid
  authorId  String    @db.Uuid
  caption   String?   @db.Text
  imageUrl  String?
  createdAt DateTime  @default(now())
  author    User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  likes     Like[]
  comments  Comment[]
  @@map("posts")
}
```

**Client search history model** (saved in browser `localStorage` under `wink_recent_searches`):

```typescript
export interface RecentSearchItem {
  id: string
  query: string
  timestamp: number
}
```

**State transitions**:

```
Search Page Lifecycle:
[Empty Input]
  │ Shows recent searches (localStorage) and suggested creators
  ▼ User types query
[Typing] (debounce timer resets on each keystroke, 300ms window)
  │ Timer fires
[Fetching Results] (search spinner visible, previous results dimmed or preserved)
  ├── Results found (> 0 items) ──> Render results according to active tab (Top, Accounts, Posts)
  ├── No matches (0 items) ──> Render friendly empty state card with search tips and suggested creators
  └── Network error ──> Show retry button card and Sonner error toast
```

**API surface**:

| Endpoint or Action | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `searchTopAction` | Server Action | `query: string` (req) | `{ success: boolean, users: UserSearchResult[], posts: PostWithAuthor[] }` | Session user required | 400 invalid query, 401 unauthorized, 500 server error |
| `searchUsersAction` | Server Action | `query: string` (req), `cursor?: string`, `limit?: number` (default 10) | `{ success: boolean, users: UserSearchResult[], nextCursor?: string, hasMore: boolean }` | Session user required | 400 invalid query, 401 unauthorized, 500 server error |
| `searchPostsAction` | Server Action | `query: string` (req), `cursor?: string`, `limit?: number` (default 10) | `{ success: boolean, posts: PostWithAuthor[], nextCursor?: string, hasMore: boolean }` | Session user required | 400 invalid query, 401 unauthorized, 500 server error |

**Value sourcing**:

| Action | Value produced or displayed | Source |
|---|---|---|
| `searchUsersAction` | `user.id`, `user.username`, `user.displayName`, `user.avatarUrl`, `user.bio` | `users` table columns |
| `searchUsersAction` | `followersCount` | Count of rows in `follows` table where `followingId = user.id` |
| `searchUsersAction` | `isFollowing` | Boolean from `follows` table check `(followerId: sessionUserId, followingId: user.id)` |
| `searchUsersAction` | `isMe` | Boolean comparison `user.id === sessionUserId` |
| `searchPostsAction` | `post.id`, `post.caption`, `post.imageUrl`, `post.createdAt` | `posts` table columns |
| `searchPostsAction` | `author.id`, `author.username`, `author.displayName`, `author.avatarUrl` | Joined `users` table columns |
| `searchPostsAction` | `likesCount` | Count of rows in `likes` table where `postId = post.id` |
| `searchPostsAction` | `commentsCount` | Count of rows in `comments` table where `postId = post.id` |
| `searchPostsAction` | `isLikedByMe` | Boolean from `likes` table check `(postId: post.id, userId: sessionUserId)` |
| `searchPostsAction` | `isAuthorFollowed` | Boolean from `follows` table check `(followerId: sessionUserId, followingId: post.authorId)` |
| Search Page View | `query` input value | URL search parameter `?q=` or client state |
| Search Page View | `activeTab` value | URL search parameter `?tab=` (default "top") |
| Search Page View | `recentSearches` list | Browser `localStorage` key `wink_recent_searches` |
| Search Page View | `suggestedCreators` list | Returned from existing `getSuggestedUsersAction` in `actions/follow.ts` |

**Key invariants**:
- Search queries are trimmed of leading and trailing whitespace; empty strings bypass backend queries and show recent search history.
- Query length is constrained to at most 100 characters to prevent database load spikes.
- Session user cannot follow themselves; user result cards for the active session user display a "(You)" indicator instead of a follow button.
- Follow actions from user search result cards immediately update the follow status optimistically and sync across post stores.
- Recent search items in local storage are capped at 10 items, deduplicated by query string, and ordered by most recent timestamp.

**Security model**:
- All search Server Actions authenticate the caller using Supabase server session cookies via `@supabase/ssr`.
- Unauthenticated requests are rejected with an unauthorized error.
- Search queries only return public user profiles and posts; no email addresses, hashed passwords, or private internal identifiers are exposed.

**Configuration required**:
- Zero new environment variables or external API keys needed. Uses existing Supabase and Prisma database configuration.

**Critical test scenarios**:
- Happy path: User visits `/search`, types "alex", sees debounced live results in Top tab with user Alex and matching posts, verifies **AC-1**, **AC-3**, **AC-4**, **AC-5**.
- Tab switching: User switches to Accounts tab, sees paginated matching creators with follower counts and interactive follow button, verifies **AC-4**, **AC-6**, **AC-10**.
- Optimistic follow: User clicks Follow on a search result card, follow button instantly toggles to "Following" without layout jumps, verifies **AC-6**.
- Empty query state: User clears the search bar, page immediately presents recent search history list and suggested creators to follow, verifies **AC-2**, **AC-8**.
- Zero results state: User searches for a non existent term like "xyz999000", page displays friendly empty state card with suggestions, verifies **AC-11**.
- Network failure: Simulated network interruption displays retry button card and Sonner toast without crashing the view, verifies **AC-12**.

## Build plan

- [x] 1. Create search Zod validation schemas in `lib/validation/search.ts` defining search query limits, tab options, and pagination boundaries, satisfies **AC-3**, **AC-4**, **AC-5**.
- [x] 2. Implement search query services in `lib/services/search.service.ts` (`searchUsers`, `searchPosts`, `searchTopSummary`) with Prisma case insensitive substring filtering, cursor pagination, and viewer relation mapping, satisfies **AC-4**, **AC-5**, **AC-6**, **AC-7**, **AC-10**.
- [x] 3. Implement Server Actions in `actions/search.ts` (`searchTopAction`, `searchUsersAction`, `searchPostsAction`) with session authentication, input validation, and structured responses, satisfies **AC-4**, **AC-5**, **AC-10**, **AC-12**.
- [x] 4. Implement local storage recent searches utility in `lib/utils/search-history.ts` managing client history array (retrieval, addition, removal, clear all, and 10 item cap), satisfies **AC-2**, **AC-8**, **AC-9**.
- [x] 5. Build search input component `components/search/search-input.tsx` with 300 millisecond debounced input, clear button, search icon, and loading spinner, satisfies **AC-1**, **AC-3**, **AC-8**.
- [x] 6. Build search category tabs component `components/search/search-tabs.tsx` coordinating Top, Accounts, and Posts views with URL parameter synchronization, satisfies **AC-1**, **AC-4**.
- [x] 7. Build recent searches widget `components/search/recent-searches.tsx` rendering recent query chips and entries with individual delete and clear all actions, satisfies **AC-2**, **AC-8**, **AC-9**.
- [x] 8. Build user search result card `components/search/user-search-result.tsx` displaying user details, follower count, profile link, and integrated optimistic `FollowButton`, satisfies **AC-6**.
- [x] 9. Build post search result card `components/search/post-search-result.tsx` rendering author header, photo preview, caption, engagement metrics, and lightbox preview, satisfies **AC-7**.
- [x] 10. Build empty search results card `components/search/search-empty-state.tsx` displaying helpful keyword suggestions and recommended creators, satisfies **AC-11**.
- [x] 11. Build unified search view container `components/search/search-view.tsx` orchestrating debounced input, URL synchronization, recent searches, tab switching, and infinite scroll pagination for Accounts and Posts, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-4**, **AC-6**, **AC-7**, **AC-10**, **AC-11**, **AC-12**.
- [x] 12. Upgrade `app/(main)/search/page.tsx` server component to parse URL search parameters (`q`, `tab`), prefetch initial results for shared URLs, and render the interactive search interface, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-4**.

## Consequences

**Positive**:
- Fast, intuitive discovery experience for finding creators and discussions across Wink.
- Live debounced search provides immediate visual feedback without requiring extra page reloads or submit clicks.
- Zero database migrations or extra infrastructure costs; runs directly on PostgreSQL via Prisma.
- Shareable URLs allow users to bookmark or share search results with friends directly.
- Recent search history helps users quickly revisit common queries without retyping.

**Negative / tradeoffs**:
- Case insensitive substring search (`contains`) does not provide typo tolerance (misspelling a name will not return fuzzy matches).
- Substring search on post captions performs sequential text scanning in PostgreSQL; acceptable for hundreds of posts at current scale, but full text indexing (`tsvector`) will be needed if posts grow to tens of thousands.

**Neutral**:
- Recent searches are stored per device in browser local storage; search history does not synchronize across different devices or browsers.

## Follow-up

- [ ] Consider adding PostgreSQL `pg_trgm` extension or full text search (`tsvector`) if post volume scales beyond 10,000 posts.
