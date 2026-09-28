# Rationale: 0005. Post model and post creation with optimistic user interface

## Context

Phase 2 of Wink centers around the core social loop: sharing posts, viewing the home feed, liking, commenting, and following creators. The foundation of this loop is the post model and the authoring experience.

Social media users expect instantaneous responsiveness when submitting a post. If a user has to stare at a loading spinner for three seconds while a high resolution photograph uploads and commits to the database, the application feels sluggish and dated. At the same time, we must maintain data integrity, validate constraints, and guard against unauthorized modifications.

We need a design that satisfies three key requirements:
1. High performance media uploads that do not block Next.js server threads with large file payloads.
2. Immediate user feedback using an optimistic state pattern where the new post is visible in the feed right away.
3. Solid security with database level validation, authorization, and Supabase Row Level Security.

## Options considered

### Option 1: Direct Supabase Storage upload paired with Next.js Server Action and Zustand optimistic store

In this approach, the browser uploads image files directly to the public Supabase Storage `posts` bucket via the Supabase client library. Once the upload finishes and returns a public URL, a Next.js Server Action is called with the caption and image URL. Before awaiting the server response, the client prepends an optimistic post object into a dedicated Zustand `usePostStore`. When the action succeeds, the optimistic post is updated with the real database record. If the action fails, the post is rolled back and a toast notification informs the user.

**Pros**:
- Upload traffic bypasses Next.js server entirely, keeping memory and CPU usage on Vercel minimal.
- Immediate visual response in the feed, satisfying our optimistic user experience mandate.
- Clean consistency with our Phase 1 avatar upload pattern.
- Robust state rollback on failure without loss of user text in the composer.

**Cons**:
- Unfinished post submissions could leave unused images in Supabase Storage.
- Requires coordinated state management across composer dialog, inline feed composer, and the feed list.

### Option 2: Server Action multipart upload with React 19 useOptimistic and path revalidation

In this approach, post submissions send a `FormData` payload containing both the raw image file and caption directly to a Next.js Server Action. The server uploads the file to Supabase Storage, creates the Prisma record, and calls `revalidatePath('/feed')`. Optimistic rendering relies on React 19 `useOptimistic` inside the feed component.

**Pros**:
- Single round trip from the browser to the application server.
- Built entirely on standard React 19 primitives without additional Zustand state.

**Cons**:
- Sending raw image files through Next.js Server Actions increases serverless function execution time and bandwidth costs.
- Coordinating optimistic state across separate components (the global sidebar modal and the feed page) is difficult with localized `useOptimistic` hooks.
- Server action file upload size limits can lead to unexpected 413 payload errors on Vercel.

## Rationale

We chose Option 1 because it delivers the best balance of speed, cost efficiency, and user experience.

Direct storage uploads to Supabase avoid taxing serverless function execution limits. This mirrors the proven pattern we established in Phase 1 for avatar uploads. Zustand provides a unified store that allows both the global sidebar modal and the inline feed composer to update the exact same feed state seamlessly. The optimistic store pattern ensures that users see their post appear instantaneously, providing a fast social experience.

## References

**Project sources**:
- `context/01-architecture/data-model.md` (Post entity specification)
- `context/01-architecture/architecture.md` (Server Action and Prisma service boundaries)
- `context/04-development/build-plan.md` (Phase 2 core features plan)
- `docs/specs/0003-onboarding-profile-setup/index.md` (Supabase Storage upload pattern)
- `docs/specs/0004-responsive-navigation-shell/index.md` (Create Post dialog integration)
- `AGENTS.md` (Optimistic mutation mandate and component reuse guidelines)

**Practices and standards**:
- Optimistic UI updates with reversible state transitions
- Defense in depth through Supabase Postgres Row Level Security
- Storage folder isolation by user identifier
