# 0007. Profile Page and Follow System: Verification

**Date**: 2026-09-29

## Verification Checklist

Use this checklist to verify that all acceptance criteria are met upon completing the implementation.

### 1. Profile Header and Identity (AC-1, AC-10)
- [ ] Visit `/profile/[username]` for an existing user. Verify avatar, display name, handle, bio, location, website link, and joined date display correctly.
- [ ] Verify post count, follower count, and following count accurately match database values.
- [ ] Visit `/profile/nonexistent_username_test`. Verify a 404 not found card appears with a clean shortcut back to the feed.

### 2. Follow and Unfollow Mechanics (AC-3, AC-4)
- [ ] Visit another user profile while logged in. Verify the Follow button appears in its default unfollowed state.
- [ ] Click the Follow button. Verify the button label switches immediately to Following, styling updates, and follower count increments by 1 without full page reload.
- [ ] Refresh the page. Verify the button persists in the Following state.
- [ ] Click Following to unfollow. Verify state toggles back to Follow and follower count decrements by 1.
- [ ] Check personal profile while logged in. Verify the Follow button is absent.
- [ ] Attempt a direct follow request where session ID equals target ID. Verify request is rejected with a validation error.

### 3. Followers and Following Dialogs (AC-5)
- [ ] Click on the follower count in the profile header. Verify a modal dialog opens displaying the list of followers.
- [ ] Verify each list item displays user avatar, display name, handle, and a contextual follow or unfollow button.
- [ ] Verify clicking the follow button inside the dialog updates follow status for that user.
- [ ] Click on the following count. Verify a modal dialog opens displaying the users followed by the profile owner.

### 4. Inline Profile Editing (AC-2)
- [ ] On your own profile, click the Edit Profile button. Verify the edit dialog opens with current name, bio, location, website, and avatar prefilled.
- [ ] Update display name, bio, location, and website, then submit the form.
- [ ] Verify the dialog closes, a success toast appears, and the profile header immediately reflects the updated values.

### 5. Profile Completion Milestone Banner (AC-9)
- [ ] With missing fields (such as empty website or empty bio), verify the milestone banner appears above the profile header with an accurate completion percentage.
- [ ] Update profile fields to satisfy all completion criteria. Verify the completion reaches 100 percent and the banner disappears.
- [ ] Visit another user profile. Verify the completion banner is never shown.

### 6. Content Tabs and Post Layouts (AC-6, AC-7, AC-8)
- [ ] On the profile page, verify tabs for Posts, Replies, Media, and Saved are visible.
- [ ] In the Posts tab, test toggling between Grid View and Feed List View. Verify posts transition between responsive multi column image grid and full post cards.
- [ ] Switch to the Media tab. Verify only posts that include an image attachment are rendered in the gallery grid.
- [ ] Click on Replies and Saved tabs. Verify appropriate placeholder or empty states are shown.
