# Verify: authentication · spec 0002 · updated 2026-09-27
_Steps derived from spec 0002 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [ ] Visit `/login` when unauthenticated → login card renders with email, password, and sign up link → AC-1
- [ ] Visit `/sign-up` → registration card renders with display name, username, email, and password input → AC-1, AC-2
- [ ] Type characters into the password field on `/sign-up` → live checklist dynamically updates requirements for length (8+), uppercase, lowercase, number, and special symbol → AC-3
- [ ] Click the eye icon on password input → toggles between hidden masked bullets and plain readable text → AC-3
- [ ] Attempt to submit sign up with invalid or weak password → submission blocked with error notification → AC-2, AC-3, AC-8
- [ ] Attempt to sign up with already taken username or email → error toast notification surfaces without crashing → AC-8
- [ ] Submit valid registration form → account created in Supabase Auth, profile provisioned in Prisma `users`, user redirected to `/onboarding` → AC-4
- [ ] Enter valid login credentials on `/login` → session cookies set, user redirected to `/feed` → AC-5
- [ ] Attempt to visit `/login` or `/sign-up` while logged in → proxy middleware redirects immediately to `/feed` → AC-6
- [ ] In an incognito window or logged out state, visit `/feed` or `/onboarding` → proxy middleware redirects immediately to `/login` → AC-7
- [ ] Enter invalid password on `/login` → displays "Invalid email or password" toast without account leakage → AC-8
- [ ] Click "Sign out" button on `/feed` or `/onboarding` → session terminates and user is redirected to `/login` → AC-9

## Commands
- [ ] `npx tsc --noEmit` → completes with 0 errors → AC-2
- [ ] `npm run build` → Next.js compiles all dynamic and static routes cleanly → AC-1, AC-6, AC-7

## Acceptance-criteria coverage
- AC-1: covered by visiting `/login` and `/sign-up` routes and build check
- AC-2: covered by sign up form field validation and typecheck
- AC-3: covered by live password requirements checklist and eye visibility toggle
- AC-4: covered by successful sign up, Prisma user creation, and `/onboarding` redirect
- AC-5: covered by login submission, cookie storage, and `/feed` redirect
- AC-6: covered by logged in access to `/login` and `/sign-up` redirecting to `/feed`
- AC-7: covered by unauthenticated access to `/feed` and `/onboarding` redirecting to `/login`
- AC-8: covered by Sonner toast alerts for invalid credentials, weak passwords, and duplicates
- AC-9: covered by reusable `SignOutButton` terminating session and redirecting to `/login`
