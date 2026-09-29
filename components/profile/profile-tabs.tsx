'use client'

import * as React from 'react'
import {
  LayoutGrid,
  Rows3,
  MessageSquareDashed,
  Image as ImageIcon,
  MessageCircle,
  Bookmark,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PostCard } from '@/components/posts/post-card'
import { PostGrid } from '@/components/profile/post-grid'
import type { PostWithAuthor } from '@/types/post'
import { cn } from '@/lib/utils'

interface ProfileTabsProps {
  posts: PostWithAuthor[]
  currentUserId: string
  currentUserProfile: any
  isOwner: boolean
  username: string
}

type TabType = 'posts' | 'media' | 'replies' | 'saved'
type ViewMode = 'feed' | 'grid'

export function ProfileTabs({
  posts,
  currentUserId,
  currentUserProfile,
  isOwner,
  username,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = React.useState<TabType>('posts')
  const [viewMode, setViewMode] = React.useState<ViewMode>('feed')

  const mediaPosts = React.useMemo(
    () => posts.filter((p) => Boolean(p.imageUrl)),
    [posts]
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs Header */}
      <div className="border-b border-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar" role="tablist">
          {/* Posts Tab */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'posts'}
            onClick={() => setActiveTab('posts')}
            className={cn(
              'relative pb-3 text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer select-none',
              activeTab === 'posts'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>Posts</span>
            <span className="px-1.5 py-0.2 rounded-md text-[11px] bg-muted font-medium">
              {posts.length}
            </span>
            {activeTab === 'posts' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-t-full" />
            )}
          </button>

          {/* Media Tab */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'media'}
            onClick={() => setActiveTab('media')}
            className={cn(
              'relative pb-3 text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer select-none',
              activeTab === 'media'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>Media</span>
            <span className="px-1.5 py-0.2 rounded-md text-[11px] bg-muted font-medium">
              {mediaPosts.length}
            </span>
            {activeTab === 'media' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-t-full" />
            )}
          </button>

          {/* Replies Tab */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'replies'}
            onClick={() => setActiveTab('replies')}
            className={cn(
              'relative pb-3 text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer select-none',
              activeTab === 'replies'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>Replies</span>
            {activeTab === 'replies' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-t-full" />
            )}
          </button>

          {/* Saved Tab */}
          {isOwner && (
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'saved'}
              onClick={() => setActiveTab('saved')}
              className={cn(
                'relative pb-3 text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer select-none',
                activeTab === 'saved'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>Saved</span>
              {activeTab === 'saved' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-t-full" />
              )}
            </button>
          )}
        </div>

        {/* View Mode Toggle (Grid vs Feed) for Posts tab */}
        {activeTab === 'posts' && (
          <div className="flex items-center gap-1 pb-2">
            <Button
              type="button"
              size="icon"
              variant={viewMode === 'feed' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('feed')}
              aria-label="Feed View"
              className="size-7.5 rounded-md"
            >
              <Rows3 className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('grid')}
              aria-label="Grid View"
              className="size-7.5 rounded-md"
            >
              <LayoutGrid className="size-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Tab Panels */}
      {activeTab === 'posts' && (
        <div className="flex flex-col gap-4">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                <MessageSquareDashed className="size-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                No posts yet
              </h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                {isOwner
                  ? 'You have not published any posts yet. Start by sharing an update!'
                  : `@${username} has not posted anything yet.`}
              </p>
            </div>
          ) : viewMode === 'feed' ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                currentUserProfile={currentUserProfile}
              />
            ))
          ) : (
            <PostGrid posts={posts} emptyMessage="No photo posts to display in the grid." />
          )}
        </div>
      )}

      {activeTab === 'media' && (
        <PostGrid
          posts={mediaPosts}
          emptyMessage={
            isOwner
              ? 'You have not shared any posts with photos yet.'
              : `@${username} has not posted any photos yet.`
          }
        />
      )}

      {activeTab === 'replies' && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
            <MessageCircle className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            No replies yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            {isOwner
              ? 'Comments and conversations you participate in will appear here.'
              : `@${username} has not posted any public replies yet.`}
          </p>
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
            <Bookmark className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            No saved posts
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Posts you bookmark for later reference will be safely archived here.
          </p>
        </div>
      )}
    </div>
  )
}
