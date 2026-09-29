import { create } from 'zustand'
import type { NotificationWithDetails, NotificationFilter } from '@/types/notification'

interface NotificationState {
  unreadCount: number
  unreadMessagesCount: number
  notifications: NotificationWithDetails[]
  cursor: string | null
  hasMore: boolean
  filter: NotificationFilter
  isLoading: boolean
  isLoadingMore: boolean

  setUnreadCount: (count: number) => void
  incrementUnread: () => void
  decrementUnread: () => void
  resetUnread: () => void

  setUnreadMessagesCount: (count: number) => void
  incrementUnreadMessages: () => void
  resetUnreadMessages: () => void

  setFilter: (filter: NotificationFilter) => void
  setLoading: (loading: boolean) => void
  setLoadingMore: (loadingMore: boolean) => void

  setNotifications: (
    notifications: NotificationWithDetails[],
    nextCursor: string | null
  ) => void
  appendNotifications: (
    notifications: NotificationWithDetails[],
    nextCursor: string | null
  ) => void
  addNotification: (notification: NotificationWithDetails) => void

  markAsReadOptimistic: (notificationId: string) => void
  markAllAsReadOptimistic: () => {
    previousNotifications: NotificationWithDetails[]
    previousUnreadCount: number
  }
  rollbackMarkAllAsRead: (snapshot: {
    previousNotifications: NotificationWithDetails[]
    previousUnreadCount: number
  }) => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  unreadCount: 0,
  unreadMessagesCount: 0,
  notifications: [],
  cursor: null,
  hasMore: false,
  filter: 'all',
  isLoading: false,
  isLoadingMore: false,

  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnread: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  resetUnread: () => set({ unreadCount: 0 }),

  setUnreadMessagesCount: (count) => set({ unreadMessagesCount: Math.max(0, count) }),
  incrementUnreadMessages: () =>
    set((state) => ({ unreadMessagesCount: state.unreadMessagesCount + 1 })),
  resetUnreadMessages: () => set({ unreadMessagesCount: 0 }),

  setFilter: (filter) => set({ filter }),
  setLoading: (isLoading) => set({ isLoading }),
  setLoadingMore: (isLoadingMore) => set({ isLoadingMore }),

  setNotifications: (notifications, nextCursor) =>
    set({
      notifications,
      cursor: nextCursor,
      hasMore: !!nextCursor,
    }),

  appendNotifications: (newNotifications, nextCursor) =>
    set((state) => {
      const existingIds = new Set(state.notifications.map((n) => n.id))
      const uniqueNew = newNotifications.filter((n) => !existingIds.has(n.id))
      return {
        notifications: [...state.notifications, ...uniqueNew],
        cursor: nextCursor,
        hasMore: !!nextCursor,
      }
    }),

  addNotification: (notification) =>
    set((state) => {
      const exists = state.notifications.some((n) => n.id === notification.id)
      if (exists) {
        return state
      }
      return {
        notifications: [notification, ...state.notifications],
        unreadCount: notification.read ? state.unreadCount : state.unreadCount + 1,
      }
    }),

  markAsReadOptimistic: (notificationId) =>
    set((state) => {
      let wasUnread = false
      const updated = state.notifications.map((n) => {
        if (n.id === notificationId && !n.read) {
          wasUnread = true
          return { ...n, read: true }
        }
        return n
      })

      return {
        notifications: updated,
        unreadCount: wasUnread
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      }
    }),

  markAllAsReadOptimistic: () => {
    const state = get()
    const snapshot = {
      previousNotifications: state.notifications,
      previousUnreadCount: state.unreadCount,
    }

    set({
      unreadCount: 0,
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })

    return snapshot
  },

  rollbackMarkAllAsRead: (snapshot) =>
    set({
      notifications: snapshot.previousNotifications,
      unreadCount: snapshot.previousUnreadCount,
    }),
}))
