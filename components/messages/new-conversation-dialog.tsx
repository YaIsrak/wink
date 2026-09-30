'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { getUserFollowingAction } from '@/actions/follow';
import { startConversationAction } from '@/actions/conversation';
import { useMessageStore } from '@/lib/store/message-store';
import { toast } from 'sonner';
import { Search, Loader2, Send } from 'lucide-react';
import type { FollowUserItem } from '@/types/profile';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: string;
  onConversationCreated?: (conversationId: string) => void;
}

export function NewConversationDialog({
  open,
  onOpenChange,
  currentUserId,
  onConversationCreated,
}: NewConversationDialogProps) {
  const router = useRouter();
  const [following, setFollowing] = React.useState<FollowUserItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [selectedUser, setSelectedUser] = React.useState<FollowUserItem | null>(null);
  const [messageText, setMessageText] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open || !currentUserId) return;

    let isMounted = true;
    setIsLoading(true);

    getUserFollowingAction(currentUserId, undefined, 50)
      .then((res) => {
        if (isMounted && res.users) {
          setFollowing(res.users);
        }
      })
      .catch((err) => {
        console.error('Failed to load following list:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, currentUserId]);

  const filteredFollowing = following.filter(
    (u) =>
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleStartChat = async () => {
    if (!selectedUser || !messageText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await startConversationAction(selectedUser.id, messageText.trim());

      if (res.error) {
        toast.error(res.error);
        return;
      }

      if (res.conversationId) {
        toast.success(
          res.status === 'PENDING'
            ? 'Message request sent!'
            : 'Conversation started!'
        );
        onOpenChange(false);
        setSelectedUser(null);
        setMessageText('');

        if (onConversationCreated) {
          onConversationCreated(res.conversationId);
        } else {
          router.push(`/messages/${res.conversationId}`);
        }
      }
    } catch {
      toast.error('Failed to start conversation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="sm:max-w-[480px] p-0 gap-0 overflow-hidden rounded-2xl">
      <DialogHeader className="p-4 border-b border-border/40">
          <DialogTitle className="text-base font-semibold">
            {selectedUser ? `Message @${selectedUser.username}` : 'New Message'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {selectedUser
              ? 'Send an initial message to start chatting.'
              : 'You can message anyone you follow on Wink.'}
          </DialogDescription>
        </DialogHeader>

        {!selectedUser ? (
          <div className="flex flex-col h-[380px]">
            <div className="p-3 border-b border-border/30">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search creators you follow..."
                  className="pl-9 h-9 text-sm rounded-xl"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 divide-y divide-border/20">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Loader2 className="size-5 animate-spin mr-2" />
                  <span className="text-xs">Loading people you follow...</span>
                </div>
              ) : filteredFollowing.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <p className="text-sm font-medium text-foreground">
                    {search ? 'No matches found' : 'Not following anyone yet'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {search
                      ? 'Try searching by a different name or handle.'
                      : 'Follow creators to message them directly.'}
                  </p>
                </div>
              ) : (
                filteredFollowing.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary/60 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={user.avatarUrl}
                        fallback={user.displayName[0]}
                        size="md"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {user.displayName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-lg text-xs h-7 pointer-events-none">
                      Select
                    </Button>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between bg-secondary/40 p-2.5 rounded-xl border border-border/40">
              <div className="flex items-center gap-3">
                <Avatar
                  src={selectedUser.avatarUrl}
                  fallback={selectedUser.displayName[0]}
                  size="sm"
                />
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {selectedUser.displayName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    @{selectedUser.username}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground h-7"
                onClick={() => setSelectedUser(null)}
              >
                Change
              </Button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Your message
              </label>
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Say hello..."
                rows={4}
                className="resize-none rounded-xl text-sm"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setSelectedUser(null)}
                disabled={isSubmitting}
                className="rounded-xl"
              >
                Back
              </Button>
              <Button
                onClick={handleStartChat}
                disabled={!messageText.trim() || isSubmitting}
                className="gap-2 rounded-xl"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                <span>Send message</span>
              </Button>
            </div>
          </div>
        )}
    </Dialog>
  );
}
