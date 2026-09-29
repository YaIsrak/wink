import type { PostWithAuthor } from './post'

export type SearchTab = 'top' | 'accounts' | 'posts'

export interface UserSearchResult {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  followersCount: number
  isFollowing: boolean
  isMe: boolean
}

export interface RecentSearchItem {
  id: string
  query: string
  timestamp: number
}

export interface SearchTopResult {
  users: UserSearchResult[]
  posts: PostWithAuthor[]
}

export interface SearchUsersResult {
  users: UserSearchResult[]
  nextCursor: string | null
  hasMore: boolean
}

export interface SearchPostsResult {
  posts: PostWithAuthor[]
  nextCursor: string | null
  hasMore: boolean
}
