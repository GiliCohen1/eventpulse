import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schemas/message.schema.js';
import { MessagesController } from './messages.controller.js';
import { MessagesService } from './messages.service.js';
import { RoomsModule } from '../rooms/rooms.module.js';
import { ChatKafkaProducer } from '../kafka/chat-kafka.producer.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    RoomsModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService, ChatKafkaProducer],
  exports: [MessagesService],
})
export class MessagesModule {}
