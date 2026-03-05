import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsEvent, AnalyticsEventSchema } from './schemas/analytics-event.schema.js';
import { UserActivityLog, UserActivityLogSchema } from './schemas/user-activity-log.schema.js';
import { TrackingService } from './tracking.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnalyticsEvent.name, schema: AnalyticsEventSchema },
      { name: UserActivityLog.name, schema: UserActivityLogSchema },
    ]),
  ],
  providers: [TrackingService],
  exports: [TrackingService],
})
export class TrackingModule {}
