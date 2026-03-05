import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Registration } from '../../registrations/entities/registration.entity.js';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'registration_id', unique: true })
  registrationId!: string;

  @Column({ type: 'varchar', length: 20, name: 'ticket_code', unique: true })
  ticketCode!: string;

  @Column({ type: 'text', name: 'qr_code_data' })
  qrCodeData!: string;

  @Column({ type: 'varchar', length: 500, name: 'qr_code_url', nullable: true })
  qrCodeUrl!: string | null;

  @Column({ type: 'boolean', name: 'is_used', default: false })
  isUsed!: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'issued_at' })
  issuedAt!: Date;

  @OneToOne(() => Registration, (registration) => registration.ticket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'registration_id' })
  registration?: Registration;
}
