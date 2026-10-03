import * as React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserConversations } from '@/lib/services/conversation.service';
import { MessagesShell } from '@/components/messages/messages-shell';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Direct Messages',
  description: 'Private, realtime direct messages with mutual follows on Wink.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { conversations, unreadRequestsCount } = await getUserConversations(user.id, 'ALL');

  return (
    <div className="w-full h-[calc(100dvh-8.5rem)] lg:h-[calc(100dvh-2rem)] p-2 lg:p-4">
      <MessagesShell
        initialConversations={conversations}
        initialUnreadRequestsCount={unreadRequestsCount}
        currentUserId={user.id}
      />
    </div>
  );
}
