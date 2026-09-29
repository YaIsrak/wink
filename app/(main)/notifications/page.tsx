import * as React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getNotifications,
  getUnreadNotificationCount,
} from '@/lib/services/notification.service'
import { NotificationList } from '@/components/notifications/notification-list'

export const metadata = {
  title: 'Notifications | Wink',
  description: 'View your activity stream, likes, comments, and new followers on Wink',
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Pre-fetch initial notification batch and unread count on the server
  const [notificationsResult, unreadCount] = await Promise.all([
    getNotifications({
      recipientId: user.id,
      filter: 'all',
      limit: 15,
    }),
    getUnreadNotificationCount(user.id),
  ])

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:py-8">
      <NotificationList
        initialNotifications={notificationsResult.notifications}
        initialNextCursor={notificationsResult.nextCursor}
        initialUnreadCount={unreadCount}
      />
    </div>
  )
}
