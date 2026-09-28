# 0003. User onboarding flow and profile picture storage (Rationale)

## Context

After completing email registration, users need a straightforward way to personalize their identity before browsing the community. Without an onboarding screen, users land directly on the feed with empty profile pictures and blank bios, which lowers community engagement.

The application uses Next.js App Router, Prisma, and Supabase. While Supabase Auth stores user credentials and metadata, Prisma persists profile records in Postgres. File uploads require reliable object storage with appropriate security rules. The user experience must feel smooth and light, letting users crop their profile image directly in the browser while protecting the application against oversized files or malicious uploads. In addition, the layout must stay focused and centered in a container with a maximum width of xl (max-w-xl) to maintain visual clarity on both mobile and desktop screens.

## Options considered

### Option 1: Direct client upload with interactive cropping modal and server action persistence (Recommended)

Users crop their image in browser memory using `react-easy-crop` inside a shadcn dialog modal. The resulting square image blob uploads directly to the Supabase Storage `avatars` bucket using the authenticated browser client. After upload succeeds, the form submits display name, bio, and the resulting avatar URL through a Next.js Server Action to update the database.

**Pros**:
- Offloads file streaming from the Next.js server directly to Supabase Storage.
- Fast interactive visual feedback with zero server processing latency for cropping.
- Leverages existing Supabase client session tokens and storage access policies.

**Cons**:
- Requires client side canvas manipulation code and adding the `react-easy-crop` dependency.

### Option 2: Server action multipart upload without client cropping

Users select an uncropped image file and submit the entire form as multipart form data to a Server Action. The server then forwards the stream directly to Supabase Storage using the admin client.

**Pros**:
- No client side crop library dependency.
- Simpler client form logic.

**Cons**:
- Users cannot preview or adjust how non-square pictures fit circular avatars.
- Increases Next.js server memory and bandwidth consumption when streaming large image files.

### Option 3: Full client side profile updates via direct Supabase Database and Storage calls

The browser updates both the storage bucket and the Postgres database directly using the Supabase client library and Postgres row level security.

**Pros**:
- Direct browser calls without writing custom Next.js Server Actions.

**Cons**:
- Bypasses Prisma and existing server validation schemas.
- Inconsistent with the established server action pattern in `actions/auth.ts` and `lib/services/auth.service.ts`.

## Rationale

Option 1 provides the best combination of responsive user experience and architectural consistency. Social media profiles require circular avatars. Allowing users to zoom and crop pictures before uploading prevents awkward aspect ratios and avoids unexpected visual distortion. Direct browser upload to Supabase Storage keeps the Next.js server light and responsive, while the server action ensures that database writes and validation go through Prisma and Zod schemas consistently.

Option 2 was rejected because uncropped avatars look inconsistent in feeds and headers, and uploading raw files forces unnecessary work on the server. Option 3 was rejected because Wink uses Prisma as its primary data layer, and bypassing Prisma would fracture authorization rules and type safety.
