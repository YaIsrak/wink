import { prisma } from '@/lib/db'
import type { LikeUser } from '@/types/post'

export async function toggleLike(
  postId: string,
  userId: string
): Promise<{ liked: boolean; likesCount: number }> {
  // Confirm post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
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
  } else {
    await prisma.like.create({
      data: {
        postId,
        userId,
      },
    })
    liked = true
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
