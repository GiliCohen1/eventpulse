import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity.js';
import { EventTag } from './entities/event-tag.entity.js';
import { EventMedia } from './entities/event-media.entity.js';
import { EventReview } from './entities/event-review.entity.js';
import { TicketTier } from '../ticket-tiers/entities/ticket-tier.entity.js';
import { EventsController } from './events.controller.js';
import { EventsService } from './events.service.js';
import { EventKafkaProducer } from '../kafka/event-kafka.producer.js';
import { EventKafkaConsumer } from '../kafka/event-kafka.consumer.js';

@Module({
  imports: [TypeOrmModule.forFeature([Event, EventTag, EventMedia, EventReview, TicketTier])],
  controllers: [EventsController],
  providers: [EventsService, EventKafkaProducer, EventKafkaConsumer],
  exports: [EventsService],
})
export class EventsModule {}
