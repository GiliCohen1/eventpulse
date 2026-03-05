import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { KafkaModule } from '@eventpulse/kafka-common';
import { NotificationsModule } from './notifications/notifications.module.js';
import { EmailModule } from './email/email.module.js';
import { PreferencesModule } from './preferences/preferences.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URI', 'mongodb://localhost:27017');
        const dbName = config.get<string>('MONGO_DB_NOTIFICATIONS', 'eventpulse_notifications');
        return { uri: `${uri}/${dbName}` };
      },
    }),

    KafkaModule.register({
      clientId: 'notification-service',
      brokers: (process.env['KAFKA_BROKERS'] ?? 'localhost:9092').split(','),
    }),

    NotificationsModule,
    EmailModule,
    PreferencesModule,
  ],
})
export class AppModule {}
