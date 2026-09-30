'use client'

import * as React from 'react'
import Link from 'next/link'
import { Sparkles, Users } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { FollowButton } from '@/components/profile/follow-button'
import { cn } from '@/lib/utils'

export interface SuggestedUserItem {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  followersCount: number
  postsCount: number
}

interface SuggestedUsersProps {
  users: SuggestedUserItem[]
  title?: string
  description?: string
  className?: string
}

export function SuggestedUsers({
  users,
  title = 'Suggested Creators',
  description = 'Follow people to see their posts and updates in your feed',
  className,
}: SuggestedUsersProps) {
  if (users.length === 0) return null

  return (
    <div
      id="suggested-creators-card"
      className={cn(
        'rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col gap-4',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground leading-tight">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border -mx-1 px-1">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between py-3 gap-3 first:pt-1 last:pb-1"
          >
            <Link
              href={`/profile/${user.username}`}
              className="flex items-center gap-3 min-w-0 flex-1 group"
            >
              <Avatar
                src={user.avatarUrl ?? undefined}
                fallback={user.displayName || user.username}
                size="md"
                className="shrink-0 border border-border"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:underline truncate">
                  {user.displayName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  @{user.username}
                </p>
                {user.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {user.bio}
                  </p>
                )}
              </div>
            </Link>

            <FollowButton
              targetUserId={user.id}
              initialIsFollowing={false}
              size="sm"
              className="shrink-0 font-medium"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
