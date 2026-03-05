import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { EventStatus, EventVisibility } from '@eventpulse/shared-types';
import { Category } from '../../categories/entities/category.entity.js';
import { EventTag } from './event-tag.entity.js';
import { EventMedia } from './event-media.entity.js';
import { EventReview } from './event-review.entity.js';
import { TicketTier } from '../../ticket-tiers/entities/ticket-tier.entity.js';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', nullable: true })
  agenda!: string | null;

  @Column({ type: 'uuid', name: 'organizer_id' })
  organizerId!: string;

  @Column({ type: 'uuid', name: 'organization_id', nullable: true })
  organizationId!: string | null;

  @Column({ type: 'uuid', name: 'category_id' })
  categoryId!: string;

  @ManyToOne(() => Category, { eager: false })
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @Column({
    type: 'enum',
    enum: ['draft', 'published', 'live', 'ended', 'cancelled', 'archived'],
    default: 'draft',
  })
  status!: EventStatus;

  @Column({
    type: 'enum',
    enum: ['public', 'private'],
    default: 'public',
  })
  visibility!: EventVisibility;

  @Column({ type: 'varchar', length: 50, name: 'access_code', nullable: true })
  accessCode!: string | null;

  @Column({ type: 'varchar', length: 255, name: 'venue_name', nullable: true })
  venueName!: string | null;

  @Column({ type: 'text', name: 'venue_address', nullable: true })
  venueAddress!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude!: number | null;

  @Column({ type: 'boolean', name: 'is_online', default: false })
  isOnline!: boolean;

  @Column({ type: 'varchar', length: 500, name: 'online_url', nullable: true })
  onlineUrl!: string | null;

  @Column({ type: 'timestamptz', name: 'starts_at' })
  startsAt!: Date;

  @Column({ type: 'timestamptz', name: 'ends_at' })
  endsAt!: Date;

  @Column({ type: 'varchar', length: 100, default: 'UTC' })
  timezone!: string;

  @Column({ type: 'uuid', name: 'recurring_parent_id', nullable: true })
  recurringParentId!: string | null;

  @Column({ type: 'varchar', length: 255, name: 'recurrence_rule', nullable: true })
  recurrenceRule!: string | null;

  @Column({ type: 'varchar', length: 500, name: 'cover_image_url', nullable: true })
  coverImageUrl!: string | null;

  @Column({ type: 'int', name: 'max_capacity', nullable: true })
  maxCapacity!: number | null;

  @Column({ type: 'int', name: 'registered_count', default: 0 })
  registeredCount!: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'timestamptz', name: 'published_at', nullable: true })
  publishedAt!: Date | null;

  @OneToMany(() => EventTag, (tag) => tag.event, { cascade: true })
  tags?: EventTag[];

  @OneToMany(() => EventMedia, (media) => media.event, { cascade: true })
  media?: EventMedia[];

  @OneToMany(() => EventReview, (review) => review.event)
  reviews?: EventReview[];

  @OneToMany(() => TicketTier, (tier) => tier.event, { cascade: true })
  ticketTiers?: TicketTier[];
}
