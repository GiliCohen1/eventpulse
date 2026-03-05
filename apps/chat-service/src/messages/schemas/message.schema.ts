import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import type { MessageType, RoomType } from '@eventpulse/shared-types';

// ── Sub-documents ──

@Schema({ _id: false })
export class MessageSender {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ type: String, default: null })
  avatarUrl!: string | null;
}

export const MessageSenderSchema = SchemaFactory.createForClass(MessageSender);

@Schema({ _id: false })
export class Reaction {
  @Prop({ required: true })
  emoji!: string;

  @Prop({ type: [String], default: [] })
  users!: string[];
}

export const ReactionSchema = SchemaFactory.createForClass(Reaction);

// ── Main Document ──

export type MessageDocument = HydratedDocument<Message>;

@Schema({ collection: 'messages', timestamps: true })
export class Message {
  _id!: Types.ObjectId;

  @Prop({ required: true, index: true })
  roomId!: string;

  @Prop({ required: true, enum: ['event_chat', 'event_qa', 'direct'] })
  roomType!: RoomType;

  @Prop({ type: MessageSenderSchema, required: true })
  sender!: MessageSender;

  @Prop({ required: true })
  content!: string;

  @Prop({ required: true, enum: ['text', 'image', 'system'], default: 'text' })
  type!: MessageType;

  @Prop({ type: String, default: null })
  replyTo!: string | null;

  @Prop({ type: [ReactionSchema], default: [] })
  reactions!: Reaction[];

  @Prop({ default: false })
  isEdited!: boolean;

  @Prop({ default: false })
  isDeleted!: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Index for cursor-based pagination (newest first)
MessageSchema.index({ roomId: 1, _id: -1 });
