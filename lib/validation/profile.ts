import { z } from 'zod'

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name cannot exceed 50 characters'),
  bio: z
    .string()
    .trim()
    .max(160, 'Bio cannot exceed 160 characters')
    .optional()
    .or(z.literal('')),
  location: z
    .string()
    .trim()
    .max(100, 'Location cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .trim()
    .max(255, 'Website cannot exceed 255 characters')
    .refine((val) => {
      if (!val || val === '') return true
      try {
        const url = val.startsWith('http://') || val.startsWith('https://') ? val : `https://${val}`
        new URL(url)
        return true
      } catch {
        return false
      }
    }, 'Please enter a valid website URL')
    .optional()
    .or(z.literal('')),
  avatarUrl: z
    .string()
    .url('Invalid avatar URL')
    .optional()
    .or(z.literal(''))
    .nullable(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const followActionSchema = z.object({
  targetUserId: z.string().uuid('Invalid user ID'),
})

export type FollowActionInput = z.infer<typeof followActionSchema>

export const followListQuerySchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  cursor: z.string().uuid('Invalid cursor ID').optional(),
  limit: z.number().int().positive().max(50).default(20),
})

export type FollowListQueryInput = z.infer<typeof followListQuerySchema>
