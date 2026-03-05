import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Event } from './entities/event.entity.js';
import { EventTag } from './entities/event-tag.entity.js';
import { TicketTier } from '../ticket-tiers/entities/ticket-tier.entity.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { QueryEventsDto } from './dto/query-events.dto.js';
import { EventKafkaProducer } from '../kafka/event-kafka.producer.js';
import type { EventStatus } from '@eventpulse/shared-types';

const TRENDING_CACHE_KEY = 'events:trending';
const TRENDING_CACHE_TTL = 300; // 5 minutes

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private readonly redis: Redis;

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(EventTag)
    private readonly eventTagRepository: Repository<EventTag>,
    @InjectRepository(TicketTier)
    private readonly ticketTierRepository: Repository<TicketTier>,
    private readonly configService: ConfigService,
    private readonly eventKafkaProducer: EventKafkaProducer,
  ) {
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD', undefined),
    });
  }

  // ── Create ──

  async create(organizerId: string, dto: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      agenda: dto.agenda ?? null,
      organizerId,
      organizationId: dto.organizationId ?? null,
      categoryId: dto.categoryId,
      status: 'draft' as EventStatus,
      visibility: dto.visibility ?? 'public',
      accessCode: dto.accessCode ?? null,
      venueName: dto.venue?.name ?? null,
      venueAddress: dto.venue?.address ?? null,
      latitude: dto.venue?.latitude ?? null,
      longitude: dto.venue?.longitude ?? null,
      isOnline: dto.isOnline ?? false,
      onlineUrl: dto.onlineUrl ?? null,
      startsAt: new Date(dto.startsAt),
      endsAt: new Date(dto.endsAt),
      timezone: dto.timezone ?? 'UTC',
      recurringParentId: dto.recurringParentId ?? null,
      recurrenceRule: dto.recurrenceRule ?? null,
      coverImageUrl: dto.coverImageUrl ?? null,
      maxCapacity: dto.maxCapacity ?? null,
      registeredCount: 0,
    });

    const savedEvent = await this.eventRepository.save(event);

    // Create tags
    if (dto.tags && dto.tags.length > 0) {
      const tags = dto.tags.map((tag) =>
        this.eventTagRepository.create({ eventId: savedEvent.id, tag }),
      );
      await this.eventTagRepository.save(tags);
    }

    // Create ticket tiers
    if (dto.ticketTiers && dto.ticketTiers.length > 0) {
      const tiers = dto.ticketTiers.map((tier, index) =>
        this.ticketTierRepository.create({
          eventId: savedEvent.id,
          name: tier.name,
          description: tier.description ?? null,
          price: tier.price,
          capacity: tier.capacity,
          salesStart: tier.salesStart ? new Date(tier.salesStart) : null,
          salesEnd: tier.salesEnd ? new Date(tier.salesEnd) : null,
          sortOrder: tier.sortOrder ?? index,
        }),
      );
      await this.ticketTierRepository.save(tiers);
    }

    // Publish Kafka event
    await this.eventKafkaProducer.publishEventCreated({
      eventId: savedEvent.id,
      title: savedEvent.title,
      organizerId: savedEvent.organizerId,
      organizationId: savedEvent.organizationId,
      categoryId: savedEvent.categoryId,
      status: 'draft',
      createdAt: savedEvent.createdAt.toISOString(),
    });

    return this.findById(savedEvent.id);
  }

  // ── Find by ID ──

  async findById(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['tags', 'media', 'ticketTiers', 'category'],
    });

    if (!event) {
      throw new NotFoundException(`Event with id "${id}" not found`);
    }

    return event;
  }

  // ── List / Search / Filter ──

  async findAll(
    query: QueryEventsDto,
  ): Promise<{ data: Event[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.tags', 'tag')
      .leftJoinAndSelect('event.ticketTiers', 'tier')
      .leftJoinAndSelect('event.category', 'category');

    this.applyFilters(qb, query);
    this.applySorting(qb, query);

    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  private applyFilters(qb: SelectQueryBuilder<Event>, query: QueryEventsDto): void {
    // Full-text search
    if (query.q) {
      qb.andWhere('(event.title ILIKE :q OR event.description ILIKE :q)', { q: `%${query.q}%` });
    }

    // Category filter (ID or slug)
    if (query.category) {
      qb.andWhere('(event.category_id = :categoryId OR category.slug = :categorySlug)', {
        categoryId: query.category,
        categorySlug: query.category,
      });
    }

    // Status filter
    if (query.status) {
      qb.andWhere('event.status = :status', { status: query.status });
    }

    // Date range
    if (query.startDate) {
      qb.andWhere('event.starts_at >= :startDate', { startDate: query.startDate });
    }

    if (query.endDate) {
      qb.andWhere('event.ends_at <= :endDate', { endDate: query.endDate });
    }

    // Online filter
    if (query.isOnline !== undefined) {
      qb.andWhere('event.is_online = :isOnline', { isOnline: query.isOnline });
    }

    // Free events filter
    if (query.isFree === true) {
      qb.andWhere(
        'NOT EXISTS (SELECT 1 FROM ticket_tiers tt WHERE tt.event_id = event.id AND tt.price > 0)',
      );
    }

    // Nearby / geo filter
    if (query.lat !== undefined && query.lng !== undefined) {
      const radius = query.radius ?? 50;
      qb.andWhere(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(event.latitude)) * cos(radians(event.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(event.latitude)))) <= :radius`,
        { lat: query.lat, lng: query.lng, radius },
      );
      qb.andWhere('event.latitude IS NOT NULL');
      qb.andWhere('event.longitude IS NOT NULL');
    }
  }

  private applySorting(qb: SelectQueryBuilder<Event>, query: QueryEventsDto): void {
    const sortOrder = query.sortOrder ?? 'ASC';
    const sortBy = query.sortBy ?? 'startsAt';

    switch (sortBy) {
      case 'startsAt':
        qb.orderBy('event.starts_at', sortOrder);
        break;
      case 'createdAt':
        qb.orderBy('event.created_at', sortOrder);
        break;
      case 'registeredCount':
        qb.orderBy('event.registered_count', sortOrder);
        break;
      case 'title':
        qb.orderBy('event.title', sortOrder);
        break;
      default:
        qb.orderBy('event.starts_at', sortOrder);
    }
  }

  // ── Trending ──

  async findTrending(limitCount: number = 10): Promise<Event[]> {
    const cached = await this.redis.get(TRENDING_CACHE_KEY);

    if (cached) {
      return JSON.parse(cached) as Event[];
    }

    const events = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.ticketTiers', 'tier')
      .where('event.status IN (:...statuses)', { statuses: ['published', 'live'] })
      .andWhere('event.starts_at > NOW()')
      .orderBy('event.registered_count', 'DESC')
      .limit(limitCount)
      .getMany();

    await this.redis.setex(TRENDING_CACHE_KEY, TRENDING_CACHE_TTL, JSON.stringify(events));

    return events;
  }

  // ── Nearby ──

  async findNearby(
    lat: number,
    lng: number,
    radius: number = 50,
    limitCount: number = 20,
  ): Promise<Event[]> {
    return this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.ticketTiers', 'tier')
      .where('event.status IN (:...statuses)', { statuses: ['published', 'live'] })
      .andWhere('event.latitude IS NOT NULL')
      .andWhere('event.longitude IS NOT NULL')
      .andWhere(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(event.latitude)) * cos(radians(event.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(event.latitude)))) <= :radius`,
        { lat, lng, radius },
      )
      .orderBy('event.starts_at', 'ASC')
      .limit(limitCount)
      .getMany();
  }

  // ── Update ──

  async update(id: string, organizerId: string, dto: UpdateEventDto): Promise<Event> {
    const event = await this.findById(id);

    this.assertOrganizer(event, organizerId);

    if (event.status === 'cancelled' || event.status === 'ended') {
      throw new BadRequestException(`Cannot update an event with status "${event.status}"`);
    }

    // Track changes for Kafka
    const changes: Array<{ field: string; oldValue: unknown; newValue: unknown }> = [];

    if (dto.title !== undefined && dto.title !== event.title) {
      changes.push({ field: 'title', oldValue: event.title, newValue: dto.title });
      event.title = dto.title;
    }
    if (dto.description !== undefined) {
      changes.push({
        field: 'description',
        oldValue: event.description,
        newValue: dto.description,
      });
      event.description = dto.description ?? null;
    }
    if (dto.agenda !== undefined) {
      event.agenda = dto.agenda ?? null;
    }
    if (dto.categoryId !== undefined) {
      changes.push({ field: 'categoryId', oldValue: event.categoryId, newValue: dto.categoryId });
      event.categoryId = dto.categoryId;
    }
    if (dto.visibility !== undefined) {
      event.visibility = dto.visibility;
    }
    if (dto.accessCode !== undefined) {
      event.accessCode = dto.accessCode ?? null;
    }
    if (dto.venue) {
      if (dto.venue.name !== undefined) event.venueName = dto.venue.name ?? null;
      if (dto.venue.address !== undefined) event.venueAddress = dto.venue.address ?? null;
      if (dto.venue.latitude !== undefined) event.latitude = dto.venue.latitude ?? null;
      if (dto.venue.longitude !== undefined) event.longitude = dto.venue.longitude ?? null;
    }
    if (dto.isOnline !== undefined) {
      event.isOnline = dto.isOnline;
    }
    if (dto.onlineUrl !== undefined) {
      event.onlineUrl = dto.onlineUrl ?? null;
    }
    if (dto.startsAt !== undefined) {
      changes.push({
        field: 'startsAt',
        oldValue: event.startsAt.toISOString(),
        newValue: dto.startsAt,
      });
      event.startsAt = new Date(dto.startsAt);
    }
    if (dto.endsAt !== undefined) {
      changes.push({ field: 'endsAt', oldValue: event.endsAt.toISOString(), newValue: dto.endsAt });
      event.endsAt = new Date(dto.endsAt);
    }
    if (dto.timezone !== undefined) {
      event.timezone = dto.timezone;
    }
    if (dto.coverImageUrl !== undefined) {
      event.coverImageUrl = dto.coverImageUrl ?? null;
    }
    if (dto.maxCapacity !== undefined) {
      event.maxCapacity = dto.maxCapacity ?? null;
    }

    const savedEvent = await this.eventRepository.save(event);

    // Update tags if provided
    if (dto.tags !== undefined) {
      await this.eventTagRepository.delete({ eventId: id });
      if (dto.tags.length > 0) {
        const tags = dto.tags.map((tag) => this.eventTagRepository.create({ eventId: id, tag }));
        await this.eventTagRepository.save(tags);
      }
    }

    // Publish Kafka event if there were meaningful changes
    if (changes.length > 0) {
      const notifyAttendees = event.status === 'published' || event.status === 'live';
      await this.eventKafkaProducer.publishEventUpdated({
        eventId: savedEvent.id,
        title: savedEvent.title,
        organizerId: savedEvent.organizerId,
        changes,
        notifyAttendees,
        updatedAt: savedEvent.updatedAt.toISOString(),
      });
    }

    await this.invalidateTrendingCache();

    return this.findById(id);
  }

  // ── Delete ──

  async remove(id: string, organizerId: string): Promise<void> {
    const event = await this.findById(id);

    this.assertOrganizer(event, organizerId);

    if (event.status !== 'draft') {
      throw new BadRequestException('Only draft events can be deleted');
    }

    await this.eventRepository.remove(event);
  }

  // ── Status Lifecycle ──

  async publish(id: string, organizerId: string): Promise<Event> {
    const event = await this.findById(id);

    this.assertOrganizer(event, organizerId);

    if (event.status !== 'draft') {
      throw new BadRequestException('Only draft events can be published');
    }

    event.status = 'published';
    event.publishedAt = new Date();
    const saved = await this.eventRepository.save(event);

    const tiers = await this.ticketTierRepository.find({ where: { eventId: id } });

    await this.eventKafkaProducer.publishEventPublished({
      eventId: saved.id,
      title: saved.title,
      organizerId: saved.organizerId,
      organizationId: saved.organizationId,
      categoryId: saved.categoryId,
      categoryName: saved.category?.name ?? '',
      startsAt: saved.startsAt.toISOString(),
      endsAt: saved.endsAt.toISOString(),
      venue: {
        name: saved.venueName ?? '',
        address: saved.venueAddress ?? '',
        latitude: Number(saved.latitude) || 0,
        longitude: Number(saved.longitude) || 0,
        isOnline: saved.isOnline,
      },
      ticketTiers: tiers.map((t) => ({
        tierId: t.id,
        name: t.name,
        price: Number(t.price),
        capacity: t.capacity,
      })),
      maxCapacity: saved.maxCapacity ?? 0,
      publishedAt: saved.publishedAt!.toISOString(),
    });

    await this.invalidateTrendingCache();

    return this.findById(id);
  }

  async cancel(id: string, organizerId: string, reason: string = ''): Promise<Event> {
    const event = await this.findById(id);

    this.assertOrganizer(event, organizerId);

    if (event.status === 'cancelled' || event.status === 'ended') {
      throw new BadRequestException(`Cannot cancel an event with status "${event.status}"`);
    }

    event.status = 'cancelled';
    const saved = await this.eventRepository.save(event);

    await this.eventKafkaProducer.publishEventCancelled({
      eventId: saved.id,
      title: saved.title,
      organizerId: saved.organizerId,
      reason,
      registeredUserIds: [], // Populated by ticket-service in practice
      cancelledAt: new Date().toISOString(),
    });

    await this.invalidateTrendingCache();

    return this.findById(id);
  }

  async goLive(id: string, organizerId: string): Promise<Event> {
    const event = await this.findById(id);

    this.assertOrganizer(event, organizerId);

    if (event.status !== 'published') {
      throw new BadRequestException('Only published events can go live');
    }

    event.status = 'live';
    const saved = await this.eventRepository.save(event);

    await this.eventKafkaProducer.publishEventLive({
      eventId: saved.id,
      title: saved.title,
      organizerId: saved.organizerId,
      startedAt: new Date().toISOString(),
    });

    await this.invalidateTrendingCache();

    return this.findById(id);
  }

  async end(id: string, organizerId: string): Promise<Event> {
    const event = await this.findById(id);

    this.assertOrganizer(event, organizerId);

    if (event.status !== 'live') {
      throw new BadRequestException('Only live events can be ended');
    }

    event.status = 'ended';
    const saved = await this.eventRepository.save(event);

    await this.eventKafkaProducer.publishEventEnded({
      eventId: saved.id,
      title: saved.title,
      organizerId: saved.organizerId,
      endedAt: new Date().toISOString(),
      totalAttendees: saved.registeredCount,
      checkedInCount: 0, // Populated by ticket-service in practice
    });

    await this.invalidateTrendingCache();

    return this.findById(id);
  }

  // ── My Events ──

  async findOrganizedByUser(
    organizerId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Event[]; total: number }> {
    const [data, total] = await this.eventRepository.findAndCount({
      where: { organizerId },
      relations: ['tags', 'ticketTiers', 'category'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findAttendingByUser(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Event[]; total: number }> {
    const qb = this.eventRepository
      .createQueryBuilder('event')
      .innerJoin('registrations', 'reg', 'reg.event_id = event.id')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.ticketTiers', 'tier')
      .where('reg.user_id = :userId', { userId })
      .andWhere('reg.status IN (:...statuses)', { statuses: ['confirmed', 'checked_in'] })
      .orderBy('event.starts_at', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }

  // ── Helpers ──

  private assertOrganizer(event: Event, organizerId: string): void {
    if (event.organizerId !== organizerId) {
      throw new ForbiddenException('You are not the organizer of this event');
    }
  }

  private async invalidateTrendingCache(): Promise<void> {
    try {
      await this.redis.del(TRENDING_CACHE_KEY);
    } catch (error) {
      this.logger.warn(
        'Failed to invalidate trending cache',
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
