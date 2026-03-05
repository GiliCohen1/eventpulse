import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { RoomsService } from './rooms.service.js';
import type { RoomDocument } from './schemas/room.schema.js';

@ApiTags('Chat Rooms')
@Controller()
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get('events/:eventId/chat/rooms')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chat rooms for an event' })
  @ApiParam({ name: 'eventId', type: 'string' })
  async findByEvent(@Param('eventId') eventId: string): Promise<RoomDocument[]> {
    return this.roomsService.findByEventId(eventId);
  }
}
