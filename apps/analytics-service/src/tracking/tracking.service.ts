import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AnalyticsEvent, AnalyticsEventDocument } from './schemas/analytics-event.schema.js';
import { UserActivityLog, UserActivityLogDocument } from './schemas/user-activity-log.schema.js';

export interface TrackEventInput {
  eventType: string;
  timestamp?: Date;
  actor: {
    userId: string | null;
    sessionId: string;
    userAgent: string;
    ip: string;
  };
  target: {
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
  };
  context?: {
    source?: string;
    referrer?: string | null;
    utm?: {
      source?: string | null;
      medium?: string | null;
      campaign?: string | null;
    };
  };
  geo?: {
    country?: string | null;
    city?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
}

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(
    @InjectModel(AnalyticsEvent.name)
    private readonly analyticsEventModel: Model<AnalyticsEventDocument>,
    @InjectModel(UserActivityLog.name)
    private readonly userActivityLogModel: Model<UserActivityLogDocument>,
  ) {}

  async track(input: TrackEventInput): Promise<AnalyticsEventDocument> {
    const doc = new this.analyticsEventModel({
      eventType: input.eventType,
      timestamp: input.timestamp ?? new Date(),
      actor: {
        userId: input.actor.userId,
        sessionId: input.actor.sessionId,
        userAgent: input.actor.userAgent,
        ip: input.actor.ip,
      },
      target: {
        entityType: input.target.entityType,
        entityId: input.target.entityId,
        metadata: input.target.metadata ?? {},
      },
      context: {
        source: input.context?.source ?? 'direct_link',
        referrer: input.context?.referrer ?? null,
        utm: {
          source: input.context?.utm?.source ?? null,
          medium: input.context?.utm?.medium ?? null,
          campaign: input.context?.utm?.campaign ?? null,
        },
      },
      geo: {
        country: input.geo?.country ?? null,
        city: input.geo?.city ?? null,
        latitude: input.geo?.latitude ?? null,
        longitude: input.geo?.longitude ?? null,
      },
    });

    const saved = await doc.save();
    this.logger.debug(
      `Tracked analytics event: type=${input.eventType} target=${input.target.entityType}/${input.target.entityId}`,
    );

    // Also log user activity if actor has a userId
    if (input.actor.userId) {
      await this.logUserActivity(input.actor.userId, input.eventType, input.target);
    }

    return saved;
  }

  async findByTarget(
    entityType: string,
    entityId: string,
    options?: { from?: Date; to?: Date; limit?: number },
  ): Promise<AnalyticsEventDocument[]> {
    const query: Record<string, unknown> = {
      'target.entityType': entityType,
      'target.entityId': entityId,
    };

    if (options?.from || options?.to) {
      const timestampFilter: Record<string, Date> = {};
      if (options.from) timestampFilter['$gte'] = options.from;
      if (options.to) timestampFilter['$lte'] = options.to;
      query['timestamp'] = timestampFilter;
    }

    return this.analyticsEventModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(options?.limit ?? 1000)
      .exec();
  }

  async findByActor(
    userId: string,
    options?: { from?: Date; to?: Date; limit?: number },
  ): Promise<AnalyticsEventDocument[]> {
    const query: Record<string, unknown> = {
      'actor.userId': userId,
    };

    if (options?.from || options?.to) {
      const timestampFilter: Record<string, Date> = {};
      if (options.from) timestampFilter['$gte'] = options.from;
      if (options.to) timestampFilter['$lte'] = options.to;
      query['timestamp'] = timestampFilter;
    }

    return this.analyticsEventModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(options?.limit ?? 1000)
      .exec();
  }

  async countByTypeAndTarget(
    eventType: string,
    entityType: string,
    entityId: string,
    from: Date,
    to: Date,
  ): Promise<number> {
    return this.analyticsEventModel.countDocuments({
      eventType,
      'target.entityType': entityType,
      'target.entityId': entityId,
      timestamp: { $gte: from, $lte: to },
    });
  }

  async getUniqueActorCount(
    eventType: string,
    entityType: string,
    entityId: string,
    from: Date,
    to: Date,
  ): Promise<number> {
    const result = await this.analyticsEventModel.aggregate([
      {
        $match: {
          eventType,
          'target.entityType': entityType,
          'target.entityId': entityId,
          timestamp: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: { $ifNull: ['$actor.userId', '$actor.sessionId'] },
        },
      },
      { $count: 'total' },
    ]);

    return result[0]?.total ?? 0;
  }

  async aggregateByHour(
    entityType: string,
    entityId: string,
    from: Date,
    to: Date,
  ): Promise<Record<string, number>> {
    const result = await this.analyticsEventModel.aggregate([
      {
        $match: {
          'target.entityType': entityType,
          'target.entityId': entityId,
          timestamp: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const breakdown: Record<string, number> = {};
    for (const item of result) {
      breakdown[String(item._id)] = item.count;
    }
    return breakdown;
  }

  async aggregateBySources(
    entityType: string,
    entityId: string,
    from: Date,
    to: Date,
  ): Promise<Record<string, number>> {
    const result = await this.analyticsEventModel.aggregate([
      {
        $match: {
          'target.entityType': entityType,
          'target.entityId': entityId,
          timestamp: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: '$context.source',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const sources: Record<string, number> = {};
    for (const item of result) {
      sources[item._id ?? 'unknown'] = item.count;
    }
    return sources;
  }

  async aggregateByGeo(
    entityType: string,
    entityId: string,
    from: Date,
    to: Date,
  ): Promise<Array<{ country: string; count: number }>> {
    const result = await this.analyticsEventModel.aggregate([
      {
        $match: {
          'target.entityType': entityType,
          'target.entityId': entityId,
          timestamp: { $gte: from, $lte: to },
          'geo.country': { $ne: null },
        },
      },
      {
        $group: {
          _id: '$geo.country',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return result.map((item: { _id: string; count: number }) => ({
      country: item._id,
      count: item.count,
    }));
  }

  private async logUserActivity(
    userId: string,
    action: string,
    target: { entityType: string; entityId: string; metadata?: Record<string, unknown> },
  ): Promise<void> {
    try {
      await this.userActivityLogModel.create({
        userId,
        action,
        target: {
          type: target.entityType,
          id: target.entityId,
          name: null,
        },
        metadata: target.metadata ?? {},
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.warn(
        `Failed to log user activity: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
