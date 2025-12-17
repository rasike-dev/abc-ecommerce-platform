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

  constructor(private configService: ConfigService) {
    if (Stripe) {
      const secretKey = this.configService.get('STRIPE_SECRET_KEY') || '';
      this.stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' });
    }
  }

  /**
   * Get client URL dynamically at runtime
   * This ensures environment variables are available in serverless environments
   */
  private getClientUrl(): string {
    // Get CLIENT_URL or construct from VERCEL_URL
    let clientUrl = this.configService.get('CLIENT_URL');
    
    console.log('Initial CLIENT_URL from config:', clientUrl);
    
    // If CLIENT_URL is empty, null, or undefined, try alternatives
    if (!clientUrl || clientUrl.trim() === '') {
      // Fallback to VERCEL_URL if CLIENT_URL is not set
      const vercelUrl = this.configService.get('VERCEL_URL');
      console.log('VERCEL_URL from config:', vercelUrl);
      
      if (vercelUrl && vercelUrl.trim() !== '') {
        clientUrl = vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;
      } else {
        // Last resort: use localhost (but this won't work for production)
        console.warn('No CLIENT_URL or VERCEL_URL found, using localhost fallback');
        clientUrl = 'http://localhost:3000';
      }
    }
    
    // Trim all whitespace including newlines, carriage returns, tabs, etc.
    clientUrl = clientUrl.trim().replace(/[\n\r\t]/g, '');
    
    // Ensure URL has protocol
    if (clientUrl && !clientUrl.startsWith('http://') && !clientUrl.startsWith('https://')) {
      clientUrl = `https://${clientUrl}`;
    }
    
    // Remove trailing slash and any remaining whitespace
    clientUrl = clientUrl.replace(/\/$/, '').trim();
    
    // Validate URL format
    try {
      const urlObj = new URL(clientUrl);
      // Ensure it's a valid HTTP/HTTPS URL
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        throw new Error(`Invalid protocol: ${urlObj.protocol}`);
      }
      // Ensure it has a hostname
      if (!urlObj.hostname || urlObj.hostname === '') {
        throw new Error('Missing hostname');
      }
      console.log('Validated CLIENT_URL:', clientUrl);
      return clientUrl;
    } catch (error) {
      console.error('Invalid CLIENT_URL format:', clientUrl, error);
      // Don't use localhost in production - return error instead
      throw new Error(`Invalid CLIENT_URL configuration: ${clientUrl}. ${error.message}`);
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
      // Get client URL dynamically at runtime
      const clientUrl = this.getClientUrl();
      
      if (!clientUrl || clientUrl === 'http://localhost:3000') {
        console.warn('CLIENT_URL not properly configured, using fallback:', clientUrl);
      }
      
      // Ensure clientUrl doesn't have trailing slash
      const baseUrl = clientUrl.replace(/\/$/, '');
      const orderId = order._id.toString();
      
      // Construct URLs - Stripe requires absolute URLs
      const successUrl = `${baseUrl}/order/${orderId}?success=true&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/order/${orderId}?cancelled=true`;
      
      // Log URLs for debugging
      console.log('Stripe URL Configuration:', {
        clientUrl,
        baseUrl,
        successUrl,
        cancelUrl,
        orderId,
        envClientUrl: this.configService.get('CLIENT_URL'),
        envVercelUrl: this.configService.get('VERCEL_URL'),
      });
      
      // Validate URLs are properly formatted (test with a placeholder)
      try {
        const testSuccessUrl = successUrl.replace('{CHECKOUT_SESSION_ID}', 'test_session_id');
        const testSuccessUrlObj = new URL(testSuccessUrl);
        const testCancelUrlObj = new URL(cancelUrl);
        
        // Ensure URLs are absolute and use https (Stripe requirement)
        if (testSuccessUrlObj.protocol !== 'https:' && testSuccessUrlObj.protocol !== 'http:') {
          throw new Error(`Invalid protocol: ${testSuccessUrlObj.protocol}`);
        }
        
        console.log('URL validation passed:', {
          successUrlProtocol: testSuccessUrlObj.protocol,
          cancelUrlProtocol: testCancelUrlObj.protocol,
        });
      } catch (urlError) {
        console.error('Invalid URL format for Stripe redirects:', {
          error: urlError.message,
          successUrl,
          cancelUrl,
          clientUrl,
        });
        return {
          success: false,
          error: `Invalid CLIENT_URL configuration: ${clientUrl}. Error: ${urlError.message}`,
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
          orderId: orderId,
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
