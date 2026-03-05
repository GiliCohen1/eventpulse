import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
  OneToOne,
} from 'typeorm';
import type { RegistrationStatus } from '@eventpulse/shared-types';
import { Payment } from '../../payments/entities/payment.entity.js';
import { Ticket } from '../../qr-codes/entities/ticket.entity.js';

@Entity('registrations')
@Unique('UQ_user_event', ['userId', 'eventId'])
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'uuid', name: 'ticket_tier_id' })
  ticketTierId!: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'cancelled', 'checked_in'],
    default: 'pending',
    name: 'status',
    enumName: 'registration_status',
  })
  status!: RegistrationStatus;

  @CreateDateColumn({ type: 'timestamptz', name: 'registered_at' })
  registeredAt!: Date;

  @Column({ type: 'timestamptz', name: 'cancelled_at', nullable: true })
  cancelledAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'checked_in_at', nullable: true })
  checkedInAt!: Date | null;

  @OneToOne(() => Payment, (payment) => payment.registration, { eager: false })
  payment?: Payment;

  @OneToOne(() => Ticket, (ticket) => ticket.registration, { eager: false })
  ticket?: Ticket;
}
