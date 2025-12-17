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
    
    // Get CLIENT_URL or construct from VERCEL_URL
    let clientUrl = this.configService.get('CLIENT_URL');
    
    if (!clientUrl) {
      // Fallback to VERCEL_URL if CLIENT_URL is not set
      const vercelUrl = this.configService.get('VERCEL_URL');
      if (vercelUrl) {
        clientUrl = `https://${vercelUrl}`;
      } else {
        clientUrl = 'http://localhost:3000';
      }
    }
    
    // Ensure URL has protocol
    if (clientUrl && !clientUrl.startsWith('http://') && !clientUrl.startsWith('https://')) {
      clientUrl = `https://${clientUrl}`;
    }
    
    // Validate URL format
    try {
      new URL(clientUrl);
      this.clientUrl = clientUrl;
    } catch (error) {
      console.error('Invalid CLIENT_URL format:', clientUrl);
      this.clientUrl = 'http://localhost:3000'; // Fallback to localhost
    }
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
      // Validate clientUrl before creating session
      if (!this.clientUrl || this.clientUrl === 'http://localhost:3000') {
        console.warn('CLIENT_URL not properly configured, using fallback');
      }
      
      const successUrl = `${this.clientUrl}/order/${order._id}?success=true&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${this.clientUrl}/order/${order._id}?cancelled=true`;
      
      // Validate URLs are properly formatted
      try {
        new URL(successUrl.replace('{CHECKOUT_SESSION_ID}', 'test'));
        new URL(cancelUrl);
      } catch (urlError) {
        console.error('Invalid URL format for Stripe redirects:', { successUrl, cancelUrl });
        return {
          success: false,
          error: `Invalid CLIENT_URL configuration: ${this.clientUrl}`,
        };
      }
      
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd', // Using USD for wider compatibility
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
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          orderId: order._id.toString(),
        },
      });

      return {
        success: true,
        transactionId: session.id,
        redirectUrl: session.url,
        providerResponse: session,
      };
    } catch (error) {
      console.error('Stripe session creation error:', error);
      return {
        success: false,
        error: `Stripe session creation failed: ${error.message}`,
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
