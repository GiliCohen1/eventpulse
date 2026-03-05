import { Injectable, Logger } from '@nestjs/common';
import { KafkaProducer, KAFKA_TOPICS } from '@eventpulse/kafka-common';
import type { UserRegisteredEvent, UserUpdatedEvent } from '@eventpulse/shared-types';

const SOURCE = 'user-service';

@Injectable()
export class UserKafkaProducer {
  private readonly logger = new Logger(UserKafkaProducer.name);

  constructor(private readonly kafkaProducer: KafkaProducer) {}

  async publishUserRegistered(event: UserRegisteredEvent): Promise<void> {
    this.logger.log(`Publishing user.registered for userId=${event.userId}`);
    await this.kafkaProducer.publish(
      KAFKA_TOPICS.USER_REGISTERED,
      'user.registered',
      event,
      SOURCE,
      event.userId,
    );
  }

  async publishUserUpdated(event: UserUpdatedEvent): Promise<void> {
    this.logger.log(`Publishing user.updated for userId=${event.userId}`);
    await this.kafkaProducer.publish(
      KAFKA_TOPICS.USER_UPDATED,
      'user.updated',
      event,
      SOURCE,
      event.userId,
    );
  }
}
