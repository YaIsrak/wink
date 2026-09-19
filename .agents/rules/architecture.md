# Rule: Architecture

- This is a single Next.js monolith (App Router). Do not introduce a
  separate backend service.
- Follow the folder structure in `context/01-architecture/folder-structure.md`.
  Do not invent a new top-level convention.
- API routes stay thin — business logic lives in the service layer
  (`lib/services/*`), not inline in route handlers.
- Data access goes through Prisma. Don't bypass it with raw Supabase client
  calls for data Prisma already models (Supabase client is fine for
  Auth/Storage/Realtime, which are outside Prisma's scope).
- Authorization is ownership-based: a user may only mutate their own posts,
  comments, etc. Enforce this in the service layer AND in Supabase RLS —
  never rely on the frontend alone.
- Do not add caching beyond Next.js built-in caching/revalidation unless a
  real performance problem is identified.
- Do not add background job infrastructure. The only scheduled task allowed
  is the weekly Vercel Cron keep-alive ping.
- Any change to this file's constraints requires user approval first.
