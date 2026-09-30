# 0012. Getting Started Checklist Widget: Rationale

## Context

When new members join Wink, onboarding helps them set up their avatar and profile details. Once they land on the home feed, however, their personal feed stream is naturally empty because they do not yet follow other creators. Without explicit orientation, new accounts encounter an empty state and may abandon the session before experiencing the core product loop (discovering creators, posting content, and direct messaging).

The product architecture addresses this onboarding friction through a gamified checklist widget located on the home feed. The widget provides four immediate goals: completing the profile, following three creators, creating a first post, and sending a first direct message.

Several technical forces govern how this checklist should be designed:
1. **State consistency**: Storing separate boolean flags for each step in a dedicated tracking table risks becoming out of sync with actual database records (for example, if a user deletes a post or unfollows an account).
2. **Device synchronization**: If checklist dismissal is stored only in the browser, a member who completes and dismisses the checklist on their phone will still see the widget when opening the web application on a desktop computer.
3. **Performance and query overhead**: The home feed is the highest traffic view in the application. Any queries used to determine checklist progress must remain lightweight, leveraging existing database indexes.
4. **Member control**: Members who complete all four milestones should have the power to dismiss the widget permanently so their feed remains clean. Members who have not yet finished all milestones should still have the option to collapse the widget out of view while they browse.

## Options considered

### Option 1: Dynamic database queries with persistent user dismissal timestamp (Chosen)

Evaluate all four milestone steps dynamically at read time by querying existing tables (counting follows, posts, messages, and profile completion score). When all milestones reach completion, the user can click a dismiss button that writes a timestamp to a new `checklistDismissedAt` column on the `User` table. The feed page checks this timestamp; if present, the widget is excluded from rendering. View collapsing is saved in browser storage.

**Pros**:
- Zero risk of stale or desynchronized progress state.
- Permanent dismissal synchronizes across all devices and browsers.
- Minimal database schema expansion (only one new nullable column).
- Collapse state operates instantly on the client with zero network requests.

**Cons**:
- Incurs a small set of indexed count queries during initial feed load for users who have not yet dismissed the checklist.

### Option 2: Pure client local storage tracking with zero database changes

Evaluate checklist steps purely on the client side, storing both completion state and dismissal status inside local storage via Zustand.

**Pros**:
- Requires no schema changes or database migrations.
- Zero extra database queries on feed load.

**Cons**:
- Checklist progress and dismissal do not synchronize across devices; a user must dismiss the widget on every browser and phone they use.
- Clearing browser cache or switching to private browsing resurrects the dismissed widget.

### Option 3: Dedicated checklist tracking table in Postgres

Create a new relational table (such as `UserChecklist`) with foreign keys and timestamp columns for every individual step (`profileCompletedAt`, `followCompletedAt`, `postCompletedAt`, `messageCompletedAt`, `dismissedAt`).

**Pros**:
- Enables historical analytics on the exact moment each milestone was completed.
- Feed load queries a single row on the checklist table rather than counting rows across multiple tables.

**Cons**:
- Creates redundant duplicated state that must be kept in sync through database triggers or service hooks across four separate services (user, follow, post, and message).
- High maintenance overhead for a personal portfolio scale application with around 100 users.

## Rationale

Option 1 is selected because it delivers the optimal balance of data integrity, cross device reliability, and architectural simplicity.

Dynamic evaluation relies on single indexed count lookups (`followerId`, `authorId`, `senderId`) which execute in milliseconds in PostgreSQL. This completely eliminates the complex synchronization overhead required by Option 3, where every post deletion, follow removal, or message soft delete would need corresponding trigger hooks to avoid stale checklist state.

Furthermore, Option 1 avoids the poor user experience of Option 2 by recording dismissal in the user record, ensuring that once a member celebrates completing the platform milestones, the widget stays dismissed permanently across all their devices.
