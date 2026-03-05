import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { QAQuestion, QAQuestionDocument } from './schemas/qa-question.schema.js';

export interface AskQuestionParams {
  eventId: string;
  author: {
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  question: string;
}

export interface AnswerQuestionParams {
  content: string;
  answeredBy: {
    userId: string;
    firstName: string;
    lastName: string;
  };
}

@Injectable()
export class QaService {
  private readonly logger = new Logger(QaService.name);

  constructor(@InjectModel(QAQuestion.name) private readonly qaModel: Model<QAQuestionDocument>) {}

  async ask(params: AskQuestionParams): Promise<QAQuestionDocument> {
    this.logger.log(`New Q&A question for event=${params.eventId} by user=${params.author.userId}`);

    const question = new this.qaModel({
      eventId: params.eventId,
      author: params.author,
      question: params.question,
      status: 'pending',
      upvotes: [],
      upvoteCount: 0,
      answer: null,
      isPinned: false,
    });

    return question.save();
  }

  async answer(questionId: string, params: AnswerQuestionParams): Promise<QAQuestionDocument> {
    const question = await this.findById(questionId);

    question.answer = {
      content: params.content,
      answeredBy: params.answeredBy,
      answeredAt: new Date(),
    };
    question.status = 'answered';

    this.logger.log(`Question ${questionId} answered by user=${params.answeredBy.userId}`);
    return question.save();
  }

  async toggleUpvote(questionId: string, userId: string): Promise<QAQuestionDocument> {
    const question = await this.findById(questionId);

    const alreadyUpvoted = question.upvotes.includes(userId);

    if (alreadyUpvoted) {
      question.upvotes = question.upvotes.filter((u) => u !== userId);
    } else {
      question.upvotes.push(userId);
    }

    question.upvoteCount = question.upvotes.length;
    return question.save();
  }

  async findByEvent(eventId: string): Promise<QAQuestionDocument[]> {
    return this.qaModel
      .find({ eventId })
      .sort({ isPinned: -1, upvoteCount: -1, createdAt: -1 })
      .exec();
  }

  async dismiss(questionId: string): Promise<QAQuestionDocument> {
    const question = await this.findById(questionId);
    question.status = 'dismissed';
    return question.save();
  }

  async pin(questionId: string, isPinned: boolean): Promise<QAQuestionDocument> {
    const question = await this.findById(questionId);
    question.isPinned = isPinned;
    return question.save();
  }

  private async findById(questionId: string): Promise<QAQuestionDocument> {
    if (!Types.ObjectId.isValid(questionId)) {
      throw new NotFoundException(`Invalid question ID: ${questionId}`);
    }

    const question = await this.qaModel.findById(questionId).exec();

    if (!question) {
      throw new NotFoundException(`Question with id=${questionId} not found`);
    }

    return question;
  }
}
