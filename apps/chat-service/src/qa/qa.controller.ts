import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CurrentUser } from '@eventpulse/common';
import type { CurrentUserPayload } from '@eventpulse/common';
import { QaService } from './qa.service.js';
import { CreateQuestionDto } from './dto/create-question.dto.js';
import { AnswerQuestionDto } from './dto/answer-question.dto.js';
import type { QAQuestionDocument } from './schemas/qa-question.schema.js';

@ApiTags('Q&A')
@Controller()
export class QaController {
  constructor(private readonly qaService: QaService) {}

  @Get('events/:eventId/qa')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Q&A questions for an event (sorted by pinned + upvotes)' })
  @ApiParam({ name: 'eventId', type: 'string' })
  async findByEvent(@Param('eventId') eventId: string): Promise<QAQuestionDocument[]> {
    return this.qaService.findByEvent(eventId);
  }

  @Post('events/:eventId/qa')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ask a question in event Q&A' })
  @ApiParam({ name: 'eventId', type: 'string' })
  async ask(
    @Param('eventId') eventId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateQuestionDto,
  ): Promise<QAQuestionDocument> {
    return this.qaService.ask({
      eventId,
      author: {
        userId: user.sub,
        firstName: 'Unknown',
        lastName: 'User',
        avatarUrl: null,
      },
      question: dto.question,
    });
  }

  @Post('events/:eventId/qa/:questionId/upvote')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle upvote on a Q&A question' })
  @ApiParam({ name: 'eventId', type: 'string' })
  @ApiParam({ name: 'questionId', type: 'string' })
  async upvote(
    @Param('questionId') questionId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<QAQuestionDocument> {
    return this.qaService.toggleUpvote(questionId, user.sub);
  }

  @Post('events/:eventId/qa/:questionId/answer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Answer a Q&A question (organizer only)' })
  @ApiParam({ name: 'eventId', type: 'string' })
  @ApiParam({ name: 'questionId', type: 'string' })
  async answerQuestion(
    @Param('questionId') questionId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: AnswerQuestionDto,
  ): Promise<QAQuestionDocument> {
    return this.qaService.answer(questionId, {
      content: dto.content,
      answeredBy: {
        userId: user.sub,
        firstName: 'Unknown',
        lastName: 'User',
      },
    });
  }
}
