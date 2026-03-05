import { Module } from '@nestjs/common';
import { AnalyticsKafkaConsumer } from './analytics-kafka.consumer.js';
import { TrackingModule } from '../tracking/tracking.module.js';
import { AggregationsModule } from '../aggregations/aggregations.module.js';

@Module({
  imports: [TrackingModule, AggregationsModule],
  providers: [AnalyticsKafkaConsumer],
})
export class AnalyticsKafkaModule {}
