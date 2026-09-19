# Rule: UI

- `/theme` is the design-system source of truth. Any new text style, button
  variant, toast, dropdown, or modal pattern must exist there first, or be
  added there when introduced.
- Before creating a UI component, check `context/02-ui/ui-registry.md` and
  the codebase. Reuse or extend an existing component before creating a new
  one.
- Every mutation (like, comment, follow, post) updates the UI **optimistically**
  before the server responds. Roll back and show an error toast (Sonner) if
  the request fails.
- Every view that fetches data shows a shadcn skeleton while loading — no
  blank screens or unstyled spinners.
- Use Sonner toasts for success/error/loading feedback on actions.
- Font is Inter, app-wide. Don't introduce another typeface without
  updating `/theme` and asking the user.
- Support light and dark mode via a visible toggle — don't rely on system
  preference alone.
- Mobile-first responsive layout; verify desktop layout too before calling a
  screen done.
- Gamification elements (profile completion %, "Getting Started" checklist)
  follow the UX rules in `context/02-ui/ui-rules.md` — don't add new
  gamification mechanics without checking there first.
