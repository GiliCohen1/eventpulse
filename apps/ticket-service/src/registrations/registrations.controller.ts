import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CurrentUser } from '@eventpulse/common';
import type { CurrentUserPayload } from '@eventpulse/common';
import { RegistrationsService } from './registrations.service.js';
import { CreateRegistrationDto } from './dto/create-registration.dto.js';
import type { Registration } from './entities/registration.entity.js';
import type { Ticket } from '../qr-codes/entities/ticket.entity.js';

@ApiTags('Registrations')
@Controller()
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post('events/:eventId/register')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register for an event' })
  @ApiParam({ name: 'eventId', type: 'string', format: 'uuid' })
  async register(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateRegistrationDto,
  ): Promise<Registration> {
    return this.registrationsService.register(user.sub, eventId, dto);
  }

  @Delete('events/:eventId/register')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel registration for an event' })
  @ApiParam({ name: 'eventId', type: 'string', format: 'uuid' })
  async cancel(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<Registration> {
    return this.registrationsService.cancel(user.sub, eventId);
  }

  @Get('registrations/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my registrations' })
  async findMyRegistrations(@CurrentUser() user: CurrentUserPayload): Promise<Registration[]> {
    return this.registrationsService.findMyRegistrations(user.sub);
  }

  @Get('registrations/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get registration by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Registration> {
    return this.registrationsService.findById(id);
  }

  @Get('registrations/:id/ticket')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ticket for a registration' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findTicket(@Param('id', ParseUUIDPipe) id: string): Promise<Ticket> {
    return this.registrationsService.findTicketByRegistrationId(id);
  }

  @Post('tickets/:ticketCode/check-in')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check in with a ticket code' })
  @ApiParam({ name: 'ticketCode', type: 'string', example: 'EVP-A1B2C3' })
  async checkIn(@Param('ticketCode') ticketCode: string): Promise<Registration> {
    return this.registrationsService.checkIn(ticketCode);
  }

  @Get('events/:eventId/attendees')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get attendees for an event' })
  @ApiParam({ name: 'eventId', type: 'string', format: 'uuid' })
  async findAttendees(@Param('eventId', ParseUUIDPipe) eventId: string): Promise<Registration[]> {
    return this.registrationsService.findAttendees(eventId);
  }
}
