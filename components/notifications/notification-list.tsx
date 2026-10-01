'use client'

import * as React from 'react'
import { BellIcon } from '@heroicons/react/24/outline'
import { CheckCheckIcon } from '@/components/shared/icons'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { NotificationTabs } from './notification-tabs'
import { NotificationItem } from './notification-item'
import { NotificationEmptyState } from './notification-empty-state'
import { InfiniteScrollSentinel } from '@/components/posts/infinite-scroll-sentinel'
import { useNotificationStore } from '@/lib/store/notification-store'
import {
  getNotificationsAction,
  markAllNotificationsAsReadAction,
} from '@/actions/notification'
import type {
  NotificationWithDetails,
  NotificationFilter,
} from '@/types/notification'

interface NotificationListProps {
  initialNotifications: NotificationWithDetails[]
  initialNextCursor: string | null
  initialUnreadCount: number
}

export function NotificationList({
  initialNotifications,
  initialNextCursor,
  initialUnreadCount,
}: NotificationListProps) {
  const [notifications, setNotifications] =
    React.useState<NotificationWithDetails[]>(initialNotifications)
  const [cursor, setCursor] = React.useState<string | null>(initialNextCursor)
  const [hasMore, setHasMore] = React.useState<boolean>(Boolean(initialNextCursor))
  const [filter, setFilter] = React.useState<NotificationFilter>('all')
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const [isMarkingAll, setIsMarkingAll] = React.useState(false)
  const [loadError, setLoadError] = React.useState(false)

  const unreadCount = useNotificationStore((state) => state.unreadCount)
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount)
  const decrementUnread = useNotificationStore((state) => state.decrementUnread)

  // Keep state synchronized with server props whenever new initial props arrive
  React.useEffect(() => {
    setNotifications(initialNotifications)
    setCursor(initialNextCursor)
    setHasMore(Boolean(initialNextCursor))
    setUnreadCount(initialUnreadCount)
  }, [initialNotifications, initialNextCursor, initialUnreadCount, setUnreadCount])

  // Handle filter changes (All vs Unread)
  const handleFilterChange = async (newFilter: NotificationFilter) => {
    if (newFilter === filter) return
    setFilter(newFilter)
    setLoadError(false)

    try {
      const res = await getNotificationsAction(newFilter, undefined, 15)
      if (res.success && res.notifications) {
        setNotifications(res.notifications)
        setCursor(res.nextCursor ?? null)
        setHasMore(Boolean(res.nextCursor))
      } else {
        toast.error(res.error || 'Failed to switch view')
      }
    } catch (err) {
      console.error('Error changing notification filter:', err)
      toast.error('Unable to fetch notifications')
    }
  }

  // Handle loading more notifications via infinite scroll
  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore || !cursor) return
    setIsLoadingMore(true)
    setLoadError(false)

    try {
      const res = await getNotificationsAction(filter, cursor, 15)
      if (res.success && res.notifications) {
        const existingIds = new Set(notifications.map((n) => n.id))
        const uniqueNew = res.notifications.filter((n) => !existingIds.has(n.id))
        setNotifications((prev) => [...prev, ...uniqueNew])
        setCursor(res.nextCursor ?? null)
        setHasMore(Boolean(res.nextCursor))
      } else {
        setLoadError(true)
      }
    } catch (err) {
      console.error('Failed to load more notifications:', err)
      setLoadError(true)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Handle individual notification read update
  const handleMarkItemRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    )
    decrementUnread()
  }

  // Handle Mark all as read with optimistic update and rollback on error
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return
    setIsMarkingAll(true)

    const prevNotifications = notifications
    const prevUnreadCount = unreadCount

    // Optimistically mark all read
    setNotifications((curr) => curr.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)

    try {
      const res = await markAllNotificationsAsReadAction()
      if (res.error) {
        setNotifications(prevNotifications)
        setUnreadCount(prevUnreadCount)
        toast.error(res.error)
      } else {
        toast.success('All notifications marked as read')
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err)
      setNotifications(prevNotifications)
      setUnreadCount(prevUnreadCount)
      toast.error('Failed to mark notifications as read')
    } finally {
      setIsMarkingAll(false)
    }
  }

  // Filter visible items if on 'unread' tab
  const displayedNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications

  return (
    <div className="flex flex-col gap-4">
      {/* Top Header Row */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
            <BellIcon className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Notifications
            </h1>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                : 'All caught up'}
            </p>
          </div>
        </div>

        {/* Mark All as Read Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0 || isMarkingAll}
          className="gap-1.5 rounded-lg text-xs font-medium cursor-pointer"
        >
          <CheckCheckIcon className="size-3.5" />
          <span>Mark all read</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <NotificationTabs
        activeFilter={filter}
        onFilterChange={handleFilterChange}
        unreadCount={unreadCount}
      />

      {/* Notifications Stream or Empty State */}
      {displayedNotifications.length === 0 ? (
        <NotificationEmptyState filter={filter} />
      ) : (
        <div className="flex flex-col gap-1 divide-y divide-border/40">
          {displayedNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkItemRead}
            />
          ))}

          {/* Infinite Scroll Sentinel */}
          <InfiniteScrollSentinel
            hasMore={hasMore}
            isLoading={isLoadingMore}
            onLoadMore={handleLoadMore}
            isError={loadError}
            onRetry={handleLoadMore}
            endMessage="No older notifications"
            className="pt-4"
          />
        </div>
      )}
    </div>
  )
}
