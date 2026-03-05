import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import { Ticket } from './entities/ticket.entity.js';

@Injectable()
export class QrCodesService {
  private readonly logger = new Logger(QrCodesService.name);

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  generateTicketCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `EVP-${code}`;
  }

  async generateQrCodeData(ticketCode: string, registrationId: string): Promise<string> {
    const payload = JSON.stringify({
      ticketCode,
      registrationId,
      issuedAt: new Date().toISOString(),
    });

    const qrDataUrl: string = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      width: 300,
      margin: 2,
    });

    return qrDataUrl;
  }

  async createTicket(registrationId: string): Promise<Ticket> {
    const ticketCode = this.generateTicketCode();
    const qrCodeData = await this.generateQrCodeData(ticketCode, registrationId);

    this.logger.log(`Creating ticket: registrationId=${registrationId}, ticketCode=${ticketCode}`);

    const ticket = this.ticketRepository.create({
      registrationId,
      ticketCode,
      qrCodeData,
      qrCodeUrl: null,
      isUsed: false,
    });

    return this.ticketRepository.save(ticket);
  }

  async findByRegistrationId(registrationId: string): Promise<Ticket | null> {
    return this.ticketRepository.findOne({ where: { registrationId } });
  }

  async findByTicketCode(ticketCode: string): Promise<Ticket | null> {
    return this.ticketRepository.findOne({
      where: { ticketCode },
      relations: ['registration'],
    });
  }

  async markAsUsed(ticketId: string): Promise<Ticket> {
    await this.ticketRepository.update(ticketId, { isUsed: true });
    const ticket = await this.ticketRepository.findOneOrFail({ where: { id: ticketId } });
    return ticket;
  }
}
