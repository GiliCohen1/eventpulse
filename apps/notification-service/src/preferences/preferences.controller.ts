import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '@eventpulse/common';
import type { CurrentUserPayload } from '@eventpulse/common';
import { PreferencesService } from './preferences.service.js';
import type { NotificationPreferencesDocument } from './schemas/notification-preferences.schema.js';

@ApiTags('Notification Preferences')
@Controller('notifications/preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get notification preferences for the current user' })
  async getPreferences(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<NotificationPreferencesDocument> {
    return this.preferencesService.getByUser(user.sub);
  }

  @Put()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update notification preferences' })
  async updatePreferences(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: Record<string, unknown>,
  ): Promise<NotificationPreferencesDocument> {
    return this.preferencesService.upsert(user.sub, body);
  }
}
