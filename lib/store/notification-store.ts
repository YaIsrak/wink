import { create } from 'zustand'

interface NotificationState {
  unreadCount: number
  unreadMessagesCount: number
  setUnreadCount: (count: number) => void
  incrementUnread: () => void
  resetUnread: () => void
  setUnreadMessagesCount: (count: number) => void
  incrementUnreadMessages: () => void
  resetUnreadMessages: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  unreadMessagesCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  resetUnread: () => set({ unreadCount: 0 }),
  setUnreadMessagesCount: (count) => set({ unreadMessagesCount: count }),
  incrementUnreadMessages: () =>
    set((state) => ({ unreadMessagesCount: state.unreadMessagesCount + 1 })),
  resetUnreadMessages: () => set({ unreadMessagesCount: 0 }),
}))
