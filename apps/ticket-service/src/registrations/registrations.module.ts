import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registration } from './entities/registration.entity.js';
import { RegistrationsController } from './registrations.controller.js';
import { RegistrationsService } from './registrations.service.js';
import { PaymentsModule } from '../payments/payments.module.js';
import { QrCodesModule } from '../qr-codes/qr-codes.module.js';
import { TicketKafkaProducer } from '../kafka/ticket-kafka.producer.js';

@Module({
  imports: [TypeOrmModule.forFeature([Registration]), PaymentsModule, QrCodesModule],
  controllers: [RegistrationsController],
  providers: [RegistrationsService, TicketKafkaProducer],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
