# Progress Tracker

Living log of completed work. Updated automatically as features are
finished. Not a planning document — see `build-plan.md` for that.

## Format

```
## [Date] — [Feature/Task]
- What was done
- Status: Done | In Progress | Blocked
```

---

## 2026-09-20 — Phase 0: Tailwind v4 & /theme Design System Page

- Configured Tailwind CSS v4 using CSS-first `@theme` and `@custom-variant dark` in `app/globals.css`
- Mapped design tokens, monochrome palette, typography scale (Inter), and micro-radii from `context/design/code/DESIGN.md`
- Built core UI primitives (`Button`, `Input`, `Textarea`, `Badge`, `Card`, `Skeleton`, `Avatar`, `Dialog`, `DropdownMenu`, `ThemeToggle`)
- Registered primitives in `context/02-ui/ui-registry.md`
- Integrated Sonner toast notifications in `app/layout.tsx`
- Built comprehensive `/theme` living source-of-truth preview page with interactive states, toasts, dialogs, inputs, skeletons, and light/dark toggle
- Refined geometry: increased roundness on buttons (`rounded-lg`/`rounded-xl`), cards & dialogs (`rounded-xl`), inputs (`rounded-lg`), removed sticky header navbar from `/theme`, and updated UI registry
- Status: Done
