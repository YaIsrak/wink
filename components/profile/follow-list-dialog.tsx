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
import { FollowButton } from '@/components/profile/follow-button'
import { getUserFollowersAction, getUserFollowingAction } from '@/actions/follow'
import type { FollowUserItem } from '@/types/profile'

interface FollowListDialogProps {
  userId: string
  username: string
  type: 'followers' | 'following'
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId: string
}

export function FollowListDialog({
  userId,
  username,
  type,
  open,
  onOpenChange,
  currentUserId,
}: FollowListDialogProps) {
  const [users, setUsers] = React.useState<FollowUserItem[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const isFollowers = type === 'followers'
  const title = isFollowers ? 'Followers' : 'Following'
  const description = isFollowers
    ? `People following @${username}`
    : `People @${username} follows`

  React.useEffect(() => {
    let isMounted = true

    if (open && userId) {
      setIsLoading(true)
      setError(null)

      const fetchAction = isFollowers
        ? getUserFollowersAction(userId)
        : getUserFollowingAction(userId)

      fetchAction
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
          setError(`Failed to load ${type}.`)
        })
        .finally(() => {
          if (isMounted) setIsLoading(false)
        })
    }

    return () => {
      isMounted = false
    }
  }, [open, userId, type, isFollowers])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <div className="max-h-[420px] overflow-y-auto divide-y divide-border -mx-2 px-2">
        {isLoading ? (
          <div className="space-y-4 py-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-destructive">
            {error}
          </div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {isFollowers
              ? `@${username} has no followers yet.`
              : `@${username} is not following anyone yet.`}
          </div>
        ) : (
          <div className="space-y-1 py-1">
            {users.map((u) => {
              const isMe = u.id === currentUserId

              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-muted/40 transition-colors gap-3"
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
                      {u.bio && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {u.bio}
                        </p>
                      )}
                    </div>
                  </Link>

                  {!isMe && (
                    <FollowButton
                      targetUserId={u.id}
                      initialIsFollowing={u.isFollowing}
                      size="sm"
                      className="shrink-0"
                    />
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
