import { Injectable } from '@nestjs/common';
import { AggregationsService } from '../aggregations/aggregations.service.js';
import { TrackingService } from '../tracking/tracking.service.js';

export interface EventOverview {
  eventId: string;
  period: { from: string; to: string };
  overview: {
    totalViews: number;
    uniqueViews: number;
    totalRegistrations: number;
    cancellations: number;
    conversionRate: number;
    shares: number;
    chatMessages: number;
    qaQuestions: number;
    reviews: number;
    avgRating: number;
  };
  trend: {
    viewsChange: number;
    registrationsChange: number;
  };
}

export interface RegistrationTimelineEntry {
  date: string;
  registrations: number;
  cancellations: number;
  cumulative: number;
}

export interface TrafficSourceEntry {
  source: string;
  count: number;
  percentage: number;
}

export interface GeoDistributionEntry {
  country: string;
  count: number;
  percentage: number;
}

export interface TierBreakdownEntry {
  tierId: string;
  name: string;
  registrations: number;
  percentage: number;
}

export interface OrganizerDashboard {
  totalEvents: number;
  totalViews: number;
  totalRegistrations: number;
  avgConversionRate: number;
  topEvents: Array<{
    eventId: string;
    views: number;
    registrations: number;
  }>;
  recentActivity: Array<{
    date: string;
    views: number;
    registrations: number;
  }>;
}

@Injectable()
export class DashboardsService {
  constructor(
    private readonly aggregationsService: AggregationsService,
    private readonly trackingService: TrackingService,
  ) {}

  async getEventOverview(eventId: string, from?: string, to?: string): Promise<EventOverview> {
    const now = new Date();
    const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const defaultTo = now.toISOString().split('T')[0];

    const periodFrom = from ?? defaultFrom;
    const periodTo = to ?? defaultTo;

    const summary = await this.aggregationsService.getAggregationSummary(
      'event',
      eventId,
      periodFrom,
      periodTo,
    );

    // Compute previous period for trend comparison
    const periodLength = this.daysBetween(periodFrom, periodTo);
    const prevTo = this.addDays(periodFrom, -1);
    const prevFrom = this.addDays(prevTo, -periodLength);

    const prevSummary = await this.aggregationsService.getAggregationSummary(
      'event',
      eventId,
      prevFrom,
      prevTo,
    );

    const conversionRate =
      summary.views > 0 ? Math.round((summary.registrations / summary.views) * 10000) / 100 : 0;

    const viewsChange =
      prevSummary.views > 0
        ? Math.round(((summary.views - prevSummary.views) / prevSummary.views) * 10000) / 100
        : 0;

    const registrationsChange =
      prevSummary.registrations > 0
        ? Math.round(
            ((summary.registrations - prevSummary.registrations) / prevSummary.registrations) *
              10000,
          ) / 100
        : 0;

    return {
      eventId,
      period: { from: periodFrom, to: periodTo },
      overview: {
        totalViews: summary.views,
        uniqueViews: summary.uniqueViews,
        totalRegistrations: summary.registrations,
        cancellations: summary.cancellations,
        conversionRate,
        shares: summary.shares,
        chatMessages: summary.chatMessages,
        qaQuestions: summary.qaQuestions,
        reviews: summary.reviews,
        avgRating: summary.avgRating,
      },
      trend: {
        viewsChange,
        registrationsChange,
      },
    };
  }

  async getRegistrationTimeline(
    eventId: string,
    from?: string,
    to?: string,
  ): Promise<RegistrationTimelineEntry[]> {
    const now = new Date();
    const periodFrom =
      from ?? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const periodTo = to ?? now.toISOString().split('T')[0];

    const aggregations = await this.aggregationsService.getAggregationRange(
      'event',
      eventId,
      periodFrom,
      periodTo,
    );

    let cumulative = 0;
    return aggregations.map((agg) => {
      cumulative += agg.metrics.registrations - agg.metrics.cancellations;
      return {
        date: agg.date,
        registrations: agg.metrics.registrations,
        cancellations: agg.metrics.cancellations,
        cumulative,
      };
    });
  }

  async getTrafficSources(
    eventId: string,
    from?: string,
    to?: string,
  ): Promise<TrafficSourceEntry[]> {
    const now = new Date();
    const periodFrom =
      from ?? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const periodTo = to ?? now.toISOString().split('T')[0];

    const aggregations = await this.aggregationsService.getAggregationRange(
      'event',
      eventId,
      periodFrom,
      periodTo,
    );

    // Merge sources across all days
    const sourceMap = new Map<string, number>();
    for (const agg of aggregations) {
      if (agg.sources) {
        for (const [source, count] of agg.sources.entries()) {
          sourceMap.set(source, (sourceMap.get(source) ?? 0) + count);
        }
      }
    }

    const total = Array.from(sourceMap.values()).reduce((sum, v) => sum + v, 0);

    return Array.from(sourceMap.entries())
      .map(([source, count]) => ({
        source,
        count,
        percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  async getGeoDistribution(
    eventId: string,
    from?: string,
    to?: string,
  ): Promise<GeoDistributionEntry[]> {
    const now = new Date();
    const periodFrom =
      from ?? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const periodTo = to ?? now.toISOString().split('T')[0];

    const aggregations = await this.aggregationsService.getAggregationRange(
      'event',
      eventId,
      periodFrom,
      periodTo,
    );

    // Merge geo across all days
    const geoMap = new Map<string, number>();
    for (const agg of aggregations) {
      for (const entry of agg.geoBreakdown) {
        geoMap.set(entry.country, (geoMap.get(entry.country) ?? 0) + entry.count);
      }
    }

    const total = Array.from(geoMap.values()).reduce((sum, v) => sum + v, 0);

    return Array.from(geoMap.entries())
      .map(([country, count]) => ({
        country,
        count,
        percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  async getTierBreakdown(eventId: string): Promise<TierBreakdownEntry[]> {
    const now = new Date();
    const from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const events = await this.trackingService.findByTarget('event', eventId, {
      from,
      to: now,
      limit: 50000,
    });

    // Group ticket registrations by tier
    const tierMap = new Map<string, { name: string; count: number }>();
    for (const event of events) {
      if (event.eventType === 'event.registered' || event.eventType === 'ticket.reserved') {
        const tierId = (event.target.metadata?.['tierId'] as string) ?? 'unknown';
        const tierName = (event.target.metadata?.['tierName'] as string) ?? 'Unknown Tier';
        const existing = tierMap.get(tierId);
        if (existing) {
          existing.count += 1;
        } else {
          tierMap.set(tierId, { name: tierName, count: 1 });
        }
      }
    }

    const total = Array.from(tierMap.values()).reduce((sum, v) => sum + v.count, 0);

    return Array.from(tierMap.entries())
      .map(([tierId, data]) => ({
        tierId,
        name: data.name,
        registrations: data.count,
        percentage: total > 0 ? Math.round((data.count / total) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.registrations - a.registrations);
  }

  async getOrganizerDashboard(organizerId: string): Promise<OrganizerDashboard> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const fromStr = thirtyDaysAgo.toISOString().split('T')[0];
    const toStr = now.toISOString().split('T')[0];

    // Get organizer's recent activity events
    const actorEvents = await this.trackingService.findByActor(organizerId, {
      from: thirtyDaysAgo,
      to: now,
      limit: 100,
    });

    // Find distinct event IDs we've been tracking for this organizer
    const eventIds = new Set<string>();
    for (const event of actorEvents) {
      if (event.target.entityType === 'event') {
        eventIds.add(event.target.entityId);
      }
    }

    let totalViews = 0;
    let totalRegistrations = 0;
    const topEvents: Array<{ eventId: string; views: number; registrations: number }> = [];

    for (const eventId of eventIds) {
      const summary = await this.aggregationsService.getAggregationSummary(
        'event',
        eventId,
        fromStr,
        toStr,
      );
      totalViews += summary.views;
      totalRegistrations += summary.registrations;
      topEvents.push({
        eventId,
        views: summary.views,
        registrations: summary.registrations,
      });
    }

    topEvents.sort((a, b) => b.views - a.views);

    const avgConversionRate =
      totalViews > 0 ? Math.round((totalRegistrations / totalViews) * 10000) / 100 : 0;

    // Build recent activity per day
    const recentActivity: Array<{ date: string; views: number; registrations: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      let dayViews = 0;
      let dayRegistrations = 0;
      for (const eventId of eventIds) {
        const dayAgg = await this.aggregationsService.getDailyAggregation(
          'event',
          eventId,
          dateStr,
        );
        if (dayAgg) {
          dayViews += dayAgg.metrics.views;
          dayRegistrations += dayAgg.metrics.registrations;
        }
      }

      recentActivity.push({ date: dateStr, views: dayViews, registrations: dayRegistrations });
    }

    return {
      totalEvents: eventIds.size,
      totalViews,
      totalRegistrations,
      avgConversionRate,
      topEvents: topEvents.slice(0, 10),
      recentActivity,
    };
  }

  private daysBetween(from: string, to: string): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((new Date(to).getTime() - new Date(from).getTime()) / msPerDay);
  }

  private addDays(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }
}
