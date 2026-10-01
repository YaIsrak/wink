'use client';

import * as React from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './message-bubble';
import { MessageComposer } from './message-composer';
import { EmptyChatState } from './empty-chat-state';
import { useMessageStore } from '@/lib/store/message-store';
import { useChatSubscription } from '@/lib/hooks/use-chat-subscription';
import {
  sendMessageAction,
  editMessageAction,
  softDeleteMessageAction,
} from '@/actions/message';
import { respondToRequestAction } from '@/actions/conversation';
import { toast } from 'sonner';
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  CheckIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import type { ConversationItem, MessageItem } from '@/types/message';

interface ChatWindowProps {
  conversation: ConversationItem | null;
  currentUserId?: string;
  onBack?: () => void;
  onStartNewMessage?: () => void;
}

export function ChatWindow({
  conversation,
  currentUserId,
  onBack,
  onStartNewMessage,
}: ChatWindowProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const addOptimisticMessage = useMessageStore((state) => state.addOptimisticMessage);
  const reconcileOptimisticMessage = useMessageStore(
    (state) => state.reconcileOptimisticMessage
  );
  const markMessageFailed = useMessageStore((state) => state.markMessageFailed);
  const updateMessageOptimistic = useMessageStore((state) => state.updateMessageOptimistic);
  const softDeleteMessageOptimistic = useMessageStore(
    (state) => state.softDeleteMessageOptimistic
  );
  const updateConversationItem = useMessageStore((state) => state.updateConversationItem);
  const onlineUsers = useMessageStore((state) => state.onlineUsers);

  const isOnline = !!(conversation && onlineUsers[conversation.otherUser.id]);

  // Realtime subscription
  const { messages, isTyping, sendTyping } = useChatSubscription({
    conversationId: conversation?.id,
    currentUserId,
    counterpartName: conversation?.otherUser.displayName,
  });

  // Auto-scroll to bottom on messages change or when counterpart is typing
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isTyping]);

  if (!conversation) {
    return <EmptyChatState onStartNewMessage={onStartNewMessage} />;
  }

  const isRecipientOfPending =
    conversation.status === 'PENDING' && conversation.initiatorId !== currentUserId;

  const handleSendMessage = async (content?: string, imageUrl?: string) => {
    if (!currentUserId) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: MessageItem = {
      id: tempId,
      conversationId: conversation.id,
      senderId: currentUserId,
      content: content || null,
      imageUrl: imageUrl || null,
      isDeleted: false,
      isEdited: false,
      readAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clientStatus: 'sending',
    };

    addOptimisticMessage(conversation.id, optimisticMessage);

    try {
      const res = await sendMessageAction(conversation.id, content, imageUrl);
      if (res.error) {
        markMessageFailed(conversation.id, tempId);
        toast.error(res.error);
        return;
      }

      if (res.message) {
        reconcileOptimisticMessage(conversation.id, tempId, res.message);
      }
    } catch {
      markMessageFailed(conversation.id, tempId);
      toast.error('Failed to send message');
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    updateMessageOptimistic(conversation.id, messageId, newContent);
    try {
      const res = await editMessageAction(messageId, newContent);
      if (res.error) {
        toast.error(res.error);
      }
    } catch {
      toast.error('Failed to update message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    softDeleteMessageOptimistic(conversation.id, messageId);
    try {
      const res = await softDeleteMessageAction(messageId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Message deleted');
      }
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const handleRespondToRequest = async (decision: 'ACCEPT' | 'DECLINE') => {
    try {
      const res = await respondToRequestAction(conversation.id, decision);
      if (res.error) {
        toast.error(res.error);
        return;
      }

      if (decision === 'ACCEPT') {
        updateConversationItem(conversation.id, { status: 'ACCEPTED' });
        toast.success('Message request accepted!');
      } else {
        updateConversationItem(conversation.id, { status: 'DECLINED' });
        toast.info('Message request declined');
      }
    } catch {
      toast.error('Failed to respond to request');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top Header */}
      <div className="h-16 px-4 border-b border-border/40 flex items-center justify-between bg-card/60 backdrop-blur-md select-none shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onBack}
              className="lg:hidden size-8 rounded-xl text-muted-foreground hover:text-foreground"
            >
              <ArrowLeftIcon className="size-4" />
            </Button>
          )}

          <Link href={`/profile/${conversation.otherUser.username}`} className="group relative">
            <Avatar
              src={conversation.otherUser.avatarUrl}
              fallback={conversation.otherUser.displayName[0]}
              size="md"
              status={isOnline ? 'online' : undefined}
            />
          </Link>

          <div>
            <div className="flex items-center gap-1.5">
              <Link
                href={`/profile/${conversation.otherUser.username}`}
                className="font-semibold text-sm text-foreground hover:underline truncate"
              >
                {conversation.otherUser.displayName}
              </Link>
              {conversation.otherUser.isMutualFollow && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal rounded-full">
                  Mutual Follow
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>@{conversation.otherUser.username}</span>
              <span>•</span>
              {isTyping ? (
                <span className="text-emerald-500 font-medium animate-pulse">
                  typing...
                </span>
              ) : (
                <span className={isOnline ? 'text-emerald-500 font-medium' : ''}>
                  {isOnline ? 'Active now' : 'Offline'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Link href={`/profile/${conversation.otherUser.username}`}>
            <Button size="icon" variant="ghost" className="size-8 rounded-xl text-muted-foreground hover:text-foreground">
              <ArrowTopRightOnSquareIcon className="size-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Privacy Banner */}
      <div className="px-4 py-2 bg-muted/40 border-b border-border/20 flex items-center justify-center gap-2 text-[11px] text-muted-foreground select-none">
        <ShieldCheckIcon className="size-3.5 text-muted-foreground" />
        <span>End to end encrypted direct connection between mutual follows</span>
      </div>

      {/* Chat Messages Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="flex justify-center my-4">
          <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider bg-muted/60 px-3 py-1 rounded-full border border-border/30 select-none">
            Today
          </span>
        </div>

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground text-xs">
            <span>No messages yet. Send a greeting to start chatting!</span>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isSender={message.senderId === currentUserId}
              senderAvatar={conversation.otherUser.avatarUrl}
              senderName={conversation.otherUser.displayName}
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
            />
          ))
        )}

        {/* Realtime Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 py-1 px-1 select-none animate-in fade-in duration-200">
            <Avatar
              src={conversation.otherUser.avatarUrl}
              fallback={conversation.otherUser.displayName[0]}
              size="sm"
              className="size-7"
            />
            <div className="bg-muted/70 border border-border/40 rounded-2xl rounded-tl-xs px-3.5 py-2.5 flex items-center gap-1.5 shadow-xs">
              <span className="size-1.5 rounded-full bg-muted-foreground/70 animate-bounce [animation-delay:-0.3s]" />
              <span className="size-1.5 rounded-full bg-muted-foreground/70 animate-bounce [animation-delay:-0.15s]" />
              <span className="size-1.5 rounded-full bg-muted-foreground/70 animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Footer / Composer or Request Decision Card */}
      {isRecipientOfPending ? (
        <div className="p-4 bg-card border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
          <div className="text-center sm:text-left">
            <h4 className="text-xs font-semibold text-foreground">
              Message request from {conversation.otherUser.displayName}
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Accept to respond and move this conversation to your primary inbox.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRespondToRequest('DECLINE')}
              className="flex-1 sm:flex-initial rounded-xl text-xs gap-1.5 h-8 text-destructive hover:bg-destructive/10"
            >
              <XMarkIcon className="size-3.5" />
              <span>Decline</span>
            </Button>
            <Button
              size="sm"
              onClick={() => handleRespondToRequest('ACCEPT')}
              className="flex-1 sm:flex-initial rounded-xl text-xs gap-1.5 h-8"
            >
              <CheckIcon className="size-3.5" />
              <span>Accept</span>
            </Button>
          </div>
        </div>
      ) : conversation.status === 'DECLINED' ? (
        <div className="p-4 bg-muted/40 border-t border-border/40 text-center text-xs text-muted-foreground select-none">
          This message request was declined.
        </div>
      ) : (
        <MessageComposer
          conversationId={conversation.id}
          currentUserId={currentUserId}
          onSendMessage={handleSendMessage}
          onTyping={sendTyping}
        />
      )}
    </div>
  );
}
