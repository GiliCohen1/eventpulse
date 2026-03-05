import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { KafkaModule } from '@eventpulse/kafka-common';
import { RoomsModule } from './rooms/rooms.module.js';
import { MessagesModule } from './messages/messages.module.js';
import { QaModule } from './qa/qa.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URI', 'mongodb://localhost:27017');
        const dbName = config.get<string>('MONGO_DB_CHAT', 'eventpulse_chat');
        return { uri: `${uri}/${dbName}` };
      },
    }),

    KafkaModule.register({
      clientId: 'chat-service',
      brokers: (process.env['KAFKA_BROKERS'] ?? 'localhost:9092').split(','),
    }),

    RoomsModule,
    MessagesModule,
    QaModule,
  ],
})
export class AppModule {}
