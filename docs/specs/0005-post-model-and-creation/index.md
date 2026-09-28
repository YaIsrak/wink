# 0005. Post model and post creation with optimistic user interface

**Date**: 2026-09-28
**Status**: Accepted

## Summary

This specification defines the database model and creation flow for posts in Wink. Users can author posts with a photo, a caption, or both, as long as at least one is present. Photos upload directly to a public Supabase Storage bucket with client side isolation, while a Next.js Server Action handles data persistence and validation. The user interface updates optimistically using a dedicated Zustand store so that newly created posts appear in the feed without waiting for network round trips.

## Requirements

**User stories**:
- As an authenticated user, I want to create a post with text, a photo, or both so that I can share updates with my followers.
- As an authenticated user, I want to upload an image from my device up to 5MB (JPG, PNG, WebP) and preview it before publishing.
- As an authenticated user, I want my new post to appear at the top of my feed instantly so that publishing feels immediate and smooth.
- As an authenticated user, I want helpful error feedback and my drafted text preserved if a network or storage failure occurs during post creation so that I do not lose my work.
- As an authenticated user, I want to open the post composer either from the navigation bar button or directly from the top of the home feed.

**Acceptance criteria**:
- **AC-1**: Database schema includes a `Post` model with UUID identifier, author relation, optional caption (up to 1,000 characters), optional image URL, created timestamp (indexed descending), and updated timestamp.
- **AC-2**: Server Action validates input using a strict Zod schema ensuring that at least one of caption or image URL is present, caption length does not exceed 1,000 characters, and image URL is a valid web address.
- **AC-3**: Author identity is securely derived from the authenticated session server side, preventing any spoofing of author identifiers.
- **AC-4**: Row Level Security (RLS) policies on the `posts` table permit authenticated users to insert, update, or delete only rows where `author_id` matches their own Supabase authentication identifier.
- **AC-5**: A public Supabase Storage bucket named `posts` accepts image files up to 5MB with mime type restrictions (`image/jpeg`, `image/png`, `image/webp`, `image/gif`) and isolates user folders by user identifier.
- **AC-6**: Client side file picker verifies image size and file type before upload, displaying a removable image thumbnail preview in the composer.
- **AC-7**: Post submission adds an optimistic post item to the feed state immediately with a temporary identifier and a posting state indicator.
- **AC-8**: Upon successful creation from the server, the temporary post is swapped with the confirmed database record without layout shifts.
- **AC-9**: If image upload or post creation fails, the optimistic post is removed from the feed, a Sonner error toast is displayed, and the composer keeps the user's drafted caption and selected image intact for retry.
- **AC-10**: Both the global modal dialog (`CreatePostDialog`) and the inline feed composer share the same submission logic and optimistic state store.

## Decision

**Chosen option**: Option 1: Direct Supabase Storage upload paired with Next.js Server Action and a Zustand optimistic post store

Images upload straight from the browser to the Supabase Storage `posts` bucket using user folder isolation. The post record is created via a thin Next.js Server Action running Prisma queries against Postgres. Client feed state is managed through a lightweight Zustand `usePostStore` that handles optimistic prepending, server record reconciliation, and rollback on failure.

**Implementation skills**: `supabase` (`supabase/supabase-js`, `.agents/skills/supabase/SKILL.md`) · `supabase-postgres-best-practices` (`supabase/postgres`, `.agents/skills/supabase-postgres-best-practices/SKILL.md`) · `shadcn` (`shadcn/ui`, `.agents/skills/shadcn/SKILL.md`) · `tailwind-css-patterns` (`tailwindlabs/tailwindcss`, `.agents/skills/tailwind-css-patterns/SKILL.md`)

## Rationale

Reasoning and options: see rationale.md

## Feature design

**Data model sketch**:

`Post` model in `prisma/schema.prisma`:
- `id`: UUID (Primary Key, `@default(uuid()) @db.Uuid`)
- `authorId`: UUID (Foreign Key referencing `User.id`, `@db.Uuid`, `onDelete: Cascade`, indexed)
- `caption`: String? (`@db.Text`, optional, max 1,000 characters)
- `imageUrl`: String? (optional, points to public Supabase Storage URL)
- `createdAt`: DateTime (`@default(now())`, indexed descending for fast feed sorting)
- `updatedAt`: DateTime (`@updatedAt`)

Relation added to `User` model:
- `posts Post[]`

**Postgres Row Level Security (RLS)**:
- Table: `public.posts`
- Enable RLS: `ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;`
- Read policy: Authenticated users can view all posts.
- Insert policy: Authenticated users can only insert rows where `author_id = auth.uid()`.
- Update policy: Authenticated users can only update rows where `author_id = auth.uid()`.
- Delete policy: Authenticated users can only delete rows where `author_id = auth.uid()`.

**Supabase Storage setup**:
- Bucket: `posts` (public, 5MB file limit, allowed mime types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`)
- Path schema: `${userId}/${uuid}.${extension}`
- Storage policies: Public read for all objects in `posts`; insert and delete restricted to authenticated owners matching `${userId}` folder prefix.

**State transitions**:
Post creation flow:
1. `idle`: Composer has optional text and optional image selection.
2. `uploading_image`: File selected, uploading directly to Supabase Storage.
3. `optimistic_pending`: Temporary post with `isOptimistic: true` and temporary UUID prepended to `usePostStore`.
4. `persisted`: Server returns true post object with real database UUID, replacing the temporary post in `usePostStore`.
5. `failed`: Optimistic item pruned from store, Sonner toast alerts user, composer remains populated for quick retry.

**API surface**:
| Endpoint / Action | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `createPostAction` in `actions/post.ts` | Server Action | `caption?: string`, `imageUrl?: string` | `{ success: true, post: PostWithAuthor }` | Authenticated session | `UNAUTHORIZED`, `VALIDATION_ERROR`, `SERVER_ERROR` |
| `getFeedPostsAction` in `actions/post.ts` | Server Action | `cursor?: string`, `limit?: number` | `{ success: true, posts: PostWithAuthor[], nextCursor?: string }` | Authenticated session | `UNAUTHORIZED`, `SERVER_ERROR` |

**Value sourcing**:
| Action | Value produced or displayed | Source |
|---|---|---|
| Create post | `id` | Generated UUID via database default |
| Create post | `authorId` | Authenticated Supabase session user identifier |
| Create post | `caption` | User input parameter from composer form |
| Create post | `imageUrl` | Uploaded Supabase Storage object public URL |
| Create post | `createdAt` | Postgres `now()` timestamp |
| Render post | Author avatar and handle | Joined `User` record (`displayName`, `username`, `avatarUrl`) |
| Render post | Optimistic pending state | Transient client store property `isOptimistic` |

**Key invariants**:
- Every post must have at least one non empty field among `caption` and `imageUrl`.
- Captions must not exceed 1,000 characters.
- Images uploaded must not exceed 5 megabytes.
- Posts belong to exactly one author and cannot be reassigned.
- Deleting an author cascades to all their posts.

**Security model**:
- Authorization enforced at the Next.js Server Action layer using `lib/supabase/server.ts` session checks.
- Defense in depth provided by Supabase Postgres RLS policies on `posts` table and storage policies on `posts` bucket.
- Client never passes arbitrary author identifiers; the server resolves identity strictly from verified session tokens.

**Critical test scenarios**:
- Happy path: User types a caption, attaches a 2MB image, clicks Post, sees optimistic post card immediately, and receives confirmation from server. Verifies **AC-1**, **AC-2**, **AC-3**, **AC-6**, **AC-7**, **AC-8**.
- Validation error: User submits with both caption and image empty; client and server validation halts submission with informative error message. Verifies **AC-2**.
- Network failure during persistence: Optimistic post vanishes from feed, toast alerts user, text and image stay in composer. Verifies **AC-9**.
- Unauthorized submission: Unauthenticated request to Server Action returns `UNAUTHORIZED` error without touching database. Verifies **AC-3**, **AC-4**.
- Image size limit exceeded: Client immediately rejects file larger than 5MB with toast warning without initiating network request. Verifies **AC-6**.

## Build plan

- [x] 1. Update `prisma/schema.prisma` with `Post` model and push changes to Supabase Postgres database, satisfies **AC-1**.
- [x] 2. Apply Supabase Postgres RLS policies for `posts` table and configure Supabase Storage `posts` bucket with storage security policies, satisfies **AC-4**, **AC-5**.
- [x] 3. Create post validation schemas in `lib/validation/post.ts` with caption length and media presence rules, satisfies **AC-2**.
- [x] 4. Implement `lib/services/post.service.ts` for database operations using Prisma client, satisfies **AC-1**, **AC-3**.
- [x] 5. Implement server actions in `actions/post.ts` for creating posts and fetching feed posts, satisfies **AC-2**, **AC-3**.
- [x] 6. Create `lib/store/post-store.ts` for optimistic feed management with prepend, reconcile, and rollback capabilities, satisfies **AC-7**, **AC-8**, **AC-9**.
- [x] 7. Build reusable `components/posts/post-composer.tsx` supporting image file selection, preview, removal, and optimistic submission, satisfies **AC-6**, **AC-9**, **AC-10**.
- [x] 8. Build `components/posts/post-card.tsx` to render post content, media, author details, relative timestamp, and optimistic pending badge, satisfies **AC-7**, **AC-8**.
- [x] 9. Integrate `post-composer` inside `components/layout/create-post-dialog.tsx`, satisfies **AC-10**.
- [x] 10. Update `app/(main)/feed/page.tsx` with top inline composer and live post feed connected to `usePostStore`, satisfies **AC-7**, **AC-10**.


## Consequences

**Positive**:
- Immediate visual gratification for users when sharing updates with zero perceived network latency.
- Clean separation between storage upload and database record creation keeps Next.js server free of heavy multipart binary payloads.
- Strict RLS policies protect data integrity even if API layers are bypassed.

**Negative / tradeoffs**:
- Failed posts disappear after being optimistically shown, which can cause brief visual jarring if user connection drops.
- Abandoned image uploads could leave orphan files in Supabase Storage if post creation is never finalized.

**Neutral**:
- Requires adding and running database migration on Supabase Postgres.
- Requires Supabase dashboard or migration execution to provision the `posts` storage bucket.

## Follow-up

- [ ] Add scheduled cron or storage trigger to clean up orphan uploaded images that never received a database record.
- [ ] Connect like and comment subcomponents in Phase 2 once basic post rendering is verified.
