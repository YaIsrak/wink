'use client'

import * as React from 'react'
import { Image as ImageIcon, BarChart2, Smile, Code, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { useUiStore } from '@/lib/store/ui-store'

export interface CreatePostDialogProps {
  user: {
    id: string
    username: string
    displayName: string
    avatarUrl?: string | null
  }
}

export function CreatePostDialog({ user }: CreatePostDialogProps) {
  const activeModal = useUiStore((state) => state.activeModal)
  const closeModal = useUiStore((state) => state.closeModal)
  const isOpen = activeModal === 'create-post'

  const [content, setContent] = React.useState('')

  const handlePost = () => {
    if (!content.trim()) {
      toast.error('Please enter some text for your post')
      return
    }
    toast.info('Post publishing and photo attachments are arriving in Phase 2!')
    setContent('')
    closeModal()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <span>Create Post</span>
        </DialogTitle>
        <DialogDescription>
          Share your updates, photos, or code snippets with the community.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4 py-2">
        <div className="flex items-start gap-3">
          <Avatar
            src={user.avatarUrl}
            fallback={user.displayName?.slice(0, 2) || user.username?.slice(0, 2) || 'WK'}
            size="md"
          />
          <div className="flex-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Share an update..."
              className="min-h-[120px] resize-none border-border bg-muted/30 focus-visible:bg-background"
              autoFocus
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-muted-foreground">
            <button
              type="button"
              onClick={() => toast.info('Image upload will be available in Phase 2')}
              className="flex size-8 items-center justify-center rounded-lg hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title="Add Image"
            >
              <ImageIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => toast.info('Polls will be available in Phase 2')}
              className="flex size-8 items-center justify-center rounded-lg hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title="Add Poll"
            >
              <BarChart2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => toast.info('Emoji picker will be available in Phase 2')}
              className="flex size-8 items-center justify-center rounded-lg hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title="Insert Emoji"
            >
              <Smile className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => toast.info('Markdown mode active')}
              className="flex size-8 items-center justify-center rounded-lg hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title="Code Snippet"
            >
              <Code className="size-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={closeModal}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handlePost}
              className="rounded-lg px-4 font-semibold"
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
