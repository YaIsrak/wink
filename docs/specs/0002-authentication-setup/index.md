# 0002. Set up authentication with Supabase Auth

**Date**: 2026-09-20
**Status**: In Progress

## Summary

This specification establishes email and password authentication using Supabase Auth alongside Prisma database user profiles. It provides dedicated sign in and registration pages with live password strength validation and automatic route redirection. Protected routes redirect unauthenticated guests to the login page, while logged in users visiting auth pages get redirected to the feed.

## Requirements

**User stories**:
- As a visitor, I want to create a new account with my email, chosen username, display name, and a strong password so that I can join the community.
- As a registered member, I want to log into my account using my email and password so that I can access my personalized feed and profile.
- As a registered member, I want to see clear real time guidance on password requirements when creating a password so that my account remains secure.
- As a visitor or member, I want the system to direct me to the correct page automatically depending on whether I am signed in so that I never get stuck on the wrong screen.
- As a logged in member, I want to sign out safely from any screen so that other people using my device cannot access my account.

**Acceptance criteria**:
- **AC-1**: Public visitors can access `/login` and `/sign-up` to create an account or sign in with their email and password.
- **AC-2**: The sign up form validates display name, unique username, valid email, and password strength requirements before submission.
- **AC-3**: The password input displays a live criteria checklist underneath showing state for minimum 8 characters, one uppercase letter, one lowercase letter, one number, and one special symbol, along with an eye toggle to show or hide the password.
- **AC-4**: Successful sign up provisions a Prisma User record linked to the Supabase Auth user identifier and redirects to `/onboarding`.
- **AC-5**: Successful login sets secure session cookies and redirects returning users to `/feed`.
- **AC-6**: Authenticated users visiting `/login` or `/sign-up` are automatically redirected to `/feed`.
- **AC-7**: Unauthenticated visitors accessing protected routes including `/feed`, `/explore`, `/messages`, or `/onboarding` are redirected to `/login`.
- **AC-8**: Invalid credentials or duplicate username or email display clear Sonner error toast notifications without crashing or leaking sensitive system information.
- **AC-9**: A reusable sign out action and button allows users to end their session and redirects them to `/login`.

## Decision

**Chosen option**: Option 1: Next.js Server Actions with Supabase SSR and Next.js proxy route protection

Authenticate users through Next.js Server Actions using `@supabase/ssr`, sync user profiles into Prisma, and enforce route redirection inside Next.js proxy middleware.

**Implementation skills**: `supabase` (`supabase/supabase-js`, `.agents/skills/supabase/SKILL.md`) · `tailwind-css-patterns` (`tailwindlabs/tailwindcss`, `.agents/skills/tailwind-css-patterns/SKILL.md`) · `shadcn` (`shadcn/ui`, `.agents/skills/shadcn/SKILL.md`)

## Rationale

Reasoning and options: see rationale.md

## Feature design

**Data model sketch**:
- Entity: `User` (mapped to Postgres table `users`)
  - `id`: Uuid, Primary Key, matches Supabase `auth.users.id`
  - `email`: String, unique, required
  - `username`: String, unique, required, lowercase alphanumeric
  - `displayName`: String, required
  - `avatarUrl`: String, optional, nullable
  - `bio`: String, optional, nullable
  - `createdAt`: DateTime, default now
  - `updatedAt`: DateTime, auto updated

**State transitions**:
- Visitor: Unauthenticated (allowed routes: `/login`, `/sign-up`, `/theme`, `/api/cron/keep-alive`)
- Registered: Authenticated without full profile (redirects to `/onboarding`)
- Active: Authenticated with profile (redirects to `/feed`, visiting `/login` or `/sign-up` redirects to `/feed`)
- Signed Out: Returns to Unauthenticated (redirects to `/login`)

**API surface**:
| Surface | Type | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `signUpAction` | Server Action | `email`, `password`, `username`, `displayName` | `success: boolean`, `redirectTo: string` | Public | 400 validation error, 409 email or username taken |
| `loginAction` | Server Action | `email`, `password` | `success: boolean`, `redirectTo: string` | Public | 400 validation error, 401 invalid credentials |
| `logoutAction` | Server Action | none | `success: boolean`, `redirectTo: string` | Authenticated | 500 session termination error |
| `proxy.ts` | Next.js Proxy | incoming request path, session cookie | HTTP 307 redirect or next response | Public / Session | 307 redirect to `/login` or `/feed` |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| `signUpAction` | Supabase Auth account | `email` and `password` input arguments |
| `signUpAction` | Prisma `User` record | `auth.users.id` returned by Supabase, plus `email`, `username`, and `displayName` input arguments |
| `loginAction` | Supabase Auth session | `email` and `password` input arguments matched against Supabase Auth credentials |
| `password-input` | Password strength checklist | Live evaluation of input value against 5 regex criteria |
| `proxy.ts` | Route redirect destination | Authenticated user presence from `supabase.auth.getUser()` and request pathname |

**Key invariants**:
- Every User record in Prisma has an id that equals the Supabase `auth.users.id`.
- Usernames must be unique, between 3 and 20 characters, containing only lowercase letters, numbers, and underscores.
- Passwords must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special symbol.
- Unauthenticated users cannot view protected app routes.
- Authenticated users cannot stay on `/login` or `/sign-up`.

**Security model**:
- Passwords are never logged or stored in application database tables. Supabase Auth manages hashing and salt rounds securely.
- Tokens reside in HTTP only, SameSite cookies managed by `@supabase/ssr`.
- Authentication errors present user friendly generic alerts via Sonner toast notifications to prevent account enumeration.

**Configuration required**:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL (already in `.env`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon public API key (already in `.env`)
- `DATABASE_URL`: Prisma connection string (already in `.env`)
- `DIRECT_URL`: Prisma direct connection string (already in `.env`)

**Critical test scenarios**:
- Happy path: A user registers with valid credentials, their profile record is created in the database, and they are redirected to `/onboarding`, verifies **AC-1**, **AC-2**, **AC-3**, **AC-4**.
- Failure case: Registration with an existing username or a password missing required symbols is blocked, displaying visual checklist errors and a toast notification, verifies **AC-2**, **AC-3**, **AC-8**.
- Auth redirection: An unauthenticated visitor navigating to `/feed` is redirected to `/login`, and a logged in user navigating to `/login` is redirected to `/feed`, verifies **AC-6**, **AC-7**.

## Build plan

1. [x] Create auth validation Zod schemas in `lib/validation/auth.ts` defining rules for sign in, sign up, username formats, and password strength checks, satisfies **AC-2**, **AC-3**
2. [x] Build auth service in `lib/services/auth.service.ts` to provision Prisma user profiles and verify username availability, satisfies **AC-4**, **AC-8**
3. [x] Create server actions in `actions/auth.ts` for `signUpAction`, `loginAction`, and `logoutAction` using `@supabase/ssr` server clients, satisfies **AC-1**, **AC-4**, **AC-5**, **AC-9**
4. [x] Update session middleware in `lib/supabase/middleware.ts` and `proxy.ts` to enforce route redirection for guests and logged in users, satisfies **AC-6**, **AC-7**
5. [x] Create reusable password input component with live visual requirement checklist and visibility toggle in `components/auth/password-input.tsx`, satisfies **AC-3**
6. [x] Build shared authentication card container and login form in `app/(auth)/login/page.tsx`, satisfies **AC-1**, **AC-5**, **AC-8**
7. [x] Build sign up form with full validation and password criteria checklist in `app/(auth)/sign-up/page.tsx`, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-4**, **AC-8**
8. [x] Create reusable sign out trigger button in `components/auth/sign-out-button.tsx`, satisfies **AC-9**

## Consequences

**Positive**:
- Robust session handling across server actions, server components, and client components.
- Clear user feedback with live password validation indicators and Sonner toasts.
- Seamless navigation flow with automated route redirection protecting private data.

**Negative / tradeoffs**:
- Sign up provisions both Supabase Auth and Prisma database records, requiring error handling if one step fails.

**Neutral**:
- Requires Next.js 16 `proxy.ts` convention to inspect session cookies without introducing deprecated middleware patterns.

## Follow-up

- [x] Execute the build plan using `/develop` to implement authentication and route protection
- [ ] Connect profile completion fields to the onboarding flow in Phase 1
