'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  HeartIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ShareIcon,
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
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
import { toggleLikeAction } from '@/actions/like'
import { LikersDialog } from '@/components/posts/likers-dialog'
import { CommentsSection } from '@/components/posts/comments-section'
import { FollowButton } from '@/components/profile/follow-button'
import { formatRelativeTime } from '@/lib/utils'
import type { FeedPost } from '@/types/post'

export interface PostCardProps {
  post: FeedPost
  currentUserId?: string
  currentUserProfile?: {
    username: string
    displayName: string
    avatarUrl?: string | null
  }
}

export function PostCard({
  post,
  currentUserId,
  currentUserProfile,
}: PostCardProps) {
  const storePost = usePostStore((state) =>
    state.posts.find((p) => p.id === post.id)
  )
  const activePost = storePost || post

  const {
    id,
    author,
    caption,
    imageUrl,
    createdAt,
    isOptimistic,
    likesCount = 0,
    commentsCount = 0,
    isLikedByMe = false,
  } = activePost

  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)
  const [isLikersModalOpen, setIsLikersModalOpen] = React.useState(false)

  const [editCaption, setEditCaption] = React.useState(caption || '')
  const [isSavingEdit, setIsSavingEdit] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const updatePostInStore = usePostStore((state) => state.updatePost)
  const removePostFromStore = usePostStore((state) => state.removePost)
  const addOptimisticPost = usePostStore((state) => state.addOptimisticPost)

  // Like & Comment store handlers
  const optimisticToggleLike = usePostStore((state) => state.optimisticToggleLike)
  const rollbackLike = usePostStore((state) => state.rollbackLike)
  const confirmLike = usePostStore((state) => state.confirmLike)
  const setLiking = usePostStore((state) => state.setLiking)
  const likingPostIds = usePostStore((state) => state.likingPostIds)
  const toggleCommentsExpanded = usePostStore((state) => state.toggleCommentsExpanded)

  const isLikingThisPost = likingPostIds.has(id)
  const isOwner = Boolean(currentUserId && currentUserId === author.id)

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/feed#${id}`
      navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
    }
  }

  const handleToggleLike = async () => {
    if (!currentUserId) {
      toast.error('You must be signed in to like posts')
      return
    }

    if (isLikingThisPost || isOptimistic) return

    setLiking(id, true)
    const backup = optimisticToggleLike(id)
    if (!backup) {
      setLiking(id, false)
      return
    }

    try {
      const res = await toggleLikeAction(id)
      if (res.error || res.liked === undefined || res.likesCount === undefined) {
        rollbackLike(id, backup.previousLiked, backup.previousCount)
        toast.error(res.error || 'Failed to like post')
      } else {
        confirmLike(id, res.liked, res.likesCount)
      }
    } catch {
      rollbackLike(id, backup.previousLiked, backup.previousCount)
      toast.error('Network error. Failed to like post')
    } finally {
      setLiking(id, false)
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
                    variant="outline"
                    className="h-4 px-1.5 text-[10px] gap-1 font-medium bg-muted text-muted-foreground"
                  >
                    <ArrowPathIcon className="size-2.5 animate-spin" />
                    <span>Posting</span>
                  </Badge>
                )}
              </div>
            </div>
          </Link>

          {/* Right Header Actions: Follow Button + Three-Dot Options Menu */}
          <div className="flex items-center gap-2 shrink-0">
            {!isOwner && currentUserId && (
              <FollowButton
                targetUserId={author.id}
                initialIsFollowing={Boolean(activePost.isFollowingAuthor)}
                size="sm"
                className="h-7 text-xs px-2.5 rounded-lg"
              />
            )}

            {!isOptimistic && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Post actions"
                    className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  >
                    <EllipsisHorizontalIcon className="size-4" />
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
                      <PencilSquareIcon className="mr-2 size-4" />
                      <span>Edit post</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      destructive
                      onClick={() => setIsDeleteModalOpen(true)}
                    >
                      <TrashIcon className="mr-2 size-4" />
                      <span>Delete post</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={handleCopyLink}>
                  <DocumentDuplicateIcon className="mr-2 size-4" />
                  <span>Copy link</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          </div>
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
              <ArrowsPointingOutIcon className="size-3.5" />
            </button>
          </div>
        )}

        {/* Action Footer (Likes, Comments, Share) */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-muted-foreground text-xs">
          <div className="flex items-center gap-4">
            {/* Like Button & Likers Modal Trigger */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleLike}
                disabled={isLikingThisPost || isOptimistic}
                className="hover:text-foreground transition-all cursor-pointer group active:scale-125"
                title={isLikedByMe ? 'Unlike post' : 'Like post'}
              >
                {isLikedByMe ? (
                  <HeartIconSolid className="size-4 text-red-500 scale-110 animate-in zoom-in-75" />
                ) : (
                  <HeartIcon className="size-4 group-hover:scale-110" />
                )}
              </button>
              {likesCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setIsLikersModalOpen(true)}
                  className="hover:text-foreground hover:underline cursor-pointer"
                  title="View likes"
                >
                  <span>{likesCount}</span>
                </button>
              ) : (
                <span>0</span>
              )}
            </div>

            {/* Comment Count / Drawer Trigger */}
            <button
              type="button"
              onClick={() => toggleCommentsExpanded(id)}
              disabled={isOptimistic}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
              title="Comments"
            >
              <ChatBubbleOvalLeftEllipsisIcon className="size-4" />
              <span>{commentsCount}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="hover:text-foreground transition-colors cursor-pointer"
            title="Share"
          >
            <ShareIcon className="size-4" />
          </button>
        </div>

        {/* Inline Preview Comments when collapsed */}
        {!activePost.isCommentsExpanded && commentsCount > 0 && (
          <div className="mt-3 pt-2.5 border-t border-border/40 space-y-1">
            <button
              type="button"
              onClick={() => toggleCommentsExpanded(id)}
              className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors block mb-1 cursor-pointer"
            >
              {commentsCount === 1
                ? 'View 1 comment'
                : `View all ${commentsCount} comments`}
            </button>

            {(activePost.comments && activePost.comments.length > 0
              ? activePost.comments.slice(-2)
              : (activePost.previewComments || []).slice(0, 2)
            ).map((c) => (
              <div key={c.id} className="text-xs flex items-baseline gap-1.5">
                <Link
                  href={`/profile/${c.author.username}`}
                  className="font-semibold text-foreground hover:underline shrink-0"
                >
                  {c.author.displayName}
                </Link>
                <span className="text-muted-foreground break-words truncate">
                  {c.content}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Expandable Comments Drawer */}
        {activePost.isCommentsExpanded && (
          <CommentsSection
            post={activePost}
            currentUserId={currentUserId}
            currentUserProfile={currentUserProfile}
          />
        )}
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
              <XMarkIcon className="size-4" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={caption || 'Post image'}
              className="w-full max-h-[85vh] object-contain rounded-md"
            />
          </div>
        </Dialog>
      )}

      {/* 2. Edit Caption Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogHeader>
          <DialogTitle>Edit post</DialogTitle>
          <DialogDescription>
            Update your caption. Photos cannot be changed after posting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Textarea
            value={editCaption}
            onChange={(e) => setEditCaption(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            maxLength={1000}
            className="resize-none"
          />
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{editCaption.length} / 1,000 characters</span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
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
              disabled={isSavingEdit || (!editCaption.trim() && !imageUrl)}
            >
              {isSavingEdit ? (
                <>
                  <ArrowPathIcon className="mr-2 size-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* 3. Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogHeader>
          <DialogTitle>Delete post?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This post will be permanently removed from your profile and feed.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
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
                <ArrowPathIcon className="mr-2 size-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </div>
      </Dialog>

      {/* 4. Likers Modal Dialog */}
      <LikersDialog
        postId={id}
        open={isLikersModalOpen}
        onOpenChange={setIsLikersModalOpen}
      />
    </>
  )
}
