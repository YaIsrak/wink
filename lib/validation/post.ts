import { z } from 'zod'

export const createPostSchema = z
  .object({
    caption: z
      .string()
      .max(1000, 'Caption must be 1,000 characters or less')
      .optional()
      .or(z.literal('')),
    imageUrl: z
      .string()
      .url('Invalid image URL format')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      const hasCaption = Boolean(data.caption && data.caption.trim().length > 0)
      const hasImage = Boolean(data.imageUrl && data.imageUrl.trim().length > 0)
      return hasCaption || hasImage
    },
    {
      message: 'Post must contain either a caption or an image',
      path: ['caption'],
    }
  )

export type CreatePostInput = z.infer<typeof createPostSchema>

export const updatePostSchema = z.object({
  caption: z
    .string()
    .max(1000, 'Caption must be 1,000 characters or less')
    .optional()
    .or(z.literal('')),
})

export type UpdatePostInput = z.infer<typeof updatePostSchema>
