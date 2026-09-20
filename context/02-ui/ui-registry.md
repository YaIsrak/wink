# UI Component Registry

Inventory of reusable components. **Check this file before creating any new
component.** Update it whenever a new reusable component is added.

| Component      | Location                             | Purpose                                            | Variants / Geometry                                                                                                |
| -------------- | ------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `Button`       | `components/ui/button.tsx`           | Base action button with loading and active pop     | default, secondary, outline, ghost, destructive, link / sm, default, lg, icon (`rounded-lg` / `rounded-xl` for lg) |
| `Input`        | `components/ui/input.tsx`            | Single-line text input with error and focus states | default, error (`rounded-lg`)                                                                                      |
| `Textarea`     | `components/ui/textarea.tsx`         | Multi-line text field                              | default, error (`rounded-lg`)                                                                                      |
| `Badge`        | `components/ui/badge.tsx`            | Notification, status, and tag pills                | default, secondary, outline, destructive, success / sm, default, pill (`rounded-full`)                             |
| `Card`         | `components/ui/card.tsx`             | Monochrome structural container                    | default, interactive (`rounded-xl`)                                                                                |
| `Skeleton`     | `components/ui/skeleton.tsx`         | Loading placeholder box                            | default (`rounded-md`)                                                                                             |
| `Avatar`       | `components/ui/avatar.tsx`           | User profile avatar with fallback & presence dot   | sm, md, lg, xl / status: online, offline, away (`rounded-full`)                                                    |
| `Dialog`       | `components/ui/dialog.tsx`           | Modal overlay dialog (max 520px)                   | default (`rounded-xl`, 30% black backdrop)                                                                         |
| `DropdownMenu` | `components/ui/dropdown-menu.tsx`    | Contextual floating menu                           | default / align: left, right (`rounded-md`)                                                                        |
| `ThemeToggle`  | `components/shared/theme-toggle.tsx` | Light/dark mode toggle button                      | default (`rounded-lg`)                                                                                             |

## Process before creating a new component

1. Search this table.
2. Search `components/` in the codebase directly (this table can lag).
3. If something close exists, extend it (new prop/variant) instead of
   forking.
4. Only create new if neither applies — then add a row here.
