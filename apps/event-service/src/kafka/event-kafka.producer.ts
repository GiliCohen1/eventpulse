import { Injectable, Logger } from '@nestjs/common';
import { KafkaProducer, KAFKA_TOPICS } from '@eventpulse/kafka-common';
import type {
  EventCreatedEvent,
  EventPublishedEvent,
  EventUpdatedEvent,
  EventCancelledEvent,
  EventLiveEvent,
  EventEndedEvent,
} from '@eventpulse/shared-types';

const SOURCE = 'event-service';

@Injectable()
export class EventKafkaProducer {
  private readonly logger = new Logger(EventKafkaProducer.name);

  constructor(private readonly kafkaProducer: KafkaProducer) {}

  async publishEventCreated(event: EventCreatedEvent): Promise<void> {
    this.logger.log(`Publishing event.created for eventId=${event.eventId}`);
    await this.kafkaProducer.publish(
      KAFKA_TOPICS.EVENT_CREATED,
      'event.created',
      event,
      SOURCE,
      event.eventId,
    );
  }

  async publishEventPublished(event: EventPublishedEvent): Promise<void> {
    this.logger.log(`Publishing event.published for eventId=${event.eventId}`);
    await this.kafkaProducer.publish(
      KAFKA_TOPICS.EVENT_PUBLISHED,
      'event.published',
      event,
      SOURCE,
      event.eventId,
    );
  }

  async publishEventUpdated(event: EventUpdatedEvent): Promise<void> {
    this.logger.log(`Publishing event.updated for eventId=${event.eventId}`);
    await this.kafkaProducer.publish(
      KAFKA_TOPICS.EVENT_UPDATED,
      'event.updated',
      event,
      SOURCE,
      event.eventId,
    );
  }

  async publishEventCancelled(event: EventCancelledEvent): Promise<void> {
    this.logger.log(`Publishing event.cancelled for eventId=${event.eventId}`);
    await this.kafkaProducer.publish(
      KAFKA_TOPICS.EVENT_CANCELLED,
      'event.cancelled',
      event,
      SOURCE,
      event.eventId,
    );
  }

  async publishEventLive(event: EventLiveEvent): Promise<void> {
    this.logger.log(`Publishing event.live for eventId=${event.eventId}`);
    await this.kafkaProducer.publish(
      KAFKA_TOPICS.EVENT_LIVE,
      'event.live',
      event,
      SOURCE,
      event.eventId,
    );
  }

  async publishEventEnded(event: EventEndedEvent): Promise<void> {
    this.logger.log(`Publishing event.ended for eventId=${event.eventId}`);
    await this.kafkaProducer.publish(
      KAFKA_TOPICS.EVENT_ENDED,
      'event.ended',
      event,
      SOURCE,
      event.eventId,
    );
  }
}
