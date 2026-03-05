import { Injectable, Logger } from '@nestjs/common';
import { KafkaProducer, KAFKA_TOPICS } from '@eventpulse/kafka-common';
import type {
  TicketReservedEvent,
  TicketConfirmedEvent,
  TicketCancelledEvent,
  TicketCheckedInEvent,
  PaymentCompletedEvent,
} from '@eventpulse/shared-types';

const SOURCE = 'ticket-service';

@Injectable()
export class TicketKafkaProducer {
  private readonly logger = new Logger(TicketKafkaProducer.name);

  constructor(private readonly kafkaProducer: KafkaProducer) {}

  async publishTicketReserved(event: TicketReservedEvent): Promise<void> {
    this.logger.log(`Publishing ticket.reserved for registrationId=${event.registrationId}`);
    await this.kafkaProducer.publish(
      KAFKA_TOPICS.TICKET_RESERVED,
      'ticket.reserved',
      event,
      SOURCE,
      event.registrationId,
    );
  }

  async publishTicketConfirmed(event: TicketConfirmedEvent): Promise<void> {
    this.logger.log(`Publishing ticket.confirmed for registrationId=${event.registrationId}`);
    await this.kafkaProducer.publish(
      KAFKA_TOPICS.TICKET_CONFIRMED,
      'ticket.confirmed',
      event,
      SOURCE,
      event.registrationId,
    );
  }

  async publishTicketCancelled(event: TicketCancelledEvent): Promise<void> {
    this.logger.log(`Publishing ticket.cancelled for registrationId=${event.registrationId}`);
    await this.kafkaProducer.publish(
      KAFKA_TOPICS.TICKET_CANCELLED,
      'ticket.cancelled',
      event,
      SOURCE,
      event.registrationId,
    );
  }

  async publishTicketCheckedIn(event: TicketCheckedInEvent): Promise<void> {
    this.logger.log(`Publishing ticket.checked_in for registrationId=${event.registrationId}`);
    await this.kafkaProducer.publish(
      KAFKA_TOPICS.TICKET_CHECKED_IN,
      'ticket.checked_in',
      event,
      SOURCE,
      event.registrationId,
    );
  }

  async publishPaymentCompleted(event: PaymentCompletedEvent): Promise<void> {
    this.logger.log(`Publishing payment.completed for paymentId=${event.paymentId}`);
    await this.kafkaProducer.publish(
      KAFKA_TOPICS.PAYMENT_COMPLETED,
      'payment.completed',
      event,
      SOURCE,
      event.paymentId,
    );
  }
}
