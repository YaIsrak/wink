# 0003. User onboarding flow and profile picture storage

**Date**: 2026-09-27
**Status**: In Progress

## Summary

This specification defines the user onboarding flow that guides newly registered members through completing their initial profile. Users can upload an avatar picture with an interactive crop tool, update their display name, and write a bio. Everything on the onboarding screen sits inside a compact container with a maximum width of xl (576 pixels). A skip option allows users to defer profile completion and jump straight to the feed.

## Requirements

**User stories**:
- As a newly registered member, I want to upload and crop my profile picture so that friends can recognize me.
- As a member, I want to edit my display name and write a short bio so that I can introduce myself to the community.
- As a busy user, I want the option to skip onboarding so that I can explore the feed immediately and fill in my profile later.
- As a user, I want all onboarding controls to fit cleanly within a focused container with a maximum width of xl so that the interface remains readable and comfortable to use.

**Acceptance criteria**:
- **AC-1**: Newly registered users arriving at `/onboarding` see their initial display name and username prefilled, with username presented as a fixed identifier.
- **AC-2**: All onboarding user interface cards, forms, and crop dialogs remain constrained within a maximum width of xl (`max-w-xl`, 576 pixels) on all screen sizes.
- **AC-3**: Users can pick an image file (JPEG, PNG, or WebP up to 5MB) and adjust a square crop area using an interactive dialog with zoom and pan controls.
- **AC-4**: Confirming the crop extracts the image data and uploads the file directly to the Supabase Storage `avatars` bucket under `{userId}/avatar-{timestamp}.{ext}`, returning a publicly accessible URL.
- **AC-5**: Submitting the form updates the user display name, bio (up to 160 characters), and avatar URL in the database, sets `onboardedAt` timestamp, and redirects to `/feed` with a success toast.
- **AC-6**: Choosing the skip option sets the `onboardedAt` timestamp without altering profile fields and redirects to `/feed`.
- **AC-7**: Users with an active session who visit `/feed` or protected routes while `onboardedAt` is null get redirected to `/onboarding`.
- **AC-8**: Users who have already completed or skipped onboarding (where `onboardedAt` is not null) visiting `/onboarding` are redirected to `/feed`.
- **AC-9**: File validation errors, oversized files, or network failures display clear Sonner error notifications without losing entered bio or display name text.

## Decision

**Chosen option**: Option 1: Direct client upload with interactive cropping modal and server action persistence

The onboarding flow runs as a dedicated client form component within `app/(onboarding)/onboarding/page.tsx` constrained by `max-w-xl`. Images are cropped in the browser with `react-easy-crop` in a dialog and uploaded directly to Supabase Storage `avatars` bucket, followed by profile record updates via Next.js Server Actions.

**Implementation skills**: `supabase` (`supabase/supabase-js`, `.agents/skills/supabase/SKILL.md`) · `tailwind-css-patterns` (`tailwindlabs/tailwindcss`, `.agents/skills/tailwind-css-patterns/SKILL.md`) · `shadcn` (`shadcn/ui`, `.agents/skills/shadcn/SKILL.md`)

## Rationale

Reasoning and options: see rationale.md

## Feature design

**Data model sketch**:

Prisma `User` model changes:
- `onboardedAt`: `DateTime?` (nullable timestamp, null indicates onboarding pending, set upon completion or skip)

Supabase Storage:
- Bucket name: `avatars` (public bucket)
- Storage path pattern: `{userId}/avatar-{timestamp}.{ext}`
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- File size limit: 5MB

**State transitions**:

User onboarding state:
- `unregistered`: User has not created an account.
- `pending`: User registered, `onboardedAt` is null. Visiting `/feed` redirects to `/onboarding`.
- `completed`: User saved avatar, bio, and display name. `onboardedAt` is populated. User accesses `/feed`.
- `skipped`: User clicked skip for now. `onboardedAt` is populated. User accesses `/feed`.

**API surface**:

| Function / Action | Type | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `completeOnboardingAction` | Server Action | `displayName: string`, `bio?: string`, `avatarUrl?: string` | `{ success: boolean, redirectTo: string }` | Authenticated session | 400 Invalid data, 401 Unauthorized, 500 Database error |
| `skipOnboardingAction` | Server Action | None | `{ success: boolean, redirectTo: string }` | Authenticated session | 401 Unauthorized, 500 Database error |
| Storage upload | Browser client | `file: Blob`, path `{userId}/avatar-{timestamp}.{ext}` | Public URL string | Authenticated user JWT | 400 File too large, 403 Forbidden, 500 Upload failure |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Display prefilled fields | Initial display name and username | Database `User` record fetched on server component |
| Render avatar preview | Image source URL | Local blob URL during crop, Supabase Storage public URL once uploaded |
| `completeOnboardingAction` | Updated display name and bio | Client form inputs validated by Zod schema |
| `completeOnboardingAction` | Updated avatar URL | Public URL generated after Supabase Storage upload |
| `completeOnboardingAction` | `onboardedAt` timestamp | Server clock `new Date()` |
| `skipOnboardingAction` | `onboardedAt` timestamp | Server clock `new Date()` |
| Route redirection | Redirect target `/onboarding` or `/feed` | Comparison of `onboardedAt` nullability against route type |

**Key invariants**:
- All onboarding screen layout elements and modals must remain inside a container with class `max-w-xl`.
- The username remains immutable during onboarding because it was validated and claimed at registration.
- A user can only upload files to the path matching their own authenticated user identifier in Supabase Storage.
- An empty bio is allowed, but if provided, it must not exceed 160 characters.
- Setting `onboardedAt` is irreversible through the onboarding interface, preventing repeated redirect loops.

**Security model**:
- Supabase Storage row level security policies:
  - Select policy: Public read for all objects in `avatars` bucket.
  - Insert and update policy: Authenticated users only, with check `(storage.foldername(name))[1] = auth.uid()::text`.
- Server actions verify user identity using `supabase.auth.getUser()` before executing Prisma queries.
- File upload client validates MIME types against an explicit whitelist (JPEG, PNG, WebP) and checks size before network calls.

**Configuration required**:
- No new environment variables needed. Uses existing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

**Critical test scenarios**:
- Happy path: User uploads a photo, adjusts crop in modal, edits display name, enters bio, clicks Complete Profile, verifies database record updated and user lands on `/feed`, verifies **AC-1**, **AC-3**, **AC-4**, **AC-5**.
- Skip path: User clicks Skip for now, verifies `onboardedAt` is recorded in database and user lands on `/feed`, verifies **AC-6**.
- Layout containment: User tests view on mobile and desktop, verifying all cards, forms, and dialogs remain within `max-w-xl`, verifies **AC-2**.
- Gate redirect: User with null `onboardedAt` navigates to `/feed` and gets redirected to `/onboarding`; user with populated `onboardedAt` navigates to `/onboarding` and gets redirected to `/feed`, verifies **AC-7**, **AC-8**.
- Failure case: User selects a file larger than 5MB or invalid file type, verifies crop modal rejects selection with a Sonner toast notification, verifies **AC-9**.
- Auth security: Unauthenticated visitor attempts to access `/onboarding` and is redirected to `/login`, verifies **AC-7**.

## Build plan

1. [x] Update `prisma/schema.prisma` to add `onboardedAt DateTime?` to the `User` model, run migration or db push, and regenerate Prisma client, satisfies **AC-5**, **AC-6**.
2. [x] Install `react-easy-crop` dependency and add Zod validation schema for onboarding in `lib/validation/onboarding.ts`, satisfies **AC-3**, **AC-5**, **AC-9**.
3. [x] Create Supabase Storage migration or setup instructions for the public `avatars` bucket with user scoped row level security policies, satisfies **AC-4**.
4. [x] Implement `lib/services/user.service.ts` with helper functions to complete onboarding, skip onboarding, and fetch profile status, satisfies **AC-5**, **AC-6**.
5. [x] Implement server actions `completeOnboardingAction` and `skipOnboardingAction` in `actions/onboarding.ts`, satisfies **AC-5**, **AC-6**.
6. [x] Build avatar crop and upload dialog component in `components/onboarding/avatar-crop-dialog.tsx` and avatar uploader in `components/onboarding/avatar-upload.tsx`, satisfying **AC-2**, **AC-3**, **AC-4**, **AC-9**.
7. [x] Build the onboarding form component `components/onboarding/onboarding-form.tsx` wrapped in `max-w-xl` with display name input, bio textarea, avatar uploader, complete button, and skip link, satisfies **AC-1**, **AC-2**, **AC-5**, **AC-6**.
8. [x] Update `app/(onboarding)/onboarding/page.tsx` to render the form with prefilled user data in `max-w-xl`, satisfying **AC-1**, **AC-2**, **AC-8**.
9. [x] Add onboarding status verification on `/feed` and protected surfaces to redirect pending users to `/onboarding`, satisfies **AC-7**, **AC-8**.

## Consequences

**Positive**:
- Provides a clean, welcoming first impression for new users to personalize their identity.
- Keeps onboarding focused, readable, and visually consistent by enforcing the `max-w-xl` width boundary.
- Interactive cropping guarantees properly centered, attractive avatar images across the app.
- Direct storage uploads reduce load on the Next.js server.
- The skip option avoids trapping impatient users who want to see content right away.

**Negative / tradeoffs**:
- Introduces `react-easy-crop` as a new client dependency.
- Setting up Supabase Storage policies requires configuring the `avatars` bucket in the Supabase project.

**Neutral**:
- Adds one new nullable column (`onboardedAt`) to the `users` table.

## Follow-up

- [ ] Ensure Supabase Storage bucket `avatars` is created with public read access and appropriate row level security in the project dashboard or migration script before testing uploads.
- [ ] Add profile completion percentage banner to `/feed` in a subsequent task to remind users who skipped onboarding to finish their bio and avatar.
