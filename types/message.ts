export type ConversationStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface ConversationParticipant {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isOnline?: boolean;
  lastSeen?: string | null;
  isMutualFollow?: boolean;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  imageUrl: string | null;
  isDeleted: boolean;
  isEdited: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  sender?: ConversationParticipant;
  clientStatus?: "sending" | "sent" | "delivered" | "read" | "failed";
}

export interface ConversationItem {
  id: string;
  userAId: string;
  userBId: string;
  initiatorId: string;
  status: ConversationStatus;
  lastMessageAt: string;
  createdAt: string;
  otherUser: ConversationParticipant;
  lastMessage: MessageItem | null;
  unreadCount: number;
}

export type ConversationFilter = "ALL" | "REQUESTS" | "UNREAD";
