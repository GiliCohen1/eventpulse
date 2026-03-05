import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Registration } from './entities/registration.entity.js';
import { PaymentsService } from '../payments/payments.service.js';
import { QrCodesService } from '../qr-codes/qr-codes.service.js';
import { TicketKafkaProducer } from '../kafka/ticket-kafka.producer.js';
import type { CreateRegistrationDto } from './dto/create-registration.dto.js';
import type { Ticket } from '../qr-codes/entities/ticket.entity.js';
import type {
  TicketReservedEvent,
  TicketConfirmedEvent,
  TicketCancelledEvent,
  TicketCheckedInEvent,
  PaymentCompletedEvent,
} from '@eventpulse/shared-types';

@Injectable()
export class RegistrationsService {
  private readonly logger = new Logger(RegistrationsService.name);

  constructor(
    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,
    private readonly paymentsService: PaymentsService,
    private readonly qrCodesService: QrCodesService,
    private readonly ticketKafkaProducer: TicketKafkaProducer,
    private readonly dataSource: DataSource,
  ) {}

  async register(
    userId: string,
    eventId: string,
    dto: CreateRegistrationDto,
  ): Promise<Registration> {
    // Check for duplicate registration
    const existing = await this.registrationRepository.findOne({
      where: { userId, eventId },
    });

    if (existing && existing.status !== 'cancelled') {
      throw new ConflictException('User is already registered for this event');
    }

    // Use a transaction for the full registration flow
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check ticket tier capacity using a raw query with row lock
      const tierResult = (await queryRunner.query(
        `SELECT id, name, price, capacity, registered_count
         FROM ticket_tiers
         WHERE id = $1 AND event_id = $2 AND is_active = true
         FOR UPDATE`,
        [dto.ticketTierId, eventId],
      )) as Array<{
        id: string;
        name: string;
        price: number;
        capacity: number;
        registered_count: number;
      }>;

      if (!tierResult || tierResult.length === 0) {
        throw new NotFoundException('Ticket tier not found or not active for this event');
      }

      const tier = tierResult[0];

      if (tier.registered_count >= tier.capacity) {
        throw new ConflictException('Ticket tier is sold out');
      }

      // Create registration as pending
      const registration = queryRunner.manager.create(Registration, {
        userId,
        eventId,
        ticketTierId: dto.ticketTierId,
        status: 'pending',
      });

      const savedRegistration = await queryRunner.manager.save(registration);

      // Increment registered_count on ticket tier
      await queryRunner.query(
        `UPDATE ticket_tiers SET registered_count = registered_count + 1 WHERE id = $1`,
        [dto.ticketTierId],
      );

      await queryRunner.commitTransaction();

      this.logger.log(
        `Registration created: id=${savedRegistration.id}, userId=${userId}, eventId=${eventId}`,
      );

      // Publish ticket.reserved event
      const reservedEvent: TicketReservedEvent = {
        registrationId: savedRegistration.id,
        userId,
        eventId,
        eventTitle: '', // Would be enriched by event service
        ticketTierId: dto.ticketTierId,
        ticketTierName: tier.name,
        price: Number(tier.price),
        reservedAt: savedRegistration.registeredAt.toISOString(),
      };
      await this.ticketKafkaProducer.publishTicketReserved(reservedEvent);

      // Process simulated payment
      const { payment, transactionId } = await this.paymentsService.processPayment(
        savedRegistration.id,
        userId,
        Number(tier.price),
        'USD',
      );

      // Publish payment.completed event
      const paymentEvent: PaymentCompletedEvent = {
        paymentId: payment.id,
        registrationId: savedRegistration.id,
        userId,
        eventId,
        amount: Number(payment.amount),
        currency: payment.currency,
        transactionId,
        method: payment.method,
        completedAt: payment.paidAt?.toISOString() ?? new Date().toISOString(),
      };
      await this.ticketKafkaProducer.publishPaymentCompleted(paymentEvent);

      // Generate QR code and ticket
      const ticket = await this.qrCodesService.createTicket(savedRegistration.id);

      // Update registration to confirmed
      savedRegistration.status = 'confirmed';
      const confirmedRegistration = await this.registrationRepository.save(savedRegistration);

      // Publish ticket.confirmed event
      const confirmedEvent: TicketConfirmedEvent = {
        registrationId: confirmedRegistration.id,
        userId,
        userEmail: '', // Would be enriched by user service
        userFirstName: '', // Would be enriched by user service
        eventId,
        eventTitle: '', // Would be enriched by event service
        ticketTierId: dto.ticketTierId,
        ticketTierName: tier.name,
        ticketCode: ticket.ticketCode,
        qrCodeUrl: ticket.qrCodeUrl ?? '',
        transactionId,
        amount: Number(tier.price),
        confirmedAt: new Date().toISOString(),
      };
      await this.ticketKafkaProducer.publishTicketConfirmed(confirmedEvent);

      this.logger.log(
        `Registration confirmed: id=${confirmedRegistration.id}, ticketCode=${ticket.ticketCode}`,
      );

      return confirmedRegistration;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cancel(userId: string, eventId: string): Promise<Registration> {
    const registration = await this.registrationRepository.findOne({
      where: { userId, eventId },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.status === 'cancelled') {
      throw new BadRequestException('Registration is already cancelled');
    }

    if (registration.status === 'checked_in') {
      throw new BadRequestException('Cannot cancel a checked-in registration');
    }

    // Update registration status
    registration.status = 'cancelled';
    registration.cancelledAt = new Date();
    const cancelledRegistration = await this.registrationRepository.save(registration);

    // Decrement registered_count on ticket tier
    await this.dataSource.query(
      `UPDATE ticket_tiers SET registered_count = GREATEST(registered_count - 1, 0) WHERE id = $1`,
      [registration.ticketTierId],
    );

    // Refund payment
    await this.paymentsService.refundPayment(registration.id);

    // Publish ticket.cancelled event
    const cancelledEvent: TicketCancelledEvent = {
      registrationId: cancelledRegistration.id,
      userId,
      eventId,
      eventTitle: '', // Would be enriched by event service
      ticketTierId: registration.ticketTierId,
      reason: 'User cancelled registration',
      cancelledAt: cancelledRegistration.cancelledAt!.toISOString(),
    };
    await this.ticketKafkaProducer.publishTicketCancelled(cancelledEvent);

    this.logger.log(`Registration cancelled: id=${cancelledRegistration.id}`);

    return cancelledRegistration;
  }

  async findMyRegistrations(userId: string): Promise<Registration[]> {
    return this.registrationRepository.find({
      where: { userId },
      order: { registeredAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Registration> {
    const registration = await this.registrationRepository.findOne({
      where: { id },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    return registration;
  }

  async findTicketByRegistrationId(registrationId: string): Promise<Ticket> {
    const registration = await this.findById(registrationId);

    const ticket = await this.qrCodesService.findByRegistrationId(registration.id);

    if (!ticket) {
      throw new NotFoundException('Ticket not found for this registration');
    }

    return ticket;
  }

  async checkIn(ticketCode: string): Promise<Registration> {
    const ticket = await this.qrCodesService.findByTicketCode(ticketCode);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.isUsed) {
      throw new BadRequestException('Ticket has already been used for check-in');
    }

    const registration = await this.registrationRepository.findOne({
      where: { id: ticket.registrationId },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found for this ticket');
    }

    if (registration.status === 'cancelled') {
      throw new BadRequestException('Registration has been cancelled');
    }

    if (registration.status === 'checked_in') {
      throw new BadRequestException('Already checked in');
    }

    // Mark ticket as used
    await this.qrCodesService.markAsUsed(ticket.id);

    // Update registration status
    registration.status = 'checked_in';
    registration.checkedInAt = new Date();
    const checkedInRegistration = await this.registrationRepository.save(registration);

    // Publish ticket.checked_in event
    const checkedInEvent: TicketCheckedInEvent = {
      registrationId: checkedInRegistration.id,
      userId: checkedInRegistration.userId,
      eventId: checkedInRegistration.eventId,
      ticketCode,
      checkedInAt: checkedInRegistration.checkedInAt!.toISOString(),
    };
    await this.ticketKafkaProducer.publishTicketCheckedIn(checkedInEvent);

    this.logger.log(
      `Check-in completed: registrationId=${checkedInRegistration.id}, ticketCode=${ticketCode}`,
    );

    return checkedInRegistration;
  }

  async findAttendees(eventId: string): Promise<Registration[]> {
    return this.registrationRepository.find({
      where: { eventId },
      order: { registeredAt: 'ASC' },
    });
  }
}
