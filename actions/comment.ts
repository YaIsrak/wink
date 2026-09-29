'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createCommentSchema,
  deleteCommentSchema,
  type CreateCommentInput,
  type DeleteCommentInput,
} from '@/lib/validation/comment'
import {
  createComment,
  deleteComment,
  getPostComments,
} from '@/lib/services/comment.service'
import type { CommentWithAuthor } from '@/types/post'

export interface CreateCommentActionResult {
  success?: boolean
  error?: string
  comment?: CommentWithAuthor
}

export interface DeleteCommentActionResult {
  success?: boolean
  error?: string
  commentId?: string
  postId?: string
}

export interface GetPostCommentsActionResult {
  success?: boolean
  error?: string
  comments?: CommentWithAuthor[]
}

export async function createCommentAction(
  data: CreateCommentInput
): Promise<CreateCommentActionResult> {
  const validation = createCommentSchema.safeParse(data)
  if (!validation.success) {
    const firstError = validation.error.issues[0]?.message ?? 'Invalid comment'
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

    const rawComment = await createComment(
      validation.data.postId,
      user.id,
      validation.data.content
    )

    const comment: CommentWithAuthor = {
      id: rawComment.id,
      postId: rawComment.postId,
      authorId: rawComment.authorId,
      content: rawComment.content,
      createdAt:
        typeof rawComment.createdAt === 'string'
          ? rawComment.createdAt
          : rawComment.createdAt.toISOString(),
      updatedAt:
        typeof rawComment.updatedAt === 'string'
          ? rawComment.updatedAt
          : rawComment.updatedAt.toISOString(),
      author: {
        id: rawComment.author.id,
        username: rawComment.author.username,
        displayName: rawComment.author.displayName,
        avatarUrl: rawComment.author.avatarUrl,
      },
    }

    revalidatePath('/feed')
    revalidatePath('/notifications')

    return {
      success: true,
      comment,
    }
  } catch (err: unknown) {
    console.error('Failed to create comment:', err)
    const message =
      err instanceof Error ? err.message : 'Failed to publish comment'
    return { error: message }
  }
}

export async function deleteCommentAction(
  data: DeleteCommentInput
): Promise<DeleteCommentActionResult> {
  const validation = deleteCommentSchema.safeParse(data)
  if (!validation.success) {
    const firstError = validation.error.issues[0]?.message ?? 'Invalid input'
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

    const result = await deleteComment(validation.data.commentId, user.id)

    revalidatePath('/feed')

    return {
      success: true,
      commentId: result.commentId,
      postId: result.postId,
    }
  } catch (err: unknown) {
    console.error('Failed to delete comment:', err)
    const message =
      err instanceof Error ? err.message : 'Failed to delete comment'
    return { error: message }
  }
}

export async function getPostCommentsAction(
  postId: string
): Promise<GetPostCommentsActionResult> {
  if (!postId || typeof postId !== 'string') {
    return { error: 'Invalid post identifier' }
  }

  try {
    const rawComments = await getPostComments(postId)
    const comments: CommentWithAuthor[] = rawComments.map((c) => ({
      id: c.id,
      postId: c.postId,
      authorId: c.authorId,
      content: c.content,
      createdAt:
        typeof c.createdAt === 'string'
          ? c.createdAt
          : c.createdAt.toISOString(),
      updatedAt:
        typeof c.updatedAt === 'string'
          ? c.updatedAt
          : c.updatedAt.toISOString(),
      author: {
        id: c.author.id,
        username: c.author.username,
        displayName: c.author.displayName,
        avatarUrl: c.author.avatarUrl,
      },
    }))

    return {
      success: true,
      comments,
    }
  } catch (err: unknown) {
    console.error('Failed to fetch post comments:', err)
    const message =
      err instanceof Error ? err.message : 'Unable to load comments'
    return { error: message }
  }
}
