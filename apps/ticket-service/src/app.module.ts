import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KafkaModule } from '@eventpulse/kafka-common';
import { RegistrationsModule } from './registrations/registrations.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { QrCodesModule } from './qr-codes/qr-codes.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('POSTGRES_HOST', 'localhost'),
        port: config.get<number>('POSTGRES_PORT', 5432),
        username: config.get<string>('POSTGRES_USER', 'eventpulse'),
        password: config.get<string>('POSTGRES_PASSWORD', 'changeme_postgres'),
        database: config.get<string>('POSTGRES_DB', 'eventpulse'),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') === 'development',
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),

    KafkaModule.register({
      clientId: 'ticket-service',
      brokers: (process.env['KAFKA_BROKERS'] ?? 'localhost:9092').split(','),
    }),

    RegistrationsModule,
    PaymentsModule,
    QrCodesModule,
  ],
})
export class AppModule {}
