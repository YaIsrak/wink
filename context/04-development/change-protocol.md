# Change Protocol

What requires explicit user approval before proceeding:

- Architecture changes (folder structure, service layer pattern, monolith
  structure)
- Data model changes that alter existing structure (renames, relation
  changes, field removal) — additive, non-breaking changes can proceed with
  a shown plan
- New major dependencies (frameworks, libraries that duplicate existing
  stack capability, auth provider changes)
- Changes to the caching strategy or introduction of background job
  infrastructure beyond the existing keep-alive cron
- Removing or altering the Supabase keep-alive cron job

What does **not** require approval:

- Small utility dependency additions
- New components that follow the existing design system
- Bug fixes within existing architecture
- Additive Prisma schema changes (new optional fields, new independent
  models) — still show a short plan first
