'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { useMessageStore } from '@/lib/store/message-store';
import { useNotificationStore } from '@/lib/store/notification-store';
import { getTotalUnreadMessagesCountAction } from '@/actions/message';
import { getConversationsAction } from '@/actions/conversation';
import { showBrowserNotification } from '@/lib/utils/notifications';

export function useInboxSubscription(userId?: string) {
  const setUnreadMessagesCount = useNotificationStore((state) => state.setUnreadMessagesCount);
  const setConversations = useMessageStore((state) => state.setConversations);
  const activeConversationId = useMessageStore((state) => state.activeConversationId);

  // Fetch initial unread messages count and requests
  React.useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    async function syncInbox() {
      try {
        const [unreadResult, convsResult] = await Promise.all([
          getTotalUnreadMessagesCountAction(),
          getConversationsAction('ALL'),
        ]);

        if (isMounted) {
          if (typeof unreadResult.count === 'number') {
            setUnreadMessagesCount(unreadResult.count);
          }
          if (convsResult.conversations) {
            setConversations(convsResult.conversations, convsResult.unreadRequestsCount);
          }
        }
      } catch (err) {
        console.error('Failed to sync inbox:', err);
      }
    }

    syncInbox();

    const handleFocus = () => {
      syncInbox();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
    };
  }, [userId, setUnreadMessagesCount, setConversations]);

  // Realtime subscription for incoming messages and conversation requests
  React.useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const inboxChannel = supabase
      .channel(`inbox-user-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        async () => {
          // Re-fetch conversation list & request count
          const res = await getConversationsAction('ALL');
          if (res.conversations) {
            setConversations(res.conversations, res.unreadRequestsCount);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const newRow = payload.new as any;
          if (newRow.sender_id !== userId) {
            // Re-fetch unread count
            const countRes = await getTotalUnreadMessagesCountAction();
            if (typeof countRes.count === 'number') {
              setUnreadMessagesCount(countRes.count);
            }

            // Also re-fetch conversation list to update lastMessage snippet
            const convsRes = await getConversationsAction('ALL');
            if (convsRes.conversations) {
              setConversations(convsRes.conversations, convsRes.unreadRequestsCount);
            }

            // If not actively viewing this conversation, trigger notification
            if (activeConversationId !== newRow.conversation_id) {
              showBrowserNotification('New message received', {
                body: newRow.content || 'Sent a photo attachment',
                onClickUrl: `/messages/${newRow.conversation_id}`,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(inboxChannel);
    };
  }, [userId, setConversations, setUnreadMessagesCount, activeConversationId]);
}
