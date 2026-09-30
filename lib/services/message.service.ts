import { prisma } from "@/lib/db";
import type { MessageItem } from "@/types/message";

export async function sendMessage(params: {
  conversationId: string;
  senderId: string;
  content?: string;
  imageUrl?: string;
}): Promise<MessageItem> {
  const { conversationId, senderId, content, imageUrl } = params;

  if (!content && !imageUrl) {
    throw new Error("Message content or image is required");
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (conversation.userAId !== senderId && conversation.userBId !== senderId) {
    throw new Error("You are not a participant in this conversation");
  }

  if (conversation.status === "DECLINED") {
    throw new Error("This conversation request was declined");
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: content || null,
        imageUrl: imageUrl || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    content: message.content,
    imageUrl: message.imageUrl,
    isDeleted: message.isDeleted,
    isEdited: message.isEdited,
    readAt: null,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
    sender: {
      id: message.sender.id,
      username: message.sender.username,
      displayName: message.sender.displayName,
      avatarUrl: message.sender.avatarUrl,
    },
    clientStatus: "sent",
  };
}

export async function editMessage(params: {
  messageId: string;
  userId: string;
  newContent: string;
}): Promise<MessageItem> {
  const { messageId, userId, newContent } = params;

  const existing = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!existing) {
    throw new Error("Message not found");
  }

  if (existing.senderId !== userId) {
    throw new Error("You can only edit your own messages");
  }

  if (existing.isDeleted) {
    throw new Error("Cannot edit a deleted message");
  }

  const updated = await prisma.message.update({
    where: { id: messageId },
    data: {
      content: newContent,
      isEdited: true,
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });

  return {
    id: updated.id,
    conversationId: updated.conversationId,
    senderId: updated.senderId,
    content: updated.content,
    imageUrl: updated.imageUrl,
    isDeleted: updated.isDeleted,
    isEdited: updated.isEdited,
    readAt: updated.readAt ? updated.readAt.toISOString() : null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    sender: {
      id: updated.sender.id,
      username: updated.sender.username,
      displayName: updated.sender.displayName,
      avatarUrl: updated.sender.avatarUrl,
    },
    clientStatus: "delivered",
  };
}

export async function softDeleteMessage(params: {
  messageId: string;
  userId: string;
}): Promise<{ success: boolean; messageId: string }> {
  const { messageId, userId } = params;

  const existing = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!existing) {
    throw new Error("Message not found");
  }

  if (existing.senderId !== userId) {
    throw new Error("You can only delete your own messages");
  }

  await prisma.message.update({
    where: { id: messageId },
    data: {
      isDeleted: true,
    },
  });

  return { success: true, messageId };
}

export async function markMessagesAsRead(params: {
  conversationId: string;
  userId: string;
}): Promise<{ count: number }> {
  const { conversationId, userId } = params;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (conversation.userAId !== userId && conversation.userBId !== userId) {
    throw new Error("You are not a participant in this conversation");
  }

  const result = await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  return { count: result.count };
}

export async function getTotalUnreadMessagesCount(userId: string): Promise<number> {
  return prisma.message.count({
    where: {
      conversation: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "ACCEPTED",
      },
      senderId: { not: userId },
      readAt: null,
      isDeleted: false,
    },
  });
}
