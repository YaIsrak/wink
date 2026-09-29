'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useNotificationStore } from '@/lib/store/notification-store'
import { getUnreadNotificationCountAction } from '@/actions/notification'
import { toast } from 'sonner'

export function useNotificationSubscription(userId?: string) {
  const pathname = usePathname()
  const router = useRouter()
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount)
  const incrementUnread = useNotificationStore((state) => state.incrementUnread)
  const decrementUnread = useNotificationStore((state) => state.decrementUnread)

  // Fetch initial unread count on mount or userId change
  React.useEffect(() => {
    if (!userId) return

    let isMounted = true

    async function fetchInitialCount() {
      try {
        const result = await getUnreadNotificationCountAction()
        if (isMounted && result.success && typeof result.count === 'number') {
          setUnreadCount(result.count)
        }
      } catch (err) {
        console.error('Failed to load initial notification count:', err)
      }
    }

    fetchInitialCount()

    // Resync when window gains focus
    const handleFocus = () => {
      fetchInitialCount()
    }
    window.addEventListener('focus', handleFocus)

    // Periodic safety check every 30 seconds
    const interval = setInterval(fetchInitialCount, 30000)

    return () => {
      isMounted = false
      window.removeEventListener('focus', handleFocus)
      clearInterval(interval)
    }
  }, [userId, setUnreadCount])

  // Realtime subscription
  React.useEffect(() => {
    if (!userId) return

    const supabase = createClient()
    const channelName = `realtime-notifications-${userId}`

    // Ensure Realtime has auth session token
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        supabase.realtime.setAuth(session.access_token)
      }
    })

    // Listen to changes without camelCase filter to avoid PostgREST filter casing bugs
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const raw = payload.new as {
              recipientId?: string
              type?: string
              actorId?: string
            }

            // Only process if intended for current user
            if (raw && raw.recipientId === userId) {
              incrementUnread()

              // Refresh route data if user is actively looking at /notifications
              if (pathname.startsWith('/notifications')) {
                router.refresh()
              } else {
                const rawType = raw.type
                let title = 'New notification'
                let description = 'You have new activity on Wink'

                if (rawType === 'LIKE') {
                  title = 'New Like'
                  description = 'Someone liked your post'
                } else if (rawType === 'COMMENT') {
                  title = 'New Comment'
                  description = 'Someone commented on your post'
                } else if (rawType === 'FOLLOW') {
                  title = 'New Follower'
                  description = 'Someone started following your profile'
                }

                toast(title, {
                  description,
                  action: {
                    label: 'View',
                    onClick: () => router.push('/notifications'),
                  },
                })
              }
            }
          } else if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as { recipientId?: string }
            if (!oldRow?.recipientId || oldRow.recipientId === userId) {
              decrementUnread()
              if (pathname.startsWith('/notifications')) {
                router.refresh()
              }
            }
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('[Realtime notifications] connection notice:', err)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, pathname, router, incrementUnread, decrementUnread])
}
