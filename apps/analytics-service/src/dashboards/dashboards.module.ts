import { Module } from '@nestjs/common';
import { DashboardsController } from './dashboards.controller.js';
import { DashboardsService } from './dashboards.service.js';
import { AggregationsModule } from '../aggregations/aggregations.module.js';
import { TrackingModule } from '../tracking/tracking.module.js';

@Module({
  imports: [AggregationsModule, TrackingModule],
  controllers: [DashboardsController],
  providers: [DashboardsService],
})
export class DashboardsModule {}
