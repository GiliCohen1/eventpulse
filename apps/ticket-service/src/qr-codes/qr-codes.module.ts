import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity.js';
import { QrCodesService } from './qr-codes.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket])],
  providers: [QrCodesService],
  exports: [QrCodesService],
})
export class QrCodesModule {}
