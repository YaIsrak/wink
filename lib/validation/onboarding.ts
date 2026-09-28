import { z } from 'zod'

export const onboardingSchema = z.object({
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
  avatarUrl: z
    .string()
    .url('Invalid avatar URL')
    .optional()
    .or(z.literal(''))
    .nullable(),
})

export type OnboardingInput = z.infer<typeof onboardingSchema>
