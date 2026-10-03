import * as React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserConversations } from '@/lib/services/conversation.service';
import { MessagesShell } from '@/components/messages/messages-shell';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Direct Message',
  description: 'Private, realtime direct messages with creators on Wink.',
  robots: {
    index: false,
    follow: false,
  },
};

interface ConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { conversations, unreadRequestsCount } = await getUserConversations(user.id, 'ALL');

  return (
    <div className="w-full h-dvh lg:h-[calc(100dvh-2rem)] p-0 lg:p-4">
      <MessagesShell
        initialConversations={conversations}
        initialUnreadRequestsCount={unreadRequestsCount}
        initialSelectedConversationId={conversationId}
        currentUserId={user.id}
      />
    </div>
  );
}
