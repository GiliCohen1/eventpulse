// ============================================
// Chat Types
// ============================================

export type RoomType = 'event_chat' | 'event_qa' | 'direct';

export type MessageType = 'text' | 'image' | 'system';

export type ParticipantRole = 'organizer' | 'attendee' | 'moderator';

export type QAQuestionStatus = 'pending' | 'answered' | 'dismissed';

export interface IChatMessage {
  id: string;
  roomId: string;
  roomType: RoomType;
  sender: {
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  content: string;
  type: MessageType;
  replyTo: string | null;
  reactions: IReaction[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IReaction {
  emoji: string;
  users: string[];
}

export interface IChatRoom {
  id: string;
  roomId: string;
  eventId: string;
  type: RoomType;
  name: string;
  participants: IChatParticipant[];
  participantCount: number;
  isActive: boolean;
  settings: IChatRoomSettings;
  createdAt: string;
  updatedAt: string;
}

export interface IChatParticipant {
  userId: string;
  joinedAt: string;
  role: ParticipantRole;
}

export interface IChatRoomSettings {
  slowMode: boolean;
  slowModeInterval: number;
  onlyOrganizersCanPost: boolean;
  maxMessageLength: number;
}

export interface IQAQuestion {
  id: string;
  eventId: string;
  author: {
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  question: string;
  status: QAQuestionStatus;
  upvotes: string[];
  upvoteCount: number;
  answer: IQAAnswer | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IQAAnswer {
  content: string;
  answeredBy: {
    userId: string;
    firstName: string;
    lastName: string;
  };
  answeredAt: string;
}
