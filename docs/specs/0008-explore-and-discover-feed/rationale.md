# 0008. Explore and Discover Feed: Rationale

**Date**: 2026-09-29

## Context

Phase 2 completed the core social graph on Wink, including post creation, optimistic likes and comments, follow relationships, and personal profile pages. The primary feed on `/feed` supports both a global For You view and a Following view. However, users need a dedicated discovery surface to find creators and hot posts beyond their existing social circles.

Currently, the `/explore` route is a static placeholder card (`app/(main)/explore/page.tsx`). Without an explore feed, new users arriving on the platform have limited exposure to the broader community, while existing users must rely on manual profile lookups to find new creators to follow. The explore feed must provide a continuous, engaging stream of community content loaded in batches of ten posts, ensuring fast initial page loads and responsive scrolling.

## Options considered

### Option 1: Blended Engagement and Recency Ranking with Intersection Observer Batching and Post Store Integration

Build a dedicated explore query in the post service that ranks posts using a composite score of likes, comments, and recency, while omitting posts authored by the viewer. The feed loads the first ten posts on the server during initial page request, and attaches an intersection observer sentinel at the bottom to trigger server action batch fetches for subsequent ten post pages. State is managed through an explore slice in the Zustand post store, ensuring that likes and comments stay synchronized across the entire application.

**Pros**:
- Delivers an engaging discovery experience that surfaces active community conversations.
- Fast initial page render with zero layout shift because the first batch renders on the server.
- Efficient network utilization by fetching small batches of ten posts on demand.
- Reuses existing post cards, like actions, comments drawer, and follow buttons without duplicated logic.
- Keyset cursor pagination prevents skipped or duplicate posts as new likes arrive.

**Cons**:
- Dynamic ranking requires sorting on aggregated relation counts at query time.

### Option 2: Pure Chronological Stream with Offset Pagination

Display all community posts strictly ordered by creation timestamp, using traditional offset pagination (`page=1, 2, 3`) with limit ten.

**Pros**:
- Very simple database query with standard index scans on `createdAt`.

**Cons**:
- Does not highlight popular or high quality community posts, giving equal weight to short or inactive posts.
- Offset pagination suffers from drift: if new posts are published while a user is scrolling, posts can shift between pages resulting in duplicate items appearing in the feed.

### Option 3: Media First Three Column Grid Layout

Render posts in a three column photo thumbnail grid similar to traditional photo sharing apps, opening posts in a modal dialog on click.

**Pros**:
- High visual density on desktop screens for photo browsing.

**Cons**:
- Excludes or creates an awkward representation for text only posts without photos.
- Disconnects comments and direct discussion from the browsing experience, requiring an extra modal click to read captions and join conversations.

## Rationale

Option 1 is selected because it delivers the best balance between discovery value, reading speed, and technical simplicity. A composite rank combining likes, comments, and recency brings vibrant community discussions to the foreground while preventing older posts from indefinitely crowding out fresh updates.

Using a vertical feed stream with standard post cards matches the polished aesthetic already established in the home feed and profile views. Users can immediately read captions, see preview comments, toggle likes, and follow unfamiliar creators without needing to open secondary modals.

Batching in groups of ten posts using a native browser intersection observer provides a seamless infinite scroll experience. The initial batch of ten posts renders on the server, ensuring instant content delivery and search friendly HTML, while subsequent batches load smoothly as the user browses down the page.
