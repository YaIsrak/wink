export interface PostAuthor {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
}

export interface PostWithAuthor {
  id: string
  authorId: string
  caption: string | null
  imageUrl: string | null
  createdAt: Date | string
  updatedAt: Date | string
  author: PostAuthor
}

export interface FeedPost extends PostWithAuthor {
  isOptimistic?: boolean
}
