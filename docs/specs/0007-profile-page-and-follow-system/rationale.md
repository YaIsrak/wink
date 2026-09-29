# 0007. Profile Page and Follow System: Rationale

**Date**: 2026-09-29

## Context

The profile page is central to identity, personal discovery, and user engagement on Wink. Currently, the profile page exists only as an early placeholder view (`app/(main)/profile/[username]/page.tsx`) that was created to support post author navigation during post actions development. It lacks interactive follow mechanics, follower and following lists, media filtering, tab switching, and inline profile editing.

At the same time, the Wink build plan for Phase 2 prioritizes both follow relationships and complete profile pages. Follow relationships are an essential architectural dependency for the home feed (filtering posts by followed users), direct messaging (restricted to mutual follows), and notifications (follow activity alerts). Addressing both requirements together ensures that the profile presentation and social graph interactions are tightly cohesive, tested together, and fully aligned with design mockups.

## Options considered

### Option 1: Integrated Profile Experience with Follow System and Inline Modal Dialogs

Build the complete profile page surface together with the underlying Follow database model and actions. This includes expanding the User model with optional location and website fields, introducing the Follow entity with unique composite constraints, implementing optimistic follow toggles, building follower and following modal dialogs, and adding tabbed posts and media galleries with view toggles.

**Pros**:
- Solves the core social graph requirement needed by home feed and direct messaging.
- Delivers a polished user experience directly matching `context/design/code/profile-desktop.html`.
- Consolidates profile editing into an inline dialog, avoiding jarring redirects to onboarding.
- Optimistic UI updates make social interactions feel instant and responsive.

**Cons**:
- Spans database changes, server actions, optimistic client state, and multiple UI components in one increment.

### Option 2: Minimal Profile Presentation with Separate Follow Feature

Limit the profile page update strictly to presentation changes using existing user fields and dummy follow counters, deferring the Follow model and interactive follow buttons to a separate follow feature spec.

**Pros**:
- Smaller immediate development slice.

**Cons**:
- Leaves the profile page in an artificial, half completed state where follow buttons and stats are non functional.
- Requires rewriting profile components shortly afterward when the follow system is built.
- Delays unlocking the home feed follow filter and mutual follow checks.

## Rationale

Option 1 is selected because follow relationships and profile presentation are fundamentally intertwined in user facing social applications. Users visit profiles primarily to evaluate content and follow creators. Building follow state alongside the profile view provides immediate end to end value, allows real testing of the follow graph, and unblocks subsequent Phase 2 features including personalized feed filtering and activity notifications.

Inline dialog modals for editing profiles and inspecting follower lists provide a frictionless experience that keeps users in context on their profile without disrupting page state or navigation.
