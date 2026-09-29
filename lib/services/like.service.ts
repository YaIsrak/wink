import { prisma } from '@/lib/db'
import type { LikeUser } from '@/types/post'
import { createNotification, deleteNotification } from '@/lib/services/notification.service'

export async function toggleLike(
  postId: string,
  userId: string
): Promise<{ liked: boolean; likesCount: number }> {
  // Confirm post exists and obtain authorId
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  })

  if (!post) {
    throw new Error('Post not found')
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  })

  let liked = false

  if (existingLike) {
    await prisma.like.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    })
    liked = false

    // Remove notification if it exists
    await deleteNotification({
      recipientId: post.authorId,
      actorId: userId,
      type: 'LIKE',
      postId,
    })
  } else {
    await prisma.like.create({
      data: {
        postId,
        userId,
      },
    })
    liked = true

    // Create like notification for post author
    await createNotification({
      recipientId: post.authorId,
      actorId: userId,
      type: 'LIKE',
      postId,
    })
  }

  const likesCount = await prisma.like.count({
    where: { postId },
  })

  return {
    liked,
    likesCount,
  }
}

export async function getPostLikes(postId: string): Promise<LikeUser[]> {
  const likes = await prisma.like.findMany({
    where: { postId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  })

  return likes.map((like) => ({
    id: like.user.id,
    username: like.user.username,
    displayName: like.user.displayName,
    avatarUrl: like.user.avatarUrl,
    createdAt: like.createdAt,
  }))
}

export async function isPostLikedByUser(
  postId: string,
  userId: string
): Promise<boolean> {
  const count = await prisma.like.count({
    where: {
      postId,
      userId,
    },
  })

  return count > 0
}
