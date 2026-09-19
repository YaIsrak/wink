# Skill: Realtime Development

How to add or change real-time behavior (DMs, notifications) via Supabase
Realtime.

## Scope

Realtime is used for:
- Direct messages (mutual-follows only)
- Live notifications (likes, comments, follows, new messages)

## Steps

1. Confirm the channel/table already exists in
   `context/01-architecture/data-model.md`; if not, this is a data-model
   change — follow `database-development` skill and get approval first.
2. Subscribe to the relevant Supabase Realtime channel from a client hook
   (e.g. `use-messages.ts`, `use-notifications.ts`) — keep subscription
   logic out of components, in a hook/lib file.
3. Always enforce access control server-side (RLS) for what a user can
   subscribe to/receive — never rely on the client to filter sensitive data.
4. For DMs: verify the mutual-follow condition is enforced at the RLS/service
   layer, not just hidden in the UI.
5. Clean up subscriptions on unmount to avoid leaks.
6. Pair realtime updates with optimistic local state where the user is the
   actor (e.g., sending a message shows instantly; incoming realtime events
   update the rest).
