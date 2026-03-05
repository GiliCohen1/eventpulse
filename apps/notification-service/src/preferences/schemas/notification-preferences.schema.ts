import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';
import type { EmailFrequency } from '@eventpulse/shared-types';

// ── Channel Preference Sub-documents ──

@Schema({ _id: false })
export class EmailPreference {
  @Prop({ default: true })
  enabled!: boolean;

  @Prop({ default: 'instant', enum: ['instant', 'daily_digest', 'weekly_digest'] })
  frequency!: EmailFrequency;
}

export const EmailPreferenceSchema = SchemaFactory.createForClass(EmailPreference);

@Schema({ _id: false })
export class InAppPreference {
  @Prop({ default: true })
  enabled!: boolean;
}

export const InAppPreferenceSchema = SchemaFactory.createForClass(InAppPreference);

@Schema({ _id: false })
export class PushPreference {
  @Prop({ default: true })
  enabled!: boolean;
}

export const PushPreferenceSchema = SchemaFactory.createForClass(PushPreference);

@Schema({ _id: false })
export class ChannelPreferences {
  @Prop({ type: EmailPreferenceSchema, default: () => ({}) })
  email!: EmailPreference;

  @Prop({ type: InAppPreferenceSchema, default: () => ({}) })
  inApp!: InAppPreference;

  @Prop({ type: PushPreferenceSchema, default: () => ({}) })
  push!: PushPreference;
}

export const ChannelPreferencesSchema = SchemaFactory.createForClass(ChannelPreferences);

// ── Main Document ──

export type NotificationPreferencesDocument = HydratedDocument<NotificationPreferences>;

@Schema({ collection: 'notification_preferences', timestamps: true })
export class NotificationPreferences {
  _id!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  userId!: string;

  @Prop({ type: ChannelPreferencesSchema, default: () => ({}) })
  channels!: ChannelPreferences;

  @Prop({ type: MongooseSchema.Types.Map, of: MongooseSchema.Types.Mixed, default: {} })
  types!: Map<string, { email: boolean; inApp: boolean; push: boolean }>;
}

export const NotificationPreferencesSchema = SchemaFactory.createForClass(NotificationPreferences);
