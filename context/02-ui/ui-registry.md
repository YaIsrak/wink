# UI Component Registry

Inventory of reusable components. **Check this file before creating any new
component.** Update it whenever a new reusable component is added.

| Component      | Location                             | Purpose                                            | Variants / Geometry                                                                                                |
| -------------- | ------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `Button`       | `components/ui/button.tsx`           | Base action button with loading and active pop     | default, secondary, outline, ghost, destructive, link / sm, default, lg, icon (`rounded-lg` / `rounded-xl` for lg) |
| `Input`        | `components/ui/input.tsx`            | Single-line text input with error and focus states | default, error (`rounded-lg`)                                                                                      |
| `Textarea`     | `components/ui/textarea.tsx`         | Multi-line text field                              | default, error (`rounded-lg`)                                                                                      |
| `Badge`        | `components/ui/badge.tsx`            | Notification, status, and tag pills                | default, secondary, outline, destructive, success / sm, default, pill (`rounded-full`)                             |
| `Card`         | `components/ui/card.tsx`             | Monochrome structural container                    | default, interactive (`rounded-xl`)                                                                                |
| `Skeleton`     | `components/ui/skeleton.tsx`         | Loading placeholder box                            | default (`rounded-md`)                                                                                             |
| `Avatar`       | `components/ui/avatar.tsx`           | User profile avatar with fallback & presence dot   | sm, md, lg, xl / status: online, offline, away (`rounded-full`)                                                    |
| `Dialog`       | `components/ui/dialog.tsx`           | Modal overlay dialog (max 520px)                   | default (`rounded-xl`, 30% black backdrop)                                                                         |
| `DropdownMenu` | `components/ui/dropdown-menu.tsx`    | Contextual floating menu                           | default / align: left, right (`rounded-md`)                                                                        |
| `ThemeToggle`  | `components/shared/theme-toggle.tsx` | Light/dark mode toggle button                      | default (`rounded-lg`)                                                                                             |
| `AvatarCropDialog` | `components/onboarding/avatar-crop-dialog.tsx` | Interactive modal for square circular avatar crop | default (`max-w-[520px]`, `rounded-xl`) |
| `AvatarUpload` | `components/onboarding/avatar-upload.tsx` | Avatar preview with camera button triggering crop & upload | size-24/28 preview with camera button |
| `OnboardingForm` | `components/onboarding/onboarding-form.tsx` | Unified profile setup card in max-w-xl | `max-w-xl`, `rounded-xl` |
| `NavItem`        | `components/layout/nav-item.tsx`     | Navigation link with active state, hover, and badge | default (`rounded-xl`) |
| `UserNavCard`    | `components/layout/user-nav-card.tsx` | Desktop user identity card with dropdown and logout | default (`rounded-xl`) |
| `DesktopSidebar` | `components/layout/desktop-sidebar.tsx` | Fixed 260px desktop navigation rail | `w-[260px]`, `hidden lg:flex` |
| `MobileHeader`   | `components/layout/mobile-header.tsx` | Sticky mobile top header with logo and alerts | `h-14`, `flex lg:hidden` |
| `MobileBottomNav` | `components/layout/mobile-bottom-nav.tsx` | Fixed thumb-friendly mobile bottom bar | `h-16`, `flex lg:hidden` |
| `CreatePostDialog` | `components/layout/create-post-dialog.tsx` | Global post composer dialog connected to store | `max-w-[520px]`, `rounded-xl` |
| `NavigationShell` | `components/layout/navigation-shell.tsx` | Responsive layout coordinator for desktop & mobile | app wrapper |
| `PostComposer`    | `components/posts/post-composer.tsx` | Reusable post authoring card with photo upload & preview | inline / dialog (`rounded-xl`) |
| `PostCard`        | `components/posts/post-card.tsx`     | Social feed post card with author, text, image, likes, comments, and lightbox | default (`rounded-xl`) |
| `FeedView`        | `components/posts/feed-view.tsx`     | Feed container coordinating inline composer and live post stream | container |
| `LikersDialog`    | `components/posts/likers-dialog.tsx` | Dialog modal displaying users who liked a post | modal dialog (`max-w-[520px]`, `rounded-xl`) |
| `CommentItem`     | `components/posts/comment-item.tsx`  | Individual comment row with author identity, timestamp, and delete action | default (`text-sm`) |
| `CommentsSection` | `components/posts/comments-section.tsx` | Expandable post comments drawer with composer and list | drawer container |
| `FollowButton`    | `components/profile/follow-button.tsx` | Optimistic follow and unfollow toggle button with pending spinner and toast rollback | default, outline (`rounded-lg`) |
| `FollowListDialog` | `components/profile/follow-list-dialog.tsx` | Modal dialog listing followers or following with inline follow action | modal dialog (`max-w-[520px]`, `rounded-xl`) |
| `EditProfileDialog` | `components/profile/edit-profile-dialog.tsx` | Modal dialog for inline editing of name, bio, location, website, and avatar | modal dialog (`max-w-lg`, `rounded-xl`) |
| `ProfileCompletionBanner` | `components/profile/profile-completion-banner.tsx` | Gamified milestone card with completion percentage and progress bar | default (`rounded-xl`) |
| `PostGrid`        | `components/profile/post-grid.tsx`   | Responsive multi-column thumbnail grid with hover engagement metrics and lightbox | grid 2-col / 3-col (`rounded-xl`) |
| `ProfileTabs`     | `components/profile/profile-tabs.tsx` | Content switcher for Posts (feed/grid toggle), Media, Replies, and Saved | tabbed view |
| `ProfileHeader`   | `components/profile/profile-header.tsx` | User identity header with banner, stats counters, follow actions, and dialog triggers | container card (`rounded-2xl`) |
| `SuggestedUsers`  | `components/profile/suggested-users.tsx` | Card displaying recommended creators to follow with instant follow button | container card (`rounded-xl`) |
| `InfiniteScrollSentinel` | `components/posts/infinite-scroll-sentinel.tsx` | IntersectionObserver sentinel with loading skeletons, retry card, and completion indicator | sentinel (`w-full`) |
| `SearchInput`     | `components/search/search-input.tsx` | Search bar with search icon, clear button, and loading spinner | default (`rounded-xl`) |
| `SearchTabs`      | `components/search/search-tabs.tsx`  | Category switcher for Top, Accounts, and Posts tabs | tabbed bar |
| `RecentSearches`  | `components/search/recent-searches.tsx` | Recent search history list with item deletion and clear all | container (`rounded-xl`) |
| `UserSearchResultCard` | `components/search/user-search-result.tsx` | User card with identity, bio, follower count, and optimistic FollowButton | default (`rounded-xl`) |
| `SearchEmptyState` | `components/search/search-empty-state.tsx` | Zero results card with search tips and suggested creators | container (`rounded-xl`) |
| `SearchView`      | `components/search/search-view.tsx`  | Unified search coordinator with debounced queries, URL sync, and pagination | container view |

## Process before creating a new component

1. Search this table.
2. Search `components/` in the codebase directly (this table can lag).
3. If something close exists, extend it (new prop/variant) instead of
   forking.
4. Only create new if neither applies — then add a row here.
