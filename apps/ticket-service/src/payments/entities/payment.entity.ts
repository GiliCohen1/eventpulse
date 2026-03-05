import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import type { PaymentStatus, PaymentMethod } from '@eventpulse/shared-types';
import { Registration } from '../../registrations/entities/registration.entity.js';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'registration_id', unique: true })
  registrationId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'refunded'],
    default: 'pending',
    name: 'status',
    enumName: 'payment_status',
  })
  status!: PaymentStatus;

  @Column({ type: 'varchar', length: 100, name: 'transaction_id' })
  transactionId!: string;

  @Column({
    type: 'enum',
    enum: ['simulated_card', 'free'],
    default: 'simulated_card',
    name: 'method',
    enumName: 'payment_method',
  })
  method!: PaymentMethod;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @Column({ type: 'timestamptz', name: 'paid_at', nullable: true })
  paidAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @OneToOne(() => Registration, (registration) => registration.payment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'registration_id' })
  registration?: Registration;
}
