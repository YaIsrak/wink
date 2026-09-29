import { prisma } from '@/lib/db'
import type { FollowUserItem } from '@/types/profile'
import { createNotification, deleteNotification } from '@/lib/services/notification.service'

export async function toggleFollow(
  followerId: string,
  followingId: string
): Promise<{ isFollowing: boolean; followersCount: number }> {
  if (followerId === followingId) {
    throw new Error('You cannot follow yourself')
  }

  // Ensure target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: followingId },
    select: { id: true },
  })

  if (!targetUser) {
    throw new Error('Target user not found')
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  })

  let isFollowing = false

  if (existingFollow) {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    })
    isFollowing = false

    // Remove follow notification
    await deleteNotification({
      recipientId: followingId,
      actorId: followerId,
      type: 'FOLLOW',
    })
  } else {
    await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    })
    isFollowing = true

    // Create follow notification
    await createNotification({
      recipientId: followingId,
      actorId: followerId,
      type: 'FOLLOW',
    })
  }

  const followersCount = await prisma.follow.count({
    where: { followingId },
  })

  return {
    isFollowing,
    followersCount,
  }
}

export async function getFollowStats(
  userId: string,
  currentUserId?: string
): Promise<{
  followersCount: number
  followingCount: number
  isFollowing: boolean
  isFollowedBy: boolean
}> {
  const [followersCount, followingCount] = await Promise.all([
    prisma.follow.count({
      where: { followingId: userId },
    }),
    prisma.follow.count({
      where: { followerId: userId },
    }),
  ])

  let isFollowing = false
  let isFollowedBy = false

  if (currentUserId && currentUserId !== userId) {
    const [followingRecord, followedByRecord] = await Promise.all([
      prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId,
          },
        },
        select: { id: true },
      }),
      prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: currentUserId,
          },
        },
        select: { id: true },
      }),
    ])

    isFollowing = Boolean(followingRecord)
    isFollowedBy = Boolean(followedByRecord)
  }

  return {
    followersCount,
    followingCount,
    isFollowing,
    isFollowedBy,
  }
}

export async function getUserFollowers(
  targetUserId: string,
  currentUserId: string,
  cursor?: string,
  limit: number = 20
): Promise<{ users: FollowUserItem[]; nextCursor: string | null }> {
  const take = limit + 1

  const follows = await prisma.follow.findMany({
    where: { followingId: targetUserId },
    take,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: { createdAt: 'desc' },
    include: {
      follower: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
        },
      },
    },
  })

  const hasNextPage = follows.length > limit
  const items = hasNextPage ? follows.slice(0, limit) : follows
  const nextCursor = hasNextPage && items.length > 0 ? items[items.length - 1].id : null

  // Check which of these followers currentUserId follows
  const followerUserIds = items.map((f) => f.follower.id)
  const myFollowingList = await prisma.follow.findMany({
    where: {
      followerId: currentUserId,
      followingId: { in: followerUserIds },
    },
    select: { followingId: true },
  })

  const myFollowingSet = new Set(myFollowingList.map((f) => f.followingId))

  const users: FollowUserItem[] = items.map((f) => ({
    id: f.follower.id,
    username: f.follower.username,
    displayName: f.follower.displayName,
    avatarUrl: f.follower.avatarUrl,
    bio: f.follower.bio,
    isFollowing: myFollowingSet.has(f.follower.id),
    isFollowedBy: true,
    createdAt: f.createdAt,
  }))

  return {
    users,
    nextCursor,
  }
}

export async function getUserFollowing(
  targetUserId: string,
  currentUserId: string,
  cursor?: string,
  limit: number = 20
): Promise<{ users: FollowUserItem[]; nextCursor: string | null }> {
  const take = limit + 1

  const follows = await prisma.follow.findMany({
    where: { followerId: targetUserId },
    take,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: { createdAt: 'desc' },
    include: {
      following: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
        },
      },
    },
  })

  const hasNextPage = follows.length > limit
  const items = hasNextPage ? follows.slice(0, limit) : follows
  const nextCursor = hasNextPage && items.length > 0 ? items[items.length - 1].id : null

  const followingUserIds = items.map((f) => f.following.id)
  const myFollowingList = await prisma.follow.findMany({
    where: {
      followerId: currentUserId,
      followingId: { in: followingUserIds },
    },
    select: { followingId: true },
  })

  const myFollowingSet = new Set(myFollowingList.map((f) => f.followingId))

  const users: FollowUserItem[] = items.map((f) => ({
    id: f.following.id,
    username: f.following.username,
    displayName: f.following.displayName,
    avatarUrl: f.following.avatarUrl,
    bio: f.following.bio,
    isFollowing: myFollowingSet.has(f.following.id),
    isFollowedBy: false,
    createdAt: f.createdAt,
  }))

  return {
    users,
    nextCursor,
  }
}

export async function getSuggestedUsers(
  currentUserId: string,
  limit: number = 5
) {
  // Get list of users already followed by current user
  const myFollows = await prisma.follow.findMany({
    where: { followerId: currentUserId },
    select: { followingId: true },
  })

  const excludedIds = [currentUserId, ...myFollows.map((f) => f.followingId)]

  const suggested = await prisma.user.findMany({
    where: {
      id: { notIn: excludedIds },
      onboardedAt: { not: null },
    },
    take: limit,
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
          posts: true,
        },
      },
    },
  })

  return suggested.map((u) => ({
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    bio: u.bio,
    followersCount: u._count.followers,
    postsCount: u._count.posts,
    isFollowing: false,
  }))
}

