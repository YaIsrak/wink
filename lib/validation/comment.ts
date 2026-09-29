import { z } from 'zod'

export const createCommentSchema = z.object({
  postId: z.string().uuid('Invalid post identifier'),
  content: z
    .string()
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(280, 'Comment must be 280 characters or less'),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>

export const deleteCommentSchema = z.object({
  commentId: z.string().uuid('Invalid comment identifier'),
})

export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>
