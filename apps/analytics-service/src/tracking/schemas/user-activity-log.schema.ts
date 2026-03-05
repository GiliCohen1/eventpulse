import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

// ── Sub-documents ──

@Schema({ _id: false })
export class ActivityTarget {
  @Prop({ required: true })
  type!: string;

  @Prop({ required: true })
  id!: string;

  @Prop({ type: String, default: null })
  name!: string | null;
}

export const ActivityTargetSchema = SchemaFactory.createForClass(ActivityTarget);

// ── Main Document ──

export type UserActivityLogDocument = HydratedDocument<UserActivityLog>;

@Schema({ collection: 'user_activity_logs', timestamps: true })
export class UserActivityLog {
  _id!: Types.ObjectId;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  action!: string;

  @Prop({ type: ActivityTargetSchema, required: true })
  target!: ActivityTarget;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;

  @Prop({ required: true, default: () => new Date() })
  timestamp!: Date;
}

export const UserActivityLogSchema = SchemaFactory.createForClass(UserActivityLog);

// Indexes
UserActivityLogSchema.index({ userId: 1, timestamp: -1 });
UserActivityLogSchema.index({ action: 1, timestamp: -1 });

// TTL index: auto-delete after 90 days
UserActivityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
