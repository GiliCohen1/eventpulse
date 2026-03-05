import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { KafkaModule } from '@eventpulse/kafka-common';
import { TrackingModule } from './tracking/tracking.module.js';
import { AggregationsModule } from './aggregations/aggregations.module.js';
import { DashboardsModule } from './dashboards/dashboards.module.js';
import { AnalyticsKafkaModule } from './kafka/analytics-kafka.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URI', 'mongodb://localhost:27017');
        const dbName = config.get<string>('MONGO_DB_ANALYTICS', 'eventpulse_analytics');
        return { uri: `${uri}/${dbName}` };
      },
    }),

    ScheduleModule.forRoot(),

    KafkaModule.register({
      clientId: 'analytics-service',
      brokers: (process.env['KAFKA_BROKERS'] ?? 'localhost:9092').split(','),
    }),

    TrackingModule,
    AggregationsModule,
    DashboardsModule,
    AnalyticsKafkaModule,
  ],
})
export class AppModule {}
