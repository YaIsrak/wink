# 0012. Getting Started Checklist Widget

**Date**: 2026-09-30
**Status**: Accepted

## Summary

This specification defines a getting started checklist widget displayed at the top of the home feed. The widget tracks four milestones for new members: completing their profile, following three creators, publishing their first post, and sending their first direct message. All milestone states compute dynamically from live database records, and users can dismiss the widget permanently once all four milestones are satisfied. The component includes an instant collapse toggle and direct interactive triggers to guide members smoothly into the platform community.

## Requirements

**User stories**:
- As a newly registered member, I want clear guidance on key actions so that I can quickly set up my presence and discover active creators.
- As an active member, I want to collapse or dismiss the checklist once finished so that my home feed remains focused on content.

**Acceptance criteria**:
- **AC-1**: The checklist widget renders at the top of the home feed for authenticated members whose checklist is not dismissed.
- **AC-2**: Milestone one (profile completion) dynamically evaluates as complete when the member profile completion score reaches 100 percent.
- **AC-3**: Milestone two (follow creators) dynamically evaluates as complete when the member follows at least three other accounts.
- **AC-4**: Milestone three (create post) dynamically evaluates as complete when the member has created at least one post.
- **AC-5**: Milestone four (send direct message) dynamically evaluates as complete when the member has sent at least one direct message.
- **AC-6**: Members can collapse and expand the checklist card at any time, saving the view preference locally without database overhead.
- **AC-7**: Members can dismiss the checklist permanently only after completing all four milestones, persisting a completion timestamp to the database to hide the card across devices.
- **AC-8**: Clicking an incomplete milestone triggers its action (profile completion opens the profile edit dialog, following creators scrolls to suggested users or search, post creation opens the global composer modal, and direct messaging navigates to messages).

## Decision

**Chosen option**: Option 1: Dynamic database queries with persistent user dismissal timestamp

The getting started checklist dynamically evaluates milestone progress from existing database records, with permanent dismissal stored in a nullable database column on the user profile.

**Implementation skills**: `tailwind-css-patterns`, `shadcn`

## Rationale

Reasoning and options: see rationale.md

## Feature design

**Data model sketch**:

Table modification (`prisma/schema.prisma`):
- `User` entity receives one new nullable field: `checklistDismissedAt DateTime?`

Milestone evaluation rules:
- Profile complete: `calculateProfileCompletion(user) >= 100`
- Follow creators: count of `Follow` records where `followerId == user.id` is at least 3
- Create post: count of `Post` records where `authorId == user.id` is at least 1
- Send direct message: count of `Message` records where `senderId == user.id` is at least 1

**State transitions**:

Widget display states:
1. `ACTIVE_EXPANDED`: Default state for new members. All incomplete and complete milestones visible, progress bar rendered at top.
2. `ACTIVE_COLLAPSED`: User clicked the chevron toggle. Card collapses to a slim header showing progress count (such as "2 of 4 tasks completed") and an expand icon.
3. `ALL_COMPLETED`: All four milestones satisfied. Progress bar fills to 100 percent, celebratory badge displays, and a "Dismiss checklist" button becomes active.
4. `DISMISSED`: User clicked the dismiss button. Database stores `checklistDismissedAt`, and the widget unmounts completely from the feed.

**API surface**:

| Endpoint / Action | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `getChecklistProgressAction` | Server Action | None (uses session) | `{ progress: ChecklistProgress }` | Authenticated | 401 Unauthorized |
| `dismissChecklistAction` | Server Action | None (uses session) | `{ success: boolean }` | Authenticated | 400 Incomplete, 401 Unauthorized |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Feed load | `isProfileComplete` | Derived from `calculateProfileCompletion(user) >= 100` |
| Feed load | `isFollowingComplete` | Derived from `prisma.follow.count({ where: { followerId: user.id } }) >= 3` |
| Feed load | `isPostComplete` | Derived from `prisma.post.count({ where: { authorId: user.id } }) >= 1` |
| Feed load | `isMessageComplete` | Derived from `prisma.message.count({ where: { senderId: user.id } }) >= 1` |
| Feed load | `completedCount` | Derived sum of satisfied milestones (integer 0 to 4) |
| Feed load | `isDismissed` | Derived from `user.checklistDismissedAt != null` |
| Client toggle | `isCollapsed` | Derived from client state in `useUiStore` (local browser storage) |
| Dismiss action | `checklistDismissedAt` | Generated on server via `new Date()` upon verification of all milestones |

**Key invariants**:
- The checklist widget never renders if `checklistDismissedAt` contains a timestamp.
- The dismiss action strictly verifies that all four milestones are satisfied before writing `checklistDismissedAt`.
- If an account deletes items before dismissal (such as unfollowing creators), the dynamic count drops and milestones uncheck accordingly.
- Dismissal is irreversible; once dismissed, the checklist will not return.

**Security model**:
- All operations are scoped strictly to the authenticated session member.
- Members cannot query or dismiss checklists belonging to other accounts.
- Row level security and Prisma service functions enforce user ownership checks.

**Configuration required**:
- None. No new environment variables, secrets, or third party credentials are required.

**Critical test scenarios**:
- Happy path: New member completes their profile, follows three accounts, publishes their first photo post, and sends a direct message; all four items display checkmarks, the dismiss button activates, and clicking dismiss hides the widget permanently across page reloads. Verifies AC-1, AC-2, AC-3, AC-4, AC-5, AC-7.
- Premature dismiss attempt: Member attempts to invoke `dismissChecklistAction` when only two milestones are complete; server action rejects the request with an error message. Verifies AC-7.
- Collapse state persistence: Member collapses the widget, refreshes the feed page, and the widget remains in its slim collapsed state. Verifies AC-6.
- Interactive deep link trigger: Member clicks "Make first post", triggering the global composer dialog without page navigation. Verifies AC-8.

## Build plan

1. [x] Add `checklistDismissedAt DateTime?` to the `User` model in `prisma/schema.prisma` and synchronize the database with `npx prisma db push`, satisfies **AC-1**, **AC-7**
2. [x] Implement query helper `getChecklistProgress` and update helper `dismissChecklist` in `lib/services/checklist.service.ts`, satisfies **AC-2**, **AC-3**, **AC-4**, **AC-5**, **AC-7**
3. [x] Create Server Action `dismissChecklistAction` in `actions/checklist.ts` with session authentication and completion validation, satisfies **AC-7**
4. [x] Add `isChecklistCollapsed` and toggle action to `lib/store/ui-store.ts` with local storage persistence, satisfies **AC-6**
5. [x] Create `components/feed/getting-started-checklist.tsx` with progress bar, step items, interactive action hooks, collapse toggle, and optimistic dismissal, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-4**, **AC-5**, **AC-6**, **AC-7**, **AC-8**
6. [x] Update `app/(main)/feed/page.tsx` and `components/posts/feed-view.tsx` to prefetch checklist progress and render the widget above the feed, satisfies **AC-1**
7. [x] Register new components in `context/02-ui/ui-registry.md`, satisfies **AC-1**

## Consequences

**Positive**:
- New members receive immediate orientation and clear gamified goals right after onboarding.
- Dynamic evaluation eliminates data synchronization bugs and stale progress states.
- Server prefetching eliminates layout shift on feed page load.
- Database persisted dismissal guarantees that dismissed widgets do not reappear across mobile and desktop devices.

**Negative / tradeoffs**:
- Computing milestone counts on feed load adds lightweight count queries to the initial feed request (mitigated by indexed user foreign keys).
- Members who wish to review the checklist after dismissing it cannot reopen it.

**Neutral**:
- Requires pushing a single column migration to the Postgres database.
- Requires updating the UI component registry.

## Follow-up

- [x] Execute `npx prisma db push` to add the column to Supabase Postgres.
- [ ] Verify responsive rendering on mobile and desktop viewports.
