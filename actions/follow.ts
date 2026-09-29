'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  toggleFollow,
  getUserFollowers,
  getUserFollowing,
} from '@/lib/services/follow.service'
import { followActionSchema } from '@/lib/validation/profile'
import type { FollowUserItem } from '@/types/profile'

export interface ToggleFollowActionResult {
  success?: boolean
  error?: string
  isFollowing?: boolean
  followersCount?: number
}

export interface GetFollowListActionResult {
  success?: boolean
  error?: string
  users?: FollowUserItem[]
  nextCursor?: string | null
}

export async function toggleFollowAction(
  targetUserId: string
): Promise<ToggleFollowActionResult> {
  const parsed = followActionSchema.safeParse({ targetUserId })
  if (!parsed.success) {
    return { error: 'Invalid user identifier' }
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

    if (user.id === targetUserId) {
      return { error: 'You cannot follow yourself' }
    }

    const result = await toggleFollow(user.id, targetUserId)
    revalidatePath('/profile/[username]', 'page')
    revalidatePath('/feed', 'page')
    revalidatePath('/notifications')

    return {
      success: true,
      isFollowing: result.isFollowing,
      followersCount: result.followersCount,
    }
  } catch (err: unknown) {
    console.error('Failed to toggle follow:', err)
    const message =
      err instanceof Error ? err.message : 'Failed to update follow status'
    return { error: message }
  }
}

export async function getUserFollowersAction(
  userId: string,
  cursor?: string,
  limit: number = 20
): Promise<GetFollowListActionResult> {
  if (!userId || typeof userId !== 'string') {
    return { error: 'Invalid user identifier' }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in.' }
    }

    const result = await getUserFollowers(userId, user.id, cursor, limit)
    return {
      success: true,
      users: result.users,
      nextCursor: result.nextCursor,
    }
  } catch (err: unknown) {
    console.error('Failed to fetch followers:', err)
    const message =
      err instanceof Error ? err.message : 'Unable to load followers list'
    return { error: message }
  }
}

export async function getUserFollowingAction(
  userId: string,
  cursor?: string,
  limit: number = 20
): Promise<GetFollowListActionResult> {
  if (!userId || typeof userId !== 'string') {
    return { error: 'Invalid user identifier' }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in.' }
    }

    const result = await getUserFollowing(userId, user.id, cursor, limit)
    return {
      success: true,
      users: result.users,
      nextCursor: result.nextCursor,
    }
  } catch (err: unknown) {
    console.error('Failed to fetch following:', err)
    const message =
      err instanceof Error ? err.message : 'Unable to load following list'
    return { error: message }
  }
}

export async function getSuggestedUsersAction(limit: number = 5) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in.' }
    }

    const { getSuggestedUsers } = await import('@/lib/services/follow.service')
    const suggested = await getSuggestedUsers(user.id, limit)
    return {
      success: true,
      users: suggested,
    }
  } catch (err: unknown) {
    console.error('Failed to fetch suggested users:', err)
    const message =
      err instanceof Error ? err.message : 'Unable to load suggested users'
    return { error: message }
  }
}
