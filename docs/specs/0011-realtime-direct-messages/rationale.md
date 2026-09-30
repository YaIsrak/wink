# 0011. Realtime Direct Messages and Message Requests: Rationale

**Date**: 2026-09-30

## Context

Direct private communication is a fundamental capability of social platforms. In Wink, users share updates, follow other creators, and engage through comments and likes. While public discourse drives discovery, community members require private spaces to discuss shared interests, coordinate collaborations, and build relationships.

In initial product definitions, direct messaging was conceived as restricted exclusively to mutual follows. While this rule prevents unsolicited messages, it creates friction when an enthusiastic follower wishes to reach out to a creator who does not follow them yet. In real social applications, a two tier messaging system resolves this tension: mutual follows open directly into an active thread, while one way follows route initial outreach into a separate Message Requests inbox. The recipient retains complete autonomy to preview messages and decide whether to accept or decline.

Additionally, messaging requires high responsiveness. Senders expect their text to appear immediately without waiting for a round trip server confirmation. When mistakes happen, users expect to edit or delete messages without destroying data integrity on the backend. Finally, realtime presence indicators and browser notifications ensure conversations feel active and timely.

## Options considered

### Option 1: Direct Messaging with Request Flow, Soft Deletes, Supabase Realtime, and Browser Push Notifications

A comprehensive messaging architecture that introduces dedicated `Conversation` and `Message` tables in Postgres via Prisma. Conversations have a `status` field (`PENDING`, `ACCEPTED`, `DECLINED`) that automatically categorizes threads. Mutual follows receive immediate `ACCEPTED` status, while one way follows start as `PENDING` message requests. Mutations are handled via Next.js Server Actions with optimistic UI updates, broadcasting live events through Supabase Realtime channels. Message editing labels messages as edited on both sides, while soft deletion hides content from both participants while preserving rows in Postgres. Browser notifications provide external alerts when the tab is inactive.

**Pros**:
- Solves spam prevention while allowing follower outreach through an intuitive Message Requests filter.
- Preserves full backend auditability through soft deletes while respecting user intent to remove visible text.
- Provides immediate visual feedback through optimistic store updates and realtime Supabase channel synchronization.
- Leverages existing Supabase Realtime and Storage infrastructure without introducing new backend services.

**Cons**:
- Requires coordinating client state between active conversation windows, request filters, and presence beacons.
- Increases websocket channel count per active user.

### Option 2: Strictly Mutual Only Messaging with Direct Hard Deletion

A simplified messaging system that enforces direct communication exclusively between users who follow each other mutually. Anyone attempting to message a non mutual follow is blocked. Messages deleted by users are physically removed from the database via SQL DELETE commands.

**Pros**:
- Simplifies schema and UI by omitting message request tabs, preview screens, and decision buttons.
- Reduces database storage footprint by permanently clearing deleted messages.

**Cons**:
- Restrictive user experience that prevents legitimate initial outreach between creators.
- Destroys data auditability by permanently erasing records from the database.
- Lacks transparency for edited messages.

### Option 3: Separate MessageRequest Table with Graduation into Conversations

An architecture separating message requests into a dedicated table (`MessageRequest`), copying records into a `Conversation` and `Message` table only after the recipient clicks Accept.

**Pros**:
- Keeps the primary conversation table purely dedicated to confirmed chats.

**Cons**:
- Introduces data duplication and complex table migration logic upon acceptance.
- Makes previewing multi message request threads clunky across disparate tables.

## Rationale

Option 1 is selected because it balances open social discovery with creator protection. The `status` enum on `Conversation` cleanly supports both mutual chats and pending requests without fracturing schema tables. Soft deletion fulfills user expectations of removing visible content while preserving backend integrity for compliance and moderation safety. Leveraging Supabase Realtime and Storage builds directly on Wink's existing technology stack without adding new operational dependencies.
