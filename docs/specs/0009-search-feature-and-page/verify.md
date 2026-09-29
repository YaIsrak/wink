# Verify: Search Feature and Page · spec 0009 · updated 2026-09-29

_Steps derived from spec 0009 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [ ] Visit `/search` while signed in → persistent search input with search icon, clear button, and category tabs for Top, Accounts, and Posts are rendered → AC-1
- [ ] When search query is empty → recent search history from browser local storage and suggested creators list are displayed → AC-2
- [ ] Type "alex" into the search bar → 300 millisecond debounce triggers search query and URL updates with `?q=alex` without full page reload → AC-3
- [ ] Click "Accounts" tab → URL updates with `?tab=accounts` and view displays matching user accounts → AC-4
- [ ] Click "Posts" tab → URL updates with `?tab=posts` and view displays matching posts → AC-4
- [ ] Verify query matching → case insensitive substring matching matches lowercase and uppercase terms in usernames, display names, and captions → AC-5
- [ ] Inspect user search card → displays avatar, display name, handle, bio or follower count, and interactive Follow button (or "(You)" for current session user) → AC-6
- [ ] Click Follow on user card → follow status updates optimistically to Following without layout jump → AC-6
- [ ] Inspect post search card → displays author info, creation timestamp, caption, image preview, engagement counts, and lightbox modal → AC-7
- [ ] Click any recent search query chip → search bar populates with that term and triggers immediate search → AC-8
- [ ] Check local storage after searching → query is saved in `wink_recent_searches` key, capped at 10 items with newest first → AC-9
- [ ] Scroll to bottom of Accounts or Posts tab with > 10 matches → intersection observer loads next batch of 10 items via cursor pagination → AC-10
- [ ] Search for a non existent query (like "xyz999000") → friendly empty state card renders with search tips and suggested creators → AC-11
- [ ] Disconnect network or trigger server error during search → error card renders with retry button and Sonner error toast displays → AC-12

## Commands

- [ ] `npx tsc --noEmit` → TypeScript compiler reports zero type errors across search services and components → AC-1..AC-12
- [ ] `npm run build` → Next.js Turbopack production build succeeds with dynamic `/search` route generated → AC-1

## Acceptance criteria coverage

- AC-1 covered by UI step 1 and Command step 2
- AC-2 covered by UI step 2
- AC-3 covered by UI step 3
- AC-4 covered by UI steps 4, 5
- AC-5 covered by UI step 6
- AC-6 covered by UI steps 7, 8
- AC-7 covered by UI step 9
- AC-8 covered by UI step 10
- AC-9 covered by UI step 11
- AC-10 covered by UI step 12
- AC-11 covered by UI step 13
- AC-12 covered by UI step 14
