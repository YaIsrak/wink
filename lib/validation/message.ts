import { z } from "zod";

export const sendMessageSchema = z
  .object({
    conversationId: z.string().uuid("Invalid conversation identifier"),
    content: z.string().trim().max(2000, "Message cannot exceed 2000 characters").optional(),
    imageUrl: z.string().url("Invalid image URL").optional(),
  })
  .refine((data) => (data.content && data.content.length > 0) || !!data.imageUrl, {
    message: "Message must have text or an image",
  });

export const startConversationSchema = z.object({
  targetUserId: z.string().uuid("Invalid user identifier"),
  initialMessage: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message cannot exceed 2000 characters"),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

export const editMessageSchema = z.object({
  messageId: z.string().uuid("Invalid message identifier"),
  newContent: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message cannot exceed 2000 characters"),
});

export const respondToRequestSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation identifier"),
  decision: z.enum(["ACCEPT", "DECLINE"]),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type StartConversationInput = z.infer<typeof startConversationSchema>;
export type EditMessageInput = z.infer<typeof editMessageSchema>;
export type RespondToRequestInput = z.infer<typeof respondToRequestSchema>;
