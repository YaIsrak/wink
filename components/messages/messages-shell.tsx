'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ConversationList } from './conversation-list';
import { ChatWindow } from './chat-window';
import { NewConversationDialog } from './new-conversation-dialog';
import { useMessageStore } from '@/lib/store/message-store';
import { usePresence } from '@/lib/hooks/use-presence';
import { getConversationByIdAction } from '@/actions/conversation';
import type { ConversationItem } from '@/types/message';

interface MessagesShellProps {
  initialConversations: ConversationItem[];
  initialUnreadRequestsCount: number;
  initialSelectedConversationId?: string;
  currentUserId: string;
}

export function MessagesShell({
  initialConversations,
  initialUnreadRequestsCount,
  initialSelectedConversationId,
  currentUserId,
}: MessagesShellProps) {
  const router = useRouter();
  const [newChatOpen, setNewChatOpen] = React.useState(false);
  const [activeConversation, setActiveConversation] = React.useState<ConversationItem | null>(null);

  const setConversations = useMessageStore((state) => state.setConversations);
  const conversations = useMessageStore((state) => state.conversations);
  const activeConversationId = useMessageStore((state) => state.activeConversationId);
  const setActiveConversationId = useMessageStore((state) => state.setActiveConversationId);
  const setMessages = useMessageStore((state) => state.setMessages);

  // Initialize presence
  usePresence(currentUserId);

  // Set initial store data
  React.useEffect(() => {
    setConversations(initialConversations, initialUnreadRequestsCount);
  }, [initialConversations, initialUnreadRequestsCount, setConversations]);

  // Load conversation strictly when ID is provided in route parameters
  React.useEffect(() => {
    if (!initialSelectedConversationId) {
      setActiveConversation(null);
      setActiveConversationId(null);
      return;
    }

    const targetId = initialSelectedConversationId;

    // Check if in local list
    const found = conversations.find((c) => c.id === targetId);
    if (found) {
      setActiveConversation(found);
      setActiveConversationId(targetId);
    }

    // Fetch fresh details and messages
    getConversationByIdAction(targetId).then((res) => {
      if (res.conversation) {
        setActiveConversation(res.conversation);
        setActiveConversationId(res.conversation.id);
      }
      if (res.messages) {
        setMessages(targetId, res.messages);
      }
    });
  }, [initialSelectedConversationId, conversations, setActiveConversationId, setMessages]);

  const handleSelectConversation = (conversation: ConversationItem) => {
    setActiveConversation(conversation);
    setActiveConversationId(conversation.id);
    router.push(`/messages/${conversation.id}`);
  };

  const handleBackToConversations = () => {
    setActiveConversation(null);
    setActiveConversationId(null);
    router.push('/messages');
  };

  const handleConversationCreated = (conversationId: string) => {
    router.push(`/messages/${conversationId}`);
  };

  return (
    <div className="h-full w-full flex bg-background rounded-none lg:rounded-2xl border-0 lg:border lg:border-border/40 overflow-hidden shadow-xs">
      {/* Left List Pane: shown always on desktop; hidden on mobile if thread is active */}
      <div
        className={`w-full lg:w-[360px] xl:w-[400px] h-full shrink-0 ${
          activeConversation ? 'hidden lg:block' : 'block'
        }`}
      >
        <ConversationList
          currentUserId={currentUserId}
          onSelectConversation={handleSelectConversation}
          onOpenNewMessage={() => setNewChatOpen(true)}
        />
      </div>

      {/* Right Chat Pane: shown always on desktop; shown on mobile only when conversation is active */}
      <div
        className={`flex-1 h-full min-w-0 ${
          activeConversation ? 'block' : 'hidden lg:block'
        }`}
      >
        <ChatWindow
          conversation={activeConversation}
          currentUserId={currentUserId}
          onBack={handleBackToConversations}
          onStartNewMessage={() => setNewChatOpen(true)}
        />
      </div>

      {/* New Conversation Dialog */}
      <NewConversationDialog
        open={newChatOpen}
        onOpenChange={setNewChatOpen}
        currentUserId={currentUserId}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
}
