'use client'

import * as React from 'react'
import type { PostWithAuthor } from '@/types/post'
import { PostCard } from '@/components/posts/post-card'

interface PostSearchResultCardProps {
  post: PostWithAuthor
  currentUserId?: string
  searchQuery?: string
  className?: string
}

export function PostSearchResultCard({
  post,
  currentUserId,
  className,
}: PostSearchResultCardProps) {
  return (
    <div className={className}>
      <PostCard
        post={post}
        currentUserId={currentUserId}
      />
    </div>
  )
}
