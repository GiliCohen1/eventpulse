import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaConsumer } from '@eventpulse/kafka-common';
import { KAFKA_TOPICS } from '@eventpulse/kafka-common';
import { EventsGateway } from './events.gateway.js';

/**
 * Bridges Kafka events to WebSocket clients.
 *
 * Subscribes to relevant Kafka topics and broadcasts
 * real-time updates to connected Socket.io rooms/users.
 */
@Injectable()
export class WsKafkaBridge implements OnModuleInit {
  private readonly logger = new Logger(WsKafkaBridge.name);

  constructor(
    private readonly kafkaConsumer: KafkaConsumer,
    private readonly gateway: EventsGateway,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.kafkaConsumer.consume(
      'ws-bridge-group',
      [
        KAFKA_TOPICS.EVENT_LIVE,
        KAFKA_TOPICS.EVENT_ENDED,
        KAFKA_TOPICS.EVENT_CANCELLED,
        KAFKA_TOPICS.EVENT_UPDATED,
        KAFKA_TOPICS.TICKET_CONFIRMED,
        KAFKA_TOPICS.TICKET_CANCELLED,
        KAFKA_TOPICS.CHAT_MESSAGE_SENT,
        KAFKA_TOPICS.NOTIFICATION_SEND,
      ],
      async ({ topic, message }) => {
        try {
          const raw = message.value?.toString();
          if (!raw) return;
          const envelope = JSON.parse(raw);
          const payload = envelope.payload ?? envelope;

          switch (topic) {
            case KAFKA_TOPICS.EVENT_LIVE:
              this.broadcastEventStatus(payload.eventId, 'live', payload);
              break;

            case KAFKA_TOPICS.EVENT_ENDED:
              this.broadcastEventStatus(payload.eventId, 'ended', payload);
              break;

            case KAFKA_TOPICS.EVENT_CANCELLED:
              this.broadcastEventStatus(payload.eventId, 'cancelled', payload);
              break;

            case KAFKA_TOPICS.EVENT_UPDATED:
              this.broadcastToEvent(payload.eventId, 'event:updated', payload);
              break;

            case KAFKA_TOPICS.TICKET_CONFIRMED:
              this.broadcastToUser(payload.userId, 'ticket:confirmed', payload);
              // Also update the event room with new count
              if (payload.eventId) {
                this.broadcastToEvent(payload.eventId, 'event:registration_count', {
                  eventId: payload.eventId,
                  registeredCount: payload.registeredCount,
                });
              }
              break;

            case KAFKA_TOPICS.TICKET_CANCELLED:
              this.broadcastToUser(payload.userId, 'ticket:cancelled', payload);
              break;

            case KAFKA_TOPICS.CHAT_MESSAGE_SENT:
              if (payload.roomId) {
                this.gateway.server.to(payload.roomId).emit('chat:message', payload);
              }
              break;

            case KAFKA_TOPICS.NOTIFICATION_SEND:
              if (payload.userId) {
                this.broadcastToUser(payload.userId, 'notification:new', {
                  userId: payload.userId,
                  type: payload.type,
                  title: payload.title,
                  body: payload.body,
                  data: payload.data,
                  createdAt: new Date().toISOString(),
                });
              }
              break;
          }
        } catch (error) {
          this.logger.error(
            `Failed to bridge Kafka→WS [${topic}]: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      },
    );

    this.logger.log('WS-Kafka bridge initialized — listening for real-time events');
  }

  /** Broadcast an event status change to all users viewing/attending this event */
  private broadcastEventStatus(eventId: string, status: string, data: Record<string, unknown>): void {
    const eventRoom = `event_chat:${eventId}`;
    const qaRoom = `event_qa:${eventId}`;

    const payload = { eventId, status, ...data, timestamp: new Date().toISOString() };

    this.gateway.server.to(eventRoom).emit('event:status_change', payload);
    this.gateway.server.to(qaRoom).emit('event:status_change', payload);

    // Also broadcast globally for event listings
    this.gateway.server.emit('event:status_change', payload);

    this.logger.debug(`Broadcast event:status_change [${status}] for ${eventId}`);
  }

  /** Broadcast to a specific event room */
  private broadcastToEvent(eventId: string, event: string, data: Record<string, unknown>): void {
    const room = `event_chat:${eventId}`;
    this.gateway.server.to(room).emit(event, data);
  }

  /** Broadcast to a specific user by joining them in their own user room */
  private broadcastToUser(userId: string, event: string, data: Record<string, unknown>): void {
    // Each connected socket with this userId receives the event
    const sockets = this.gateway.server.sockets.sockets;
    for (const [, socket] of sockets) {
      if ((socket as any).data?.userId === userId) {
        socket.emit(event, data);
      }
    }
  }
}
