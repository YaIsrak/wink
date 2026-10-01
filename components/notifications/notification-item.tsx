'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  UserPlusIcon,
} from '@heroicons/react/24/solid'
import { Avatar } from '@/components/ui/avatar'
import { formatRelativeTime, cn } from '@/lib/utils'
import type { NotificationWithDetails } from '@/types/notification'
import { markNotificationAsReadAction } from '@/actions/notification'

interface NotificationItemProps {
  notification: NotificationWithDetails
  onMarkAsRead?: (id: string) => void
}

export function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const router = useRouter()
  const isUnread = !notification.read

  const handleClick = async () => {
    if (isUnread) {
      onMarkAsRead?.(notification.id)
      markNotificationAsReadAction(notification.id).catch((err) => {
        console.error('Failed to sync notification read state:', err)
      })
    }

    // Determine destination route
    if (notification.type === 'FOLLOW') {
      router.push(`/profile/${notification.actor.username}`)
    } else if (notification.post?.author?.username) {
      router.push(`/profile/${notification.post.author.username}`)
    } else {
      router.push('/feed')
    }
  }

  // Type specific badge icon
  const renderBadgeIcon = () => {
    switch (notification.type) {
      case 'LIKE':
        return (
          <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-white ring-2 ring-background">
            <HeartIcon className="size-3" />
          </div>
        )
      case 'COMMENT':
        return (
          <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-blue-500 text-white ring-2 ring-background">
            <ChatBubbleLeftIcon className="size-3" />
          </div>
        )
      case 'FOLLOW':
        return (
          <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-violet-600 text-white ring-2 ring-background">
            <UserPlusIcon className="size-3" />
          </div>
        )
      default:
        return null
    }
  }

  // Action text description
  const renderActionText = () => {
    switch (notification.type) {
      case 'LIKE':
        return 'liked your post'
      case 'COMMENT':
        return 'commented on your post'
      case 'FOLLOW':
        return 'started following you'
      default:
        return 'interacted with you'
    }
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative flex items-start gap-3.5 p-4 rounded-xl transition-colors cursor-pointer select-none border border-transparent',
        isUnread
          ? 'bg-secondary/40 hover:bg-secondary/70 border-border/40'
          : 'hover:bg-muted/50'
      )}
    >
      {/* Unread indicator dot */}
      {isUnread && (
        <span className="absolute left-1.5 top-5 size-2 rounded-full bg-primary" />
      )}

      {/* Actor Avatar with Action Icon Badge */}
      <div className="relative shrink-0">
        <Link
          href={`/profile/${notification.actor.username}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar
            src={notification.actor.avatarUrl}
            alt={notification.actor.displayName}
            fallback={notification.actor.displayName.slice(0, 2).toUpperCase()}
            className="size-11 ring-1 ring-border/50 transition-transform group-hover:scale-105"
          />
        </Link>
        {renderBadgeIcon()}
      </div>

      {/* Notification Content Body */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="text-sm leading-snug">
          <Link
            href={`/profile/${notification.actor.username}`}
            onClick={(e) => e.stopPropagation()}
            className="font-semibold text-foreground hover:underline mr-1"
          >
            {notification.actor.displayName}
          </Link>
          <span className="text-muted-foreground">{renderActionText()}</span>
          <span className="text-xs text-muted-foreground/80 ml-2 whitespace-nowrap">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>

        {/* Comment snippet */}
        {notification.type === 'COMMENT' && notification.comment?.content && (
          <p className="mt-1.5 text-xs text-foreground/90 bg-background/80 rounded-lg p-2 border border-border/50 line-clamp-2">
            &ldquo;{notification.comment.content}&rdquo;
          </p>
        )}

        {/* Post caption preview if no image */}
        {notification.type === 'LIKE' &&
          !notification.post?.imageUrl &&
          notification.post?.caption && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-1 italic">
              {notification.post.caption}
            </p>
          )}
      </div>

      {/* Post Thumbnail Preview */}
      {notification.post?.imageUrl && (
        <div className="relative size-12 shrink-0 rounded-lg overflow-hidden border border-border/60 bg-muted">
          <Image
            src={notification.post.imageUrl}
            alt="Referenced post"
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
      )}
    </div>
  )
}
