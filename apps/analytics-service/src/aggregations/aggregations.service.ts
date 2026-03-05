import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DailyAggregation, DailyAggregationDocument } from './schemas/daily-aggregation.schema.js';
import { TrackingService } from '../tracking/tracking.service.js';

@Injectable()
export class AggregationsService {
  private readonly logger = new Logger(AggregationsService.name);

  constructor(
    @InjectModel(DailyAggregation.name)
    private readonly dailyAggregationModel: Model<DailyAggregationDocument>,
    private readonly trackingService: TrackingService,
  ) {}

  async incrementMetric(
    entityType: string,
    entityId: string,
    date: string,
    metric: string,
    value: number = 1,
  ): Promise<DailyAggregationDocument> {
    const update: Record<string, unknown> = {
      $inc: { [`metrics.${metric}`]: value },
    };

    return this.dailyAggregationModel.findOneAndUpdate({ entityType, entityId, date }, update, {
      upsert: true,
      new: true,
    });
  }

  async getDailyAggregation(
    entityType: string,
    entityId: string,
    date: string,
  ): Promise<DailyAggregationDocument | null> {
    return this.dailyAggregationModel.findOne({ entityType, entityId, date }).exec();
  }

  async getAggregationRange(
    entityType: string,
    entityId: string,
    from: string,
    to: string,
  ): Promise<DailyAggregationDocument[]> {
    return this.dailyAggregationModel
      .find({
        entityType,
        entityId,
        date: { $gte: from, $lte: to },
      })
      .sort({ date: 1 })
      .exec();
  }

  async getAggregationSummary(
    entityType: string,
    entityId: string,
    from: string,
    to: string,
  ): Promise<{
    views: number;
    uniqueViews: number;
    registrations: number;
    cancellations: number;
    shares: number;
    chatMessages: number;
    qaQuestions: number;
    reviews: number;
    avgRating: number;
  }> {
    const result = await this.dailyAggregationModel.aggregate([
      {
        $match: {
          entityType,
          entityId,
          date: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: null,
          views: { $sum: '$metrics.views' },
          uniqueViews: { $sum: '$metrics.uniqueViews' },
          registrations: { $sum: '$metrics.registrations' },
          cancellations: { $sum: '$metrics.cancellations' },
          shares: { $sum: '$metrics.shares' },
          chatMessages: { $sum: '$metrics.chatMessages' },
          qaQuestions: { $sum: '$metrics.qaQuestions' },
          reviews: { $sum: '$metrics.reviews' },
          avgRating: { $avg: '$metrics.avgRating' },
        },
      },
    ]);

    if (result.length === 0) {
      return {
        views: 0,
        uniqueViews: 0,
        registrations: 0,
        cancellations: 0,
        shares: 0,
        chatMessages: 0,
        qaQuestions: 0,
        reviews: 0,
        avgRating: 0,
      };
    }

    const row = result[0];
    return {
      views: row.views,
      uniqueViews: row.uniqueViews,
      registrations: row.registrations,
      cancellations: row.cancellations,
      shares: row.shares,
      chatMessages: row.chatMessages,
      qaQuestions: row.qaQuestions,
      reviews: row.reviews,
      avgRating: Math.round((row.avgRating ?? 0) * 100) / 100,
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async runDailyAggregation(): Promise<void> {
    this.logger.log('Starting daily aggregation cron job');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
    const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

    try {
      // Find all distinct entity targets from yesterday's events
      const distinctTargets = await this.getDistinctTargets(dayStart, dayEnd);

      this.logger.log(`Found ${distinctTargets.length} distinct targets for ${dateStr}`);

      for (const target of distinctTargets) {
        await this.computeAggregationForTarget(
          target.entityType,
          target.entityId,
          dateStr,
          dayStart,
          dayEnd,
        );
      }

      this.logger.log(`Daily aggregation completed for ${dateStr}`);
    } catch (error) {
      this.logger.error(
        `Daily aggregation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async getDistinctTargets(
    from: Date,
    to: Date,
  ): Promise<Array<{ entityType: string; entityId: string }>> {
    const result = await this.trackingService.findByTarget('event', '', { from, to, limit: 0 });

    // Use aggregation for distinct targets instead
    const Model = this.dailyAggregationModel;
    const trackingModel = Model.db.model('AnalyticsEvent');

    const targets = await trackingModel.aggregate([
      { $match: { timestamp: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: {
            entityType: '$target.entityType',
            entityId: '$target.entityId',
          },
        },
      },
    ]);

    // Fallback: if the aggregate above returns nothing, return empty
    if (targets.length === 0 && result.length === 0) {
      return [];
    }

    return targets.map((t: { _id: { entityType: string; entityId: string } }) => ({
      entityType: t._id.entityType,
      entityId: t._id.entityId,
    }));
  }

  private async computeAggregationForTarget(
    entityType: string,
    entityId: string,
    dateStr: string,
    dayStart: Date,
    dayEnd: Date,
  ): Promise<void> {
    try {
      const [
        views,
        uniqueViews,
        registrations,
        cancellations,
        shares,
        chatMessages,
        qaQuestions,
        hourlyBreakdown,
        sources,
        geoBreakdown,
      ] = await Promise.all([
        this.trackingService.countByTypeAndTarget(
          'event.viewed',
          entityType,
          entityId,
          dayStart,
          dayEnd,
        ),
        this.trackingService.getUniqueActorCount(
          'event.viewed',
          entityType,
          entityId,
          dayStart,
          dayEnd,
        ),
        this.trackingService.countByTypeAndTarget(
          'event.registered',
          entityType,
          entityId,
          dayStart,
          dayEnd,
        ),
        this.trackingService.countByTypeAndTarget(
          'event.cancelled',
          entityType,
          entityId,
          dayStart,
          dayEnd,
        ),
        this.trackingService.countByTypeAndTarget(
          'event.shared',
          entityType,
          entityId,
          dayStart,
          dayEnd,
        ),
        this.trackingService.countByTypeAndTarget(
          'chat.message_sent',
          entityType,
          entityId,
          dayStart,
          dayEnd,
        ),
        this.trackingService.countByTypeAndTarget(
          'qa.question_asked',
          entityType,
          entityId,
          dayStart,
          dayEnd,
        ),
        this.trackingService.aggregateByHour(entityType, entityId, dayStart, dayEnd),
        this.trackingService.aggregateBySources(entityType, entityId, dayStart, dayEnd),
        this.trackingService.aggregateByGeo(entityType, entityId, dayStart, dayEnd),
      ]);

      await this.dailyAggregationModel.findOneAndUpdate(
        { entityType, entityId, date: dateStr },
        {
          $set: {
            metrics: {
              views,
              uniqueViews,
              registrations,
              cancellations,
              shares,
              chatMessages,
              qaQuestions,
              reviews: 0,
              avgRating: 0,
            },
            hourlyBreakdown,
            sources,
            geoBreakdown,
          },
        },
        { upsert: true, new: true },
      );

      this.logger.debug(`Aggregation computed for ${entityType}/${entityId} on ${dateStr}`);
    } catch (error) {
      this.logger.error(
        `Failed to compute aggregation for ${entityType}/${entityId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
