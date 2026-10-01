'use client'

import * as React from 'react'
import { SparklesIcon } from '@heroicons/react/24/outline'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useUiStore } from '@/lib/store/ui-store'
import { PostComposer } from '@/components/posts/post-composer'

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <SparklesIcon className="size-4 text-primary" />
          <span>Create Post</span>
        </DialogTitle>
        <DialogDescription>
          Share your updates, photos, or thoughts with the Wink community.
        </DialogDescription>
      </DialogHeader>

      <div className="py-2">
        <PostComposer
          user={user}
          variant="dialog"
          autoFocus
          onSuccess={closeModal}
          onCancel={closeModal}
        />
      </div>
    </Dialog>
  )
}
