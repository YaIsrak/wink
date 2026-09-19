# Skill: Feature Development

How to take a feature from request to done in this codebase.

## Steps

1. **Understand** — restate the feature in your own words; confirm scope if
   ambiguous.
2. **Inspect context** — read relevant files in `context/` (data model, UI
   rules, API design) so the feature fits existing conventions.
3. **Inspect existing code** — search `components/`, `lib/`, `actions/`,
   `app/` for anything reusable. Never build blind.
4. **Plan** — for anything non-trivial, write a short plan: what
   files/routes/components are touched, any schema changes, any new
   dependency. Show it to the user before implementing.
5. **Implement**:
   - Route handlers stay thin; logic goes in `lib/services/`.
   - New UI: check `ui-registry.md` first (see `ui-development` skill).
   - Mutations are optimistic; loading states use skeletons.
   - Validate input with Zod.
6. **Verify** — only if asked. When asked, check against the Definition of
   Done checklist in `build-plan.md`.
7. **Review diff** — re-read your own changes for scope creep or unrelated
   edits before calling it done.
8. **Update documentation** — append to `progress-tracker.md`; log any
   notable decision in `decisions.md`.

## Don't

- Don't touch architecture or the data model without approval.
- Don't add a major dependency without approval (small utilities are fine).
- Don't mark something done that hasn't actually been checked.
