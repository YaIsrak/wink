import { create } from 'zustand'
import type { FeedPost, PostWithAuthor, CommentWithAuthor } from '@/types/post'

interface PostState {
  posts: FeedPost[]
  isLoading: boolean
  hasLoadedInitial: boolean
  nextCursor?: string
  hasMore: boolean
  likingPostIds: Set<string>
  setIsLoading: (loading: boolean) => void
  setInitialPosts: (posts: PostWithAuthor[], nextCursor?: string) => void
  appendPosts: (posts: PostWithAuthor[], nextCursor?: string) => void
  addOptimisticPost: (post: FeedPost) => void
  reconcilePost: (tempId: string, realPost: PostWithAuthor) => void
  rollbackOptimisticPost: (tempId: string) => void
  removePost: (postId: string) => void
  updatePost: (postId: string, data: Partial<PostWithAuthor>) => void

  // Likes
  optimisticToggleLike: (postId: string) => { previousLiked: boolean; previousCount: number } | null
  confirmLike: (postId: string, liked: boolean, likesCount: number) => void
  rollbackLike: (postId: string, previousLiked: boolean, previousCount: number) => void
  setLiking: (postId: string, isLiking: boolean) => void

  // Comments
  setPostComments: (postId: string, comments: CommentWithAuthor[]) => void
  toggleCommentsExpanded: (postId: string) => void
  setLoadingComments: (postId: string, loading: boolean) => void
  addOptimisticComment: (postId: string, comment: CommentWithAuthor) => void
  reconcileComment: (postId: string, tempId: string, realComment: CommentWithAuthor) => void
  rollbackOptimisticComment: (postId: string, tempId: string) => void
  removeComment: (postId: string, commentId: string) => CommentWithAuthor | null
  rollbackDeletedComment: (postId: string, comment: CommentWithAuthor) => void
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  isLoading: false,
  hasLoadedInitial: false,
  nextCursor: undefined,
  hasMore: false,
  likingPostIds: new Set<string>(),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setInitialPosts: (posts, nextCursor) =>
    set((state) => {
      const existingMap = new Map(state.posts.map((p) => [p.id, p]))
      return {
        posts: posts.map((p) => {
          const existing = existingMap.get(p.id)
          return {
            ...p,
            comments:
              existing?.hasLoadedAllComments && existing.comments
                ? existing.comments
                : existing && existing.comments && existing.comments.length > (p.previewComments?.length || 0)
                ? existing.comments
                : p.previewComments
                ? [...p.previewComments]
                : [],
            isCommentsExpanded: existing ? existing.isCommentsExpanded : false,
            isLoadingComments: false,
            hasLoadedAllComments: existing ? existing.hasLoadedAllComments : false,
          }
        }),
        nextCursor,
        hasMore: Boolean(nextCursor),
        hasLoadedInitial: true,
        isLoading: false,
      }
    }),

  appendPosts: (newPosts, nextCursor) =>
    set((state) => {
      const existingIds = new Set(state.posts.map((p) => p.id))
      const uniqueNewPosts = newPosts
        .filter((p) => !existingIds.has(p.id))
        .map((p) => ({
          ...p,
          comments: p.previewComments ? [...p.previewComments] : [],
          isCommentsExpanded: false,
          isLoadingComments: false,
        }))
      return {
        posts: [...state.posts, ...uniqueNewPosts],
        nextCursor,
        hasMore: Boolean(nextCursor),
        isLoading: false,
      }
    }),

  addOptimisticPost: (post) =>
    set((state) => ({
      posts: [
        {
          ...post,
          comments: [],
          previewComments: [],
          likesCount: 0,
          commentsCount: 0,
          isLikedByMe: false,
          isCommentsExpanded: false,
          isLoadingComments: false,
        },
        ...state.posts,
      ],
    })),

  reconcilePost: (tempId, realPost) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === tempId
          ? {
              ...realPost,
              isOptimistic: false,
              comments: p.comments || [],
              isCommentsExpanded: p.isCommentsExpanded,
              isLoadingComments: p.isLoadingComments,
            }
          : p
      ),
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

  // Likes
  optimisticToggleLike: (postId) => {
    const post = get().posts.find((p) => p.id === postId)
    if (!post) return null

    const previousLiked = post.isLikedByMe
    const previousCount = post.likesCount
    const newLiked = !previousLiked
    const newCount = newLiked
      ? previousCount + 1
      : Math.max(0, previousCount - 1)

    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLikedByMe: newLiked,
              likesCount: newCount,
            }
          : p
      ),
    }))

    return { previousLiked, previousCount }
  },

  confirmLike: (postId, liked, likesCount) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLikedByMe: liked,
              likesCount,
            }
          : p
      ),
    })),

  rollbackLike: (postId, previousLiked, previousCount) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLikedByMe: previousLiked,
              likesCount: previousCount,
            }
          : p
      ),
    })),

  setLiking: (postId, isLiking) =>
    set((state) => {
      const next = new Set(state.likingPostIds)
      if (isLiking) {
        next.add(postId)
      } else {
        next.delete(postId)
      }
      return { likingPostIds: next }
    }),

  // Comments
  setPostComments: (postId, comments) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments,
              previewComments: comments.slice(-2),
              isLoadingComments: false,
              hasLoadedAllComments: true,
            }
          : p
      ),
    })),

  toggleCommentsExpanded: (postId) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              isCommentsExpanded: !p.isCommentsExpanded,
            }
          : p
      ),
    })),

  setLoadingComments: (postId, loading) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, isLoadingComments: loading } : p
      ),
    })),

  addOptimisticComment: (postId, comment) =>
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p
        const existingComments = p.comments || []
        const updatedComments = [...existingComments, comment]
        return {
          ...p,
          comments: updatedComments,
          previewComments: updatedComments.slice(-2),
          commentsCount: p.commentsCount + 1,
          isCommentsExpanded: true,
        }
      }),
    })),

  reconcileComment: (postId, tempId, realComment) =>
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p
        const updatedComments = (p.comments || []).map((c) =>
          c.id === tempId ? realComment : c
        )
        return {
          ...p,
          comments: updatedComments,
          previewComments: updatedComments.slice(-2),
        }
      }),
    })),

  rollbackOptimisticComment: (postId, tempId) =>
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p
        const remaining = (p.comments || []).filter((c) => c.id !== tempId)
        return {
          ...p,
          comments: remaining,
          previewComments: remaining.slice(-2),
          commentsCount: Math.max(0, p.commentsCount - 1),
        }
      }),
    })),

  removeComment: (postId, commentId) => {
    const post = get().posts.find((p) => p.id === postId)
    if (!post) return null
    const targetComment =
      (post.comments || []).find((c) => c.id === commentId) ||
      (post.previewComments || []).find((c) => c.id === commentId) ||
      null

    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p
        const remaining = (p.comments || []).filter((c) => c.id !== commentId)
        return {
          ...p,
          comments: remaining,
          previewComments: (p.previewComments || []).filter((c) => c.id !== commentId),
          commentsCount: Math.max(0, p.commentsCount - 1),
        }
      }),
    }))

    return targetComment
  },

  rollbackDeletedComment: (postId, comment) =>
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p
        const restored = [...(p.comments || []), comment].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        return {
          ...p,
          comments: restored,
          previewComments: restored.slice(-2),
          commentsCount: p.commentsCount + 1,
        }
      }),
    })),
}))
