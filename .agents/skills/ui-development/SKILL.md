# Skill: UI Development

How to build or modify UI in this project without duplicating components.

## Before creating anything

1. Search `context/02-ui/ui-registry.md` for an existing component that
   covers (or nearly covers) the need.
2. Search the codebase (`components/`) directly — the registry can lag
   behind reality.
3. If something close exists: **extend** it (add a prop/variant) rather than
   forking it.
4. Only create a new component if neither reuse nor extension is reasonable.
5. If you create a new component, add it to `ui-registry.md`.

## Building a screen/component

- Reference `/theme` for text styles, button variants, spacing, and color
  tokens — don't invent new ones inline.
- Use shadcn/ui primitives as the base; style with Tailwind utility classes.
- Any data-fetching component needs a shadcn Skeleton fallback.
- Any mutation (like, follow, comment, post) updates local/optimistic state
  immediately, then reconciles with the server response; roll back + toast
  on failure.
- Respect mobile-first layout; check the desktop breakpoint too.
- Respect both light and dark mode — test the component in both.

## Gamification widgets

- Profile completion banner and "Getting Started" checklist are shared
  patterns — check `context/02-ui/ui-rules.md` before adding a new nudge or
  changing existing ones.
