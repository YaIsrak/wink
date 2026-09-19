# Design System

The **`/theme`** route is the living source of truth for the design system
— build it first, before any feature screen. It should preview:

- Text styles (headings, body, caption, muted text)
- Buttons (primary, secondary, ghost, destructive, icon) including hover/
  press/loading/disabled animated states
- Toasts (Sonner: success, error, loading)
- Dropdowns, modals/dialogs
- Form inputs, textarea, search bar
- Avatar (with status indicator variant for DMs)
- Skeleton loading states
- Light/dark mode toggle demo

## Foundations

- **Font:** Inter, app-wide.
- **Base:** shadcn/ui components + Tailwind CSS utility classes.
- **Color:** neutral base (white/gray light, dark gray/black dark) + one
  accent color. Exact palette to be finalized once a reference image is
  provided (see project notes) or via the Google Stitch output.
- **Corners/spacing:** soft rounded corners, consistent Tailwind spacing
  scale, soft shadows on cards.
- **Modes:** light and dark, toggled via a visible UI control (not just
  system preference).

## Reference

A detailed prompt for generating visual design direction in Google Stitch
was produced during project setup (see conversation history / attach the
Stitch output here once available). A reference image may be supplied later
to refine tokens below.
