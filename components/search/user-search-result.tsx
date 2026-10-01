'use client'

import * as React from 'react'
import Link from 'next/link'
import type { UserSearchResult } from '@/types/search'
import { Avatar } from '@/components/ui/avatar'
import { FollowButton } from '@/components/profile/follow-button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface UserSearchResultProps {
  user: UserSearchResult
  onSelect?: () => void
  className?: string
}

export function UserSearchResultCard({
  user,
  onSelect,
  className,
}: UserSearchResultProps) {
  const [followersCount, setFollowersCount] = React.useState(user.followersCount)

  const handleFollowChange = (nextIsFollowing: boolean, diff: number) => {
    setFollowersCount((prev) => Math.max(0, prev + diff))
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-card/60 hover:bg-card hover:border-border transition-all',
        className
      )}
    >
      <Link
        href={`/profile/${user.username}`}
        onClick={onSelect}
        className="flex items-center gap-3 min-w-0 flex-1 group"
      >
        <Avatar
          src={user.avatarUrl}
          alt={user.displayName}
          fallback={user.displayName.slice(0, 2)}
          size="md"
          className="ring-1 ring-border group-hover:ring-primary/40 transition-all shrink-0"
        />

        <div className="flex flex-col min-w-0 pr-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-sm text-foreground truncate group-hover:underline">
              {user.displayName}
            </span>
            {user.isMe ? (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                You
              </Badge>
            ) : null}
          </div>

          <span className="text-xs text-muted-foreground truncate">
            @{user.username}
          </span>

          {user.bio ? (
            <p className="text-xs text-muted-foreground/90 line-clamp-1 mt-1">
              {user.bio}
            </p>
          ) : (
            <span className="text-xs text-muted-foreground/60 mt-0.5">
              {followersCount} {followersCount === 1 ? 'follower' : 'followers'}
            </span>
          )}
        </div>
      </Link>

      <div className="shrink-0">
        {user.isMe ? null : (
          <FollowButton
            targetUserId={user.id}
            initialIsFollowing={user.isFollowing}
            onFollowChange={handleFollowChange}
            size="sm"
          />
        )}
      </div>
    </div>
  )
}
