import { Injectable, Logger } from '@nestjs/common';
import { KafkaProducer, KAFKA_TOPICS } from '@eventpulse/kafka-common';
import type { ChatMessageSentEvent } from '@eventpulse/shared-types';

const SOURCE = 'chat-service';

@Injectable()
export class ChatKafkaProducer {
  private readonly logger = new Logger(ChatKafkaProducer.name);

  constructor(private readonly kafkaProducer: KafkaProducer) {}

  async publishMessageSent(event: ChatMessageSentEvent): Promise<void> {
    this.logger.log(`Publishing chat.message_sent for messageId=${event.messageId}`);
    await this.kafkaProducer.publish(
      KAFKA_TOPICS.CHAT_MESSAGE_SENT,
      'chat.message_sent',
      event,
      SOURCE,
      event.roomId,
    );
  }
}
