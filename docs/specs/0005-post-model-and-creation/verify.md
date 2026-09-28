# Verify: Post model and post creation with optimistic UI · spec 0005 · updated 2026-09-28
_Steps derived from spec 0005 acceptance criteria. `/check verify` runs these._

## UI / manual
- [ ] Visit `/feed` while signed in with a completed profile → top inline post composer card and feed list render cleanly → AC-7, AC-10
- [ ] Type text into the composer, attach a valid photograph (< 5MB), and click Post → post immediately appears at top of feed with posting status, image uploads to Supabase Storage `posts` bucket, server action succeeds, and temporary post reconciles with real record without flicker → AC-1, AC-3, AC-5, AC-6, AC-7, AC-8
- [ ] Create a text only post without image → post publishes successfully and displays with author details and relative timestamp → AC-1, AC-2, AC-7, AC-8
- [ ] Create a photo only post without text caption → post publishes successfully and displays with image → AC-1, AC-2, AC-7, AC-8
- [ ] Attempt to submit a post with both caption and photo empty → Post button remains disabled or error toast informs user that content is required → AC-2
- [ ] Click "+ Create Post" from desktop left sidebar or center button in mobile bottom navigation → `CreatePostDialog` opens with autofocus composer, submitting works identically to inline composer → AC-7, AC-10
- [ ] Select an image file larger than 5MB → error toast displays immediately and file selection is rejected → AC-5, AC-6
- [ ] Simulate network failure or invalid session during upload → optimistic post is rolled back from feed, Sonner error toast displays, and user's drafted caption and selected image stay in composer → AC-9

## Commands
- [ ] `npx tsc --noEmit` → TypeScript type check passes with 0 errors → AC-1, AC-2, AC-3
- [ ] `npm run build` → Next.js Turbopack production build succeeds with all routes compiled → AC-1, AC-7, AC-10

## Acceptance-criteria coverage
- AC-1 covered by Prisma schema, migrations, and database queries
- AC-2 covered by `lib/validation/post.ts` and `createPostAction`
- AC-3 covered by server action session authentication via Supabase
- AC-4 covered by Supabase Postgres Row Level Security policies on `posts`
- AC-5 covered by Supabase Storage `posts` bucket configuration and RLS
- AC-6 covered by `PostComposer` file picker validation and preview
- AC-7 covered by `usePostStore` optimistic prepend
- AC-8 covered by `usePostStore.reconcilePost`
- AC-9 covered by `usePostStore.rollbackOptimisticPost` and form draft preservation
- AC-10 covered by `CreatePostDialog` and `FeedView` sharing `PostComposer` and store
