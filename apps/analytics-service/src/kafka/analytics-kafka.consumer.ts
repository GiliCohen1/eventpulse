import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaConsumer, KAFKA_TOPICS, CONSUMER_GROUPS } from '@eventpulse/kafka-common';
import type {
  KafkaEventEnvelope,
  UserRegisteredEvent,
  UserUpdatedEvent,
  EventCreatedEvent,
  EventPublishedEvent,
  EventUpdatedEvent,
  EventCancelledEvent,
  EventLiveEvent,
  EventEndedEvent,
  TicketReservedEvent,
  TicketConfirmedEvent,
  TicketCancelledEvent,
  TicketCheckedInEvent,
  PaymentCompletedEvent,
  ChatMessageSentEvent,
  AnalyticsTrackEvent,
} from '@eventpulse/shared-types';
import { TrackingService } from '../tracking/tracking.service.js';
import { AggregationsService } from '../aggregations/aggregations.service.js';

@Injectable()
export class AnalyticsKafkaConsumer implements OnModuleInit {
  private readonly logger = new Logger(AnalyticsKafkaConsumer.name);

  constructor(
    private readonly kafkaConsumer: KafkaConsumer,
    private readonly trackingService: TrackingService,
    private readonly aggregationsService: AggregationsService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.kafkaConsumer.consume(
      CONSUMER_GROUPS.ANALYTICS_SERVICE,
      [
        KAFKA_TOPICS.USER_REGISTERED,
        KAFKA_TOPICS.USER_UPDATED,
        KAFKA_TOPICS.EVENT_CREATED,
        KAFKA_TOPICS.EVENT_PUBLISHED,
        KAFKA_TOPICS.EVENT_UPDATED,
        KAFKA_TOPICS.EVENT_CANCELLED,
        KAFKA_TOPICS.EVENT_LIVE,
        KAFKA_TOPICS.EVENT_ENDED,
        KAFKA_TOPICS.TICKET_RESERVED,
        KAFKA_TOPICS.TICKET_CONFIRMED,
        KAFKA_TOPICS.TICKET_CANCELLED,
        KAFKA_TOPICS.TICKET_CHECKED_IN,
        KAFKA_TOPICS.PAYMENT_COMPLETED,
        KAFKA_TOPICS.CHAT_MESSAGE_SENT,
        KAFKA_TOPICS.ANALYTICS_TRACK,
      ],
      async (payload) => {
        const { topic, message } = payload;
        const value = message.value?.toString();

        if (!value) {
          return;
        }

        try {
          await this.routeMessage(topic, value);
        } catch (error) {
          this.logger.error(
            `Error processing ${topic}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      },
    );

    this.logger.log('Analytics Kafka consumer initialized – subscribed to all topics');
  }

  private async routeMessage(topic: string, rawMessage: string): Promise<void> {
    switch (topic) {
      case KAFKA_TOPICS.USER_REGISTERED:
        await this.handleUserRegistered(rawMessage);
        break;
      case KAFKA_TOPICS.USER_UPDATED:
        await this.handleUserUpdated(rawMessage);
        break;
      case KAFKA_TOPICS.EVENT_CREATED:
        await this.handleEventCreated(rawMessage);
        break;
      case KAFKA_TOPICS.EVENT_PUBLISHED:
        await this.handleEventPublished(rawMessage);
        break;
      case KAFKA_TOPICS.EVENT_UPDATED:
        await this.handleEventUpdated(rawMessage);
        break;
      case KAFKA_TOPICS.EVENT_CANCELLED:
        await this.handleEventCancelled(rawMessage);
        break;
      case KAFKA_TOPICS.EVENT_LIVE:
        await this.handleEventLive(rawMessage);
        break;
      case KAFKA_TOPICS.EVENT_ENDED:
        await this.handleEventEnded(rawMessage);
        break;
      case KAFKA_TOPICS.TICKET_RESERVED:
        await this.handleTicketReserved(rawMessage);
        break;
      case KAFKA_TOPICS.TICKET_CONFIRMED:
        await this.handleTicketConfirmed(rawMessage);
        break;
      case KAFKA_TOPICS.TICKET_CANCELLED:
        await this.handleTicketCancelled(rawMessage);
        break;
      case KAFKA_TOPICS.TICKET_CHECKED_IN:
        await this.handleTicketCheckedIn(rawMessage);
        break;
      case KAFKA_TOPICS.PAYMENT_COMPLETED:
        await this.handlePaymentCompleted(rawMessage);
        break;
      case KAFKA_TOPICS.CHAT_MESSAGE_SENT:
        await this.handleChatMessageSent(rawMessage);
        break;
      case KAFKA_TOPICS.ANALYTICS_TRACK:
        await this.handleAnalyticsTrack(rawMessage);
        break;
      default:
        this.logger.warn(`Unhandled topic: ${topic}`);
    }
  }

  // ── User Events ──

  private async handleUserRegistered(rawMessage: string): Promise<void> {
    const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<UserRegisteredEvent>;
    const { userId, role, registeredAt } = envelope.data;

    await this.trackingService.track({
      eventType: 'user.registered',
      timestamp: new Date(registeredAt),
      actor: { userId, sessionId: '', userAgent: '', ip: '' },
      target: { entityType: 'user', entityId: userId, metadata: { role } },
    });

    this.logger.debug(`Tracked user.registered for userId=${userId}`);
  }

  private async handleUserUpdated(rawMessage: string): Promise<void> {
    const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<UserUpdatedEvent>;
    const { userId, changes, updatedAt } = envelope.data;

    await this.trackingService.track({
      eventType: 'user.updated',
      timestamp: new Date(updatedAt),
      actor: { userId, sessionId: '', userAgent: '', ip: '' },
      target: {
        entityType: 'user',
        entityId: userId,
        metadata: { changedFields: changes.map((c) => c.field) },
      },
    });

    this.logger.debug(`Tracked user.updated for userId=${userId}`);
  }

  // ── Event Events ──

  private async handleEventCreated(rawMessage: string): Promise<void> {
    const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<EventCreatedEvent>;
    const { eventId, organizerId, title, createdAt } = envelope.data;

    await this.trackingService.track({
      eventType: 'event.created',
      timestamp: new Date(createdAt),
      actor: { userId: organizerId, sessionId: '', userAgent: '', ip: '' },
      target: { entityType: 'event', entityId: eventId, metadata: { title } },
    });

    this.logger.debug(`Tracked event.created for eventId=${eventId}`);
  }

  private async handleEventPublished(rawMessage: string): Promise<void> {
    const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<EventPublishedEvent>;
    const { eventId, organizerId, title, publishedAt, maxCapacity } = envelope.data;

    await this.trackingService.track({
      eventType: 'event.published',
      timestamp: new Date(publishedAt),
      actor: { userId: organizerId, sessionId: '', userAgent: '', ip: '' },
      target: { entityType: 'event', entityId: eventId, metadata: { title, maxCapacity } },
    });

    this.logger.debug(`Tracked event.published for eventId=${eventId}`);
  }

  private async handleEventUpdated(rawMessage: string): Promise<void> {
    const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<EventUpdatedEvent>;
    const { eventId, organizerId, updatedAt, changes } = envelope.data;

    await this.trackingService.track({
      eventType: 'event.updated',
      timestamp: new Date(updatedAt),
      actor: { userId: organizerId, sessionId: '', userAgent: '', ip: '' },
      target: {
        entityType: 'event',
        entityId: eventId,
        metadata: { changedFields: changes.map((c) => c.field) },
      },
    });

    this.logger.debug(`Tracked event.updated for eventId=${eventId}`);
  }

  private async handleEventCancelled(rawMessage: string): Promise<void> {
    const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<EventCancelledEvent>;
    const { eventId, organizerId, reason, cancelledAt, registeredUserIds } = envelope.data;

    await this.trackingService.track({
      eventType: 'event.cancelled',
      timestamp: new Date(cancelledAt),
      actor: { userId: organizerId, sessionId: '', userAgent: '', ip: '' },
      target: {
        entityType: 'event',
        entityId: eventId,
        metadata: { reason, affectedUsers: registeredUserIds.length },
      },
    });

    const dateStr = new Date(cancelledAt).toISOString().split('T')[0];
    await this.aggregationsService.incrementMetric('event', eventId, dateStr, 'cancellations');

    this.logger.debug(`Tracked event.cancelled for eventId=${eventId}`);
  }

  private async handleEventLive(rawMessage: string): Promise<void> {
    const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<EventLiveEvent>;
    const { eventId, organizerId, startedAt } = envelope.data;

    await this.trackingService.track({
      eventType: 'event.live',
      timestamp: new Date(startedAt),
      actor: { userId: organizerId, sessionId: '', userAgent: '', ip: '' },
      target: { entityType: 'event', entityId: eventId },
    });

    this.logger.debug(`Tracked event.live for eventId=${eventId}`);
  }

  private async handleEventEnded(rawMessage: string): Promise<void> {
    const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<EventEndedEvent>;
    const { eventId, organizerId, endedAt, totalAttendees, checkedInCount } = envelope.data;

    await this.trackingService.track({
      eventType: 'event.ended',
      timestamp: new Date(endedAt),
      actor: { userId: organizerId, sessionId: '', userAgent: '', ip: '' },
      target: {
        entityType: 'event',
        entityId: eventId,
        metadata: { totalAttendees, checkedInCount },
      },
    });

    this.logger.debug(`Tracked event.ended for eventId=${eventId}`);
  }

  // ── Ticket Events ──

  private async handleTicketReserved(rawMessage: string): Promise<void> {
    const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<TicketReservedEvent>;
    const { registrationId, userId, eventId, ticketTierId, ticketTierName, price, reservedAt } =
      envelope.data;

    await this.trackingService.track({
      eventType: 'ticket.reserved',
      timestamp: new Date(reservedAt),
      actor: { userId, sessionId: '', userAgent: '', ip: '' },
      target: {
        entityType: 'event',
        entityId: eventId,
        metadata: { registrationId, tierId: ticketTierId, tierName: ticketTierName, price },
      },
    });

    const dateStr = new Date(reservedAt).toISOString().split('T')[0];
    await this.aggregationsService.incrementMetric('event', eventId, dateStr, 'registrations');

    this.logger.debug(`Tracked ticket.reserved for eventId=${eventId} userId=${userId}`);
  }

  private async handleTicketConfirmed(rawMessage: string): Promise<void> {
    const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<TicketConfirmedEvent>;
    const { registrationId, userId, eventId, ticketTierId, amount, confirmedAt } = envelope.data;

    await this.trackingService.track({
      eventType: 'ticket.confirmed',
      timestamp: new Date(confirmedAt),
      actor: { userId, sessionId: '', userAgent: '', ip: '' },
      target: {
        entityType: 'event',
        entityId: eventId,
        metadata: { registrationId, tierId: ticketTierId, amount },
      },
    });

    this.logger.debug(`Tracked ticket.confirmed for eventId=${eventId} userId=${userId}`);
  }

  private async handleTicketCancelled(rawMessage: string): Promise<void> {
    const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<TicketCancelledEvent>;
    const { registrationId, userId, eventId, reason, cancelledAt } = envelope.data;

    await this.trackingService.track({
      eventType: 'ticket.cancelled',
      timestamp: new Date(cancelledAt),
      actor: { userId, sessionId: '', userAgent: '', ip: '' },
      target: {
        entityType: 'event',
        entityId: eventId,
        metadata: { registrationId, reason },
      },
    });

    const dateStr = new Date(cancelledAt).toISOString().split('T')[0];
    await this.aggregationsService.incrementMetric('event', eventId, dateStr, 'cancellations');

    this.logger.debug(`Tracked ticket.cancelled for eventId=${eventId} userId=${userId}`);
  }

  private async handleTicketCheckedIn(rawMessage: string): Promise<void> {
    const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<TicketCheckedInEvent>;
    const { registrationId, userId, eventId, checkedInAt } = envelope.data;

    await this.trackingService.track({
      eventType: 'ticket.checked_in',
      timestamp: new Date(checkedInAt),
      actor: { userId, sessionId: '', userAgent: '', ip: '' },
      target: {
        entityType: 'event',
        entityId: eventId,
        metadata: { registrationId },
      },
    });

    this.logger.debug(`Tracked ticket.checked_in for eventId=${eventId} userId=${userId}`);
  }

  // ── Payment Events ──

  private async handlePaymentCompleted(rawMessage: string): Promise<void> {
    const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<PaymentCompletedEvent>;
    const { paymentId, userId, eventId, amount, currency, method, completedAt } = envelope.data;

    await this.trackingService.track({
      eventType: 'payment.completed',
      timestamp: new Date(completedAt),
      actor: { userId, sessionId: '', userAgent: '', ip: '' },
      target: {
        entityType: 'event',
        entityId: eventId,
        metadata: { paymentId, amount, currency, method },
      },
    });

    this.logger.debug(`Tracked payment.completed for eventId=${eventId} paymentId=${paymentId}`);
  }

  // ── Chat Events ──

  private async handleChatMessageSent(rawMessage: string): Promise<void> {
    const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<ChatMessageSentEvent>;
    const { messageId, roomId, eventId, senderId, type, contentLength, sentAt } = envelope.data;

    await this.trackingService.track({
      eventType: 'chat.message_sent',
      timestamp: new Date(sentAt),
      actor: { userId: senderId, sessionId: '', userAgent: '', ip: '' },
      target: {
        entityType: 'event',
        entityId: eventId,
        metadata: { messageId, roomId, type, contentLength },
      },
    });

    const dateStr = new Date(sentAt).toISOString().split('T')[0];
    await this.aggregationsService.incrementMetric('event', eventId, dateStr, 'chatMessages');

    this.logger.debug(`Tracked chat.message_sent for eventId=${eventId} roomId=${roomId}`);
  }

  // ── Generic Analytics Track ──

  private async handleAnalyticsTrack(rawMessage: string): Promise<void> {
    const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<AnalyticsTrackEvent>;
    const { eventType, actorId, sessionId, target, context, timestamp } = envelope.data;

    await this.trackingService.track({
      eventType,
      timestamp: new Date(timestamp),
      actor: { userId: actorId, sessionId, userAgent: '', ip: '' },
      target: {
        entityType: target.entityType,
        entityId: target.entityId,
        metadata: context,
      },
    });

    // Increment real-time metrics if applicable
    const dateStr = new Date(timestamp).toISOString().split('T')[0];
    const metricMap: Record<string, string> = {
      'event.viewed': 'views',
      'event.shared': 'shares',
      'event.registered': 'registrations',
      'event.cancelled': 'cancellations',
    };

    const metric = metricMap[eventType];
    if (metric && target.entityType === 'event') {
      await this.aggregationsService.incrementMetric('event', target.entityId, dateStr, metric);
    }

    this.logger.debug(
      `Tracked analytics.track: type=${eventType} target=${target.entityType}/${target.entityId}`,
    );
  }
}
