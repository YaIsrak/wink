import { z } from 'zod'

export const getNotificationsSchema = z.object({
  filter: z.enum(['all', 'unread']).default('all'),
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(50).default(15),
})

export type GetNotificationsInput = z.infer<typeof getNotificationsSchema>

export const markNotificationReadSchema = z.object({
  notificationId: z.string().uuid('Invalid notification identifier'),
})

export type MarkNotificationReadInput = z.infer<typeof markNotificationReadSchema>
