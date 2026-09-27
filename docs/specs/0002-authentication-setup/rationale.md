# 0002. Set up authentication with Supabase Auth (Rationale)

## Context

The application requires secure user identity so members can publish posts, share comments, follow accounts, and exchange direct messages. Users need a reliable registration and sign in experience that protects account credentials from common threats like weak passwords or credential sniffing.

Without this decision, application routes lack access control, user identity remains unverified, and subsequent features like profile setup or post creation cannot determine who is performing an action. Next.js 16 App Router runs server and client environments, so session management must handle server action mutations, client state synchronization, and route proxy protection without hydration mismatch or stale credentials.

## Options considered

### Option 1: Next.js Server Actions with Supabase SSR and Next.js proxy route protection

Handle authentication mutations through Next.js Server Actions backed by `@supabase/ssr` server clients. Session cookies get written directly to request and response headers. Route protection and redirection run inside `proxy.ts` using `updateSession`. Password strength verification runs on the client for live visual feedback and validates again on the server using Zod before submission to Supabase Auth.

**Pros**:
- Server actions keep authentication secrets and Supabase service calls safe on the server.
- Session cookie synchronization between server components, client components, and proxy middleware prevents auth state desynchronization.
- Centralized route redirects in `proxy.ts` stop unauthenticated requests before page components execute.

**Cons**:
- Requires coordinating Supabase SSR cookie methods with Next.js 16 response headers.

### Option 2: Client side only Supabase client with client router guards

Execute all sign in and registration calls directly inside the browser using the public Supabase browser client. Guard routes by checking session state inside a layout component or `useEffect` hook, then triggering client router navigation.

**Pros**:
- Slightly simpler initial code setup with fewer server action files.

**Cons**:
- Unprotected content flashes briefly in the browser before client redirects kick in.
- Server components cannot access user session data reliably during initial page rendering.
- Password validation logic runs only in the browser unless mirrored in custom API endpoints.

## Rationale

Option 1 provides defense in depth. Route redirection inside `proxy.ts` prevents unauthenticated visitors from ever loading protected page layouts, eliminating layout shift and unauthorized data exposure. Using server actions with `@supabase/ssr` guarantees session cookies persist across server rendered pages, which aligns with the project architecture in `context/01-architecture/architecture.md`.

Option 2 was rejected because client side redirects cause layout flash and fail to secure server rendered data feeds.
