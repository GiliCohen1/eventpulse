import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { EventStatus } from '@eventpulse/shared-types';

export class QueryEventsDto {
  @ApiPropertyOptional({ description: 'Full-text search query' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by category ID or slug' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: ['draft', 'published', 'live', 'ended', 'cancelled', 'archived'] })
  @IsOptional()
  @IsEnum(['draft', 'published', 'live', 'ended', 'cancelled', 'archived'])
  status?: EventStatus;

  @ApiPropertyOptional({ description: 'Events starting after this date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Events ending before this date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Latitude for nearby search' })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ description: 'Longitude for nearby search' })
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional({ description: 'Radius in km for nearby search', default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  radius?: number;

  @ApiPropertyOptional({ description: 'Filter online-only events' })
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @ApiPropertyOptional({ description: 'Filter free events (price = 0)' })
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @ApiPropertyOptional({
    enum: ['startsAt', 'createdAt', 'registeredCount', 'title'],
    default: 'startsAt',
  })
  @IsOptional()
  @IsEnum(['startsAt', 'createdAt', 'registeredCount', 'title'])
  sortBy?: 'startsAt' | 'createdAt' | 'registeredCount' | 'title';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
