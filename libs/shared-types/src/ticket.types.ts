// ============================================
// Ticket Types
// ============================================

export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled' | 'checked_in';

export type PaymentStatus = 'pending' | 'completed' | 'refunded';

export type PaymentMethod = 'simulated_card' | 'free';

export interface IRegistration {
  id: string;
  userId: string;
  eventId: string;
  ticketTierId: string;
  status: RegistrationStatus;
  registeredAt: string;
  cancelledAt: string | null;
  checkedInAt: string | null;
}

export interface IPayment {
  id: string;
  registrationId: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  transactionId: string;
  method: PaymentMethod;
  metadata: Record<string, unknown>;
  paidAt: string | null;
  createdAt: string;
}

export interface ITicket {
  id: string;
  registrationId: string;
  ticketCode: string;
  qrCodeData: string;
  qrCodeUrl: string | null;
  isUsed: boolean;
  issuedAt: string;
}
