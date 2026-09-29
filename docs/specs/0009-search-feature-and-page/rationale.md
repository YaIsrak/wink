# 0009. Search Feature and Page: Rationale

**Date**: 2026-09-29

## Context

Phase 2 established core social interactions including profiles, post creation, likes, comments, and following creators. Phase 3 expands discovery. Previously, the `/search` route was created as a placeholder card during navigation shell scaffolding (`app/(main)/search/page.tsx`).

Currently, users have no direct way to look up specific creators or locate posts covering topics of interest. The only way to find other people is through the suggested creators widget or encountering them in the feed. A comprehensive search feature is essential for connecting members, finding friends by handle or name, and exploring discussions by keyword.

Wink is designed as a personal portfolio project supporting around 100 concurrent users. The search solution must be fast, responsive, and reliable without introducing unnecessary operational overhead, new infrastructure dependencies, or complex external billing accounts.

## Options considered

### Option 1: Prisma Case Insensitive Substring Search with Local Storage Recent History

Implement search queries directly through Prisma using case insensitive contains filters (`mode: 'insensitive'`) against `User.username`, `User.displayName`, and `Post.caption`. The user interface performs live debounced requests (300 milliseconds) as the user types and synchronizes query state to URL parameters. When the search query is empty, the interface displays recent searches stored in browser local storage along with suggested creators.

**Pros**:
- Zero additional infrastructure, extensions, or external services required.
- Works natively with the existing PostgreSQL database and Prisma schema.
- Instant setup with full type safety across TypeScript and Next.js Server Actions.
- Local storage recent searches provide fast, private recall without database writes.
- Easily handles the platform scale target of ~100 concurrent users with sub 50 millisecond response times.

**Cons**:
- Does not provide typo tolerance or fuzzy matching for misspelled queries.
- Substring searches on post captions perform sequential text scanning in PostgreSQL, which does not scale to hundreds of thousands of posts without indexes.

### Option 2: PostgreSQL Full Text Search with tsvector and tsquery

Implement PostgreSQL native full text search for post captions using `tsvector` columns, English dictionaries, and GIN indexes, combined with standard case insensitive matching for usernames.

**Pros**:
- Supports stemming and stop word handling for captions (for example matching "running" to "run").
- Indexed searches perform efficiently even with very large volumes of posts.

**Cons**:
- Requires custom SQL migrations, database triggers to maintain vector columns, and raw SQL queries bypassing Prisma model typing.
- Adds unnecessary architectural complexity for a portfolio platform with modest post volume.
- Does not improve username search where exact substrings are what users expect.

### Option 3: External Hosted Search Engine (Algolia or Meilisearch)

Integrate an external hosted search provider or separate search container, synchronizing user profiles and posts to the external search index via webhooks or database hooks.

**Pros**:
- Rich search capabilities including typo tolerance, instant highlighting, and search analytics.

**Cons**:
- Introduces an external dependency, network hop, and ongoing operational or subscription costs.
- Requires dual write synchronization or event webhooks, introducing data drift and consistency issues.
- Massive overkill for a ~100 user portfolio web application.

## Rationale

Option 1 is selected because it delivers immediate, fast, and reliable search functionality while keeping the architecture simple and maintainable.

For a social media application at Wink's scale, users primarily search for specific creators by their handle or name, and secondarily look up posts by keywords. Prisma's case insensitive contains matching provides exact substring matches that fulfill this requirement with high precision.

Managing recent search history in browser local storage keeps the database completely free from write traffic during simple search interactions, preserves user privacy, and allows instant rendering of search history without extra network latency.

Dividing search into Top, Accounts, and Posts tabs gives users focused browsing while the 300 millisecond debounced live search provides a fluid, app like experience consistent with modern social web standards.
