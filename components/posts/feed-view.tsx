'use client'

import * as React from 'react'
import { MessageSquareDashed, Users, Sparkles } from 'lucide-react'
import { PostComposer } from '@/components/posts/post-composer'
import { PostCard } from '@/components/posts/post-card'
import { Skeleton } from '@/components/ui/skeleton'
import { SuggestedUsers, type SuggestedUserItem } from '@/components/profile/suggested-users'
import { getFeedPostsAction } from '@/actions/post'
import { usePostStore } from '@/lib/store'
import type { PostWithAuthor } from '@/types/post'
import { cn } from '@/lib/utils'

export interface FeedViewProps {
  user: {
    id: string
    username: string
    displayName: string
    avatarUrl?: string | null
  }
  initialPosts: PostWithAuthor[]
  initialCursor?: string
  suggestedUsers?: SuggestedUserItem[]
  initialFilter?: 'all' | 'following'
}

export function FeedView({
  user,
  initialPosts,
  initialCursor,
  suggestedUsers = [],
  initialFilter = 'all',
}: FeedViewProps) {
  const [feedFilter, setFeedFilter] = React.useState<'all' | 'following'>(initialFilter)
  const [isSwitchingTab, setIsSwitchingTab] = React.useState(false)

  const posts = usePostStore((state) => state.posts)
  const hasLoadedInitial = usePostStore((state) => state.hasLoadedInitial)
  const setInitialPosts = usePostStore((state) => state.setInitialPosts)

  React.useEffect(() => {
    setInitialPosts(initialPosts, initialCursor)
  }, [initialPosts, initialCursor, setInitialPosts])

  const handleTabChange = async (newFilter: 'all' | 'following') => {
    if (newFilter === feedFilter || isSwitchingTab) return

    setFeedFilter(newFilter)
    setIsSwitchingTab(true)

    try {
      const res = await getFeedPostsAction({
        filter: newFilter,
        limit: 20,
      })

      if (res.success && res.posts) {
        setInitialPosts(res.posts, res.nextCursor)
      }
    } catch (err) {
      console.error('Failed to switch feed filter:', err)
    } finally {
      setIsSwitchingTab(false)
    }
  }

  const displayPosts = hasLoadedInitial ? posts : initialPosts

  return (
    <div className="flex flex-col gap-6">
      {/* Feed Filter Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-1">
        <div className="flex items-center gap-6" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={feedFilter === 'all'}
            onClick={() => handleTabChange('all')}
            className={cn(
              'relative pb-2.5 text-sm font-semibold transition-colors cursor-pointer select-none',
              feedFilter === 'all'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>For You</span>
            {feedFilter === 'all' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-t-full" />
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={feedFilter === 'following'}
            onClick={() => handleTabChange('following')}
            className={cn(
              'relative pb-2.5 text-sm font-semibold transition-colors cursor-pointer select-none',
              feedFilter === 'following'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>Following</span>
            {feedFilter === 'following' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-t-full" />
            )}
          </button>
        </div>
      </div>

      {/* Top Inline Composer */}
      <PostComposer user={user} variant="inline" />

      {/* Loading Skeletons during tab switch */}
      {isSwitchingTab ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-16 w-full rounded-md" />
              <div className="flex gap-4 pt-2">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Feed List */
        <div className="flex flex-col gap-4">
          {displayPosts.length > 0 ? (
            <>
              {displayPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user.id}
                  currentUserProfile={user}
                />
              ))}

              {/* Suggested users prompt at end of following feed */}
              {feedFilter === 'following' && suggestedUsers.length > 0 && (
                <SuggestedUsers
                  users={suggestedUsers}
                  title="Discover More Creators"
                  description="Expand your feed by following other active members"
                  className="mt-4"
                />
              )}
            </>
          ) : feedFilter === 'following' ? (
            /* Empty state for Following tab: render suggestions directly */
            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                  <Users className="size-6" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  Your Following feed is empty
                </h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                  You are not following anyone who has posted yet. Follow creators below or switch to the &quot;For You&quot; tab to explore updates.
                </p>
              </div>

              {suggestedUsers.length > 0 && (
                <SuggestedUsers users={suggestedUsers} />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                <MessageSquareDashed className="size-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                No posts yet
              </h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                Be the first to share an update, photograph, or thought with the Wink community!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
