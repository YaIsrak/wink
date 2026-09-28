'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Heart,
  MessageCircle,
  Share2,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  X,
  Maximize2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { usePostStore } from '@/lib/store'
import { deletePostAction, updatePostAction } from '@/actions/post'
import type { FeedPost } from '@/types/post'

export interface PostCardProps {
  post: FeedPost
  currentUserId?: string
}

function formatRelativeTime(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 30) return 'Just now'
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const { id, author, caption, imageUrl, createdAt, isOptimistic } = post

  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)

  const [editCaption, setEditCaption] = React.useState(caption || '')
  const [isSavingEdit, setIsSavingEdit] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const updatePostInStore = usePostStore((state) => state.updatePost)
  const removePostFromStore = usePostStore((state) => state.removePost)
  const addOptimisticPost = usePostStore((state) => state.addOptimisticPost)

  const isOwner = Boolean(currentUserId && currentUserId === author.id)

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/feed#${id}`
      navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
    }
  }

  const handleSaveEdit = async () => {
    const trimmed = editCaption.trim()
    if (!trimmed && !imageUrl) {
      toast.error('Post must contain either text or a photo')
      return
    }

    if (trimmed.length > 1000) {
      toast.error('Caption cannot exceed 1,000 characters')
      return
    }

    setIsSavingEdit(true)
    const previousCaption = caption

    // Optimistic update
    updatePostInStore(id, { caption: trimmed || null, updatedAt: new Date().toISOString() })
    setIsEditModalOpen(false)

    try {
      const result = await updatePostAction(id, { caption: trimmed })
      if (!result.success || !result.post) {
        throw new Error(result.error || 'Failed to update post')
      }
      updatePostInStore(id, result.post)
      toast.success('Post updated')
    } catch (err: unknown) {
      console.error('Update post failed:', err)
      // Rollback
      updatePostInStore(id, { caption: previousCaption })
      const msg = err instanceof Error ? err.message : 'Could not update post'
      toast.error(msg)
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDeletePost = async () => {
    setIsDeleting(true)
    setIsDeleteModalOpen(false)

    // Optimistically remove from store
    removePostFromStore(id)

    try {
      const result = await deletePostAction(id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete post')
      }
      toast.success('Post deleted')
    } catch (err: unknown) {
      console.error('Delete post failed:', err)
      // Rollback: restore post in store
      addOptimisticPost(post)
      const msg = err instanceof Error ? err.message : 'Could not delete post'
      toast.error(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <article
        id={id}
        className={`rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-opacity ${
          isOptimistic ? 'opacity-70' : 'opacity-100'
        }`}
      >
        {/* Header: Clickable Author Link + Timestamp + Dropdown Options */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <Link
            href={`/profile/${author.username}`}
            className="group flex items-center gap-3 min-w-0"
          >
            <Avatar
              src={author.avatarUrl}
              fallback={
                author.displayName?.slice(0, 2) || author.username?.slice(0, 2) || 'WK'
              }
              size="md"
            />
            <div className="min-w-0 flex flex-col">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-sm text-foreground truncate group-hover:underline">
                  {author.displayName}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  @{author.username}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatRelativeTime(createdAt)}</span>
                {isOptimistic && (
                  <Badge
                    variant="secondary"
                    className="h-4 px-1.5 text-[10px] gap-1 font-medium bg-muted text-muted-foreground"
                  >
                    <Loader2 className="size-2.5 animate-spin" />
                    <span>Posting</span>
                  </Badge>
                )}
              </div>
            </div>
          </Link>

          {/* Three-Dot Options Menu */}
          {!isOptimistic && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Post actions"
                  className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="right">
                {isOwner && (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditCaption(caption || '')
                        setIsEditModalOpen(true)
                      }}
                    >
                      <Pencil className="mr-2 size-4" />
                      <span>Edit post</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      destructive
                      onClick={() => setIsDeleteModalOpen(true)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      <span>Delete post</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Copy className="mr-2 size-4" />
                  <span>Copy link</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Post Text Caption */}
        {caption && (
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-line mb-3">
            {caption}
          </p>
        )}

        {/* Post Image with click-to-full-view lightbox */}
        {imageUrl && (
          <div className="relative mb-3 overflow-hidden rounded-lg border border-border bg-muted/20 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={
                caption
                  ? `Photo by ${author.displayName}: ${caption.slice(0, 40)}`
                  : `Photo by ${author.displayName}`
              }
              className="w-full max-h-[500px] object-cover rounded-lg cursor-pointer transition-transform duration-200 group-hover:scale-[1.01]"
              onClick={() => setIsImageModalOpen(true)}
              loading="lazy"
            />
            <button
              type="button"
              onClick={() => setIsImageModalOpen(true)}
              className="absolute bottom-2.5 right-2.5 flex size-7 items-center justify-center rounded-md bg-background/80 text-foreground backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
              title="View full photo"
            >
              <Maximize2 className="size-3.5" />
            </button>
          </div>
        )}

        {/* Action Footer (Likes, Comments, Share) */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-muted-foreground text-xs">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
              title="Like post"
            >
              <Heart className="size-4" />
              <span>0</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
              title="Comments"
            >
              <MessageCircle className="size-4" />
              <span>0</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="hover:text-foreground transition-colors cursor-pointer"
            title="Share"
          >
            <Share2 className="size-4" />
          </button>
        </div>
      </article>

      {/* 1. Full Image Lightbox Modal */}
      {imageUrl && (
        <Dialog
          open={isImageModalOpen}
          onOpenChange={setIsImageModalOpen}
          className="max-w-4xl p-2 bg-background/95 border-border overflow-hidden"
        >
          <div className="relative flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-xs hover:bg-muted transition-colors cursor-pointer"
              title="Close"
            >
              <X className="size-4" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={caption || 'Full view'}
              className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain"
            />
          </div>
        </Dialog>
      )}

      {/* 2. Edit Post Modal (Owner Only) */}
      {isOwner && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Update your caption below.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <Textarea
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              placeholder="Write a caption..."
              className="min-h-[120px] resize-none"
              autoFocus
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{editCaption.length}/1000 characters</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSavingEdit}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={isSavingEdit || editCaption.length > 1000}
              >
                {isSavingEdit ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* 3. Delete Confirmation Modal (Owner Only) */}
      {isOwner && (
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeletePost}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete</span>
              )}
            </Button>
          </div>
        </Dialog>
      )}
    </>
  )
}
