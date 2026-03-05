import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from '@eventpulse/common';
import type { CurrentUserPayload } from '@eventpulse/common';
import { MessagesService } from './messages.service.js';
import type { CursorPaginationResult } from './messages.service.js';
import { CreateMessageDto } from './dto/create-message.dto.js';
import { ChatKafkaProducer } from '../kafka/chat-kafka.producer.js';
import { RoomsService } from '../rooms/rooms.service.js';
import type { MessageDocument } from './schemas/message.schema.js';

@ApiTags('Chat Messages')
@Controller()
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly roomsService: RoomsService,
    private readonly chatKafkaProducer: ChatKafkaProducer,
  ) {}

  @Get('events/:eventId/chat/messages')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get messages for an event chat room (cursor pagination)' })
  @ApiParam({ name: 'eventId', type: 'string' })
  @ApiQuery({ name: 'before', required: false, description: 'Cursor: message _id to fetch before' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max messages to return' })
  async findMessages(
    @Param('eventId') eventId: string,
    @Query('before') before?: string,
    @Query('limit') limit?: number,
  ): Promise<CursorPaginationResult> {
    const room = await this.roomsService.findByEventIdAndType(eventId, 'event_chat');

    if (!room) {
      return { messages: [], nextCursor: null, hasMore: false };
    }

    return this.messagesService.findByRoom(room.roomId, before, limit ?? 50);
  }

  @Post('events/:eventId/chat/messages')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a message to an event chat room' })
  @ApiParam({ name: 'eventId', type: 'string' })
  async sendMessage(
    @Param('eventId') eventId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateMessageDto,
  ): Promise<MessageDocument> {
    const room = await this.roomsService.findByEventIdAndType(eventId, 'event_chat');

    if (!room) {
      // Auto-create the chat room if it doesn't exist
      const newRoom = await this.roomsService.createRoom(eventId, 'event_chat', 'Event Chat');

      const message = await this.messagesService.create({
        roomId: newRoom.roomId,
        roomType: 'event_chat',
        sender: {
          userId: user.sub,
          firstName: 'Unknown',
          lastName: 'User',
          avatarUrl: null,
        },
        content: dto.content,
        type: dto.type ?? 'text',
        replyTo: dto.replyTo ?? null,
      });

      await this.chatKafkaProducer.publishMessageSent({
        messageId: String(message._id),
        roomId: newRoom.roomId,
        eventId,
        senderId: user.sub,
        type: dto.type ?? 'text',
        contentLength: dto.content.length,
        sentAt: new Date().toISOString(),
      });

      return message;
    }

    const message = await this.messagesService.create({
      roomId: room.roomId,
      roomType: room.type,
      sender: {
        userId: user.sub,
        firstName: 'Unknown',
        lastName: 'User',
        avatarUrl: null,
      },
      content: dto.content,
      type: dto.type ?? 'text',
      replyTo: dto.replyTo ?? null,
    });

    await this.chatKafkaProducer.publishMessageSent({
      messageId: String(message._id),
      roomId: room.roomId,
      eventId,
      senderId: user.sub,
      type: dto.type ?? 'text',
      contentLength: dto.content.length,
      sentAt: new Date().toISOString(),
    });

    return message;
  }
}
