'use server';

import { createClient } from '@/lib/supabase/server';
import {
  sendMessage,
  editMessage,
  softDeleteMessage,
  markMessagesAsRead,
  getTotalUnreadMessagesCount,
} from '@/lib/services/message.service';
import { sendMessageSchema, editMessageSchema } from '@/lib/validation/message';
import type { MessageItem } from '@/types/message';

export interface SendMessageResult {
  message?: MessageItem;
  error?: string;
}

export interface EditMessageResult {
  message?: MessageItem;
  error?: string;
}

export interface SoftDeleteMessageResult {
  success?: boolean;
  messageId?: string;
  error?: string;
}

export interface MarkConversationReadResult {
  count?: number;
  error?: string;
}

export interface GetUnreadMessagesCountResult {
  count?: number;
  error?: string;
}

export async function sendMessageAction(
  conversationId: string,
  content?: string,
  imageUrl?: string
): Promise<SendMessageResult> {
  const parsed = sendMessageSchema.safeParse({ conversationId, content, imageUrl });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid message inputs' };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in.' };
    }

    const message = await sendMessage({
      conversationId: parsed.data.conversationId,
      senderId: user.id,
      content: parsed.data.content,
      imageUrl: parsed.data.imageUrl,
    });

    return { message };
  } catch (err: any) {
    return { error: err.message || 'Failed to send message' };
  }
}

export async function editMessageAction(
  messageId: string,
  newContent: string
): Promise<EditMessageResult> {
  const parsed = editMessageSchema.safeParse({ messageId, newContent });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid edit content' };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in.' };
    }

    const message = await editMessage({
      messageId: parsed.data.messageId,
      userId: user.id,
      newContent: parsed.data.newContent,
    });

    return { message };
  } catch (err: any) {
    return { error: err.message || 'Failed to edit message' };
  }
}

export async function softDeleteMessageAction(
  messageId: string
): Promise<SoftDeleteMessageResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in.' };
    }

    const result = await softDeleteMessage({
      messageId,
      userId: user.id,
    });

    return { success: true, messageId: result.messageId };
  } catch (err: any) {
    return { error: err.message || 'Failed to delete message' };
  }
}

export async function markConversationReadAction(
  conversationId: string
): Promise<MarkConversationReadResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in.' };
    }

    const result = await markMessagesAsRead({
      conversationId,
      userId: user.id,
    });

    return { count: result.count };
  } catch (err: any) {
    return { error: err.message || 'Failed to mark messages as read' };
  }
}

export async function getTotalUnreadMessagesCountAction(): Promise<GetUnreadMessagesCountResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in.' };
    }

    const count = await getTotalUnreadMessagesCount(user.id);
    return { count };
  } catch (err: any) {
    return { error: err.message || 'Failed to fetch unread messages count' };
  }
}
