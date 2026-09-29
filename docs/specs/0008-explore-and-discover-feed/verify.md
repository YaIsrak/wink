# 0008. Explore and Discover Feed: Verification

**Date**: 2026-09-29

## Verification Checklist

Use this checklist to verify that all acceptance criteria are met upon completing the implementation.

### 1. Initial Page Load and Server Rendering (AC-1, AC-2, AC-5)
- [ ] Visit `/explore` while authenticated. Verify the explore header displays with the compass icon, title, and descriptive subtitle.
- [ ] Inspect page source or disable JavaScript temporarily. Verify the first batch of up to ten post cards is rendered in the server HTML without layout shift.
- [ ] Verify that no posts authored by the logged in session user appear anywhere in the explore feed.

### 2. Infinite Scroll and Batch Pagination (AC-3, AC-8, AC-10)
- [ ] Scroll down through the initial ten posts. Verify that as the tenth post approaches the viewport, the loading skeleton indicator appears briefly and the next batch of ten posts loads automatically.
- [ ] Verify that new posts append smoothly to the bottom of the feed without jumping or resetting the scroll position.
- [ ] Scroll rapidly downward. Verify that the in flight request lock prevents multiple simultaneous queries, and no duplicate posts appear in the list.
- [ ] Scroll until all posts in the database are fetched. Verify that the end of feed indicator displays indicating the stream is complete.
- [ ] Click the back to top button on the end of feed card. Verify the browser smoothly scrolls back to the top of the explore page.

### 3. Ranking and Content Display (AC-4, AC-6)
- [ ] Verify that posts with more likes and comments appear higher in the feed order compared to unengaged older posts.
- [ ] Verify that posts authored by creators you do not currently follow display an active Follow button in their card header.
- [ ] Verify that posts authored by users you already follow do not display a follow button.

### 4. Interactive Feedback and State Synchronization (AC-7)
- [ ] Click the heart like button on an explore post. Verify the heart animates immediately, the count increments by one, and state persists when navigating to home feed or profile.
- [ ] Expand the comments section and submit a new comment. Verify the comment appears optimistically in the thread and the comment counter increments.
- [ ] Click the Follow button on an unfamiliar creator within an explore post card. Verify the button changes to Following, and subsequent posts by that creator across the session reflect the new follow status.

### 5. Network Error Resilience and Retry (AC-9)
- [ ] Simulate network offline state using browser developer tools and scroll down to trigger the next batch.
- [ ] Verify that an error toast notification appears and an inline retry card renders at the bottom of the feed.
- [ ] Verify that existing posts remain visible and interactive.
- [ ] Re enable the network and click the Retry button on the card. Verify the pending batch of ten posts loads successfully and scrolling resumes.
