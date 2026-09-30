'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { useMessageStore } from '@/lib/store/message-store';

export function usePresence(userId?: string) {
  const setBulkOnlineStatus = useMessageStore((state) => state.setBulkOnlineStatus);
  const setOnlineStatus = useMessageStore((state) => state.setOnlineStatus);

  React.useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const presenceChannel = supabase.channel('online-presence', {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const onlineMap: Record<string, boolean> = {};
        for (const id in state) {
          onlineMap[id] = true;
        }
        setBulkOnlineStatus(onlineMap);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineStatus(key, true);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineStatus(key, false);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      presenceChannel.untrack();
      supabase.removeChannel(presenceChannel);
    };
  }, [userId, setBulkOnlineStatus, setOnlineStatus]);
}
