# Rationale: 0006. Optimistic Likes and Post Comments

## Context

The Wink web application provides photo sharing and caption publishing in the home feed. However, community interaction remains strictly one directional. Members can publish posts and view feeds, but cannot express appreciation, react to content, or engage in discussions under each post.

Social interactions like tapping hearts or leaving remarks are the primary drivers of community retention and active participation. Because users interact frequently with these controls on both mobile and desktop screens, latency or sluggish network feedback makes the application feel unresponsive. Every like tap or comment post must feel instantaneous.

At our target scale of approximately one hundred active users, database complexity must remain manageable. We must maintain data integrity when posts or accounts are removed, prevent duplicate likes, and avoid counter drift where displayed numbers diverge from actual database rows. Furthermore, we must establish clear moderation authority so that post creators can maintain healthy conversations beneath their content.

## Options considered

### Option 1: Dynamic Prisma Aggregations with Client Store Optimistic Handlers

Likes and comments exist as separate normalized relational tables with foreign keys linking to posts and users. Post counts for likes and comments are computed dynamically via relation counts during feed fetching. The frontend manages optimistic updates directly inside the existing Zustand store, handling temporary keys, in flight state locking, and rollbacks.

**Pros**:
- Guarantees zero counter drift because displayed numbers always match real records.
- Leverages existing Zustand store architecture without adding extra libraries or state managers.
- Minimal moving parts with straightforward cascade deletions on Postgres foreign keys.

**Cons**:
- Requires relational count aggregations during feed queries, though negligible at our hundred user scale.
- Client store must maintain explicit rollback logic for each mutation failure mode.

### Option 2: Denormalized Integer Counters on Post Table with Database Triggers

Add `likesCount` and `commentsCount` integer columns directly to the `posts` table. Whenever a like or comment is added or deleted, a PostgreSQL trigger or transactional service method increments or decrements these counter columns.

**Pros**:
- Reading the feed requires no relational count calculation, reading static numbers directly off the post row.
- Slightly faster query execution for very high volume reads.

**Cons**:
- Counter values frequently drift or desynchronize when concurrent requests fail partway or transactions roll back.
- Adds database trigger maintenance or complex distributed transaction locks.
- Unnecessary operational overhead for our target scale.

### Option 3: Offloaded Realtime Chat Architecture with Third Party Widget

Embed a third party commenting widget or separate external discussion service for conversation threads.

**Pros**:
- Offloads UI rendering and thread persistence to an external service.

**Cons**:
- Breaks visual continuity and dark mode theming consistency across the application.
- Introduces external dependencies, recurring subscription costs, and vendor lock in.
- Completely violates our unified Supabase Postgres architecture principles.

## Rationale

Option 1 is selected because it directly aligns with the Wink architectural philosophy of keeping technology simple and robust. At a scale of one hundred members, relational databases excel at dynamic count aggregations. Computing counts dynamically through Prisma queries eliminates an entire class of synchronization bugs where counters get stuck out of sync with actual rows.

Managing optimistic updates in the client Zustand store ensures immediate tactile feedback for heart taps and comments while keeping our application bundle lean. Using Tailwind CSS pulse animations gives a lively feel without installing heavy external animation runtimes. Cascade deletions in Postgres maintain pristine referential integrity whenever members delete their posts.
