import { z } from 'zod'

export const searchQuerySchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, 'Search query cannot be empty')
    .max(100, 'Search query cannot exceed 100 characters'),
})

export const searchUsersQuerySchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, 'Search query cannot be empty')
    .max(100, 'Search query cannot exceed 100 characters'),
  cursor: z.string().uuid('Invalid cursor').optional().nullable(),
  limit: z.number().int().min(1).max(50).default(10),
})

export const searchPostsQuerySchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, 'Search query cannot be empty')
    .max(100, 'Search query cannot exceed 100 characters'),
  cursor: z.string().uuid('Invalid cursor').optional().nullable(),
  limit: z.number().int().min(1).max(50).default(10),
})

export const searchTabSchema = z.enum(['top', 'accounts', 'posts']).default('top')

export type SearchQueryInput = z.infer<typeof searchQuerySchema>
export type SearchUsersQueryInput = z.infer<typeof searchUsersQuerySchema>
export type SearchPostsQueryInput = z.infer<typeof searchPostsQuerySchema>
export type SearchTabInput = z.infer<typeof searchTabSchema>
