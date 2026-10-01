'use client'

import * as React from 'react'
import {
  ChatBubbleLeftIcon,
  UsersIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import { PostComposer } from '@/components/posts/post-composer'
import { PostCard } from '@/components/posts/post-card'
import { Skeleton } from '@/components/ui/skeleton'
import { InfiniteScrollSentinel } from '@/components/posts/infinite-scroll-sentinel'
import { SuggestedUsers, type SuggestedUserItem } from '@/components/profile/suggested-users'
import { GettingStartedChecklist } from '@/components/feed/getting-started-checklist'
import { getFeedPostsAction } from '@/actions/post'
import { usePostStore } from '@/lib/store'
import type { PostWithAuthor } from '@/types/post'
import type { ChecklistProgress } from '@/types/checklist'
import { cn } from '@/lib/utils'

export interface FeedViewProps {
  user: {
    id: string
    username: string
    displayName: string
    avatarUrl?: string | null
    bio?: string | null
    location?: string | null
    website?: string | null
  }
  initialPosts: PostWithAuthor[]
  initialCursor?: string
  suggestedUsers?: SuggestedUserItem[]
  initialFilter?: 'all' | 'following'
  checklistProgress?: ChecklistProgress
}

export function FeedView({
  user,
  initialPosts,
  initialCursor,
  suggestedUsers = [],
  initialFilter = 'all',
  checklistProgress,
}: FeedViewProps) {
  const [feedFilter, setFeedFilter] = React.useState<'all' | 'following'>(initialFilter)
  const [isSwitchingTab, setIsSwitchingTab] = React.useState(false)
  const [isError, setIsError] = React.useState(false)
  const isFetchingRef = React.useRef(false)

  const posts = usePostStore((state) => state.posts)
  const nextCursor = usePostStore((state) => state.nextCursor)
  const hasMore = usePostStore((state) => state.hasMore)
  const isLoading = usePostStore((state) => state.isLoading)
  const hasLoadedInitial = usePostStore((state) => state.hasLoadedInitial)
  const setInitialPosts = usePostStore((state) => state.setInitialPosts)
  const appendPosts = usePostStore((state) => state.appendPosts)
  const setIsLoading = usePostStore((state) => state.setIsLoading)

  React.useEffect(() => {
    setInitialPosts(initialPosts, initialCursor)
  }, [initialPosts, initialCursor, setInitialPosts])

  const handleTabChange = async (newFilter: 'all' | 'following') => {
    if (newFilter === feedFilter || isSwitchingTab) return

    setFeedFilter(newFilter)
    setIsSwitchingTab(true)
    setIsError(false)

    try {
      const res = await getFeedPostsAction({
        filter: newFilter,
        limit: 10,
      })

      if (res.success && res.posts) {
        setInitialPosts(res.posts, res.nextCursor)
      } else {
        toast.error(res.error || 'Failed to load posts for this feed.')
      }
    } catch (err: unknown) {
      console.error('Failed to switch feed filter:', err)
      toast.error('Network error switching feeds. Please try again.')
    } finally {
      setIsSwitchingTab(false)
    }
  }

  const handleLoadMore = React.useCallback(async () => {
    if (isFetchingRef.current || !hasMore || isLoading || isSwitchingTab) {
      return
    }

    isFetchingRef.current = true
    setIsLoading(true)
    setIsError(false)

    try {
      const res = await getFeedPostsAction({
        cursor: nextCursor,
        limit: 10,
        filter: feedFilter,
      })

      if (res.success && res.posts) {
        appendPosts(res.posts, res.nextCursor)
      } else {
        setIsError(true)
        toast.error(res.error || 'Failed to load more posts.')
      }
    } catch (err: unknown) {
      console.error('Failed to fetch more feed posts:', err)
      setIsError(true)
      toast.error('Network error loading posts. Please try again.')
    } finally {
      isFetchingRef.current = false
      setIsLoading(false)
    }
  }, [hasMore, isLoading, isSwitchingTab, nextCursor, feedFilter, appendPosts, setIsLoading])

  const displayPosts = hasLoadedInitial ? posts : initialPosts

  return (
    <div className="flex flex-col gap-6">
      {/* Getting Started Checklist */}
      {checklistProgress && (
        <GettingStartedChecklist
          initialProgress={checklistProgress}
          user={user}
        />
      )}

      {/* Feed Filter Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-1">
        <div className="flex items-center gap-6" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={feedFilter === 'all'}
            onClick={() => handleTabChange('all')}
            className={cn(
              'relative pb-2.5 text-sm font-semibold transition-colors cursor-pointer select-none flex items-center gap-1.5',
              feedFilter === 'all'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>For You</span>
            <SparklesIcon className="size-3 text-secondary" />
            {feedFilter === 'all' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
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
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
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

              {/* Infinite Scroll Sentinel for Batch 10 Pagination */}
              <InfiniteScrollSentinel
                hasMore={hasMore}
                isLoading={isLoading}
                onLoadMore={handleLoadMore}
                isError={isError}
                onRetry={handleLoadMore}
                endMessage="You are all caught up!"
              />

              {/* Suggested creators at end of following feed */}
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
                  <UsersIcon className="size-6" />
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
                <ChatBubbleLeftIcon className="size-6" />
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
