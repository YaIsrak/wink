'use client';

import * as React from 'react';
import { ConversationItemCard } from './conversation-item-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMessageStore } from '@/lib/store/message-store';
import { Search, SquarePen, Inbox, Sparkles } from 'lucide-react';
import type { ConversationFilter, ConversationItem } from '@/types/message';

interface ConversationListProps {
  currentUserId?: string;
  onSelectConversation: (conversation: ConversationItem) => void;
  onOpenNewMessage: () => void;
}

export function ConversationList({
  currentUserId,
  onSelectConversation,
  onOpenNewMessage,
}: ConversationListProps) {
  const conversations = useMessageStore((state) => state.conversations);
  const unreadRequestsCount = useMessageStore((state) => state.unreadRequestsCount);
  const activeConversationId = useMessageStore((state) => state.activeConversationId);
  const activeFilter = useMessageStore((state) => state.activeFilter);
  const setActiveFilter = useMessageStore((state) => state.setActiveFilter);
  const searchQuery = useMessageStore((state) => state.searchQuery);
  const setSearchQuery = useMessageStore((state) => state.setSearchQuery);
  const onlineUsers = useMessageStore((state) => state.onlineUsers);

  // Filter conversations based on search and active tab
  const filteredConversations = React.useMemo(() => {
    return conversations.filter((c) => {
      // Search matching
      const matchesSearch =
        !searchQuery.trim() ||
        c.otherUser.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.lastMessage?.content &&
          c.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Filter matching
      if (activeFilter === 'REQUESTS') {
        return c.status === 'PENDING' && c.initiatorId !== currentUserId;
      }
      if (activeFilter === 'UNREAD') {
        return c.unreadCount > 0;
      }

      // 'ALL' tab: show all accepted, plus requests user sent
      return (
        c.status === 'ACCEPTED' ||
        (c.status === 'PENDING' && c.initiatorId === currentUserId)
      );
    });
  }, [conversations, activeFilter, searchQuery, currentUserId]);

  const tabs: { key: ConversationFilter; label: string; count?: number }[] = [
    { key: 'ALL', label: 'All' },
    {
      key: 'REQUESTS',
      label: 'Requests',
      count: unreadRequestsCount,
    },
    {
      key: 'UNREAD',
      label: 'Unread',
      count: conversations.filter((c) => c.unreadCount > 0).length,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-card border-r border-border/40 select-none">
      {/* Header */}
      <div className="p-4 pb-3 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Messages
            </h1>
            <Badge variant="secondary" className="text-[11px] font-medium rounded-full px-2 py-0.5">
              Active
            </Badge>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onOpenNewMessage}
            className="size-8 rounded-xl hover:bg-secondary text-foreground"
            title="New message"
          >
            <SquarePen className="size-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-9 h-9 text-xs rounded-xl bg-secondary/40 border-border/40 focus-visible:ring-1"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {tabs.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                  isActive
                    ? 'bg-foreground text-background shadow-xs'
                    : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-background text-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversations Stream */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <div className="size-10 rounded-full bg-secondary/80 flex items-center justify-center mb-2 text-muted-foreground">
              {activeFilter === 'REQUESTS' ? (
                <Inbox className="size-5" />
              ) : (
                <Sparkles className="size-5" />
              )}
            </div>
            <p className="text-xs font-semibold text-foreground">
              {activeFilter === 'REQUESTS'
                ? 'No message requests'
                : activeFilter === 'UNREAD'
                ? 'No unread messages'
                : searchQuery
                ? 'No conversations found'
                : 'No messages yet'}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-[200px]">
              {activeFilter === 'REQUESTS'
                ? 'When someone you do not follow messages you, their request will appear here.'
                : activeFilter === 'UNREAD'
                ? 'You are all caught up on your inbox.'
                : searchQuery
                ? 'Try a different keyword or username.'
                : 'Start a conversation with someone you follow.'}
            </p>
          </div>
        ) : (
          filteredConversations.map((c) => (
            <ConversationItemCard
              key={c.id}
              conversation={c}
              isActive={c.id === activeConversationId}
              isOnline={!!onlineUsers[c.otherUser.id]}
              currentUserId={currentUserId}
              onClick={() => onSelectConversation(c)}
            />
          ))
        )}
      </div>
    </div>
  );
}
