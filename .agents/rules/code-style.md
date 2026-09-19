# Rule: Code Style

- File naming: kebab-case for all files (`post-card.tsx`, `use-feed.ts`).
- TypeScript throughout — no `.js`/`.jsx` files in `app/`, `components/`,
  `lib/`, `actions/`.
- Components: PascalCase component names, kebab-case file names.
- Functions/variables: camelCase.
- Validate all external input (API request bodies, form input) with Zod
  schemas — don't trust unvalidated data past the boundary.
- Keep API responses in the standard error shape defined in
  `context/01-architecture/api-design.md`.
- Prefer existing utilities/hooks/components over writing new ones —
  search first (see `.agents/skills/ui-development/SKILL.md`).
- No automated tests are required for this project. Don't scaffold test
  files unless asked.
