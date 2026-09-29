import { prisma } from '@/lib/db'
import type { PostWithAuthor } from '@/types/post'

export type { PostAuthor, PostWithAuthor } from '@/types/post'

export interface CreatePostParams {
  authorId: string
  caption?: string | null
  imageUrl?: string | null
}

export interface GetFeedPostsParams {
  cursor?: string
  limit?: number
  currentUserId?: string
}

const AUTHOR_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
}

export async function createPost(params: CreatePostParams): Promise<PostWithAuthor> {
  const { authorId, caption, imageUrl } = params

  const trimmedCaption = caption?.trim() || null
  const cleanImageUrl = imageUrl?.trim() || null

  if (!trimmedCaption && !cleanImageUrl) {
    throw new Error('Post must have either a caption or an image.')
  }

  const post = await prisma.post.create({
    data: {
      authorId,
      caption: trimmedCaption,
      imageUrl: cleanImageUrl,
    },
    include: {
      author: {
        select: AUTHOR_SELECT,
      },
    },
  })

  return {
    ...post,
    likesCount: 0,
    commentsCount: 0,
    isLikedByMe: false,
    previewComments: [],
  }
}

export async function getFeedPosts(params: GetFeedPostsParams = {}): Promise<{
  posts: PostWithAuthor[]
  nextCursor?: string
}> {
  const limit = Math.min(Math.max(params.limit ?? 20, 1), 50)
  const { cursor, currentUserId } = params

  const posts = await prisma.post.findMany({
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      author: {
        select: AUTHOR_SELECT,
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
      likes: currentUserId
        ? {
            where: {
              userId: currentUserId,
            },
            select: {
              userId: true,
            },
          }
        : false,
      comments: {
        take: 2,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: {
            select: AUTHOR_SELECT,
          },
        },
      },
    },
  })

  let nextCursor: string | undefined = undefined
  if (posts.length > limit) {
    const nextItem = posts.pop()
    nextCursor = nextItem?.id
  }

  const formattedPosts: PostWithAuthor[] = posts.map((post) => ({
    id: post.id,
    authorId: post.authorId,
    caption: post.caption,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: post.author,
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    isLikedByMe: Array.isArray(post.likes) && post.likes.length > 0,
    previewComments: (post.comments || []).slice().reverse(),
  }))

  return {
    posts: formattedPosts,
    nextCursor,
  }
}

export async function getPostById(
  postId: string,
  currentUserId?: string
): Promise<PostWithAuthor | null> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: AUTHOR_SELECT,
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
      likes: currentUserId
        ? {
            where: {
              userId: currentUserId,
            },
            select: {
              userId: true,
            },
          }
        : false,
      comments: {
        take: 2,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: {
            select: AUTHOR_SELECT,
          },
        },
      },
    },
  })

  if (!post) return null

  return {
    id: post.id,
    authorId: post.authorId,
    caption: post.caption,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: post.author,
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    isLikedByMe: Array.isArray(post.likes) && post.likes.length > 0,
    previewComments: (post.comments || []).slice().reverse(),
  }
}

export async function deletePost(postId: string, userId: string): Promise<boolean> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  })

  if (!post || post.authorId !== userId) {
    throw new Error('Unauthorized or post not found')
  }

  await prisma.post.delete({
    where: { id: postId },
  })

  return true
}

export async function updatePost(
  postId: string,
  userId: string,
  data: { caption?: string | null }
): Promise<PostWithAuthor> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, imageUrl: true },
  })

  if (!post || post.authorId !== userId) {
    throw new Error('Unauthorized or post not found')
  }

  const trimmedCaption = data.caption?.trim() || null
  if (!trimmedCaption && !post.imageUrl) {
    throw new Error('Post must have either a caption or an image.')
  }

  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      caption: trimmedCaption,
    },
    include: {
      author: {
        select: AUTHOR_SELECT,
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
      likes: {
        where: {
          userId,
        },
        select: {
          userId: true,
        },
      },
      comments: {
        take: 2,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: {
            select: AUTHOR_SELECT,
          },
        },
      },
    },
  })

  return {
    id: updated.id,
    authorId: updated.authorId,
    caption: updated.caption,
    imageUrl: updated.imageUrl,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    author: updated.author,
    likesCount: updated._count.likes,
    commentsCount: updated._count.comments,
    isLikedByMe: Array.isArray(updated.likes) && updated.likes.length > 0,
    previewComments: (updated.comments || []).slice().reverse(),
  }
}

export async function getUserPosts(
  authorId: string,
  currentUserId?: string
): Promise<PostWithAuthor[]> {
  const posts = await prisma.post.findMany({
    where: { authorId },
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: AUTHOR_SELECT,
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
      likes: currentUserId
        ? {
            where: {
              userId: currentUserId,
            },
            select: {
              userId: true,
            },
          }
        : false,
      comments: {
        take: 2,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: {
            select: AUTHOR_SELECT,
          },
        },
      },
    },
  })

  return posts.map((post) => ({
    id: post.id,
    authorId: post.authorId,
    caption: post.caption,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: post.author,
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    isLikedByMe: Array.isArray(post.likes) && post.likes.length > 0,
    previewComments: (post.comments || []).slice().reverse(),
  }))
}
