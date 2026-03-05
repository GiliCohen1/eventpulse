import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyAggregation, DailyAggregationSchema } from './schemas/daily-aggregation.schema.js';
import { AggregationsService } from './aggregations.service.js';
import { TrackingModule } from '../tracking/tracking.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DailyAggregation.name, schema: DailyAggregationSchema }]),
    TrackingModule,
  ],
  providers: [AggregationsService],
  exports: [AggregationsService],
})
export class AggregationsModule {}
