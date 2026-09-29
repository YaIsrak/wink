import { NotificationType } from '@prisma/client'

export type { NotificationType }

export interface NotificationActor {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
}

export interface NotificationPostSnippet {
  id: string
  imageUrl: string | null
  caption: string | null
  author: {
    username: string
  }
}

export interface NotificationCommentSnippet {
  id: string
  content: string
}

export interface NotificationWithDetails {
  id: string
  recipientId: string
  actorId: string
  type: NotificationType
  postId: string | null
  commentId: string | null
  read: boolean
  createdAt: string
  actor: NotificationActor
  post?: NotificationPostSnippet | null
  comment?: NotificationCommentSnippet | null
}

export type NotificationFilter = 'all' | 'unread'
