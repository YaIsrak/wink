'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createPostSchema,
  updatePostSchema,
  type CreatePostInput,
  type UpdatePostInput,
} from '@/lib/validation/post'
import {
  createPost,
  getFeedPosts,
  getExplorePosts,
  updatePost,
  deletePost,
  type PostWithAuthor,
} from '@/lib/services/post.service'

export interface CreatePostActionResult {
  success?: boolean
  error?: string
  post?: PostWithAuthor
}

export interface GetFeedPostsActionResult {
  success?: boolean
  error?: string
  posts?: PostWithAuthor[]
  nextCursor?: string
  hasMore?: boolean
}

export async function createPostAction(
  data: CreatePostInput
): Promise<CreatePostActionResult> {
  const validation = createPostSchema.safeParse(data)
  if (!validation.success) {
    const firstError =
      validation.error.issues[0]?.message ?? 'Invalid post content'
    return { error: firstError }
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

    const post = await createPost({
      authorId: user.id,
      caption: validation.data.caption,
      imageUrl: validation.data.imageUrl,
    })

    revalidatePath('/feed')

    return {
      success: true,
      post,
    }
  } catch (err: unknown) {
    console.error('Failed to create post:', err)
    return {
      error:
        'An unexpected error occurred while publishing your post. Please try again.',
    }
  }
}

export async function getFeedPostsAction(params: {
  cursor?: string
  limit?: number
  filter?: 'all' | 'following'
} = {}): Promise<GetFeedPostsActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in.' }
    }

    const limit = params.limit ?? 10
    const result = await getFeedPosts({
      ...params,
      limit,
      currentUserId: user.id,
    })

    return {
      success: true,
      posts: result.posts,
      nextCursor: result.nextCursor,
      hasMore: Boolean(result.nextCursor),
    }
  } catch (err: unknown) {
    console.error('Failed to fetch feed posts:', err)
    return {
      error: 'Unable to load feed posts at this time.',
    }
  }
}

export interface GetExploreFeedPostsActionResult {
  success?: boolean
  error?: string
  posts?: PostWithAuthor[]
  nextCursor?: string
  hasMore?: boolean
}

export async function getExploreFeedPostsAction(params: {
  cursor?: string
  limit?: number
} = {}): Promise<GetExploreFeedPostsActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in.' }
    }

    const limit = params.limit ?? 10
    const result = await getExplorePosts({
      cursor: params.cursor,
      limit,
      currentUserId: user.id,
    })

    return {
      success: true,
      posts: result.posts,
      nextCursor: result.nextCursor,
      hasMore: Boolean(result.nextCursor),
    }
  } catch (err: unknown) {
    console.error('Failed to fetch explore posts:', err)
    return {
      error: 'Unable to load explore posts at this time.',
    }
  }
}

export async function updatePostAction(
  postId: string,
  data: UpdatePostInput
): Promise<{ success?: boolean; error?: string; post?: PostWithAuthor }> {
  const validation = updatePostSchema.safeParse(data)
  if (!validation.success) {
    const firstError = validation.error.issues[0]?.message ?? 'Invalid post update'
    return { error: firstError }
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

    const post = await updatePost(postId, user.id, validation.data)
    revalidatePath('/feed')

    return {
      success: true,
      post,
    }
  } catch (err: unknown) {
    console.error('Failed to update post:', err)
    const message = err instanceof Error ? err.message : 'Failed to update post'
    return { error: message }
  }
}

export async function deletePostAction(
  postId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Your session has expired. Please sign in again.' }
    }

    await deletePost(postId, user.id)
    revalidatePath('/feed')

    return { success: true }
  } catch (err: unknown) {
    console.error('Failed to delete post:', err)
    const message = err instanceof Error ? err.message : 'Failed to delete post'
    return { error: message }
  }
}

