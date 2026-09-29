import { prisma } from '@/lib/db'
import type { UpdateProfileInput } from '@/lib/validation/profile'
import type { UserProfileData } from '@/types/profile'
import { getFollowStats } from './follow.service'

export interface CompleteUserOnboardingParams {
  displayName: string
  bio?: string | null
  avatarUrl?: string | null
}

export function calculateProfileCompletion(user: {
  displayName?: string | null
  username?: string | null
  avatarUrl?: string | null
  bio?: string | null
  website?: string | null
  location?: string | null
}): number {
  let score = 0
  if (user.displayName && user.displayName.trim().length > 0) score += 20
  if (user.username && user.username.trim().length > 0) score += 20
  if (user.avatarUrl && user.avatarUrl.trim().length > 0) score += 25
  if (user.bio && user.bio.trim().length > 0) score += 20
  if (
    (user.website && user.website.trim().length > 0) ||
    (user.location && user.location.trim().length > 0)
  ) {
    score += 15
  }
  return Math.min(100, score)
}

export async function completeUserOnboarding(
  userId: string,
  data: CompleteUserOnboardingParams
) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      displayName: data.displayName.trim(),
      bio: data.bio && data.bio.trim().length > 0 ? data.bio.trim() : null,
      avatarUrl:
        data.avatarUrl && data.avatarUrl.trim().length > 0
          ? data.avatarUrl.trim()
          : null,
      onboardedAt: new Date(),
    },
  })
}

export async function skipUserOnboarding(userId: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      onboardedAt: new Date(),
    },
  })
}

export async function getUserOnboardingStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      onboardedAt: true,
      avatarUrl: true,
      displayName: true,
      username: true,
      bio: true,
      website: true,
      location: true,
    },
  })

  return {
    user,
    isOnboarded: Boolean(user?.onboardedAt),
    completionPercentage: user ? calculateProfileCompletion(user) : 0,
  }
}

export async function updateUserProfile(
  userId: string,
  data: UpdateProfileInput
) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      displayName: data.displayName.trim(),
      bio: data.bio && data.bio.trim().length > 0 ? data.bio.trim() : null,
      location:
        data.location && data.location.trim().length > 0
          ? data.location.trim()
          : null,
      website:
        data.website && data.website.trim().length > 0
          ? data.website.trim()
          : null,
      avatarUrl:
        data.avatarUrl && data.avatarUrl.trim().length > 0
          ? data.avatarUrl.trim()
          : null,
    },
  })
}

export async function getFullUserProfileByUsername(
  username: string,
  sessionUserId?: string
): Promise<UserProfileData | null> {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username.trim().toLowerCase(),
        mode: 'insensitive',
      },
    },
  })

  if (!user) return null

  const [postsCount, followStats] = await Promise.all([
    prisma.post.count({
      where: { authorId: user.id },
    }),
    getFollowStats(user.id, sessionUserId),
  ])

  const completionPercentage = calculateProfileCompletion(user)

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    website: user.website,
    location: user.location,
    onboardedAt: user.onboardedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    stats: {
      postsCount,
      followersCount: followStats.followersCount,
      followingCount: followStats.followingCount,
      isFollowing: followStats.isFollowing,
      isFollowedBy: followStats.isFollowedBy,
      completionPercentage,
    },
  }
}
