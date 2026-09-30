# Verify: Getting Started Checklist Widget · spec 0012 · updated 2026-09-30
_Steps derived from spec 0012 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [ ] Visit `/feed` as an active member whose checklist is not dismissed → expect `GettingStartedChecklist` widget rendered at top of feed with correct completed count and progress bar → AC-1
- [ ] Member with 100% profile score → expect Step 1 (Complete your profile) checked with green checkmark and "Completed" badge → AC-2
- [ ] Member following 3 or more creators → expect Step 2 (Follow 3 creators) checked with green checkmark → AC-3
- [ ] Member with at least 1 post authored → expect Step 3 (Share your first post) checked with green checkmark → AC-4
- [ ] Member with at least 1 sent message → expect Step 4 (Send a direct message) checked with green checkmark → AC-5
- [ ] Click chevron collapse toggle → expect checklist body to collapse into slim header bar, with collapsed preference persisted across page reloads → AC-6
- [ ] Click "Edit Profile" on incomplete Step 1 → expect `EditProfileDialog` modal to open prefilled with profile info → AC-8
- [ ] Click "Find People" on incomplete Step 2 → expect smooth scroll and highlight to suggested creators card, or navigation to `/search` → AC-8
- [ ] Click "Create Post" on incomplete Step 3 → expect global post composer modal to open → AC-8
- [ ] Click "Open Messages" on incomplete Step 4 → expect navigation to `/messages` → AC-8
- [ ] Complete all four milestones → expect celebratory banner to display with "Dismiss Checklist" button → AC-7
- [ ] Click "Dismiss Checklist" → expect optimistic hide, server timestamp saved to `user.checklistDismissedAt`, toast confirmation, and widget never reappearing across devices → AC-7

## Commands
- [ ] `npx tsc --noEmit` → completes cleanly with zero errors → AC-1
- [ ] `npm run build` → completes with clean static and dynamic route compilation → AC-1

## Acceptance-criteria coverage
- AC-1 covered by Visit `/feed` and compile commands · AC-2 covered by profile score check · AC-3 covered by follow count check · AC-4 covered by post count check · AC-5 covered by message count check · AC-6 covered by chevron collapse toggle · AC-7 covered by completion banner and dismiss button · AC-8 covered by interactive deep link triggers
