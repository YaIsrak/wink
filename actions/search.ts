'use server'

import { createClient } from '@/lib/supabase/server'
import {
  searchUsers,
  searchPosts,
  searchTopSummary,
} from '@/lib/services/search.service'
import {
  searchQuerySchema,
  searchUsersQuerySchema,
  searchPostsQuerySchema,
} from '@/lib/validation/search'
import type {
  UserSearchResult,
  SearchUsersResult,
  SearchPostsResult,
  SearchTopResult,
} from '@/types/search'
import type { PostWithAuthor } from '@/types/post'

export interface SearchTopActionResult {
  success?: boolean
  error?: string
  users?: UserSearchResult[]
  posts?: PostWithAuthor[]
}

export interface SearchUsersActionResult {
  success?: boolean
  error?: string
  users?: UserSearchResult[]
  nextCursor?: string | null
  hasMore?: boolean
}

export interface SearchPostsActionResult {
  success?: boolean
  error?: string
  posts?: PostWithAuthor[]
  nextCursor?: string | null
  hasMore?: boolean
}

export async function searchTopAction(
  query: string
): Promise<SearchTopActionResult> {
  const parsed = searchQuerySchema.safeParse({ query })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid search query' }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Your session has expired. Please sign in again.' }
    }

    const result: SearchTopResult = await searchTopSummary(user.id, parsed.data.query)

    return {
      success: true,
      users: result.users,
      posts: result.posts,
    }
  } catch (err: unknown) {
    console.error('Failed to execute searchTopAction:', err)
    return { error: 'Failed to search. Please try again.' }
  }
}

export async function searchUsersAction(
  query: string,
  cursor?: string | null,
  limit: number = 10
): Promise<SearchUsersActionResult> {
  const parsed = searchUsersQuerySchema.safeParse({ query, cursor, limit })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid search parameters' }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Your session has expired. Please sign in again.' }
    }

    const result: SearchUsersResult = await searchUsers(
      user.id,
      parsed.data.query,
      parsed.data.cursor,
      parsed.data.limit
    )

    return {
      success: true,
      users: result.users,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    }
  } catch (err: unknown) {
    console.error('Failed to execute searchUsersAction:', err)
    return { error: 'Failed to search users. Please try again.' }
  }
}

export async function searchPostsAction(
  query: string,
  cursor?: string | null,
  limit: number = 10
): Promise<SearchPostsActionResult> {
  const parsed = searchPostsQuerySchema.safeParse({ query, cursor, limit })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid search parameters' }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Your session has expired. Please sign in again.' }
    }

    const result: SearchPostsResult = await searchPosts(
      user.id,
      parsed.data.query,
      parsed.data.cursor,
      parsed.data.limit
    )

    return {
      success: true,
      posts: result.posts,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    }
  } catch (err: unknown) {
    console.error('Failed to execute searchPostsAction:', err)
    return { error: 'Failed to search posts. Please try again.' }
  }
}
