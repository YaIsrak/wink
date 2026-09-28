import { prisma } from '@/lib/db'

export interface CompleteUserOnboardingParams {
  displayName: string
  bio?: string | null
  avatarUrl?: string | null
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
    },
  })

  return {
    user,
    isOnboarded: Boolean(user?.onboardedAt),
  }
}
