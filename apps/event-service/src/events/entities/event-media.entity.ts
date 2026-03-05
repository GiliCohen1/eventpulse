import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { MediaType } from '@eventpulse/shared-types';
import { Event } from './event.entity.js';

@Entity('event_media')
export class EventMedia {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'varchar', length: 500 })
  url!: string;

  @Column({
    type: 'enum',
    enum: ['image', 'video', 'document'],
    default: 'image',
  })
  type!: MediaType;

  @Column({ type: 'varchar', length: 255, name: 'alt_text', nullable: true })
  altText!: string | null;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'uploaded_at' })
  uploadedAt!: Date;

  @ManyToOne(() => Event, (event) => event.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event?: Event;
}
