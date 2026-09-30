import { prisma } from "@/lib/db";
import type { ConversationFilter, ConversationItem, ConversationParticipant, MessageItem } from "@/types/message";

export async function getUserConversations(
  userId: string,
  filter: ConversationFilter = "ALL"
): Promise<{ conversations: ConversationItem[]; unreadRequestsCount: number }> {
  // Count total pending requests where caller is recipient
  const unreadRequestsCount = await prisma.conversation.count({
    where: {
      status: "PENDING",
      initiatorId: { not: userId },
      OR: [{ userAId: userId }, { userBId: userId }],
    },
  });

  // Base condition: user is a participant
  const baseWhere: any = {
    OR: [{ userAId: userId }, { userBId: userId }],
  };

  if (filter === "REQUESTS") {
    baseWhere.status = "PENDING";
    baseWhere.initiatorId = { not: userId };
  } else if (filter === "UNREAD") {
    baseWhere.status = "ACCEPTED";
    baseWhere.messages = {
      some: {
        senderId: { not: userId },
        readAt: null,
      },
    };
  } else {
    // "ALL" tab: confirmed conversations or pending requests initiated by the caller
    baseWhere.OR = [
      {
        userAId: userId,
        status: "ACCEPTED",
      },
      {
        userBId: userId,
        status: "ACCEPTED",
      },
      {
        userAId: userId,
        status: "PENDING",
        initiatorId: userId,
      },
      {
        userBId: userId,
        status: "PENDING",
        initiatorId: userId,
      },
    ];
  }

  const rawConversations = await prisma.conversation.findMany({
    where: baseWhere,
    orderBy: {
      lastMessageAt: "desc",
    },
    include: {
      userA: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      userB: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          conversationId: true,
          senderId: true,
          content: true,
          imageUrl: true,
          isDeleted: true,
          isEdited: true,
          readAt: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      _count: {
        select: {
          messages: {
            where: {
              senderId: { not: userId },
              readAt: null,
            },
          },
        },
      },
    },
  });

  const otherUserIds = rawConversations.map((c) => (c.userAId === userId ? c.userBId : c.userAId));

  // Batch query mutual follows for these other users
  const [followingThem, theyFollowMe] = await Promise.all([
    prisma.follow.findMany({
      where: {
        followerId: userId,
        followingId: { in: otherUserIds },
      },
      select: { followingId: true },
    }),
    prisma.follow.findMany({
      where: {
        followerId: { in: otherUserIds },
        followingId: userId,
      },
      select: { followerId: true },
    }),
  ]);

  const followingSet = new Set(followingThem.map((f) => f.followingId));
  const followedBySet = new Set(theyFollowMe.map((f) => f.followerId));

  const conversations: ConversationItem[] = rawConversations.map((c) => {
    const isUserA = c.userAId === userId;
    const rawOther = isUserA ? c.userB : c.userA;
    const isMutual = followingSet.has(rawOther.id) && followedBySet.has(rawOther.id);

    const otherUser: ConversationParticipant = {
      id: rawOther.id,
      username: rawOther.username,
      displayName: rawOther.displayName,
      avatarUrl: rawOther.avatarUrl,
      isMutualFollow: isMutual,
    };

    let lastMessage: MessageItem | null = null;
    if (c.messages.length > 0) {
      const msg = c.messages[0];
      lastMessage = {
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        content: msg.isDeleted ? null : msg.content,
        imageUrl: msg.isDeleted ? null : msg.imageUrl,
        isDeleted: msg.isDeleted,
        isEdited: msg.isEdited,
        readAt: msg.readAt ? msg.readAt.toISOString() : null,
        createdAt: msg.createdAt.toISOString(),
        updatedAt: msg.updatedAt.toISOString(),
      };
    }

    return {
      id: c.id,
      userAId: c.userAId,
      userBId: c.userBId,
      initiatorId: c.initiatorId,
      status: c.status,
      lastMessageAt: c.lastMessageAt.toISOString(),
      createdAt: c.createdAt.toISOString(),
      otherUser,
      lastMessage,
      unreadCount: c._count.messages,
    };
  });

  return { conversations, unreadRequestsCount };
}

export async function getConversationById(
  conversationId: string,
  currentUserId: string
): Promise<{
  conversation: ConversationItem;
  messages: MessageItem[];
} | null> {
  const c = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      userA: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      userB: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
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
      },
      _count: {
        select: {
          messages: {
            where: {
              senderId: { not: currentUserId },
              readAt: null,
            },
          },
        },
      },
    },
  });

  if (!c) return null;
  if (c.userAId !== currentUserId && c.userBId !== currentUserId) {
    return null; // Not a participant
  }

  const isUserA = c.userAId === currentUserId;
  const rawOther = isUserA ? c.userB : c.userA;

  // Check mutual follow
  const [followingOther, otherFollowsMe] = await Promise.all([
    prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: rawOther.id,
        },
      },
    }),
    prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: rawOther.id,
          followingId: currentUserId,
        },
      },
    }),
  ]);

  const otherUser: ConversationParticipant = {
    id: rawOther.id,
    username: rawOther.username,
    displayName: rawOther.displayName,
    avatarUrl: rawOther.avatarUrl,
    isMutualFollow: !!(followingOther && otherFollowsMe),
  };

  const messages: MessageItem[] = c.messages.map((msg) => ({
    id: msg.id,
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    content: msg.isDeleted ? null : msg.content,
    imageUrl: msg.isDeleted ? null : msg.imageUrl,
    isDeleted: msg.isDeleted,
    isEdited: msg.isEdited,
    readAt: msg.readAt ? msg.readAt.toISOString() : null,
    createdAt: msg.createdAt.toISOString(),
    updatedAt: msg.updatedAt.toISOString(),
    sender: {
      id: msg.sender.id,
      username: msg.sender.username,
      displayName: msg.sender.displayName,
      avatarUrl: msg.sender.avatarUrl,
    },
  }));

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  return {
    conversation: {
      id: c.id,
      userAId: c.userAId,
      userBId: c.userBId,
      initiatorId: c.initiatorId,
      status: c.status,
      lastMessageAt: c.lastMessageAt.toISOString(),
      createdAt: c.createdAt.toISOString(),
      otherUser,
      lastMessage,
      unreadCount: c._count.messages,
    },
    messages,
  };
}

export async function startConversation(params: {
  currentUserId: string;
  targetUserId: string;
  initialMessage: string;
  imageUrl?: string;
}): Promise<{ conversationId: string; status: string; messageId: string }> {
  const { currentUserId, targetUserId, initialMessage, imageUrl } = params;

  if (currentUserId === targetUserId) {
    throw new Error("You cannot message yourself");
  }

  // Caller MUST follow target user
  const callerFollowsTarget = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    },
  });

  if (!callerFollowsTarget) {
    throw new Error("You can only message creators you follow");
  }

  // Check if target follows caller back
  const targetFollowsCaller = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: targetUserId,
        followingId: currentUserId,
      },
    },
  });

  const isMutual = !!targetFollowsCaller;
  const status = isMutual ? "ACCEPTED" : "PENDING";

  const userAId = currentUserId < targetUserId ? currentUserId : targetUserId;
  const userBId = currentUserId < targetUserId ? targetUserId : currentUserId;

  return prisma.$transaction(async (tx) => {
    let conversation = await tx.conversation.findUnique({
      where: {
        userAId_userBId: { userAId, userBId },
      },
    });

    if (conversation) {
      // Re-activate if declined or update status if mutual
      if (conversation.status === "DECLINED" || (isMutual && conversation.status === "PENDING")) {
        conversation = await tx.conversation.update({
          where: { id: conversation.id },
          data: {
            status: isMutual ? "ACCEPTED" : "PENDING",
            initiatorId: currentUserId,
            lastMessageAt: new Date(),
          },
        });
      } else {
        conversation = await tx.conversation.update({
          where: { id: conversation.id },
          data: { lastMessageAt: new Date() },
        });
      }
    } else {
      conversation = await tx.conversation.create({
        data: {
          userAId,
          userBId,
          initiatorId: currentUserId,
          status,
          lastMessageAt: new Date(),
        },
      });
    }

    const message = await tx.message.create({
      data: {
        conversationId: conversation.id,
        senderId: currentUserId,
        content: initialMessage,
        imageUrl: imageUrl || null,
      },
    });

    return {
      conversationId: conversation.id,
      status: conversation.status,
      messageId: message.id,
    };
  });
}

export async function respondToRequest(params: {
  conversationId: string;
  currentUserId: string;
  decision: "ACCEPT" | "DECLINE";
}): Promise<{ success: boolean; status: string }> {
  const { conversationId, currentUserId, decision } = params;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  // Must be recipient of pending request
  if (conversation.status !== "PENDING") {
    throw new Error("Conversation is not a pending request");
  }

  if (conversation.initiatorId === currentUserId) {
    throw new Error("You cannot accept or decline your own message request");
  }

  if (conversation.userAId !== currentUserId && conversation.userBId !== currentUserId) {
    throw new Error("You are not a participant in this conversation");
  }

  const updatedStatus = decision === "ACCEPT" ? "ACCEPTED" : "DECLINED";

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: updatedStatus },
  });

  return { success: true, status: updatedStatus };
}
