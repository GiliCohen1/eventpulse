import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KafkaConsumer, KAFKA_TOPICS, CONSUMER_GROUPS } from '@eventpulse/kafka-common';
import type {
  KafkaEventEnvelope,
  TicketReservedEvent,
  TicketCancelledEvent,
} from '@eventpulse/shared-types';
import { Event } from '../events/entities/event.entity.js';
import { TicketTier } from '../ticket-tiers/entities/ticket-tier.entity.js';

@Injectable()
export class EventKafkaConsumer implements OnModuleInit {
  private readonly logger = new Logger(EventKafkaConsumer.name);

  constructor(
    private readonly kafkaConsumer: KafkaConsumer,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(TicketTier)
    private readonly ticketTierRepository: Repository<TicketTier>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.kafkaConsumer.consume(
      CONSUMER_GROUPS.EVENT_SERVICE,
      [KAFKA_TOPICS.TICKET_RESERVED, KAFKA_TOPICS.TICKET_CANCELLED],
      async (payload) => {
        const { topic, message } = payload;
        const value = message.value?.toString();

        if (!value) {
          return;
        }

        switch (topic) {
          case KAFKA_TOPICS.TICKET_RESERVED:
            await this.handleTicketReserved(value);
            break;
          case KAFKA_TOPICS.TICKET_CANCELLED:
            await this.handleTicketCancelled(value);
            break;
          default:
            this.logger.warn(`Unhandled topic: ${topic}`);
        }
      },
    );

    this.logger.log('Event Kafka consumer initialized');
  }

  private async handleTicketReserved(rawMessage: string): Promise<void> {
    try {
      const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<TicketReservedEvent>;
      const { eventId, ticketTierId } = envelope.data;

      this.logger.log(`Handling ticket.reserved for event=${eventId}, tier=${ticketTierId}`);

      await this.eventRepository.increment({ id: eventId }, 'registeredCount', 1);
      await this.ticketTierRepository.increment({ id: ticketTierId }, 'registeredCount', 1);
    } catch (error) {
      this.logger.error(
        'Failed to handle ticket.reserved',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private async handleTicketCancelled(rawMessage: string): Promise<void> {
    try {
      const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<TicketCancelledEvent>;
      const { eventId, ticketTierId } = envelope.data;

      this.logger.log(`Handling ticket.cancelled for event=${eventId}, tier=${ticketTierId}`);

      await this.eventRepository.decrement({ id: eventId }, 'registeredCount', 1);
      await this.ticketTierRepository.decrement({ id: ticketTierId }, 'registeredCount', 1);
    } catch (error) {
      this.logger.error(
        'Failed to handle ticket.cancelled',
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
