# UI Rules

## Optimistic updates

Every mutation (like, comment, follow, post creation) updates local UI
state immediately, before server confirmation. On failure: roll back the
optimistic change and show an error toast (Sonner).

## Loading states

Every component/page that fetches data shows a shadcn `Skeleton` while
loading — never a blank screen or bare spinner.

## Feedback

Use Sonner toasts consistently for success, error, and loading feedback on
user actions.

## Gamification

- **Profile completion banner** — shown on the user's own profile (and
  optionally the feed) while completion < 100%. Shows a percentage and
  links back to the missing onboarding fields. Disappears once 100%.
- **"Getting Started" checklist** — shown on the home feed until all steps
  are complete: complete profile → follow 3 people → make first post →
  send first DM. Dismissible once fully checked off; each item links to the
  relevant action.
- **Empty states** should gently nudge the user toward the next action
  (e.g. empty feed → "Follow people to see their posts"; empty DM list →
  "Message someone you follow").

## Responsiveness

Mobile-first. Every screen must also be verified at desktop breakpoints
before being considered done.

## Motion

Subtle micro-interactions only: hover/press states, like-button pop
animation, smooth transitions on toasts/modals. Avoid heavy or gratuitous
animation.
