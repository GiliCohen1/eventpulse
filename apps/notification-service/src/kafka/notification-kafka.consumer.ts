import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaConsumer, KAFKA_TOPICS, CONSUMER_GROUPS } from '@eventpulse/kafka-common';
import type {
  KafkaEventEnvelope,
  UserRegisteredEvent,
  EventPublishedEvent,
  EventUpdatedEvent,
  EventCancelledEvent,
  EventLiveEvent,
  TicketReservedEvent,
  TicketConfirmedEvent,
  TicketCancelledEvent,
  NotificationSendEvent,
} from '@eventpulse/shared-types';
import { NotificationsService } from '../notifications/notifications.service.js';
import { EmailService } from '../email/email.service.js';
import { PreferencesService } from '../preferences/preferences.service.js';

@Injectable()
export class NotificationKafkaConsumer implements OnModuleInit {
  private readonly logger = new Logger(NotificationKafkaConsumer.name);

  constructor(
    private readonly kafkaConsumer: KafkaConsumer,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
    private readonly preferencesService: PreferencesService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.kafkaConsumer.consume(
      CONSUMER_GROUPS.NOTIFICATION_SERVICE,
      [
        KAFKA_TOPICS.USER_REGISTERED,
        KAFKA_TOPICS.EVENT_PUBLISHED,
        KAFKA_TOPICS.EVENT_UPDATED,
        KAFKA_TOPICS.EVENT_CANCELLED,
        KAFKA_TOPICS.EVENT_LIVE,
        KAFKA_TOPICS.TICKET_RESERVED,
        KAFKA_TOPICS.TICKET_CONFIRMED,
        KAFKA_TOPICS.TICKET_CANCELLED,
        KAFKA_TOPICS.NOTIFICATION_SEND,
      ],
      async (payload) => {
        const { topic, message } = payload;
        const value = message.value?.toString();

        if (!value) {
          return;
        }

        switch (topic) {
          case KAFKA_TOPICS.USER_REGISTERED:
            await this.handleUserRegistered(value);
            break;
          case KAFKA_TOPICS.EVENT_PUBLISHED:
            await this.handleEventPublished(value);
            break;
          case KAFKA_TOPICS.EVENT_UPDATED:
            await this.handleEventUpdated(value);
            break;
          case KAFKA_TOPICS.EVENT_CANCELLED:
            await this.handleEventCancelled(value);
            break;
          case KAFKA_TOPICS.EVENT_LIVE:
            await this.handleEventLive(value);
            break;
          case KAFKA_TOPICS.TICKET_RESERVED:
            await this.handleTicketReserved(value);
            break;
          case KAFKA_TOPICS.TICKET_CONFIRMED:
            await this.handleTicketConfirmed(value);
            break;
          case KAFKA_TOPICS.TICKET_CANCELLED:
            await this.handleTicketCancelled(value);
            break;
          case KAFKA_TOPICS.NOTIFICATION_SEND:
            await this.handleNotificationSend(value);
            break;
          default:
            this.logger.warn(`Unhandled topic: ${topic}`);
        }
      },
    );

    this.logger.log('Notification Kafka consumer initialized');
  }

  // ── user.registered ──

  private async handleUserRegistered(rawMessage: string): Promise<void> {
    try {
      const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<UserRegisteredEvent>;
      const { userId, email, firstName } = envelope.data;

      this.logger.log(`Handling user.registered – user=${userId}`);

      // Create default notification preferences
      await this.preferencesService.createDefault(userId);

      // Send welcome email
      await this.emailService.sendWelcomeEmail(email, firstName);

      // Create in-app welcome notification
      await this.notificationsService.create({
        userId,
        type: 'welcome',
        title: 'Welcome to EventPulse!',
        body: `Hi ${firstName}, thanks for joining EventPulse. Start exploring events now!`,
        data: { email },
        channels: { inApp: true, email: true },
      });
    } catch (error) {
      this.logger.error(
        'Failed to handle user.registered',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // ── event.published ──

  private async handleEventPublished(rawMessage: string): Promise<void> {
    try {
      const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<EventPublishedEvent>;
      const { eventId, title, organizerId, categoryName } = envelope.data;

      this.logger.log(`Handling event.published – event=${eventId}`);

      // Notify the organizer that their event is now published
      await this.notificationsService.create({
        userId: organizerId,
        type: 'event_updated',
        title: 'Event Published',
        body: `Your event "${title}" is now live and visible to attendees.`,
        data: { eventId, categoryName },
        channels: { inApp: true, email: false },
      });
    } catch (error) {
      this.logger.error(
        'Failed to handle event.published',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // ── event.updated ──

  private async handleEventUpdated(rawMessage: string): Promise<void> {
    try {
      const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<EventUpdatedEvent>;
      const { eventId, title, changes, notifyAttendees } = envelope.data;

      this.logger.log(
        `Handling event.updated – event=${eventId} notifyAttendees=${notifyAttendees}`,
      );

      if (!notifyAttendees) {
        return;
      }

      const changedFields = changes.map((c) => c.field).join(', ');

      // In a full implementation we would look up attendee user IDs.
      // For now we create a notification for the organizer as a placeholder.
      await this.notificationsService.create({
        userId: envelope.data.organizerId,
        type: 'event_updated',
        title: 'Event Updated',
        body: `"${title}" has been updated. Changed: ${changedFields}.`,
        data: { eventId, changes },
        channels: { inApp: true, email: true },
      });
    } catch (error) {
      this.logger.error(
        'Failed to handle event.updated',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // ── event.cancelled ──

  private async handleEventCancelled(rawMessage: string): Promise<void> {
    try {
      const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<EventCancelledEvent>;
      const { eventId, title, reason, registeredUserIds } = envelope.data;

      this.logger.log(
        `Handling event.cancelled – event=${eventId} users=${registeredUserIds.length}`,
      );

      // Notify each registered attendee
      const promises = registeredUserIds.map(async (userId) => {
        await this.notificationsService.create({
          userId,
          type: 'event_cancelled',
          title: 'Event Cancelled',
          body: `"${title}" has been cancelled. Reason: ${reason}`,
          data: { eventId, reason },
          channels: { inApp: true, email: true },
        });
      });

      await Promise.all(promises);
    } catch (error) {
      this.logger.error(
        'Failed to handle event.cancelled',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // ── event.live ──

  private async handleEventLive(rawMessage: string): Promise<void> {
    try {
      const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<EventLiveEvent>;
      const { eventId, title, organizerId } = envelope.data;

      this.logger.log(`Handling event.live – event=${eventId}`);

      // Notify organizer that event is now live
      await this.notificationsService.create({
        userId: organizerId,
        type: 'event_live',
        title: 'Event Is Live!',
        body: `"${title}" is now live. Attendees can join the event.`,
        data: { eventId },
        channels: { inApp: true, email: false },
      });
    } catch (error) {
      this.logger.error(
        'Failed to handle event.live',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // ── ticket.reserved ──

  private async handleTicketReserved(rawMessage: string): Promise<void> {
    try {
      const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<TicketReservedEvent>;
      const { userId, eventTitle, ticketTierName, registrationId } = envelope.data;

      this.logger.log(`Handling ticket.reserved – registration=${registrationId}`);

      await this.notificationsService.create({
        userId,
        type: 'ticket_confirmed',
        title: 'Ticket Reserved',
        body: `Your ${ticketTierName} ticket for "${eventTitle}" is reserved. Complete payment to confirm.`,
        data: { registrationId, eventTitle, ticketTierName },
        channels: { inApp: true, email: false },
      });
    } catch (error) {
      this.logger.error(
        'Failed to handle ticket.reserved',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // ── ticket.confirmed ──

  private async handleTicketConfirmed(rawMessage: string): Promise<void> {
    try {
      const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<TicketConfirmedEvent>;
      const {
        userId,
        userEmail,
        userFirstName,
        eventTitle,
        ticketTierName,
        ticketCode,
        qrCodeUrl,
        registrationId,
      } = envelope.data;

      this.logger.log(`Handling ticket.confirmed – registration=${registrationId}`);

      // Send confirmation email with QR code
      await this.emailService.sendTicketConfirmation(
        userEmail,
        userFirstName,
        eventTitle,
        ticketTierName,
        ticketCode,
        qrCodeUrl,
      );

      // In-app notification
      await this.notificationsService.create({
        userId,
        type: 'ticket_confirmed',
        title: 'Ticket Confirmed!',
        body: `Your ${ticketTierName} ticket for "${eventTitle}" is confirmed. Check your email for the QR code.`,
        data: { registrationId, eventTitle, ticketCode, qrCodeUrl },
        channels: { inApp: true, email: true },
      });
    } catch (error) {
      this.logger.error(
        'Failed to handle ticket.confirmed',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // ── ticket.cancelled ──

  private async handleTicketCancelled(rawMessage: string): Promise<void> {
    try {
      const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<TicketCancelledEvent>;
      const { userId, eventTitle, reason, registrationId } = envelope.data;

      this.logger.log(`Handling ticket.cancelled – registration=${registrationId}`);

      await this.notificationsService.create({
        userId,
        type: 'event_cancelled',
        title: 'Ticket Cancelled',
        body: `Your ticket for "${eventTitle}" has been cancelled. Reason: ${reason}`,
        data: { registrationId, eventTitle, reason },
        channels: { inApp: true, email: true },
      });
    } catch (error) {
      this.logger.error(
        'Failed to handle ticket.cancelled',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // ── notification.send (generic) ──

  private async handleNotificationSend(rawMessage: string): Promise<void> {
    try {
      const envelope = JSON.parse(rawMessage) as KafkaEventEnvelope<NotificationSendEvent>;
      const { userId, type, title, body, data, channels } = envelope.data;

      this.logger.log(`Handling notification.send – user=${userId} type=${type}`);

      await this.notificationsService.create({
        userId,
        type: type as import('@eventpulse/shared-types').NotificationType,
        title,
        body,
        data,
        channels: {
          inApp: channels.includes('inApp'),
          email: channels.includes('email'),
          push: channels.includes('push'),
        },
      });
    } catch (error) {
      this.logger.error(
        'Failed to handle notification.send',
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
