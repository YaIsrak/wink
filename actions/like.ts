'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { toggleLike, getPostLikes } from '@/lib/services/like.service'
import type { LikeUser } from '@/types/post'

export interface ToggleLikeActionResult {
  success?: boolean
  error?: string
  liked?: boolean
  likesCount?: number
}

export interface GetPostLikesActionResult {
  success?: boolean
  error?: string
  users?: LikeUser[]
}

export async function toggleLikeAction(
  postId: string
): Promise<ToggleLikeActionResult> {
  if (!postId || typeof postId !== 'string') {
    return { error: 'Invalid post identifier' }
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

    const result = await toggleLike(postId, user.id)
    revalidatePath('/feed')

    return {
      success: true,
      liked: result.liked,
      likesCount: result.likesCount,
    }
  } catch (err: unknown) {
    console.error('Failed to toggle like:', err)
    const message = err instanceof Error ? err.message : 'Failed to toggle like'
    return { error: message }
  }
}

export async function getPostLikesAction(
  postId: string
): Promise<GetPostLikesActionResult> {
  if (!postId || typeof postId !== 'string') {
    return { error: 'Invalid post identifier' }
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

    const users = await getPostLikes(postId)
    return {
      success: true,
      users,
    }
  } catch (err: unknown) {
    console.error('Failed to fetch post likes:', err)
    const message =
      err instanceof Error ? err.message : 'Unable to fetch likers list'
    return { error: message }
  }
}
