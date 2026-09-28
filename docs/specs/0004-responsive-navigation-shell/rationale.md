# 0004. Responsive navigation shell with desktop sidebar and mobile navigation (Rationale)

## Context

Wink is a social media application built to showcase polished full stack craftsmanship. Navigating across core sections like the feed, explore page, search, notifications, direct messages, and user profile requires an intuitive and responsive layout framework. 

Social applications display different ergonomics on desktop computers versus mobile handsets. On desktop viewports, an expansive left sidebar provides rapid access to primary sections, keeps brand identity visible, and gives room for quick creation actions and account management. On mobile screens, viewport height is precious and hand grip places thumbs near the bottom of the display. Therefore, standard industry best practice pairs a compact top status bar for branding and alerts with a thumb friendly bottom navigation bar for primary browsing tasks.

The user experience must transition smoothly between these two layouts, maintain active state across page transitions, provide clear visual indicators for unread notifications, and allow users to sign out cleanly.

## Options considered

### Option 1: Shared layout shell with responsive desktop sidebar, mobile top header, and mobile bottom bar (Recommended)

A root server layout under `app/(main)/layout.tsx` checks authentication and retrieves the current user profile. It wraps child views in a client navigation shell component. Tailwind responsive utility classes show a fixed 260px wide left sidebar on large screens (1024px and wider), while showing a sticky top bar and fixed bottom bar on mobile screens. The create post button opens a client dialog modal without leaving the current screen. Logout is accessible via a user profile dropdown menu on desktop and via profile navigation on mobile.

**Pros**:
- Direct alignment with the provided design references `feed-desktop.png` and `feed-mobile.png`.
- Thumb friendly ergonomic navigation on mobile devices.
- High efficiency and zero layout shift because route changes only rerender page content while navigation rails stay mounted.
- Reuses existing UI primitives including `Avatar`, `Button`, `DropdownMenu`, and `Dialog`.
- Leverages existing Zustand stores for lightweight badge synchronization.

**Cons**:
- Requires careful handling of content padding margins so page content does not collide with fixed navigation bars.

### Option 2: Collapsible hamburger drawer across all viewports

Replace the fixed desktop sidebar and mobile bottom bar with a single universal top header featuring a hamburger menu icon that slides open a drawer containing all navigation links and logout.

**Pros**:
- Simpler single component implementation across all screen sizes.
- Maximum horizontal space for feed content on desktop.

**Cons**:
- Hides primary navigation links behind an extra click, reducing engagement.
- Conflicts directly with the desktop and mobile design references.
- Inferior mobile ergonomics compared to a fixed bottom navigation bar.

### Option 3: Minimal top horizontal navbar for both desktop and mobile

A traditional horizontal navbar fixed at the top of the screen with horizontal tabs for Feed, Explore, Search, Messages, and Profile.

**Pros**:
- Traditional layout familiar from classical websites.

**Cons**:
- Poor fit for social media apps with many navigation destinations.
- Horizontally scrollable tabs on mobile feel clunky and hard to reach with one hand.
- Fails to match the modern left rail design in `feed-desktop.png`.

## Rationale

Option 1 is selected because it strictly fulfills the design intent captured in `feed-desktop.png` and `feed-mobile.png` while following industry standards for social applications. 

On desktop screens, a persistent vertical left rail keeps all destinations one click away without eating vertical reading height. Placing the user profile card and logout trigger in the lower left corner provides consistent identity awareness and simple account management. 

On mobile devices, separating quick alerts (notifications, messages) into the top header and navigation into a five item bottom bar matches native mobile app conventions. The elevated center plus button makes creating posts effortless. 

Option 2 was rejected because hiding essential social navigation inside a drawer increases friction. Option 3 was rejected because top horizontal navigation does not scale well on mobile viewports and fails to deliver the modern desktop aesthetic specified in our designs.
