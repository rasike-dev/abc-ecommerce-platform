import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentStrategy, PaymentResult } from '../interfaces/payment-strategy.interface';
import { OrderDocument } from '../../orders/schemas/order.schema';

// Dynamic import for Stripe to make it optional
let Stripe: any = null;
try {
  Stripe = require('stripe');
} catch (error) {
  console.warn('Stripe not installed. Stripe payments will not be available.');
}

@Injectable()
export class StripeProvider implements PaymentStrategy {
  private stripe: any;
  private clientUrl: string;

  constructor(private configService: ConfigService) {
    if (Stripe) {
      const secretKey = this.configService.get('STRIPE_SECRET_KEY') || '';
      this.stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' });
    }
    this.clientUrl = this.configService.get('CLIENT_URL') || 'http://localhost:3000';
  }

  getProviderName(): string {
    return 'stripe';
  }

  async createCheckoutSession(order: OrderDocument): Promise<PaymentResult> {
    if (!this.stripe) {
      return {
        success: false,
        error: 'Stripe not configured',
      };
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'lkr',
              product_data: {
                name: `Order ${order._id}`,
                description: `Payment for order ${order._id}`,
              },
              unit_amount: Math.round(order.totalPrice * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${this.clientUrl}/order/${order._id}?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${this.clientUrl}/order/${order._id}?cancelled=true`,
        metadata: {
          orderId: order._id.toString(),
        },
      });

      return {
        success: true,
        transactionId: session.id,
        providerResponse: session,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Stripe session creation failed',
        providerResponse: error,
      };
    }
  }

  async validatePayment(paymentData: any): Promise<boolean> {
    if (!this.stripe) {
      return false;
    }

    try {
      const { sessionId } = paymentData;

      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      return session.payment_status === 'paid';
    } catch (error) {
      console.error('Stripe validation error:', error);
      return false;
    }
  }

  async refundPayment(order: OrderDocument, amount?: number): Promise<PaymentResult> {
    if (!this.stripe) {
      return {
        success: false,
        error: 'Stripe not configured',
      };
    }

    try {
      const refundAmount = amount || order.totalPrice;

      // Get payment intent from session
      const session = await this.stripe.checkout.sessions.retrieve(order.paymentResult?.sessionId);
      const paymentIntentId = session.payment_intent as string;

      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(refundAmount * 100), // Convert to cents
        reason: 'requested_by_customer',
      });

      return {
        success: true,
        transactionId: refund.id,
        providerResponse: refund,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Stripe refund failed',
        providerResponse: error,
      };
    }
  }
}
