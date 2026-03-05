import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaConsumer, KAFKA_TOPICS, CONSUMER_GROUPS } from '@eventpulse/kafka-common';
import type {
  KafkaEventEnvelope,
  EventPublishedEvent,
  EventLiveEvent,
  EventEndedEvent,
  EventCancelledEvent,
  TicketReservedEvent,
} from '@eventpulse/shared-types';
import { RoomsService } from '../rooms/rooms.service.js';

@Injectable()
export class ChatKafkaConsumer implements OnModuleInit {
  private readonly logger = new Logger(ChatKafkaConsumer.name);

  constructor(
    private readonly kafkaConsumer: KafkaConsumer,
    private readonly roomsService: RoomsService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.kafkaConsumer.consume(
      CONSUMER_GROUPS.CHAT_SERVICE,
      [
        KAFKA_TOPICS.EVENT_PUBLISHED,
        KAFKA_TOPICS.EVENT_LIVE,
        KAFKA_TOPICS.EVENT_ENDED,
        KAFKA_TOPICS.EVENT_CANCELLED,
        KAFKA_TOPICS.TICKET_RESERVED,
      ],
      async (payload) => {
        const { topic, message } = payload;
        const value = message.value?.toString();

        if (!value) {
          return;
        }

        switch (topic) {
          case KAFKA_TOPICS.EVENT_PUBLISHED:
            await this.handleEventPublished(value);
            break;
          case KAFKA_TOPICS.EVENT_LIVE:
            await this.handleEventLive(value);
            break;
          case KAFKA_TOPICS.EVENT_ENDED:
            await this.handleEventEnded(value);
            break;
          case KAFKA_TOPICS.EVENT_CANCELLED:
            await this.handleEventCancelled(value);
            break;
          case KAFKA_TOPICS.TICKET_RESERVED:
            await this.handleTicketReserved(value);
            break;
          default:
            this.logger.warn(`Unhandled topic: ${topic}`);
        }
      },
    );

    this.logger.log('Chat Kafka consumer initialized');
  }

  private async handleEventPublished(rawMessage: string): Promise<void> {
    try {
      const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<EventPublishedEvent>;
      const { eventId, title } = envelope.data;

      this.logger.log(`Handling event.published – creating chat room for event=${eventId}`);

      const existingRoom = await this.roomsService.findByEventIdAndType(eventId, 'event_chat');
      if (!existingRoom) {
        await this.roomsService.createRoom(eventId, 'event_chat', `${title} – Chat`);
      }
    } catch (error) {
      this.logger.error(
        'Failed to handle event.published',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private async handleEventLive(rawMessage: string): Promise<void> {
    try {
      const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<EventLiveEvent>;
      const { eventId, title } = envelope.data;

      this.logger.log(`Handling event.live – activating rooms & enabling Q&A for event=${eventId}`);

      await this.roomsService.activateByEventId(eventId);

      // Create a Q&A room if it doesn't exist
      const existingQa = await this.roomsService.findByEventIdAndType(eventId, 'event_qa');
      if (!existingQa) {
        await this.roomsService.createRoom(eventId, 'event_qa', `${title} – Q&A`);
      }
    } catch (error) {
      this.logger.error(
        'Failed to handle event.live',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private async handleEventEnded(rawMessage: string): Promise<void> {
    try {
      const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<EventEndedEvent>;
      const { eventId } = envelope.data;

      this.logger.log(`Handling event.ended – deactivating rooms for event=${eventId}`);
      await this.roomsService.deactivateByEventId(eventId);
    } catch (error) {
      this.logger.error(
        'Failed to handle event.ended',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private async handleEventCancelled(rawMessage: string): Promise<void> {
    try {
      const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<EventCancelledEvent>;
      const { eventId } = envelope.data;

      this.logger.log(`Handling event.cancelled – deactivating rooms for event=${eventId}`);
      await this.roomsService.deactivateByEventId(eventId);
    } catch (error) {
      this.logger.error(
        'Failed to handle event.cancelled',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private async handleTicketReserved(rawMessage: string): Promise<void> {
    try {
      const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<TicketReservedEvent>;
      const { eventId, userId } = envelope.data;

      this.logger.log(
        `Handling ticket.reserved – auto-joining user=${userId} to chat for event=${eventId}`,
      );

      const room = await this.roomsService.findByEventIdAndType(eventId, 'event_chat');
      if (room) {
        await this.roomsService.addParticipant(room.roomId, userId, 'attendee');
      }
    } catch (error) {
      this.logger.error(
        'Failed to handle ticket.reserved',
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
