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

  return post
}

export async function getFeedPosts(params: GetFeedPostsParams = {}): Promise<{
  posts: PostWithAuthor[]
  nextCursor?: string
}> {
  const limit = Math.min(Math.max(params.limit ?? 20, 1), 50)
  const { cursor } = params

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
    },
  })

  let nextCursor: string | undefined = undefined
  if (posts.length > limit) {
    const nextItem = posts.pop()
    nextCursor = nextItem?.id
  }

  return {
    posts,
    nextCursor,
  }
}

export async function getPostById(postId: string): Promise<PostWithAuthor | null> {
  return await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: AUTHOR_SELECT,
      },
    },
  })
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

  return await prisma.post.update({
    where: { id: postId },
    data: {
      caption: trimmedCaption,
    },
    include: {
      author: {
        select: AUTHOR_SELECT,
      },
    },
  })
}

export async function getUserPosts(authorId: string): Promise<PostWithAuthor[]> {
  return await prisma.post.findMany({
    where: { authorId },
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: AUTHOR_SELECT,
      },
    },
  })
}

