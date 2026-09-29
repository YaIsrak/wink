'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { getPostLikesAction } from '@/actions/like'
import type { LikeUser } from '@/types/post'
import { formatRelativeTime } from '@/lib/utils'

interface LikersDialogProps {
  postId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LikersDialog({ postId, open, onOpenChange }: LikersDialogProps) {
  const [users, setUsers] = React.useState<LikeUser[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isMounted = true

    if (open && postId) {
      setIsLoading(true)
      setError(null)
      getPostLikesAction(postId)
        .then((res) => {
          if (!isMounted) return
          if (res.error) {
            setError(res.error)
          } else if (res.users) {
            setUsers(res.users)
          }
        })
        .catch(() => {
          if (!isMounted) return
          setError('Failed to load likes.')
        })
        .finally(() => {
          if (isMounted) setIsLoading(false)
        })
    }

    return () => {
      isMounted = false
    }
  }, [open, postId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Likes</DialogTitle>
        <DialogDescription>
          People who liked this post
        </DialogDescription>
      </DialogHeader>

      <div className="max-h-[380px] overflow-y-auto divide-y divide-border -mx-2 px-2">
        {isLoading ? (
          <div className="space-y-4 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-destructive">
            {error}
          </div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No likes yet. Be the first to like this post!
          </div>
        ) : (
          <div className="space-y-1 py-1">
            {users.map((u) => {
              const formattedTime = formatRelativeTime(u.createdAt)

              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-muted/40 transition-colors"
                >
                  <Link
                    href={`/profile/${u.username}`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-3 min-w-0 flex-1 group"
                  >
                    <Avatar
                      src={u.avatarUrl ?? undefined}
                      fallback={u.displayName || u.username}
                      className="size-10 shrink-0 border border-border"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:underline truncate">
                        {u.displayName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{u.username}
                      </p>
                    </div>
                  </Link>

                  {formattedTime && (
                    <span className="text-xs text-muted-foreground shrink-0 ml-3">
                      {formattedTime}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Dialog>
  )
}
