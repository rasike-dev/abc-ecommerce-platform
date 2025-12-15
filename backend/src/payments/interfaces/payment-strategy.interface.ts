import { OrderDocument } from '../../orders/schemas/order.schema';

export interface PaymentStrategy {
  getProviderName(): string;
  createCheckoutSession(order: OrderDocument): Promise<any>;
  validatePayment(paymentData: any): Promise<boolean>;
  refundPayment(order: OrderDocument, amount?: number): Promise<any>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  providerResponse?: any;
  captureId?: string;
  error?: string;
}
