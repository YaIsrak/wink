'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/services/notification.service'
import type { NotificationWithDetails, NotificationFilter } from '@/types/notification'
import { getNotificationsSchema, markNotificationReadSchema } from '@/lib/validation/notification'

export interface GetNotificationsActionResult {
  success?: boolean
  error?: string
  notifications?: NotificationWithDetails[]
  nextCursor?: string | null
}

export interface GetUnreadNotificationCountActionResult {
  success?: boolean
  error?: string
  count?: number
}

export interface MarkNotificationReadActionResult {
  success?: boolean
  error?: string
}

export async function getNotificationsAction(
  filter: NotificationFilter = 'all',
  cursor?: string,
  limit: number = 15
): Promise<GetNotificationsActionResult> {
  const parsed = getNotificationsSchema.safeParse({ filter, cursor, limit })
  if (!parsed.success) {
    return { error: 'Invalid notification query parameters' }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in.' }
    }

    const result = await getNotifications({
      recipientId: user.id,
      filter: parsed.data.filter,
      cursor: parsed.data.cursor,
      limit: parsed.data.limit,
    })

    return {
      success: true,
      notifications: result.notifications,
      nextCursor: result.nextCursor,
    }
  } catch (err: unknown) {
    console.error('Failed to fetch notifications:', err)
    const message =
      err instanceof Error ? err.message : 'Unable to fetch notifications'
    return { error: message }
  }
}

export async function getUnreadNotificationCountAction(): Promise<GetUnreadNotificationCountActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { count: 0 }
    }

    const count = await getUnreadNotificationCount(user.id)
    return {
      success: true,
      count,
    }
  } catch (err: unknown) {
    console.error('Failed to fetch unread count:', err)
    return { count: 0 }
  }
}

export async function markNotificationAsReadAction(
  notificationId: string
): Promise<MarkNotificationReadActionResult> {
  const parsed = markNotificationReadSchema.safeParse({ notificationId })
  if (!parsed.success) {
    return { error: 'Invalid notification identifier' }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in.' }
    }

    await markNotificationAsRead(parsed.data.notificationId, user.id)
    revalidatePath('/notifications')

    return { success: true }
  } catch (err: unknown) {
    console.error('Failed to mark notification as read:', err)
    const message =
      err instanceof Error ? err.message : 'Failed to mark notification as read'
    return { error: message }
  }
}

export async function markAllNotificationsAsReadAction(): Promise<MarkNotificationReadActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in.' }
    }

    await markAllNotificationsAsRead(user.id)
    revalidatePath('/notifications')

    return { success: true }
  } catch (err: unknown) {
    console.error('Failed to mark all notifications as read:', err)
    const message =
      err instanceof Error
        ? err.message
        : 'Failed to mark all notifications as read'
    return { error: message }
  }
}
