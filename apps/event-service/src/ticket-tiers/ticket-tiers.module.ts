import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketTier } from './entities/ticket-tier.entity.js';
import { Event } from '../events/entities/event.entity.js';
import { TicketTiersController } from './ticket-tiers.controller.js';
import { TicketTiersService } from './ticket-tiers.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([TicketTier, Event])],
  controllers: [TicketTiersController],
  providers: [TicketTiersService],
  exports: [TicketTiersService],
})
export class TicketTiersModule {}
