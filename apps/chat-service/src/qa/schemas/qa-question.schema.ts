import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import type { QAQuestionStatus } from '@eventpulse/shared-types';

// ── Sub-documents ──

@Schema({ _id: false })
export class QAAuthor {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ type: String, default: null })
  avatarUrl!: string | null;
}

export const QAAuthorSchema = SchemaFactory.createForClass(QAAuthor);

@Schema({ _id: false })
export class QAAnswer {
  @Prop({ required: true })
  content!: string;

  @Prop({
    type: {
      userId: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
    },
    required: true,
  })
  answeredBy!: { userId: string; firstName: string; lastName: string };

  @Prop({ required: true, default: () => new Date() })
  answeredAt!: Date;
}

export const QAAnswerSchema = SchemaFactory.createForClass(QAAnswer);

// ── Main Document ──

export type QAQuestionDocument = HydratedDocument<QAQuestion>;

@Schema({ collection: 'qa_questions', timestamps: true })
export class QAQuestion {
  _id!: Types.ObjectId;

  @Prop({ required: true, index: true })
  eventId!: string;

  @Prop({ type: QAAuthorSchema, required: true })
  author!: QAAuthor;

  @Prop({ required: true })
  question!: string;

  @Prop({ required: true, enum: ['pending', 'answered', 'dismissed'], default: 'pending' })
  status!: QAQuestionStatus;

  @Prop({ type: [String], default: [] })
  upvotes!: string[];

  @Prop({ default: 0 })
  upvoteCount!: number;

  @Prop({ type: QAAnswerSchema, default: null })
  answer!: QAAnswer | null;

  @Prop({ default: false })
  isPinned!: boolean;
}

export const QAQuestionSchema = SchemaFactory.createForClass(QAQuestion);

// Compound index for sorting: pinned first, then by upvoteCount descending
QAQuestionSchema.index({ eventId: 1, isPinned: -1, upvoteCount: -1 });
