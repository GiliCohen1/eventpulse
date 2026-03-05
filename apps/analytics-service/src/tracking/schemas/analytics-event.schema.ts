import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

// ── Sub-documents ──

@Schema({ _id: false })
export class AnalyticsActor {
  @Prop({ type: String, default: null })
  userId!: string | null;

  @Prop({ required: true })
  sessionId!: string;

  @Prop({ required: true })
  userAgent!: string;

  @Prop({ required: true })
  ip!: string;
}

export const AnalyticsActorSchema = SchemaFactory.createForClass(AnalyticsActor);

@Schema({ _id: false })
export class AnalyticsTarget {
  @Prop({ required: true })
  entityType!: string;

  @Prop({ required: true })
  entityId!: string;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;
}

export const AnalyticsTargetSchema = SchemaFactory.createForClass(AnalyticsTarget);

@Schema({ _id: false })
export class AnalyticsUtm {
  @Prop({ type: String, default: null })
  source!: string | null;

  @Prop({ type: String, default: null })
  medium!: string | null;

  @Prop({ type: String, default: null })
  campaign!: string | null;
}

export const AnalyticsUtmSchema = SchemaFactory.createForClass(AnalyticsUtm);

@Schema({ _id: false })
export class AnalyticsContext {
  @Prop({ required: true, default: 'direct_link' })
  source!: string;

  @Prop({ type: String, default: null })
  referrer!: string | null;

  @Prop({ type: AnalyticsUtmSchema, default: () => ({}) })
  utm!: AnalyticsUtm;
}

export const AnalyticsContextSchema = SchemaFactory.createForClass(AnalyticsContext);

@Schema({ _id: false })
export class AnalyticsGeo {
  @Prop({ type: String, default: null })
  country!: string | null;

  @Prop({ type: String, default: null })
  city!: string | null;

  @Prop({ type: Number, default: null })
  latitude!: number | null;

  @Prop({ type: Number, default: null })
  longitude!: number | null;
}

export const AnalyticsGeoSchema = SchemaFactory.createForClass(AnalyticsGeo);

// ── Main Document ──

export type AnalyticsEventDocument = HydratedDocument<AnalyticsEvent>;

@Schema({ collection: 'analytics_events', timestamps: true })
export class AnalyticsEvent {
  _id!: Types.ObjectId;

  @Prop({ required: true, index: true })
  eventType!: string;

  @Prop({ required: true, default: () => new Date() })
  timestamp!: Date;

  @Prop({ type: AnalyticsActorSchema, required: true })
  actor!: AnalyticsActor;

  @Prop({ type: AnalyticsTargetSchema, required: true })
  target!: AnalyticsTarget;

  @Prop({ type: AnalyticsContextSchema, default: () => ({}) })
  context!: AnalyticsContext;

  @Prop({ type: AnalyticsGeoSchema, default: () => ({}) })
  geo!: AnalyticsGeo;
}

export const AnalyticsEventSchema = SchemaFactory.createForClass(AnalyticsEvent);

// Compound indexes
AnalyticsEventSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsEventSchema.index({ 'target.entityType': 1, 'target.entityId': 1, timestamp: -1 });
AnalyticsEventSchema.index({ 'actor.userId': 1, timestamp: -1 });

// TTL index: auto-delete after 180 days
AnalyticsEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });
