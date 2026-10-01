'use client';

import * as React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, formatRelativeTime } from '@/lib/utils';
import { CameraIcon, CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import { CheckCheckIcon } from '@/components/shared/icons';
import type { ConversationItem } from '@/types/message';

interface ConversationItemCardProps {
  conversation: ConversationItem;
  isActive: boolean;
  isOnline: boolean;
  currentUserId?: string;
  onClick: () => void;
}

export function ConversationItemCard({
  conversation,
  isActive,
  isOnline,
  currentUserId,
  onClick,
}: ConversationItemCardProps) {
  const { otherUser, lastMessage, unreadCount, status } = conversation;
  const isSender = lastMessage?.senderId === currentUserId;
  const isPending = status === 'PENDING';
  const isInitiator = conversation.initiatorId === currentUserId;

  const renderSnippet = () => {
    if (!lastMessage) {
      return (
        <span className="text-muted-foreground italic text-xs">
          {isPending && !isInitiator ? 'Sent you a message request' : 'Started a conversation'}
        </span>
      );
    }

    if (lastMessage.isDeleted) {
      return (
        <span className="text-muted-foreground/70 italic text-xs">
          This message was deleted
        </span>
      );
    }

    return (
      <div className="flex items-center gap-1 min-w-0">
        {isSender && (
          <span className="shrink-0 text-muted-foreground">
            {lastMessage.clientStatus === 'sending' ? (
              <ClockIcon className="size-3" />
            ) : lastMessage.readAt ? (
              <CheckCheckIcon className="size-3 text-emerald-500" />
            ) : (
              <CheckIcon className="size-3 text-muted-foreground" />
            )}
          </span>
        )}
        {lastMessage.imageUrl && !lastMessage.content && (
          <span className="flex items-center gap-1 text-xs text-foreground/80 shrink-0">
            <CameraIcon className="size-3" />
            <span>Photo</span>
          </span>
        )}
        {lastMessage.content && (
          <span className="truncate text-xs text-muted-foreground group-hover:text-foreground/90 transition-colors">
            {lastMessage.content}
          </span>
        )}
      </div>
    );
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-2xl transition-all flex items-center gap-3 group relative select-none border border-transparent',
        isActive
          ? 'bg-muted border-border/60 shadow-xs'
          : 'hover:bg-muted/50 hover:border-border/30'
      )}
    >
      <div className="relative shrink-0">
        <Avatar
          src={otherUser.avatarUrl}
          fallback={otherUser.displayName[0]}
          size="md"
          status={isOnline ? 'online' : undefined}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-sm text-foreground truncate">
              {otherUser.displayName}
            </span>
            {isPending && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-amber-500/40 text-amber-600 dark:text-amber-400 font-normal">
                {isInitiator ? 'Outgoing' : 'Request'}
              </Badge>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground shrink-0 font-normal">
            {formatRelativeTime(conversation.lastMessageAt)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            {renderSnippet()}
          </div>
          {unreadCount > 0 && (
            <span className="size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>

        <div className="text-[11px] text-muted-foreground/80 truncate mt-0.5">
          @{otherUser.username}
        </div>
      </div>
    </button>
  );
}
