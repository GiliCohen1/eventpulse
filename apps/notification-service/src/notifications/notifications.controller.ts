import { Controller, Get, Put, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from '@eventpulse/common';
import type { CurrentUserPayload } from '@eventpulse/common';
import { NotificationsService } from './notifications.service.js';
import type { NotificationDocument } from './schemas/notification.schema.js';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get notifications for the current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findByUser(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<{ data: NotificationDocument[]; total: number; page: number; limit: number }> {
    return this.notificationsService.findByUser(user.sub, page, limit);
  }

  @Get('unread-count')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@CurrentUser() user: CurrentUserPayload): Promise<{ count: number }> {
    const count = await this.notificationsService.getUnreadCount(user.sub);
    return { count };
  }

  @Put(':id/read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark a single notification as read' })
  @ApiParam({ name: 'id', type: 'string' })
  async markAsRead(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ): Promise<NotificationDocument> {
    return this.notificationsService.markAsRead(user.sub, id);
  }

  @Put('read-all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser() user: CurrentUserPayload): Promise<{ updated: number }> {
    const updated = await this.notificationsService.markAllAsRead(user.sub);
    return { updated };
  }
}
