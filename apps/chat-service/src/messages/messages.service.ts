import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { MessageType, RoomType } from '@eventpulse/shared-types';
import { Message, MessageDocument } from './schemas/message.schema.js';

export interface CreateMessageParams {
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
  replyTo?: string | null;
}

export interface CursorPaginationResult {
  messages: MessageDocument[];
  nextCursor: string | null;
  hasMore: boolean;
}

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(@InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>) {}

  async create(params: CreateMessageParams): Promise<MessageDocument> {
    this.logger.log(`Creating message in room=${params.roomId} from user=${params.sender.userId}`);

    const message = new this.messageModel({
      roomId: params.roomId,
      roomType: params.roomType,
      sender: params.sender,
      content: params.content,
      type: params.type,
      replyTo: params.replyTo ?? null,
      reactions: [],
      isEdited: false,
      isDeleted: false,
    });

    return message.save();
  }

  async findByRoom(
    roomId: string,
    before?: string,
    limit: number = 50,
  ): Promise<CursorPaginationResult> {
    const query: Record<string, unknown> = { roomId };

    if (before) {
      if (!Types.ObjectId.isValid(before)) {
        throw new NotFoundException(`Invalid cursor: ${before}`);
      }
      query['_id'] = { $lt: new Types.ObjectId(before) };
    }

    const messages = await this.messageModel
      .find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .exec();

    const hasMore = messages.length > limit;
    const page = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? String(page[page.length - 1]._id) : null;

    return { messages: page, nextCursor, hasMore };
  }

  async addReaction(messageId: string, emoji: string, userId: string): Promise<MessageDocument> {
    const message = await this.findById(messageId);

    const existingReaction = message.reactions.find((r) => r.emoji === emoji);

    if (existingReaction) {
      if (!existingReaction.users.includes(userId)) {
        existingReaction.users.push(userId);
      }
    } else {
      message.reactions.push({ emoji, users: [userId] });
    }

    return message.save();
  }

  async removeReaction(messageId: string, emoji: string, userId: string): Promise<MessageDocument> {
    const message = await this.findById(messageId);

    const existingReaction = message.reactions.find((r) => r.emoji === emoji);

    if (existingReaction) {
      existingReaction.users = existingReaction.users.filter((u) => u !== userId);

      if (existingReaction.users.length === 0) {
        message.reactions = message.reactions.filter((r) => r.emoji !== emoji);
      }
    }

    return message.save();
  }

  async softDelete(messageId: string): Promise<MessageDocument> {
    const message = await this.findById(messageId);
    message.isDeleted = true;
    message.content = '[Message deleted]';
    return message.save();
  }

  private async findById(messageId: string): Promise<MessageDocument> {
    if (!Types.ObjectId.isValid(messageId)) {
      throw new NotFoundException(`Invalid message ID: ${messageId}`);
    }

    const message = await this.messageModel.findById(messageId).exec();

    if (!message) {
      throw new NotFoundException(`Message with id=${messageId} not found`);
    }

    return message;
  }
}
