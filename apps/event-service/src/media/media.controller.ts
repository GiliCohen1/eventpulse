import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CurrentUser } from '@eventpulse/common';
import type { CurrentUserPayload } from '@eventpulse/common';
import { MediaService } from './media.service.js';
import type { EventMedia } from '../events/entities/event-media.entity.js';

@ApiTags('Event Media')
@Controller('events/:eventId/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiOperation({ summary: 'List media for an event' })
  async findAll(@Param('eventId', ParseUUIDPipe) eventId: string): Promise<EventMedia[]> {
    return this.mediaService.findByEventId(eventId);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload media for an event' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        altText: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: CurrentUserPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body('altText') altText?: string,
  ): Promise<EventMedia> {
    return this.mediaService.upload(eventId, user.sub, file, altText);
  }

  @Delete(':mediaId')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete media from an event' })
  async remove(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    return this.mediaService.remove(eventId, mediaId, user.sub);
  }
}
