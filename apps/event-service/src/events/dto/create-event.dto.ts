import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { EventVisibility } from '@eventpulse/shared-types';

export class VenueDto {
  @ApiPropertyOptional({ example: 'Convention Center' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: '123 Main St, City' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 40.7128 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: -74.006 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class CreateTicketTierDto {
  @ApiProperty({ example: 'General Admission' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'Standard entry ticket' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 25.0 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiPropertyOptional({ example: '2026-04-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  salesStart?: string;

  @ApiPropertyOptional({ example: '2026-04-15T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  salesEnd?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class CreateEventDto {
  @ApiProperty({ example: 'Tech Conference 2026' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ example: 'Annual tech conference with top speakers' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '10:00 - Keynote\n11:00 - Workshop' })
  @IsOptional()
  @IsString()
  agenda?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiProperty()
  @IsUUID()
  categoryId!: string;

  @ApiPropertyOptional({ enum: ['public', 'private'], default: 'public' })
  @IsOptional()
  @IsEnum(['public', 'private'])
  visibility?: EventVisibility;

  @ApiPropertyOptional({ example: 'SECRET123' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  accessCode?: string;

  @ApiPropertyOptional({ type: VenueDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => VenueDto)
  venue?: VenueDto;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @ApiPropertyOptional({ example: 'https://zoom.us/j/123456' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  onlineUrl?: string;

  @ApiProperty({ example: '2026-05-01T10:00:00Z' })
  @IsDateString()
  startsAt!: string;

  @ApiProperty({ example: '2026-05-01T18:00:00Z' })
  @IsDateString()
  endsAt!: string;

  @ApiPropertyOptional({ example: 'America/New_York', default: 'UTC' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  recurringParentId?: string;

  @ApiPropertyOptional({ example: 'FREQ=WEEKLY;COUNT=10' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  recurrenceRule?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/cover.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImageUrl?: string;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxCapacity?: number;

  @ApiPropertyOptional({ example: ['tech', 'conference', 'networking'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: [CreateTicketTierDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTicketTierDto)
  ticketTiers?: CreateTicketTierDto[];
}
