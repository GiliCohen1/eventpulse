import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from './schemas/room.schema.js';
import { RoomsController } from './rooms.controller.js';
import { RoomsService } from './rooms.service.js';
import { ChatKafkaConsumer } from '../kafka/chat-kafka.consumer.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }])],
  controllers: [RoomsController],
  providers: [RoomsService, ChatKafkaConsumer],
  exports: [RoomsService],
})
export class RoomsModule {}
