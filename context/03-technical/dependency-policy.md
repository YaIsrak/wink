# Dependency Policy

## Agent can add freely

Small, well-established utility packages that solve a narrow, obvious
problem (e.g. date formatting, class name merging, slug generation) —
provided they don't overlap with something already in the stack.

## Requires user approval first

- Any new major library or framework-level dependency (e.g. swapping state
  management, adding a second UI kit, adding a new auth provider).
- Anything that duplicates a capability Supabase/Prisma/shadcn already
  provides.
- Anything that changes build tooling or deployment configuration.

## Process

When approval is needed: briefly state what the dependency does, why it's
needed, and what alternative (if any) was considered, then wait for
confirmation before installing.
