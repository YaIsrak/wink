'use client';

import * as React from 'react';
import Image from 'next/image';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  CheckIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCheckIcon } from '@/components/shared/icons';
import type { MessageItem } from '@/types/message';

interface MessageBubbleProps {
  message: MessageItem;
  isSender: boolean;
  senderAvatar?: string | null;
  senderName?: string;
  onEdit?: (messageId: string, newContent: string) => Promise<void>;
  onDelete?: (messageId: string) => Promise<void>;
  onRetry?: (message: MessageItem) => void;
}

export function MessageBubble({
  message,
  isSender,
  senderAvatar,
  senderName,
  onEdit,
  onDelete,
  onRetry,
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(message.content || '');
  const [isSubmittingEdit, setIsSubmittingEdit] = React.useState(false);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  const formattedTime = React.useMemo(() => {
    try {
      const d = new Date(message.createdAt);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }, [message.createdAt]);

  const handleSaveEdit = async () => {
    if (!editContent.trim() || editContent === message.content) {
      setIsEditing(false);
      return;
    }

    setIsSubmittingEdit(true);
    try {
      if (onEdit) {
        await onEdit(message.id, editContent.trim());
      }
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const renderStatus = () => {
    if (!isSender) return null;

    if (message.clientStatus === 'sending') {
      return <ClockIcon className="size-3 text-muted-foreground animate-pulse" />;
    }

    if (message.clientStatus === 'failed') {
      return (
        <button
          onClick={() => onRetry?.(message)}
          className="flex items-center gap-0.5 text-[10px] text-destructive hover:underline cursor-pointer"
        >
          <ExclamationCircleIcon className="size-3" />
          <span>Retry</span>
        </button>
      );
    }

    if (message.readAt) {
      return <CheckCheckIcon className="size-3 text-emerald-500" />;
    }

    return <CheckIcon className="size-3 text-muted-foreground" />;
  };

  if (message.isDeleted) {
    return (
      <div className={cn('flex w-full mb-3', isSender ? 'justify-end' : 'justify-start')}>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-secondary/30 border border-border/30 text-xs text-muted-foreground italic select-none">
          <span>This message was deleted</span>
          <span className="text-[10px] text-muted-foreground/60 not-italic ml-1">
            {formattedTime}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group flex w-full gap-2 mb-3.5 items-end',
        isSender ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Recipient avatar on incoming */}
      {!isSender && (
        <Avatar
          src={senderAvatar}
          fallback={senderName?.[0] || 'U'}
          size="sm"
          className="mb-1 shrink-0 select-none"
        />
      )}

      {/* Bubble container */}
      <div className={cn('flex flex-col max-w-[75%] sm:max-w-[65%]', isSender ? 'items-end' : 'items-start')}>
        <div className="relative group/bubble flex items-center gap-1.5">
          {/* Action trigger menu on hover (for sender) */}
          {isSender && !isEditing && (
            <div className="opacity-0 group-hover/bubble:opacity-100 transition-opacity flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-6 rounded-full hover:bg-secondary text-muted-foreground"
                  >
                    <EllipsisHorizontalIcon className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="right" className="rounded-xl w-32 p-1">
                  {message.content && (
                    <DropdownMenuItem
                      onClick={() => setIsEditing(true)}
                      className="text-xs gap-2 rounded-lg cursor-pointer"
                    >
                      <PencilSquareIcon className="size-3.5" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => onDelete?.(message.id)}
                    className="text-xs gap-2 rounded-lg text-destructive focus:text-destructive cursor-pointer"
                  >
                    <TrashIcon className="size-3.5" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Bubble content */}
          <div
            className={cn(
              'rounded-2xl text-sm overflow-hidden transition-shadow select-text',
              isSender
                ? 'bg-primary text-primary-foreground rounded-br-xs shadow-xs'
                : 'bg-secondary/70 text-foreground border border-border/40 rounded-bl-xs'
            )}
          >
            {/* Image attachment */}
            {message.imageUrl && (
              <div
                onClick={() => setLightboxOpen(true)}
                className="relative cursor-pointer overflow-hidden max-h-[300px] w-full bg-black/20"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={message.imageUrl}
                  alt="Attachment"
                  className="w-full h-auto object-cover max-h-[280px] rounded-t-xl hover:opacity-95 transition-opacity"
                />
              </div>
            )}

            {/* Text message */}
            {isEditing ? (
              <div className="p-2 flex flex-col gap-1.5 min-w-[200px]">
                <Input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="h-8 text-xs bg-background text-foreground rounded-lg"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                    className="h-6 text-[10px] px-2 text-primary-foreground hover:bg-white/20 rounded-md"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleSaveEdit}
                    disabled={isSubmittingEdit}
                    className="h-6 text-[10px] px-2 rounded-md"
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              message.content && (
                <div className="px-3.5 py-2 whitespace-pre-wrap break-words leading-relaxed">
                  {message.content}
                </div>
              )
            )}
          </div>
        </div>

        {/* Timestamp and status row */}
        <div
          className={cn(
            'flex items-center gap-1.5 text-[10px] text-muted-foreground/80 mt-1 px-1 select-none',
            isSender ? 'justify-end' : 'justify-start'
          )}
        >
          <span>{formattedTime}</span>
          {message.isEdited && <span className="text-[9px] italic">(edited)</span>}
          {renderStatus()}
        </div>
      </div>

      {/* Lightbox Dialog */}
      {message.imageUrl && (
        <Dialog
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          className="max-w-4xl p-0 border-none bg-black/90 overflow-hidden flex items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={message.imageUrl}
            alt="Full size attachment"
            className="max-h-[85vh] w-auto max-w-full object-contain"
          />
        </Dialog>
      )}
    </div>
  );
}
