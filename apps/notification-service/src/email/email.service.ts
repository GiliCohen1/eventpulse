import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter<SMTPTransport.SentMessageInfo>;
  private readonly fromAddress: string;

  constructor(private readonly config: ConfigService) {
    this.fromAddress = this.config.get<string>('SMTP_FROM', 'noreply@eventpulse.io');

    this.transporter = createTransport({
      host: this.config.get<string>('SMTP_HOST', 'localhost'),
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: this.config.get<number>('SMTP_PORT', 587) === 465,
      auth: {
        user: this.config.get<string>('SMTP_USER', ''),
        pass: this.config.get<string>('SMTP_PASS', ''),
      },
    });
  }

  async sendWelcomeEmail(to: string, firstName: string): Promise<string | null> {
    const subject = 'Welcome to EventPulse!';
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0;">Welcome to EventPulse!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <p>Hi <strong>${firstName}</strong>,</p>
          <p>Thanks for joining EventPulse! We're excited to have you on board.</p>
          <p>Here's what you can do:</p>
          <ul>
            <li>Discover and attend amazing events</li>
            <li>Connect with other attendees via live chat</li>
            <li>Get real-time notifications for events you care about</li>
          </ul>
          <p>Start exploring events now and find something you love.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">— The EventPulse Team</p>
        </div>
      </body>
      </html>
    `;

    return this.send(to, subject, html);
  }

  async sendTicketConfirmation(
    to: string,
    firstName: string,
    eventTitle: string,
    ticketTierName: string,
    ticketCode: string,
    qrCodeUrl: string,
  ): Promise<string | null> {
    const subject = `Your ticket for ${eventTitle} is confirmed!`;
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0;">Ticket Confirmed!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <p>Hi <strong>${firstName}</strong>,</p>
          <p>Your ticket for <strong>${eventTitle}</strong> has been confirmed.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Ticket Tier</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">${ticketTierName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Ticket Code</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; font-family: monospace;">${ticketCode}</td>
            </tr>
          </table>
          <div style="text-align: center; margin: 20px 0;">
            <img src="${qrCodeUrl}" alt="QR Code" style="max-width: 200px;" />
            <p style="color: #6b7280; font-size: 12px;">Show this QR code at the event entrance</p>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">— The EventPulse Team</p>
        </div>
      </body>
      </html>
    `;

    return this.send(to, subject, html);
  }

  async sendEventReminder(
    to: string,
    firstName: string,
    eventTitle: string,
    eventDate: string,
  ): Promise<string | null> {
    const subject = `Reminder: ${eventTitle} is coming up!`;
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0;">Event Reminder</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <p>Hi <strong>${firstName}</strong>,</p>
          <p>Just a friendly reminder that <strong>${eventTitle}</strong> is happening on <strong>${eventDate}</strong>.</p>
          <p>Make sure you have your ticket ready and arrive on time!</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">— The EventPulse Team</p>
        </div>
      </body>
      </html>
    `;

    return this.send(to, subject, html);
  }

  async sendEventCancelled(
    to: string,
    firstName: string,
    eventTitle: string,
    reason: string,
  ): Promise<string | null> {
    const subject = `Event cancelled: ${eventTitle}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0;">Event Cancelled</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <p>Hi <strong>${firstName}</strong>,</p>
          <p>We're sorry to inform you that <strong>${eventTitle}</strong> has been cancelled.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>If you purchased a ticket, a refund will be processed automatically.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">— The EventPulse Team</p>
        </div>
      </body>
      </html>
    `;

    return this.send(to, subject, html);
  }

  private async send(to: string, subject: string, html: string): Promise<string | null> {
    try {
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent to=${to} subject="${subject}" messageId=${info.messageId}`);
      return info.messageId ?? null;
    } catch (error) {
      this.logger.error(
        `Failed to send email to=${to} subject="${subject}"`,
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  }
}
