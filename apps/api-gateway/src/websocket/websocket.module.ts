import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaModule } from '@eventpulse/kafka-common';
import { EventsGateway } from './events.gateway.js';
import { WsKafkaBridge } from './ws-kafka.bridge.js';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
    KafkaModule.register({
      clientId: 'api-gateway',
      brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
    }),
  ],
  providers: [EventsGateway, WsKafkaBridge],
  exports: [EventsGateway],
})
export class WebsocketModule {}
