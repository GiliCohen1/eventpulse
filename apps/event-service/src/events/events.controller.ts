import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from '@eventpulse/common';
import type { CurrentUserPayload } from '@eventpulse/common';
import { EventsService } from './events.service.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { QueryEventsDto } from './dto/query-events.dto.js';
import type { Event } from './entities/event.entity.js';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new event' })
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateEventDto,
  ): Promise<Event> {
    return this.eventsService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List and search events' })
  async findAll(
    @Query() query: QueryEventsDto,
  ): Promise<{ data: Event[]; total: number; page: number; limit: number }> {
    return this.eventsService.findAll(query);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending events' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findTrending(@Query('limit') limit?: number): Promise<Event[]> {
    return this.eventsService.findTrending(limit);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get nearby events by coordinates' })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lng', required: true, type: Number })
  @ApiQuery({ name: 'radius', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findNearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius?: number,
    @Query('limit') limit?: number,
  ): Promise<Event[]> {
    return this.eventsService.findNearby(lat, lng, radius, limit);
  }

  @Get('me/organized')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get events organized by current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findMyOrganized(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ data: Event[]; total: number }> {
    return this.eventsService.findOrganizedByUser(user.sub, page, limit);
  }

  @Get('me/attending')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get events the current user is attending' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findMyAttending(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ data: Event[]; total: number }> {
    return this.eventsService.findAttendingByUser(user.sub, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Event> {
    return this.eventsService.findById(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an event' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateEventDto,
  ): Promise<Event> {
    return this.eventsService.update(id, user.sub, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a draft event' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    return this.eventsService.remove(id, user.sub);
  }

  @Put(':id/publish')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a draft event' })
  async publish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<Event> {
    return this.eventsService.publish(id, user.sub);
  }

  @Put(':id/cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel an event' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body('reason') reason?: string,
  ): Promise<Event> {
    return this.eventsService.cancel(id, user.sub, reason);
  }

  @Put(':id/go-live')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set a published event to live' })
  async goLive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<Event> {
    return this.eventsService.goLive(id, user.sub);
  }

  @Put(':id/end')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'End a live event' })
  async end(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<Event> {
    return this.eventsService.end(id, user.sub);
  }
}
