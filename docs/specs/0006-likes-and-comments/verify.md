# Verify: Optimistic Likes and Post Comments · spec 0006 · updated 2026-09-29
_Steps derived from spec 0006 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [ ] Tap heart icon on any post card -> Heart immediately turns filled red with scale animation and count increments by 1 -> AC-1
- [ ] Tap filled heart icon again -> Heart turns to outline and count decrements by 1 -> AC-1
- [ ] Network failure during like toggle -> Heart state and count rollback to prior values with Sonner toast -> AC-2
- [ ] Click like count number on post with likes -> Likers dialog opens displaying user avatars, names, handles, profile links, and relative timestamps -> AC-3
- [ ] Click like count on post with zero likes -> Shows empty state "No likes yet" -> AC-3
- [ ] Type comment under 280 characters and press submit -> Comment appends immediately with posting state, then reconciles, and count increments -> AC-4
- [ ] Submit empty comment or whitespace only -> Blocked by validation -> AC-5
- [ ] Submit comment over 280 characters -> Blocked by character limit with toast error -> AC-5
- [ ] Network failure during comment creation -> Comment removed from list, draft text restored to input, and Sonner toast displayed -> AC-6
- [ ] Comment author clicks delete on their comment -> Comment removed optimistically and deleted from server -> AC-7
- [ ] Post author clicks delete on another member's comment -> Comment removed optimistically and deleted from server (moderation) -> AC-7
- [ ] Non author viewer -> No delete button visible on comments by other users -> AC-7
- [ ] Post card with comments -> Shows total count and up to two newest preview comments when collapsed -> AC-8
- [ ] Click comment icon or "View all comments" -> Comments drawer expands with full chronological conversation and composer -> AC-8
- [ ] Delete parent post -> Associated likes and comments cascade deleted from database -> AC-9

## Commands
- [ ] `npx tsc --noEmit` -> Zero errors -> AC-1..AC-9
- [ ] `npm run build` -> Successful Next.js Turbopack production compilation -> AC-1..AC-9

## Acceptance criteria coverage
- AC-1 covered by like toggle and active states
- AC-2 covered by like failure rollback
- AC-3 covered by likers dialog modal
- AC-4 covered by optimistic comment append
- AC-5 covered by Zod input length validation
- AC-6 covered by comment failure rollback and draft restoration
- AC-7 covered by author and post owner comment deletion
- AC-8 covered by preview comments and collapsible comments drawer
- AC-9 covered by Postgres schema cascade constraints and Supabase RLS
