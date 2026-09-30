import { create } from 'zustand';
import type { ConversationFilter, ConversationItem, MessageItem } from '@/types/message';

interface MessageState {
  conversations: ConversationItem[];
  unreadRequestsCount: number;
  activeConversationId: string | null;
  messagesByConversation: Record<string, MessageItem[]>;
  onlineUsers: Record<string, boolean>; // userId -> isOnline
  activeFilter: ConversationFilter;
  searchQuery: string;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;

  setConversations: (conversations: ConversationItem[], unreadRequestsCount?: number) => void;
  updateConversationItem: (conversationId: string, updates: Partial<ConversationItem>) => void;
  setUnreadRequestsCount: (count: number) => void;
  setActiveConversationId: (id: string | null) => void;
  setActiveFilter: (filter: ConversationFilter) => void;
  setSearchQuery: (query: string) => void;
  setLoadingConversations: (loading: boolean) => void;
  setLoadingMessages: (loading: boolean) => void;

  setMessages: (conversationId: string, messages: MessageItem[]) => void;
  addMessage: (conversationId: string, message: MessageItem) => void;
  addOptimisticMessage: (conversationId: string, message: MessageItem) => void;
  reconcileOptimisticMessage: (conversationId: string, tempId: string, realMessage: MessageItem) => void;
  markMessageFailed: (conversationId: string, tempId: string) => void;
  updateMessageOptimistic: (conversationId: string, messageId: string, content: string) => void;
  softDeleteMessageOptimistic: (conversationId: string, messageId: string) => void;
  markConversationReadOptimistic: (conversationId: string) => void;

  setOnlineStatus: (userId: string, isOnline: boolean) => void;
  setBulkOnlineStatus: (statuses: Record<string, boolean>) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  unreadRequestsCount: 0,
  activeConversationId: null,
  messagesByConversation: {},
  onlineUsers: {},
  activeFilter: 'ALL',
  searchQuery: '',
  isLoadingConversations: false,
  isLoadingMessages: false,

  setConversations: (conversations, unreadRequestsCount) =>
    set((state) => ({
      conversations,
      unreadRequestsCount:
        unreadRequestsCount !== undefined ? unreadRequestsCount : state.unreadRequestsCount,
    })),

  updateConversationItem: (conversationId, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, ...updates } : c
      ),
    })),

  setUnreadRequestsCount: (count) => set({ unreadRequestsCount: Math.max(0, count) }),

  setActiveConversationId: (id) => set({ activeConversationId: id }),

  setActiveFilter: (filter) => set({ activeFilter: filter }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setLoadingConversations: (isLoadingConversations) => set({ isLoadingConversations }),

  setLoadingMessages: (isLoadingMessages) => set({ isLoadingMessages }),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: messages,
      },
    })),

  addMessage: (conversationId, message) =>
    set((state) => {
      const existing = state.messagesByConversation[conversationId] || [];
      // Prevent duplicate if already exists by id
      if (existing.some((m) => m.id === message.id)) {
        return state;
      }

      const updatedMessages = [...existing, message];

      // Also update lastMessage on conversation list
      const updatedConversations = state.conversations.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: message,
            lastMessageAt: message.createdAt,
          };
        }
        return c;
      });

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: updatedMessages,
        },
        conversations: updatedConversations,
      };
    }),

  addOptimisticMessage: (conversationId, message) =>
    set((state) => {
      const existing = state.messagesByConversation[conversationId] || [];
      const updatedMessages = [...existing, message];

      const updatedConversations = state.conversations.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: message,
            lastMessageAt: message.createdAt,
          };
        }
        return c;
      });

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: updatedMessages,
        },
        conversations: updatedConversations,
      };
    }),

  reconcileOptimisticMessage: (conversationId, tempId, realMessage) =>
    set((state) => {
      const existing = state.messagesByConversation[conversationId] || [];
      const updatedMessages = existing.map((m) => (m.id === tempId ? realMessage : m));

      const updatedConversations = state.conversations.map((c) => {
        if (c.id === conversationId && c.lastMessage?.id === tempId) {
          return {
            ...c,
            lastMessage: realMessage,
            lastMessageAt: realMessage.createdAt,
          };
        }
        return c;
      });

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: updatedMessages,
        },
        conversations: updatedConversations,
      };
    }),

  markMessageFailed: (conversationId, tempId) =>
    set((state) => {
      const existing = state.messagesByConversation[conversationId] || [];
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: existing.map((m) =>
            m.id === tempId ? { ...m, clientStatus: 'failed' } : m
          ),
        },
      };
    }),

  updateMessageOptimistic: (conversationId, messageId, content) =>
    set((state) => {
      const existing = state.messagesByConversation[conversationId] || [];
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: existing.map((m) =>
            m.id === messageId ? { ...m, content, isEdited: true } : m
          ),
        },
      };
    }),

  softDeleteMessageOptimistic: (conversationId, messageId) =>
    set((state) => {
      const existing = state.messagesByConversation[conversationId] || [];
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: existing.map((m) =>
            m.id === messageId ? { ...m, isDeleted: true, content: null, imageUrl: null } : m
          ),
        },
      };
    }),

  markConversationReadOptimistic: (conversationId) =>
    set((state) => {
      const existing = state.messagesByConversation[conversationId] || [];
      const updatedMessages = existing.map((m) => ({
        ...m,
        readAt: m.readAt || new Date().toISOString(),
      }));

      const updatedConversations = state.conversations.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            unreadCount: 0,
          };
        }
        return c;
      });

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: updatedMessages,
        },
        conversations: updatedConversations,
      };
    }),

  setOnlineStatus: (userId, isOnline) =>
    set((state) => ({
      onlineUsers: {
        ...state.onlineUsers,
        [userId]: isOnline,
      },
    })),

  setBulkOnlineStatus: (statuses) =>
    set((state) => ({
      onlineUsers: {
        ...state.onlineUsers,
        ...statuses,
      },
    })),
}));
