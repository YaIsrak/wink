'use client'

import * as React from 'react'
import { Sparkles, MessageSquareDashed } from 'lucide-react'
import { PostComposer } from '@/components/posts/post-composer'
import { PostCard } from '@/components/posts/post-card'
import { usePostStore } from '@/lib/store'
import type { PostWithAuthor } from '@/types/post'

export interface FeedViewProps {
  user: {
    id: string
    username: string
    displayName: string
    avatarUrl?: string | null
  }
  initialPosts: PostWithAuthor[]
  initialCursor?: string
}

export function FeedView({
  user,
  initialPosts,
  initialCursor,
}: FeedViewProps) {
  const posts = usePostStore((state) => state.posts)
  const hasLoadedInitial = usePostStore((state) => state.hasLoadedInitial)
  const setInitialPosts = usePostStore((state) => state.setInitialPosts)

  React.useEffect(() => {
    setInitialPosts(initialPosts, initialCursor)
  }, [initialPosts, initialCursor, setInitialPosts])

  const displayPosts = hasLoadedInitial ? posts : initialPosts

  return (
    <div className="flex flex-col gap-6">
      {/* Top Inline Composer */}
      <PostComposer user={user} variant="inline" />

      {/* Feed List */}
      <div className="flex flex-col gap-4">
        {displayPosts.length > 0 ? (
          displayPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user.id}
              currentUserProfile={user}
            />
          ))
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
    </div>
  )
}
