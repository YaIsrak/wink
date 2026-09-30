import { prisma } from '@/lib/db'
import { calculateProfileCompletion } from '@/lib/services/user.service'
import type { ChecklistProgress, ChecklistStep } from '@/types/checklist'

export async function getChecklistProgress(userId: string): Promise<ChecklistProgress> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      website: true,
      location: true,
      checklistDismissedAt: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const isDismissed = Boolean(user.checklistDismissedAt)

  if (isDismissed) {
    return {
      isDismissed: true,
      completedCount: 4,
      totalCount: 4,
      allCompleted: true,
      steps: [
        {
          id: 'profile',
          title: 'Complete your profile',
          description: 'Add your display name, bio, and avatar',
          isCompleted: true,
          actionText: 'Completed',
        },
        {
          id: 'follow',
          title: 'Follow 3 creators',
          description: 'Discover and follow at least 3 creators',
          isCompleted: true,
          actionText: 'Completed',
        },
        {
          id: 'post',
          title: 'Share your first post',
          description: 'Post a photo, caption, or thoughts',
          isCompleted: true,
          actionText: 'Completed',
        },
        {
          id: 'message',
          title: 'Send a direct message',
          description: 'Say hello to someone you follow',
          isCompleted: true,
          actionText: 'Completed',
        },
      ],
    }
  }

  const [followingCount, postsCount, messagesCount] = await Promise.all([
    prisma.follow.count({
      where: { followerId: userId },
    }),
    prisma.post.count({
      where: { authorId: userId },
    }),
    prisma.message.count({
      where: { senderId: userId },
    }),
  ])

  const profileScore = calculateProfileCompletion(user)
  const isProfileComplete = profileScore >= 100
  const isFollowingComplete = followingCount >= 3
  const isPostComplete = postsCount >= 1
  const isMessageComplete = messagesCount >= 1

  const steps: ChecklistStep[] = [
    {
      id: 'profile',
      title: 'Complete your profile',
      description: 'Add your display name, bio, and avatar',
      isCompleted: isProfileComplete,
      actionText: isProfileComplete ? 'Completed' : 'Edit Profile',
    },
    {
      id: 'follow',
      title: 'Follow 3 creators',
      description: `Follow at least 3 creators (${followingCount}/3)`,
      isCompleted: isFollowingComplete,
      actionText: isFollowingComplete ? 'Completed' : 'Find People',
    },
    {
      id: 'post',
      title: 'Share your first post',
      description: 'Post a photo, caption, or thoughts',
      isCompleted: isPostComplete,
      actionText: isPostComplete ? 'Completed' : 'Create Post',
    },
    {
      id: 'message',
      title: 'Send a direct message',
      description: 'Say hello to someone you follow',
      isCompleted: isMessageComplete,
      actionText: isMessageComplete ? 'Completed' : 'Open Messages',
    },
  ]

  const completedCount = steps.filter((step) => step.isCompleted).length
  const allCompleted = completedCount === steps.length

  return {
    isDismissed: false,
    completedCount,
    totalCount: steps.length,
    allCompleted,
    steps,
  }
}

export async function dismissChecklist(userId: string): Promise<boolean> {
  const progress = await getChecklistProgress(userId)
  if (!progress.allCompleted) {
    throw new Error('All checklist steps must be completed before dismissing')
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      checklistDismissedAt: new Date(),
    },
  })

  return true
}
