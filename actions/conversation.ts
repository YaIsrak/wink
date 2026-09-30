'use server';

import { createClient } from '@/lib/supabase/server';
import {
  getUserConversations,
  getConversationById,
  startConversation,
  respondToRequest,
} from '@/lib/services/conversation.service';
import { startConversationSchema, respondToRequestSchema } from '@/lib/validation/message';
import type { ConversationFilter, ConversationItem, MessageItem } from '@/types/message';

export interface GetConversationsResult {
  conversations?: ConversationItem[];
  unreadRequestsCount?: number;
  error?: string;
}

export interface GetConversationByIdResult {
  conversation?: ConversationItem;
  messages?: MessageItem[];
  error?: string;
}

export interface StartConversationResult {
  conversationId?: string;
  status?: string;
  messageId?: string;
  error?: string;
}

export interface RespondToRequestResult {
  success?: boolean;
  status?: string;
  error?: string;
}

export async function getConversationsAction(
  filter: ConversationFilter = 'ALL'
): Promise<GetConversationsResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in.' };
    }

    const result = await getUserConversations(user.id, filter);
    return {
      conversations: result.conversations,
      unreadRequestsCount: result.unreadRequestsCount,
    };
  } catch (err: any) {
    return { error: err.message || 'Failed to fetch conversations' };
  }
}

export async function getConversationByIdAction(
  conversationId: string
): Promise<GetConversationByIdResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in.' };
    }

    const result = await getConversationById(conversationId, user.id);
    if (!result) {
      return { error: 'Conversation not found or access denied' };
    }

    return {
      conversation: result.conversation,
      messages: result.messages,
    };
  } catch (err: any) {
    return { error: err.message || 'Failed to fetch conversation details' };
  }
}

export async function startConversationAction(
  targetUserId: string,
  initialMessage: string,
  imageUrl?: string
): Promise<StartConversationResult> {
  const parsed = startConversationSchema.safeParse({ targetUserId, initialMessage, imageUrl });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid conversation inputs' };
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

    const result = await startConversation({
      currentUserId: user.id,
      targetUserId: parsed.data.targetUserId,
      initialMessage: parsed.data.initialMessage,
      imageUrl: parsed.data.imageUrl,
    });

    return {
      conversationId: result.conversationId,
      status: result.status,
      messageId: result.messageId,
    };
  } catch (err: any) {
    return { error: err.message || 'Failed to start conversation' };
  }
}

export async function respondToRequestAction(
  conversationId: string,
  decision: 'ACCEPT' | 'DECLINE'
): Promise<RespondToRequestResult> {
  const parsed = respondToRequestSchema.safeParse({ conversationId, decision });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid decision input' };
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

    const result = await respondToRequest({
      conversationId: parsed.data.conversationId,
      currentUserId: user.id,
      decision: parsed.data.decision,
    });

    return { success: true, status: result.status };
  } catch (err: any) {
    return { error: err.message || 'Failed to respond to request' };
  }
}
