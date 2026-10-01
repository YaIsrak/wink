'use client'

import * as React from 'react'
import Image from 'next/image'
import { PhotoIcon as ImageIcon } from '@heroicons/react/24/outline'
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/solid'
import { Dialog } from '@/components/ui/dialog'
import type { PostWithAuthor } from '@/types/post'

interface PostGridProps {
  posts: PostWithAuthor[]
  emptyMessage?: string
}

export function PostGrid({
  posts,
  emptyMessage = 'No posts with images yet.',
}: PostGridProps) {
  const [selectedPost, setSelectedPost] = React.useState<PostWithAuthor | null>(null)

  const mediaPosts = posts.filter((p) => Boolean(p.imageUrl))

  if (mediaPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
          <ImageIcon className="size-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          No media yet
        </h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {mediaPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="group relative aspect-square rounded-xl overflow-hidden bg-muted border border-border cursor-pointer transition-all hover:border-foreground/40 shadow-2xs"
          >
            {post.imageUrl && (
              <Image
                src={post.imageUrl}
                alt={post.caption || 'Post image'}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}

            {/* Hover overlay with engagement metrics */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4 text-white text-xs font-semibold backdrop-blur-xs select-none">
              <span className="flex items-center gap-1.5">
                <HeartIcon className="size-4" />
                <span>{post.likesCount ?? 0}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ChatBubbleLeftIcon className="size-4" />
                <span>{post.commentsCount ?? 0}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Post Detail Dialog */}
      {selectedPost && (
        <Dialog
          open={Boolean(selectedPost)}
          onOpenChange={(open) => !open && setSelectedPost(null)}
          className="max-w-3xl p-0 overflow-hidden bg-black/95 border-border/20 text-white shadow-2xl"
        >
          <div className="relative flex flex-col items-center justify-center w-full min-h-[320px] max-h-[85vh]">
            {selectedPost.imageUrl && (
              <div className="relative w-full h-[60vh] max-h-[650px] flex items-center justify-center p-2">
                <Image
                  src={selectedPost.imageUrl}
                  alt={selectedPost.caption || 'Post full image'}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>
            )}

            {selectedPost.caption && (
              <div className="w-full p-4 bg-zinc-950/80 border-t border-zinc-800 text-left">
                <p className="text-sm text-zinc-200 line-clamp-3">
                  {selectedPost.caption}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <HeartIcon className="size-3.5 text-red-500" />
                    <span>{selectedPost.likesCount ?? 0} likes</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <ChatBubbleLeftIcon className="size-3.5" />
                    <span>{selectedPost.commentsCount ?? 0} comments</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </Dialog>
      )}
    </>
  )
}
