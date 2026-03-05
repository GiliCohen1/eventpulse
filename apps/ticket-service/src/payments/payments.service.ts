import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Payment } from './entities/payment.entity.js';
import type { PaymentMethod } from '@eventpulse/shared-types';

export interface ProcessPaymentResult {
  payment: Payment;
  transactionId: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async processPayment(
    registrationId: string,
    userId: string,
    amount: number,
    currency: string,
  ): Promise<ProcessPaymentResult> {
    const transactionId = `TXN-${uuidv4().slice(0, 12).toUpperCase()}`;

    const method: PaymentMethod = amount === 0 ? 'free' : 'simulated_card';

    this.logger.log(
      `Processing simulated payment: registrationId=${registrationId}, amount=${amount} ${currency}, method=${method}`,
    );

    const payment = this.paymentRepository.create({
      registrationId,
      userId,
      amount,
      currency,
      status: 'completed',
      transactionId,
      method,
      metadata: {
        simulatedAt: new Date().toISOString(),
        processor: 'eventpulse-simulated',
        cardLast4: method === 'simulated_card' ? '4242' : undefined,
      },
      paidAt: new Date(),
    });

    const savedPayment = await this.paymentRepository.save(payment);

    this.logger.log(
      `Payment completed: paymentId=${savedPayment.id}, transactionId=${transactionId}`,
    );

    return { payment: savedPayment, transactionId };
  }

  async findByRegistrationId(registrationId: string): Promise<Payment | null> {
    return this.paymentRepository.findOne({ where: { registrationId } });
  }

  async findByUserId(userId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async refundPayment(registrationId: string): Promise<Payment | null> {
    const payment = await this.paymentRepository.findOne({ where: { registrationId } });

    if (!payment) {
      return null;
    }

    payment.status = 'refunded';
    payment.metadata = {
      ...payment.metadata,
      refundedAt: new Date().toISOString(),
    };

    return this.paymentRepository.save(payment);
  }
}
