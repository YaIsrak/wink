# Skill: Database Development

How to make schema changes safely with Prisma + Supabase.

## Steps

1. Check `context/01-architecture/data-model.md` for the current schema and
   whether the change fits existing entities/relations.
2. If the change is additive (new field, new optional relation) and doesn't
   alter existing architecture, proceed with a plan shown to the user first
   for anything non-trivial.
3. If the change alters existing structure (renames, relation changes,
   removing fields), this counts as an **architecture change** — get
   explicit approval first (see `.agents/rules/architecture.md`).
4. Update `schema.prisma`, run a migration (`prisma migrate dev` locally),
   and reflect the change in `context/01-architecture/data-model.md`.
5. If the table needs Row Level Security, write/update the Supabase RLS
   policy alongside the schema change — don't leave a table unprotected.
6. Re-generate the Prisma client and check that existing service-layer
   queries still type-check.

## Don't

- Don't use `prisma db push` for anything beyond quick local prototyping —
  prefer tracked migrations.
- Don't write raw SQL unless Prisma genuinely can't express the query;
  document why if you do.
