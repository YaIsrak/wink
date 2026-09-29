export interface PostAuthor {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
}

export interface CommentWithAuthor {
  id: string
  postId: string
  authorId: string
  content: string
  createdAt: Date | string
  updatedAt: Date | string
  author: PostAuthor
  isOptimistic?: boolean
}

export interface LikeUser {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  createdAt: Date | string
}

export interface PostWithAuthor {
  id: string
  authorId: string
  caption: string | null
  imageUrl: string | null
  createdAt: Date | string
  updatedAt: Date | string
  author: PostAuthor
  likesCount: number
  commentsCount: number
  isLikedByMe: boolean
  previewComments?: CommentWithAuthor[]
}

export interface FeedPost extends PostWithAuthor {
  isOptimistic?: boolean
  comments?: CommentWithAuthor[]
  isCommentsExpanded?: boolean
  isLoadingComments?: boolean
}
