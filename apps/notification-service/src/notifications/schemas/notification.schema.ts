import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';
import type { NotificationType } from '@eventpulse/shared-types';

// ── Channel Sub-documents ──

@Schema({ _id: false })
export class InAppChannel {
  @Prop({ default: false })
  sent!: boolean;

  @Prop({ type: Date, default: null })
  sentAt!: Date | null;

  @Prop({ type: Date, default: null })
  readAt!: Date | null;
}

export const InAppChannelSchema = SchemaFactory.createForClass(InAppChannel);

@Schema({ _id: false })
export class EmailChannel {
  @Prop({ default: false })
  sent!: boolean;

  @Prop({ type: Date, default: null })
  sentAt!: Date | null;

  @Prop({ type: String, default: null })
  messageId!: string | null;
}

export const EmailChannelSchema = SchemaFactory.createForClass(EmailChannel);

@Schema({ _id: false })
export class PushChannel {
  @Prop({ default: false })
  sent!: boolean;

  @Prop({ type: String, default: null })
  reason!: string | null;
}

export const PushChannelSchema = SchemaFactory.createForClass(PushChannel);

@Schema({ _id: false })
export class NotificationChannels {
  @Prop({ type: InAppChannelSchema, default: () => ({}) })
  inApp!: InAppChannel;

  @Prop({ type: EmailChannelSchema, default: () => ({}) })
  email!: EmailChannel;

  @Prop({ type: PushChannelSchema, default: () => ({}) })
  push!: PushChannel;
}

export const NotificationChannelsSchema = SchemaFactory.createForClass(NotificationChannels);

// ── Main Document ──

export type NotificationDocument = HydratedDocument<Notification>;

const NOTIFICATION_TYPES: NotificationType[] = [
  'ticket_confirmed',
  'event_reminder',
  'event_updated',
  'event_cancelled',
  'new_follower',
  'chat_mention',
  'review_received',
  'event_live',
  'welcome',
];

@Schema({ collection: 'notifications', timestamps: true })
export class Notification {
  _id!: Types.ObjectId;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, enum: NOTIFICATION_TYPES })
  type!: NotificationType;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  body!: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  data!: Record<string, unknown>;

  @Prop({ type: NotificationChannelsSchema, default: () => ({}) })
  channels!: NotificationChannels;

  @Prop({ default: false, index: true })
  isRead!: boolean;

  @Prop({ type: Date, default: null, index: true })
  expiresAt!: Date | null;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Compound index for user notifications query
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

// TTL index – MongoDB automatically removes docs when expiresAt is reached
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });
