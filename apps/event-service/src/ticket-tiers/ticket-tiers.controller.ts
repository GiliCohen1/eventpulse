import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '@eventpulse/common';
import type { CurrentUserPayload } from '@eventpulse/common';
import { TicketTiersService } from './ticket-tiers.service.js';
import { CreateTicketTierDto, UpdateTicketTierDto } from './dto/create-ticket-tier.dto.js';
import type { TicketTier } from './entities/ticket-tier.entity.js';

@ApiTags('Ticket Tiers')
@Controller('events/:eventId/tiers')
export class TicketTiersController {
  constructor(private readonly ticketTiersService: TicketTiersService) {}

  @Get()
  @ApiOperation({ summary: 'List ticket tiers for an event' })
  async findAll(@Param('eventId', ParseUUIDPipe) eventId: string): Promise<TicketTier[]> {
    return this.ticketTiersService.findByEventId(eventId);
  }

  @Get(':tierId')
  @ApiOperation({ summary: 'Get a ticket tier by ID' })
  async findOne(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('tierId', ParseUUIDPipe) tierId: string,
  ): Promise<TicketTier> {
    return this.ticketTiersService.findOne(eventId, tierId);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a ticket tier for an event' })
  async create(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateTicketTierDto,
  ): Promise<TicketTier> {
    return this.ticketTiersService.create(eventId, user.sub, dto);
  }

  @Put(':tierId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a ticket tier' })
  async update(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('tierId', ParseUUIDPipe) tierId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateTicketTierDto,
  ): Promise<TicketTier> {
    return this.ticketTiersService.update(eventId, tierId, user.sub, dto);
  }

  @Delete(':tierId')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a ticket tier (draft events only)' })
  async remove(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('tierId', ParseUUIDPipe) tierId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    return this.ticketTiersService.remove(eventId, tierId, user.sub);
  }
}
