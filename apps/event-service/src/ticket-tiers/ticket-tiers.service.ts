import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketTier } from './entities/ticket-tier.entity.js';
import { Event } from '../events/entities/event.entity.js';
import { CreateTicketTierDto, UpdateTicketTierDto } from './dto/create-ticket-tier.dto.js';

@Injectable()
export class TicketTiersService {
  constructor(
    @InjectRepository(TicketTier)
    private readonly tierRepository: Repository<TicketTier>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async findByEventId(eventId: string): Promise<TicketTier[]> {
    return this.tierRepository.find({
      where: { eventId },
      order: { sortOrder: 'ASC' },
    });
  }

  async findOne(eventId: string, tierId: string): Promise<TicketTier> {
    const tier = await this.tierRepository.findOne({
      where: { id: tierId, eventId },
    });

    if (!tier) {
      throw new NotFoundException(`Ticket tier "${tierId}" not found for event "${eventId}"`);
    }

    return tier;
  }

  async create(
    eventId: string,
    organizerId: string,
    dto: CreateTicketTierDto,
  ): Promise<TicketTier> {
    const event = await this.getEventAndAssertOrganizer(eventId, organizerId);

    if (event.status !== 'draft' && event.status !== 'published') {
      throw new BadRequestException('Can only add ticket tiers to draft or published events');
    }

    const tier = this.tierRepository.create({
      eventId,
      name: dto.name,
      description: dto.description ?? null,
      price: dto.price,
      capacity: dto.capacity,
      salesStart: dto.salesStart ? new Date(dto.salesStart) : null,
      salesEnd: dto.salesEnd ? new Date(dto.salesEnd) : null,
      sortOrder: dto.sortOrder ?? 0,
    });

    return this.tierRepository.save(tier);
  }

  async update(
    eventId: string,
    tierId: string,
    organizerId: string,
    dto: UpdateTicketTierDto,
  ): Promise<TicketTier> {
    await this.getEventAndAssertOrganizer(eventId, organizerId);
    const tier = await this.findOne(eventId, tierId);

    if (dto.name !== undefined) tier.name = dto.name;
    if (dto.description !== undefined) tier.description = dto.description ?? null;
    if (dto.price !== undefined) tier.price = dto.price;
    if (dto.capacity !== undefined) tier.capacity = dto.capacity;
    if (dto.salesStart !== undefined)
      tier.salesStart = dto.salesStart ? new Date(dto.salesStart) : null;
    if (dto.salesEnd !== undefined) tier.salesEnd = dto.salesEnd ? new Date(dto.salesEnd) : null;
    if (dto.sortOrder !== undefined) tier.sortOrder = dto.sortOrder;

    return this.tierRepository.save(tier);
  }

  async remove(eventId: string, tierId: string, organizerId: string): Promise<void> {
    const event = await this.getEventAndAssertOrganizer(eventId, organizerId);

    if (event.status !== 'draft') {
      throw new BadRequestException('Can only delete ticket tiers from draft events');
    }

    const tier = await this.findOne(eventId, tierId);
    await this.tierRepository.remove(tier);
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
}
