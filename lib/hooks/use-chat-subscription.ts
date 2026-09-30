'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { useMessageStore } from '@/lib/store/message-store';
import { markConversationReadAction } from '@/actions/message';
import { showBrowserNotification } from '@/lib/utils/notifications';
import type { MessageItem } from '@/types/message';

const EMPTY_MESSAGES: MessageItem[] = [];

export function useChatSubscription(params: {
  conversationId?: string | null;
  currentUserId?: string;
  counterpartName?: string;
}) {
  const { conversationId, currentUserId, counterpartName } = params;

  const addMessage = useMessageStore((state) => state.addMessage);
  const markConversationReadOptimistic = useMessageStore(
    (state) => state.markConversationReadOptimistic
  );
  const messages = useMessageStore((state) => {
    if (!conversationId) return EMPTY_MESSAGES;
    return state.messagesByConversation[conversationId] ?? EMPTY_MESSAGES;
  });


  const [isTyping, setIsTyping] = React.useState(false);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastTypingSentRef = React.useRef<number>(0);
  const channelRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const supabase = createClient();
    const channelName = `chat-room-${conversationId}`;

    // Mark as read immediately on mount
    markConversationReadOptimistic(conversationId);
    markConversationReadAction(conversationId).catch(() => {});

    const channel = supabase
      .channel(channelName)
      .on(
        'broadcast',
        { event: 'typing' },
        (payload) => {
          if (payload.payload?.userId && payload.payload.userId !== currentUserId) {
            setIsTyping(true);
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
              setIsTyping(false);
            }, 3000);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newRow = payload.new as any;

          const incomingMessage: MessageItem = {
            id: newRow.id,
            conversationId: newRow.conversation_id,
            senderId: newRow.sender_id,
            content: newRow.is_deleted ? null : newRow.content,
            imageUrl: newRow.is_deleted ? null : newRow.image_url,
            isDeleted: newRow.is_deleted,
            isEdited: newRow.is_edited,
            readAt: newRow.read_at ? new Date(newRow.read_at).toISOString() : null,
            createdAt: new Date(newRow.created_at).toISOString(),
            updatedAt: new Date(newRow.updated_at).toISOString(),
            clientStatus: 'delivered',
          };

          addMessage(conversationId, incomingMessage);

          if (incomingMessage.senderId !== currentUserId) {
            // Clear typing state immediately when counterpart sends a message
            setIsTyping(false);
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }

            // Trigger browser notification if window is blurred
            if (document.hidden) {
              showBrowserNotification(
                counterpartName ? `New message from ${counterpartName}` : 'New message on Wink',
                {
                  body: incomingMessage.content || 'Sent a photo attachment',
                  onClickUrl: `/messages/${conversationId}`,
                }
              );
            }

            // Mark as read immediately since user has thread open
            markConversationReadOptimistic(conversationId);
            markConversationReadAction(conversationId).catch(() => {});
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedRow = payload.new as any;
          const store = useMessageStore.getState();
          const existing = store.messagesByConversation[conversationId] || [];

          const updatedMessages = existing.map((m) => {
            if (m.id === updatedRow.id) {
              return {
                ...m,
                content: updatedRow.is_deleted ? null : updatedRow.content,
                imageUrl: updatedRow.is_deleted ? null : updatedRow.image_url,
                isDeleted: updatedRow.is_deleted,
                isEdited: updatedRow.is_edited,
                readAt: updatedRow.read_at ? new Date(updatedRow.read_at).toISOString() : null,
              };
            }
            return m;
          });

          store.setMessages(conversationId, updatedMessages);
        }
      );

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, counterpartName, addMessage, markConversationReadOptimistic]);

  const sendTyping = React.useCallback(() => {
    if (!channelRef.current || !currentUserId || !conversationId) return;

    const now = Date.now();
    if (now - lastTypingSentRef.current > 1500) {
      lastTypingSentRef.current = now;
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUserId },
      });
    }
  }, [currentUserId, conversationId]);

  return { messages, isTyping, sendTyping };
}
