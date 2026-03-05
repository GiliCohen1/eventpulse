import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DashboardsService } from './dashboards.service.js';
import type {
  EventOverview,
  RegistrationTimelineEntry,
  TrafficSourceEntry,
  GeoDistributionEntry,
  TierBreakdownEntry,
  OrganizerDashboard,
} from './dashboards.service.js';

@ApiTags('Analytics Dashboards')
@Controller()
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Get('analytics/events/:eventId/overview')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get event analytics overview' })
  @ApiParam({ name: 'eventId', type: 'string' })
  @ApiQuery({
    name: 'from',
    required: false,
    type: 'string',
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({ name: 'to', required: false, type: 'string', description: 'End date (YYYY-MM-DD)' })
  async getEventOverview(
    @Param('eventId') eventId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<EventOverview> {
    return this.dashboardsService.getEventOverview(eventId, from, to);
  }

  @Get('analytics/events/:eventId/registrations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get registration timeline for an event' })
  @ApiParam({ name: 'eventId', type: 'string' })
  @ApiQuery({
    name: 'from',
    required: false,
    type: 'string',
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({ name: 'to', required: false, type: 'string', description: 'End date (YYYY-MM-DD)' })
  async getRegistrationTimeline(
    @Param('eventId') eventId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<RegistrationTimelineEntry[]> {
    return this.dashboardsService.getRegistrationTimeline(eventId, from, to);
  }

  @Get('analytics/events/:eventId/sources')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get traffic sources for an event' })
  @ApiParam({ name: 'eventId', type: 'string' })
  @ApiQuery({
    name: 'from',
    required: false,
    type: 'string',
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({ name: 'to', required: false, type: 'string', description: 'End date (YYYY-MM-DD)' })
  async getTrafficSources(
    @Param('eventId') eventId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<TrafficSourceEntry[]> {
    return this.dashboardsService.getTrafficSources(eventId, from, to);
  }

  @Get('analytics/events/:eventId/geo')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get geographic distribution for an event' })
  @ApiParam({ name: 'eventId', type: 'string' })
  @ApiQuery({
    name: 'from',
    required: false,
    type: 'string',
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({ name: 'to', required: false, type: 'string', description: 'End date (YYYY-MM-DD)' })
  async getGeoDistribution(
    @Param('eventId') eventId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<GeoDistributionEntry[]> {
    return this.dashboardsService.getGeoDistribution(eventId, from, to);
  }

  @Get('analytics/events/:eventId/tiers')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ticket tier breakdown for an event' })
  @ApiParam({ name: 'eventId', type: 'string' })
  async getTierBreakdown(@Param('eventId') eventId: string): Promise<TierBreakdownEntry[]> {
    return this.dashboardsService.getTierBreakdown(eventId);
  }

  @Get('analytics/dashboard')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get organizer dashboard overview' })
  @ApiQuery({ name: 'organizerId', required: true, type: 'string' })
  async getOrganizerDashboard(
    @Query('organizerId') organizerId: string,
  ): Promise<OrganizerDashboard> {
    return this.dashboardsService.getOrganizerDashboard(organizerId);
  }
}
