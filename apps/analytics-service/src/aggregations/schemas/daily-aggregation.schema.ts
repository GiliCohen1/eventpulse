import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

// ── Sub-documents ──

@Schema({ _id: false })
export class AggregationMetrics {
  @Prop({ default: 0 })
  views!: number;

  @Prop({ default: 0 })
  uniqueViews!: number;

  @Prop({ default: 0 })
  registrations!: number;

  @Prop({ default: 0 })
  cancellations!: number;

  @Prop({ default: 0 })
  shares!: number;

  @Prop({ default: 0 })
  chatMessages!: number;

  @Prop({ default: 0 })
  qaQuestions!: number;

  @Prop({ default: 0 })
  reviews!: number;

  @Prop({ default: 0 })
  avgRating!: number;
}

export const AggregationMetricsSchema = SchemaFactory.createForClass(AggregationMetrics);

@Schema({ _id: false })
export class GeoBreakdownEntry {
  @Prop({ required: true })
  country!: string;

  @Prop({ required: true, default: 0 })
  count!: number;
}

export const GeoBreakdownEntrySchema = SchemaFactory.createForClass(GeoBreakdownEntry);

// ── Main Document ──

export type DailyAggregationDocument = HydratedDocument<DailyAggregation>;

@Schema({ collection: 'daily_aggregations', timestamps: true })
export class DailyAggregation {
  _id!: Types.ObjectId;

  @Prop({ required: true, index: true })
  entityType!: string;

  @Prop({ required: true, index: true })
  entityId!: string;

  @Prop({ required: true })
  date!: string; // YYYY-MM-DD

  @Prop({ type: AggregationMetricsSchema, default: () => ({}) })
  metrics!: AggregationMetrics;

  @Prop({ type: Map, of: Number, default: () => new Map() })
  hourlyBreakdown!: Map<string, number>;

  @Prop({ type: Map, of: Number, default: () => new Map() })
  sources!: Map<string, number>;

  @Prop({ type: [GeoBreakdownEntrySchema], default: [] })
  geoBreakdown!: GeoBreakdownEntry[];
}

export const DailyAggregationSchema = SchemaFactory.createForClass(DailyAggregation);

// Unique compound index
DailyAggregationSchema.index({ entityType: 1, entityId: 1, date: 1 }, { unique: true });
DailyAggregationSchema.index({ date: -1 });
