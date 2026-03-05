import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from './event.entity.js';

@Entity('event_tags')
export class EventTag {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'varchar', length: 100 })
  tag!: string;

  @ManyToOne(() => Event, (event) => event.tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event?: Event;
}
