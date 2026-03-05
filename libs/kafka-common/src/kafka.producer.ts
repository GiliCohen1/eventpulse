import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import type { KafkaEventEnvelope } from '@eventpulse/shared-types';

@Injectable()
export class KafkaProducer implements OnModuleInit, OnModuleDestroy {
  private producer: Producer;
  private readonly kafka: Kafka;

  constructor(clientId: string, brokers: string[]) {
    this.kafka = new Kafka({ clientId, brokers });
    this.producer = this.kafka.producer();
  }

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect();
  }

  async publish<T>(
    topic: string,
    eventType: string,
    data: T,
    source: string,
    key?: string,
  ): Promise<void> {
    const envelope: KafkaEventEnvelope<T> = {
      eventId: uuidv4(),
      eventType,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      source,
      correlationId: uuidv4(),
      data,
    };

    const record: ProducerRecord = {
      topic,
      messages: [
        {
          key: key ?? envelope.eventId,
          value: JSON.stringify(envelope),
          headers: {
            'event-type': eventType,
            'correlation-id': envelope.correlationId,
          },
        },
      ],
    };

    await this.producer.send(record);
  }
}
