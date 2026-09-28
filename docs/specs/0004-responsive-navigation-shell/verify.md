# 0004. Responsive navigation shell verification checklist

## Visual layout verification

- [ ] **Desktop view (viewport width 1280px or wider)**:
  - Persistent left sidebar renders with width 260px and border on right.
  - Wink logo and wordmark render at the top of the sidebar.
  - Navigation links render with icons and labels: Feed, Explore, Search, Messages, Notifications, Profile, Settings.
  - Currently active link shows visual highlight container.
  - Black "+ Create Post" button renders prominently in sidebar.
  - Sidebar footer displays authenticated user avatar with presence dot, display name, and username handle.
  - Clicking three dot button on user card opens dropdown menu displaying Profile, Settings, Theme toggle, and Logout.
  - Mobile top header and mobile bottom bar are completely hidden on desktop viewports.

- [ ] **Mobile view (viewport width 375px to 425px)**:
  - Desktop sidebar is completely hidden.
  - Sticky top header displays Wink logo on left, notification bell and direct message icon on right.
  - Unread badge counters or alert dots render on notification and message icons.
  - Fixed bottom bar displays five items: Home, Explore, center Create Post plus button, Inbox, Profile.
  - Bottom bar includes safe area padding for modern phone gesture bars.
  - Page content has bottom margin (`pb-20`) so bottom content is not obscured.

## Functional verification

- [ ] **Navigation routing**:
  - Clicking Feed navigates to `/feed` with active state updating.
  - Clicking Search navigates to `/search`.
  - Clicking Profile navigates to user profile.
  - Clicking Messages navigates to `/messages`.
  - Clicking Notifications navigates to `/notifications`.

- [ ] **Create post dialog**:
  - Clicking "+ Create Post" on desktop sidebar opens modal dialog overlay.
  - Clicking center plus button on mobile bottom bar opens modal dialog overlay.
  - Modal dialog can be dismissed with escape key or close button without route change.

- [ ] **Sign out flow**:
  - Clicking Logout triggers `logoutAction`.
  - Browser session terminates and user is redirected to `/login` with success toast.

- [ ] **Authentication protection**:
  - Visiting any route under `app/(main)` without a session redirects immediately to `/login`.
  - Visiting while onboarding is incomplete redirects to `/onboarding`.
