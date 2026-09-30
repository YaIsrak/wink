'use client';

import * as React from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyChatStateProps {
  onStartNewMessage?: () => void;
}

export function EmptyChatState({ onStartNewMessage }: EmptyChatStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12 select-none">
      <div className="size-16 rounded-2xl bg-secondary/60 flex items-center justify-center mb-4 text-muted-foreground border border-border/50">
        <MessageSquare className="size-8" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground">
        Select a conversation
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6 leading-relaxed">
        Choose a conversation from the list to start messaging, or start a new chat with creators you follow.
      </p>
      {onStartNewMessage && (
        <Button onClick={onStartNewMessage} className="gap-2 rounded-xl">
          <Plus className="size-4" />
          <span>New message</span>
        </Button>
      )}
    </div>
  );
}
