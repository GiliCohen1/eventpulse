import { DynamicModule, Module } from '@nestjs/common';
import { KafkaProducer } from './kafka.producer.js';
import { KafkaConsumer } from './kafka.consumer.js';

export interface KafkaModuleOptions {
  clientId: string;
  brokers: string[];
}

@Module({})
export class KafkaModule {
  static register(options: KafkaModuleOptions): DynamicModule {
    return {
      module: KafkaModule,
      providers: [
        {
          provide: KafkaProducer,
          useFactory: () => new KafkaProducer(options.clientId, options.brokers),
        },
        {
          provide: KafkaConsumer,
          useFactory: () => new KafkaConsumer(options.clientId, options.brokers),
        },
      ],
      exports: [KafkaProducer, KafkaConsumer],
      global: true,
    };
  }
}
