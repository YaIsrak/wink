import { create } from 'zustand'
import type { FeedPost, PostWithAuthor } from '@/types/post'

interface PostState {
  posts: FeedPost[]
  isLoading: boolean
  hasLoadedInitial: boolean
  nextCursor?: string
  hasMore: boolean
  setIsLoading: (loading: boolean) => void
  setInitialPosts: (posts: PostWithAuthor[], nextCursor?: string) => void
  appendPosts: (posts: PostWithAuthor[], nextCursor?: string) => void
  addOptimisticPost: (post: FeedPost) => void
  reconcilePost: (tempId: string, realPost: PostWithAuthor) => void
  rollbackOptimisticPost: (tempId: string) => void
  removePost: (postId: string) => void
  updatePost: (postId: string, data: Partial<PostWithAuthor>) => void
}

export const usePostStore = create<PostState>((set) => ({
  posts: [],
  isLoading: false,
  hasLoadedInitial: false,
  nextCursor: undefined,
  hasMore: false,

  setIsLoading: (loading) => set({ isLoading: loading }),

  setInitialPosts: (posts, nextCursor) =>
    set({
      posts,
      nextCursor,
      hasMore: Boolean(nextCursor),
      hasLoadedInitial: true,
      isLoading: false,
    }),

  appendPosts: (newPosts, nextCursor) =>
    set((state) => {
      const existingIds = new Set(state.posts.map((p) => p.id))
      const uniqueNewPosts = newPosts.filter((p) => !existingIds.has(p.id))
      return {
        posts: [...state.posts, ...uniqueNewPosts],
        nextCursor,
        hasMore: Boolean(nextCursor),
        isLoading: false,
      }
    }),

  addOptimisticPost: (post) =>
    set((state) => ({
      posts: [post, ...state.posts],
    })),

  reconcilePost: (tempId, realPost) =>
    set((state) => ({
      posts: state.posts.map((p) => (p.id === tempId ? realPost : p)),
    })),

  rollbackOptimisticPost: (tempId) =>
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== tempId),
    })),

  removePost: (postId) =>
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== postId),
    })),

  updatePost: (postId, data) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, ...data } : p
      ),
    })),
}))
