import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import type { RoomType, ParticipantRole } from '@eventpulse/shared-types';

// ── Sub-documents ──

@Schema({ _id: false })
export class ChatParticipant {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true, default: () => new Date() })
  joinedAt!: Date;

  @Prop({ required: true, enum: ['organizer', 'attendee', 'moderator'], default: 'attendee' })
  role!: ParticipantRole;
}

export const ChatParticipantSchema = SchemaFactory.createForClass(ChatParticipant);

@Schema({ _id: false })
export class ChatRoomSettings {
  @Prop({ default: false })
  slowMode!: boolean;

  @Prop({ default: 5 })
  slowModeInterval!: number;

  @Prop({ default: false })
  onlyOrganizersCanPost!: boolean;

  @Prop({ default: 500 })
  maxMessageLength!: number;
}

export const ChatRoomSettingsSchema = SchemaFactory.createForClass(ChatRoomSettings);

// ── Main Document ──

export type RoomDocument = HydratedDocument<Room>;

@Schema({ collection: 'rooms', timestamps: true })
export class Room {
  _id!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  roomId!: string;

  @Prop({ required: true, index: true })
  eventId!: string;

  @Prop({ required: true, enum: ['event_chat', 'event_qa', 'direct'] })
  type!: RoomType;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: [ChatParticipantSchema], default: [] })
  participants!: ChatParticipant[];

  @Prop({ default: 0 })
  participantCount!: number;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: ChatRoomSettingsSchema, default: () => ({}) })
  settings!: ChatRoomSettings;
}

export const RoomSchema = SchemaFactory.createForClass(Room);

// Compound index for fast look-ups
RoomSchema.index({ eventId: 1, type: 1 });
