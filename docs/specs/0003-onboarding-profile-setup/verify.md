# Verify: User onboarding and profile picture storage · spec 0003 · updated 2026-09-27
_Steps derived from spec 0003 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [ ] Sign up a new user or log in with pending user → verify redirect to `/onboarding` → AC-1, AC-7
- [ ] Inspect onboarding card on mobile (375px) and desktop (1280px) → verify form remains contained inside `max-w-xl` → AC-2
- [ ] Click upload photo and select a JPEG/PNG/WebP image under 5MB → verify interactive crop dialog opens with zoom slider → AC-3
- [ ] Select image larger than 5MB or invalid format → verify Sonner error toast displays and input is rejected → AC-9
- [ ] Adjust crop and click Apply picture → verify cropped square image uploads to Supabase Storage and returns avatar preview → AC-4
- [ ] Edit display name, enter bio up to 160 characters, and click Complete Profile → verify redirect to `/feed`, success toast, and database records updated → AC-5
- [ ] Log in with another pending user, click Skip for now → verify `onboardedAt` timestamp is set and user redirects to `/feed` → AC-6
- [ ] Visit `/onboarding` as an already onboarded user → verify redirect to `/feed` → AC-8
- [ ] Visit `/onboarding` as an unauthenticated visitor → verify redirect to `/login` → AC-7

## Commands
- [ ] `npx tsc --noEmit` → zero errors → AC-1 through AC-9
- [ ] `npm run build` → successful production build with dynamic `/onboarding` route → AC-1 through AC-9

## Acceptance-criteria coverage
- AC-1 prefilled display name and fixed username: covered by UI / manual step 1
- AC-2 layout contained inside max-w-xl: covered by UI / manual step 2
- AC-3 interactive crop dialog: covered by UI / manual step 3
- AC-4 Supabase Storage direct upload: covered by UI / manual step 5
- AC-5 profile submission and redirect: covered by UI / manual step 6
- AC-6 skip onboarding: covered by UI / manual step 7
- AC-7 route protection for pending and unauthenticated users: covered by UI / manual steps 1 and 9
- AC-8 redirect onboarded users away from /onboarding: covered by UI / manual step 8
- AC-9 validation error handling with Sonner toasts: covered by UI / manual step 4
