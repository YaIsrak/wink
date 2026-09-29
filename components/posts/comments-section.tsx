'use client'

import * as React from 'react'
import { Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CommentItem } from '@/components/posts/comment-item'
import { usePostStore } from '@/lib/store'
import { createCommentAction, getPostCommentsAction } from '@/actions/comment'
import type { FeedPost, CommentWithAuthor } from '@/types/post'

interface CommentsSectionProps {
  post: FeedPost
  currentUserId?: string
  currentUserProfile?: {
    username: string
    displayName: string
    avatarUrl?: string | null
  }
}

export function CommentsSection({
  post,
  currentUserId,
  currentUserProfile,
}: CommentsSectionProps) {
  const {
    posts,
    setPostComments,
    setLoadingComments,
    addOptimisticComment,
    reconcileComment,
    rollbackOptimisticComment,
  } = usePostStore()

  // Always read reactive post from store if available
  const activePost = posts.find((p) => p.id === post.id) || post

  const [content, setContent] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const comments = activePost.comments || []
  const isLoading = activePost.isLoadingComments || false

  // Load all comments if expanded and hasn't loaded full thread yet
  React.useEffect(() => {
    let isMounted = true

    if (activePost.isCommentsExpanded && activePost.commentsCount > comments.length && !isLoading) {
      setLoadingComments(activePost.id, true)
      getPostCommentsAction(activePost.id)
        .then((res) => {
          if (!isMounted) return
          if (res.error) {
            toast.error(res.error)
          } else if (res.comments) {
            setPostComments(activePost.id, res.comments)
          }
        })
        .catch(() => {
          if (!isMounted) return
          toast.error('Failed to load full comments')
        })
        .finally(() => {
          if (isMounted) setLoadingComments(activePost.id, false)
        })
    }

    return () => {
      isMounted = false
    }
  }, [activePost.id, activePost.isCommentsExpanded, activePost.commentsCount, comments.length, isLoading, setLoadingComments, setPostComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmed = content.trim()
    if (!trimmed) return

    if (trimmed.length > 280) {
      toast.error('Comment must be 280 characters or less')
      return
    }

    if (!currentUserId || !currentUserProfile) {
      toast.error('You must be signed in to comment')
      return
    }

    const tempId = `temp-comment-${Date.now()}`
    const previousContent = content
    setContent('')
    setIsSubmitting(true)

    // Build optimistic comment
    const optimisticComment: CommentWithAuthor = {
      id: tempId,
      postId: activePost.id,
      authorId: currentUserId,
      content: trimmed,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: currentUserId,
        username: currentUserProfile.username,
        displayName: currentUserProfile.displayName,
        avatarUrl: currentUserProfile.avatarUrl ?? null,
      },
      isOptimistic: true,
    }

    addOptimisticComment(activePost.id, optimisticComment)

    try {
      const res = await createCommentAction({
        postId: activePost.id,
        content: trimmed,
      })

      if (res.error || !res.comment) {
        rollbackOptimisticComment(activePost.id, tempId)
        setContent(previousContent)
        toast.error(res.error || 'Failed to post comment')
      } else {
        reconcileComment(activePost.id, tempId, res.comment)
      }
    } catch {
      rollbackOptimisticComment(activePost.id, tempId)
      setContent(previousContent)
      toast.error('Network error. Failed to post comment')
    } finally {
      setIsSubmitting(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="pt-3 border-t border-border/60 space-y-3">
      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-3 py-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-start gap-2.5">
              <Skeleton className="size-7 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground py-1 text-center">
          No comments yet. Start the conversation!
        </p>
      ) : (
        <div className="space-y-1 max-h-[360px] overflow-y-auto divide-y divide-border/40 pr-1">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={activePost.id}
              postAuthorId={activePost.authorId}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}

      {/* Comment Input Composer */}
      {currentUserId && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a comment..."
              maxLength={280}
              disabled={isSubmitting}
              className="w-full text-sm rounded-full bg-muted/50 border border-border px-3.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-foreground focus:bg-background transition-all pr-12 text-foreground placeholder:text-muted-foreground"
            />
            {content.length > 200 && (
              <span
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono ${
                  content.length >= 280
                    ? 'text-destructive font-bold'
                    : 'text-muted-foreground'
                }`}
              >
                {280 - content.length}
              </span>
            )}
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || isSubmitting}
            className="rounded-full size-8 p-0 shrink-0"
          >
            {isSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
            <span className="sr-only">Send comment</span>
          </Button>
        </form>
      )}
    </div>
  )
}
