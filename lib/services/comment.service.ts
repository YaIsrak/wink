import { prisma } from '@/lib/db'
import type { CommentWithAuthor } from '@/types/post'
import { createNotification } from '@/lib/services/notification.service'

const AUTHOR_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
}

export async function createComment(
  postId: string,
  authorId: string,
  content: string
): Promise<CommentWithAuthor> {
  const trimmed = content.trim()

  if (!trimmed) {
    throw new Error('Comment cannot be empty')
  }

  if (trimmed.length > 280) {
    throw new Error('Comment must be 280 characters or less')
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  })

  if (!post) {
    throw new Error('Post not found')
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      authorId,
      content: trimmed,
    },
    include: {
      author: {
        select: AUTHOR_SELECT,
      },
    },
  })

  // Create notification for post author
  await createNotification({
    recipientId: post.authorId,
    actorId: authorId,
    type: 'COMMENT',
    postId,
    commentId: comment.id,
  })

  return comment
}

export async function deleteComment(
  commentId: string,
  userId: string
): Promise<{ success: boolean; commentId: string; postId: string }> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      post: {
        select: {
          authorId: true,
        },
      },
    },
  })

  if (!comment) {
    throw new Error('Comment not found')
  }

  const isCommentAuthor = comment.authorId === userId
  const isPostAuthor = comment.post.authorId === userId

  if (!isCommentAuthor && !isPostAuthor) {
    throw new Error('Unauthorized to delete this comment')
  }

  await prisma.comment.delete({
    where: { id: commentId },
  })

  return {
    success: true,
    commentId,
    postId: comment.postId,
  }
}

export async function getPostComments(postId: string): Promise<CommentWithAuthor[]> {
  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: 'asc' },
    include: {
      author: {
        select: AUTHOR_SELECT,
      },
    },
  })

  return comments
}
