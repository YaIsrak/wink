# 0007. Profile Page and Follow System

**Date**: 2026-09-29
**Status**: In Progress

## Summary

This specification upgrades the profile page into a complete profile experience and introduces the follow system. Users can view profile details, see follower and following statistics, inspect paginated follower lists in dialog modals, and toggle follow status with instant optimistic feedback. The profile view introduces a tabbed interface for posts and media along with a grid or feed list view switcher, an edit profile dialog for account owners, and a gamified profile completion banner. All data mutations enforce ownership rules and database level constraints.

## Requirements

**User stories**:
- As an active user, I want to visit any user profile to see their bio, location, website, follower stats, and post history so that I can understand their identity and content.
- As an active user, I want to follow and unfollow other users with instant feedback so that I can curate my feed.
- As a profile viewer, I want to browse follower and following lists in a dialog modal so that I can discover related people.
- As an account owner, I want to edit my profile details in an inline modal dialog and see my profile completion milestone progress so that I can keep my presence current.

**Acceptance criteria**:
- **AC-1**: Visiting `/profile/[username]` displays the target user identity (avatar, online status badge, display name, handle, bio, location, website, join date, and counts for posts, followers, and following).
- **AC-2**: When viewing your own profile, an Edit Profile button opens an interactive modal dialog allowing instant updates to display name, bio, location, website, and avatar.
- **AC-3**: When viewing another user profile, a primary Follow or Unfollow button reflects the relationship with the current session user. Clicking toggles state optimistically and updates the follower count immediately, rolling back on error with a toast notification.
- **AC-4**: A user cannot follow themselves. The follow button is absent on personal profiles, and backend requests attempting a self follow are rejected with a validation error.
- **AC-5**: Clicking the follower or following count triggers a modal dialog that loads a paginated list of users with avatars, names, handles, and contextual follow action buttons.
- **AC-6**: The profile displays a tabbed content switcher supporting a Posts tab and a Media tab, with inactive placeholders for Replies and Saved.
- **AC-7**: The Posts tab provides a view switcher between a photo grid view and a feed list view, remembering the viewer preference during the session.
- **AC-8**: The Media tab filters and renders only posts that include an image attachment in a responsive grid layout.
- **AC-9**: For the account owner, a profile completion milestone banner appears when overall completion is below 100 percent, displaying the calculated percentage and a progress bar. The banner is hidden when at 100 percent and is never displayed on other users profiles.
- **AC-10**: If a requested username does not exist in the database, the page renders a clean not found state with a shortcut back to the feed.

## Decision

**Chosen option**: Option 1: Integrated Profile Experience with Follow System and Inline Modal Dialogs

We will build the complete profile surface and underlying follow relationship model together. This includes adding optional website and location fields to the User model, creating the Follow relation table with composite uniqueness, and implementing optimistic follow toggles and follower dialogs.

**Implementation skills**: `shadcn` (`.agents/skills/shadcn/`) · `supabase` (`.agents/skills/supabase/`) · `tailwind-css-patterns` (`.agents/skills/tailwind-css-patterns/`)

## Rationale

Reasoning and options: see rationale.md

## Feature design

**Data model sketch**:

```prisma
// Extension to existing User model
model User {
  // Existing fields: id, email, username, displayName, avatarUrl, bio, onboardedAt, createdAt, updatedAt
  website     String?   @db.VarChar(255)
  location    String?   @db.VarChar(100)

  // Relations
  posts       Post[]
  likes       Like[]
  comments    Comment[]
  followers   Follow[]  @relation("UserFollowers")
  following   Follow[]  @relation("UserFollowing")
}

// New Follow model
model Follow {
  id          String    @id @default(uuid()) @db.Uuid
  followerId  String    @db.Uuid
  followingId String    @db.Uuid
  createdAt   DateTime  @default(now())

  follower    User      @relation("UserFollowing", fields: [followerId], references: [id], onDelete: Cascade)
  following   User      @relation("UserFollowers", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
  @@map("follows")
}
```

**State transitions**:

```
Follow State Machine (User A viewing User B):
[Not Following] -- toggleFollowAction (optimistic: Following, count + 1) --> [Following]
[Following]     -- toggleFollowAction (optimistic: Not Following, count - 1) --> [Not Following]
Error on network / server --> Rollback state and counter, show error toast
```

**API surface**:

| Endpoint or Action | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `toggleFollowAction` | Server Action | `targetUserId: string` | `{ isFollowing: boolean, followersCount: number }` | Session user required | 400 (self follow), 401, 404 (user missing), 500 |
| `getUserFollowersAction` | Server Action | `userId: string, cursor?: string, limit?: number` | `{ users: FollowUserItem[], nextCursor: string \| null }` | Session user required | 401, 404, 500 |
| `getUserFollowingAction` | Server Action | `userId: string, cursor?: string, limit?: number` | `{ users: FollowUserItem[], nextCursor: string \| null }` | Session user required | 401, 404, 500 |
| `updateProfileDetailsAction` | Server Action | `formData: UpdateProfileInput` | `{ user: UserProfile }` | Session user (owner only) | 400 (validation), 401, 403, 500 |
| `getProfileDataAction` | Server Action | `username: string` | `{ profile: FullUserProfile, stats: ProfileStats, isFollowing: boolean }` | Session user required | 401, 404, 500 |

**Value sourcing**:

| Action | Value produced or displayed | Source |
|---|---|---|
| Profile header load | Display name, handle, bio, avatar, joined date | Database columns on `users` table |
| Profile header load | Website and location text | Database columns `users.website` and `users.location` |
| Profile stats load | Posts count | Derived query `count(posts where authorId = targetProfile.id)` |
| Profile stats load | Followers count | Derived query `count(follows where followingId = targetProfile.id)` |
| Profile stats load | Following count | Derived query `count(follows where followerId = targetProfile.id)` |
| Profile stats load | `isFollowing` relationship status | Derived query `exists(follows where followerId = sessionUser.id and followingId = targetProfile.id)` |
| Completion milestone | Profile completion percentage | Computed formula based on presence of displayName (20), username (20), avatarUrl (25), bio (20), website or location (15) |
| Follow toggle | New follow state and updated count | Input `targetUserId` combined with `sessionUser.id`, committed to `follows` table |
| Followers dialog | List of follower user cards | Read from `follows` joined with `users` on `followerId` |
| Following dialog | List of following user cards | Read from `follows` joined with `users` on `followingId` |

**Key invariants**:
- Uniqueness: A user can follow another user at most once, enforced by `@@unique([followerId, followingId])` on the Postgres table.
- Self follow restriction: `followerId !== followingId`. Enforced in the validation schema and server action logic.
- Cascade deletion: Deleting a user account cascades to remove all associated follow relationships in both directions.
- Ownership protection: Profile updates can only modify the authenticated session user record (`sessionUser.id === targetProfile.id`).

**Security model**:
- Supabase Row Level Security on `follows`:
  - `select`: readable by all authenticated users.
  - `insert`: allowed only when `auth.uid() = follower_id` and `follower_id != following_id`.
  - `delete`: allowed only when `auth.uid() = follower_id`.
- Supabase Row Level Security on `users`:
  - `select`: readable by all authenticated users.
  - `update`: allowed only when `auth.uid() = id`.
- Input validation: Zod schemas enforce string length limits (bio max 160 characters, displayName max 50 characters, location max 100 characters, website max 255 valid URL format).

**Configuration required**:
- None. Reuses existing Supabase Postgres database and authentication.

**Critical test scenarios**:
- Happy path: User visits another profile, clicks Follow, button toggles immediately to Following, follower count increments, and database records the follow row, verifying **AC-1**, **AC-3**.
- Unfollow path: User clicks Following button, button toggles to Follow, follower count decrements, row is deleted from database, verifying **AC-3**.
- Self follow attempt: Server action called with identical session user ID and target user ID rejects with bad request error, verifying **AC-4**.
- Followers modal pagination: Clicking followers counter opens dialog, fetches list with cursor pagination, and renders follow buttons matching current user relations, verifying **AC-5**.
- Inline profile editing: Owner updates display name, bio, location, and website, saves dialog, page displays updated fields without full reload, verifying **AC-2**.
- Completion banner lifecycle: Owner with incomplete profile sees banner with accurate progress bar; upon completing website and bio to reach 100 percent, banner dismisses, verifying **AC-9**.
- Media tab filtering: Switching to Media tab shows only posts with image attachments in a grid, excluding text only posts, verifying **AC-8**.
- Not found handling: Visiting `/profile/nonexistent_user` returns not found view with return shortcut, verifying **AC-10**.

## Build plan

1. [x] Extend Prisma schema with `website` and `location` fields on `User`, add the `Follow` model, run database migration, and update Supabase Row Level Security policies, satisfies **AC-1**, **AC-3**, **AC-4**
2. [x] Create Zod validation schemas for profile updates and follow actions in `lib/validation/profile.ts`, satisfies **AC-2**, **AC-4**
3. [x] Implement `lib/services/follow.service.ts` for database queries (toggle follow, follower count, following count, check follow status, paginated followers and following lists), satisfies **AC-3**, **AC-4**, **AC-5**
4. [x] Implement `lib/services/user.service.ts` updates for profile field edits and completion score calculation, satisfies **AC-1**, **AC-2**, **AC-9**
5. [x] Create Server Actions in `actions/follow.ts` (`toggleFollowAction`, `getUserFollowersAction`, `getUserFollowingAction`) and `actions/profile.ts` (`updateProfileDetailsAction`), satisfies **AC-2**, **AC-3**, **AC-4**, **AC-5**
6. [x] Build `components/profile/follow-button.tsx` supporting optimistic state toggle, pending feedback, and error rollback, satisfies **AC-3**, **AC-4**
7. [x] Build `components/profile/follow-list-dialog.tsx` displaying paginated followers or following lists with user cards and follow actions, satisfies **AC-5**
8. [x] Build `components/profile/edit-profile-dialog.tsx` providing an inline form for editing avatar, name, bio, location, and website, satisfies **AC-2**
9. [x] Build `components/profile/profile-completion-banner.tsx` displaying milestone percentage, progress track, and edit trigger, satisfies **AC-9**
10. [x] Build `components/profile/profile-tabs.tsx` and `components/profile/post-grid.tsx` supporting Posts feed or grid views and Media tab image gallery, satisfies **AC-6**, **AC-7**, **AC-8**
11. [x] Upgrade `app/(main)/profile/[username]/page.tsx` and assemble the complete profile header, stats counters, actions, and tabs layout, satisfies **AC-1**, **AC-10**

## Consequences

**Positive**:
- Establishes the foundational social graph (follows) necessary for personalized home feeds and mutual follow direct messaging.
- Delivers a visually rich, engaging profile page matching design mockups with both feed and grid layouts.
- Gives users full control over their public profile presentation and clear feedback on profile completeness.

**Negative / tradeoffs**:
- Storing follower and following counts via runtime queries can become slower as user graphs grow, requiring denormalized count columns or Redis caching in future phases.
- Two distinct post display modes (feed list and image grid) require maintaining two card presentation components.

**Neutral**:
- Requires a database schema push to Supabase Postgres.
- Requires updating UI registry with new profile components.

## Follow-up

- [x] Update `prisma/schema.prisma` and push migration to Supabase Postgres.
- [ ] Connect the home feed query in Phase 2 to filter posts by followed authors once the follow system is active.
- [x] Register new components in `context/02-ui/ui-registry.md`.

## Migration plan

**Strategy**: Direct additive schema migration
**Phases**:
1. Add nullable `website` and `location` columns to `users` table via Prisma db push.
2. Create `follows` table with foreign key cascades and unique composite index.
3. Apply Supabase Row Level Security policies on `follows` table.
4. Deploy application code containing updated services, actions, and profile UI components.
**Rollback**:
- Revert application code commit. New nullable columns and follow table remain harmlessly dormant if code is reverted.
**Risks**:
- Low risk. Schema changes are strictly additive with nullable fields and a new standalone table.
