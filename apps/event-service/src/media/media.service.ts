import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import { EventMedia } from '../events/entities/event-media.entity.js';
import { Event } from '../events/entities/event.entity.js';
import type { MediaType } from '@eventpulse/shared-types';

const ALLOWED_MIME_TYPES: Record<string, MediaType> = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  'video/mp4': 'video',
  'video/webm': 'video',
  'application/pdf': 'document',
};

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(
    @InjectRepository(EventMedia)
    private readonly mediaRepository: Repository<EventMedia>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly configService: ConfigService,
  ) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: this.configService.get<number>('MINIO_PORT', 9000),
      useSSL: this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
    });

    this.bucketName = this.configService.get<string>('MINIO_BUCKET', 'eventpulse-media');
    this.ensureBucket();
  }

  async upload(
    eventId: string,
    organizerId: string,
    file: Express.Multer.File,
    altText?: string,
  ): Promise<EventMedia> {
    const event = await this.getEventAndAssertOrganizer(eventId, organizerId);

    if (event.status === 'cancelled' || event.status === 'ended') {
      throw new BadRequestException(
        `Cannot upload media for an event with status "${event.status}"`,
      );
    }

    const mediaType = ALLOWED_MIME_TYPES[file.mimetype];

    if (!mediaType) {
      throw new BadRequestException(
        `Unsupported file type "${file.mimetype}". Allowed: ${Object.keys(ALLOWED_MIME_TYPES).join(', ')}`,
      );
    }

    const extension = file.originalname.split('.').pop() ?? 'bin';
    const objectName = `events/${eventId}/${uuidv4()}.${extension}`;

    await this.minioClient.putObject(this.bucketName, objectName, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    const url = `/${this.bucketName}/${objectName}`;

    const existingCount = await this.mediaRepository.count({ where: { eventId } });

    const media = this.mediaRepository.create({
      eventId,
      url,
      type: mediaType,
      altText: altText ?? null,
      sortOrder: existingCount,
    });

    return this.mediaRepository.save(media);
  }

  async remove(eventId: string, mediaId: string, organizerId: string): Promise<void> {
    await this.getEventAndAssertOrganizer(eventId, organizerId);

    const media = await this.mediaRepository.findOne({
      where: { id: mediaId, eventId },
    });

    if (!media) {
      throw new NotFoundException(`Media "${mediaId}" not found for event "${eventId}"`);
    }

    // Remove from MinIO
    try {
      const objectName = media.url.replace(`/${this.bucketName}/`, '');
      await this.minioClient.removeObject(this.bucketName, objectName);
    } catch (error) {
      this.logger.warn(
        `Failed to remove object from MinIO: ${media.url}`,
        error instanceof Error ? error.message : String(error),
      );
    }

    await this.mediaRepository.remove(media);
  }

  async findByEventId(eventId: string): Promise<EventMedia[]> {
    return this.mediaRepository.find({
      where: { eventId },
      order: { sortOrder: 'ASC' },
    });
  }

  private async getEventAndAssertOrganizer(eventId: string, organizerId: string): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });

    if (!event) {
      throw new NotFoundException(`Event with id "${eventId}" not found`);
    }

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException('You are not the organizer of this event');
    }

    return event;
  }

  private async ensureBucket(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);

      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName);
        this.logger.log(`Created MinIO bucket: ${this.bucketName}`);
      }
    } catch (error) {
      this.logger.warn(
        'Failed to ensure MinIO bucket exists',
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
