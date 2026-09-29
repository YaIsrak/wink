import { prisma } from '@/lib/db'
import type { UserSearchResult, SearchUsersResult, SearchPostsResult, SearchTopResult } from '@/types/search'
import type { PostWithAuthor } from '@/types/post'

/**
 * Searches users by username or display name with case insensitive matching
 */
export async function searchUsers(
  viewerId: string,
  query: string,
  cursor?: string | null,
  limit: number = 10
): Promise<SearchUsersResult> {
  const cleanQuery = query.trim()
  if (!cleanQuery) {
    return { users: [], nextCursor: null, hasMore: false }
  }

  const take = limit + 1

  const usersFound = await prisma.user.findMany({
    where: {
      onboardedAt: { not: null },
      OR: [
        { username: { contains: cleanQuery, mode: 'insensitive' } },
        { displayName: { contains: cleanQuery, mode: 'insensitive' } },
      ],
    },
    take,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      _count: {
        select: {
          followers: true,
        },
      },
    },
  })

  const hasMore = usersFound.length > limit
  const items = hasMore ? usersFound.slice(0, limit) : usersFound
  const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null

  // Fetch follow status for these users relative to the viewer
  const targetIds = items.map((u) => u.id)
  const myFollows = await prisma.follow.findMany({
    where: {
      followerId: viewerId,
      followingId: { in: targetIds },
    },
    select: { followingId: true },
  })

  const followingSet = new Set(myFollows.map((f) => f.followingId))

  const users: UserSearchResult[] = items.map((u) => ({
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    bio: u.bio,
    followersCount: u._count.followers,
    isFollowing: followingSet.has(u.id),
    isMe: u.id === viewerId,
  }))

  return {
    users,
    nextCursor,
    hasMore,
  }
}

/**
 * Searches posts by caption with case insensitive matching
 */
export async function searchPosts(
  viewerId: string,
  query: string,
  cursor?: string | null,
  limit: number = 10
): Promise<SearchPostsResult> {
  const cleanQuery = query.trim()
  if (!cleanQuery) {
    return { posts: [], nextCursor: null, hasMore: false }
  }

  const take = limit + 1

  const postsFound = await prisma.post.findMany({
    where: {
      caption: { contains: cleanQuery, mode: 'insensitive' },
    },
    take,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      likes: {
        where: { userId: viewerId },
        select: { id: true },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  })

  const hasMore = postsFound.length > limit
  const items = hasMore ? postsFound.slice(0, limit) : postsFound
  const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null

  // Check which authors viewer follows
  const authorIds = Array.from(new Set(items.map((p) => p.authorId)))
  const myAuthorFollows = await prisma.follow.findMany({
    where: {
      followerId: viewerId,
      followingId: { in: authorIds },
    },
    select: { followingId: true },
  })

  const authorFollowSet = new Set(myAuthorFollows.map((f) => f.followingId))

  const posts: PostWithAuthor[] = items.map((p) => ({
    id: p.id,
    authorId: p.authorId,
    caption: p.caption,
    imageUrl: p.imageUrl,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    author: {
      id: p.author.id,
      username: p.author.username,
      displayName: p.author.displayName,
      avatarUrl: p.author.avatarUrl,
    },
    likesCount: p._count.likes,
    commentsCount: p._count.comments,
    isLikedByMe: p.likes.length > 0,
    isFollowingAuthor: authorFollowSet.has(p.authorId),
  }))

  return {
    posts,
    nextCursor,
    hasMore,
  }
}

/**
 * Searches top results combining top users and top posts
 */
export async function searchTopSummary(
  viewerId: string,
  query: string
): Promise<SearchTopResult> {
  const [usersResult, postsResult] = await Promise.all([
    searchUsers(viewerId, query, null, 5),
    searchPosts(viewerId, query, null, 10),
  ])

  return {
    users: usersResult.users,
    posts: postsResult.posts,
  }
}
