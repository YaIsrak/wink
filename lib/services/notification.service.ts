import { prisma } from '@/lib/db'
import type { NotificationType } from '@prisma/client'
import type { NotificationWithDetails, NotificationFilter } from '@/types/notification'

export async function createNotification(params: {
  recipientId: string
  actorId: string
  type: NotificationType
  postId?: string | null
  commentId?: string | null
}) {
  // Never create self notifications
  if (params.recipientId === params.actorId) {
    return null
  }

  // Prevent duplicate unread notifications for LIKE
  if (params.type === 'LIKE' && params.postId) {
    const existing = await prisma.notification.findFirst({
      where: {
        recipientId: params.recipientId,
        actorId: params.actorId,
        type: 'LIKE',
        postId: params.postId,
      },
    })
    if (existing) {
      return existing
    }
  }

  // Prevent duplicate notifications for FOLLOW
  if (params.type === 'FOLLOW') {
    const existing = await prisma.notification.findFirst({
      where: {
        recipientId: params.recipientId,
        actorId: params.actorId,
        type: 'FOLLOW',
      },
    })
    if (existing) {
      return existing
    }
  }

  return prisma.notification.create({
    data: {
      recipientId: params.recipientId,
      actorId: params.actorId,
      type: params.type,
      postId: params.postId || null,
      commentId: params.commentId || null,
      read: false,
    },
  })
}

export async function deleteNotification(params: {
  recipientId: string
  actorId: string
  type: NotificationType
  postId?: string | null
}) {
  if (params.type === 'LIKE' && params.postId) {
    await prisma.notification.deleteMany({
      where: {
        recipientId: params.recipientId,
        actorId: params.actorId,
        type: 'LIKE',
        postId: params.postId,
      },
    })
  } else if (params.type === 'FOLLOW') {
    await prisma.notification.deleteMany({
      where: {
        recipientId: params.recipientId,
        actorId: params.actorId,
        type: 'FOLLOW',
      },
    })
  }
}

export async function getNotifications(params: {
  recipientId: string
  filter?: NotificationFilter
  cursor?: string
  limit?: number
}): Promise<{ notifications: NotificationWithDetails[]; nextCursor: string | null }> {
  const limit = params.limit ?? 15
  const whereClause: {
    recipientId: string
    read?: boolean
  } = {
    recipientId: params.recipientId,
  }

  if (params.filter === 'unread') {
    whereClause.read = false
  }

  const rawNotifications = await prisma.notification.findMany({
    where: whereClause,
    take: limit + 1,
    skip: params.cursor ? 1 : 0,
    cursor: params.cursor ? { id: params.cursor } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      actor: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      post: {
        select: {
          id: true,
          imageUrl: true,
          caption: true,
          author: {
            select: {
              username: true,
            },
          },
        },
      },
      comment: {
        select: {
          id: true,
          content: true,
        },
      },
    },
  })

  let nextCursor: string | null = null
  if (rawNotifications.length > limit) {
    const nextItem = rawNotifications.pop()
    nextCursor = nextItem ? nextItem.id : null
  }

  const notifications: NotificationWithDetails[] = rawNotifications.map((n) => ({
    id: n.id,
    recipientId: n.recipientId,
    actorId: n.actorId,
    type: n.type,
    postId: n.postId,
    commentId: n.commentId,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
    actor: {
      id: n.actor.id,
      username: n.actor.username,
      displayName: n.actor.displayName,
      avatarUrl: n.actor.avatarUrl,
    },
    post: n.post
      ? {
          id: n.post.id,
          imageUrl: n.post.imageUrl,
          caption: n.post.caption,
          author: {
            username: n.post.author.username,
          },
        }
      : null,
    comment: n.comment
      ? {
          id: n.comment.id,
          content: n.comment.content,
        }
      : null,
  }))

  return {
    notifications,
    nextCursor,
  }
}

export async function getUnreadNotificationCount(recipientId: string): Promise<number> {
  return prisma.notification.count({
    where: {
      recipientId,
      read: false,
    },
  })
}

export async function markNotificationAsRead(
  notificationId: string,
  recipientId: string
): Promise<boolean> {
  const result = await prisma.notification.updateMany({
    where: {
      id: notificationId,
      recipientId,
      read: false,
    },
    data: {
      read: true,
    },
  })

  return result.count > 0
}

export async function markAllNotificationsAsRead(recipientId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: {
      recipientId,
      read: false,
    },
    data: {
      read: true,
    },
  })

  return result.count
}
