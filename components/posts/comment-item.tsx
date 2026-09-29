'use client'

import * as React from 'react'
import Link from 'next/link'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar } from '@/components/ui/avatar'
import { formatRelativeTime } from '@/lib/utils'
import { deleteCommentAction } from '@/actions/comment'
import { usePostStore } from '@/lib/store'
import type { CommentWithAuthor } from '@/types/post'

interface CommentItemProps {
  comment: CommentWithAuthor
  postId: string
  postAuthorId: string
  currentUserId?: string
}

export function CommentItem({
  comment,
  postId,
  postAuthorId,
  currentUserId,
}: CommentItemProps) {
  const { removeComment, rollbackDeletedComment } = usePostStore()
  const [isDeleting, setIsDeleting] = React.useState(false)

  const isAuthor = currentUserId === comment.authorId
  const isPostOwner = currentUserId === postAuthorId
  const canDelete = Boolean(currentUserId && (isAuthor || isPostOwner))

  const handleDelete = async () => {
    if (isDeleting) return
    setIsDeleting(true)

    // Optimistically remove comment from store
    const removed = removeComment(postId, comment.id)

    try {
      const res = await deleteCommentAction({ commentId: comment.id })
      if (res.error) {
        if (removed) rollbackDeletedComment(postId, removed)
        toast.error(res.error)
      } else {
        toast.success('Comment deleted')
      }
    } catch {
      if (removed) rollbackDeletedComment(postId, removed)
      toast.error('Failed to delete comment')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      className={`group flex items-start justify-between gap-3 py-2 text-sm transition-opacity ${
        comment.isOptimistic ? 'opacity-60' : 'opacity-100'
      }`}
    >
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <Link
          href={`/profile/${comment.author.username}`}
          className="shrink-0 mt-0.5"
        >
          <Avatar
            src={comment.author.avatarUrl ?? undefined}
            fallback={comment.author.displayName || comment.author.username}
            className="size-7 border border-border"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <Link
              href={`/profile/${comment.author.username}`}
              className="font-semibold text-xs text-foreground hover:underline"
            >
              {comment.author.displayName}
            </Link>
            <span className="text-[11px] text-muted-foreground">
              @{comment.author.username}
            </span>
            <span className="text-[11px] text-muted-foreground">·</span>
            <span className="text-[11px] text-muted-foreground">
              {formatRelativeTime(comment.createdAt)}
            </span>
            {comment.isOptimistic && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                Posting...
              </span>
            )}
          </div>

          <p className="text-sm text-foreground break-words mt-0.5 leading-relaxed">
            {comment.content}
          </p>
        </div>
      </div>

      {canDelete && !comment.isOptimistic && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="Delete comment"
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all mt-0.5 shrink-0"
        >
          {isDeleting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
        </button>
      )}
    </div>
  )
}
