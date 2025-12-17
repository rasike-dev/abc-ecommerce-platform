import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PaymentStrategy, PaymentResult } from '../interfaces/payment-strategy.interface';
import { OrderDocument } from '../../orders/schemas/order.schema';

@Injectable()
export class PaypalProvider implements PaymentStrategy {
  private clientId: string;
  private clientSecret: string;
  private apiUrl: string;

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get('PAYPAL_CLIENT_ID') || '';
    this.clientSecret = this.configService.get('PAYPAL_CLIENT_SECRET') || '';
    this.apiUrl = this.configService.get('PAYPAL_API_URL') || 'https://api-m.sandbox.paypal.com';
  }

  /**
   * Get client URL dynamically at runtime
   * This ensures environment variables are available in serverless environments
   */
  private getClientUrl(): string {
    // Get CLIENT_URL or construct from VERCEL_URL
    let clientUrl = this.configService.get('CLIENT_URL');
    
    // If CLIENT_URL is empty, null, or undefined, try alternatives
    if (!clientUrl || clientUrl.trim() === '') {
      // Fallback to VERCEL_URL if CLIENT_URL is not set
      const vercelUrl = this.configService.get('VERCEL_URL');
      if (vercelUrl && vercelUrl.trim() !== '') {
        clientUrl = vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;
      } else {
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
      return clientUrl;
    } catch (error) {
      console.error('Invalid CLIENT_URL format for PayPal:', clientUrl, error);
      return 'http://localhost:3000'; // Fallback to localhost
    }
  }

  getProviderName(): string {
    return 'paypal';
  }

  async createCheckoutSession(order: OrderDocument): Promise<PaymentResult> {
    try {
      const accessToken = await this.getAccessToken();
      
      // Get client URL dynamically at runtime
      const clientUrl = this.getClientUrl();
      const orderId = order._id.toString();
      
      const returnUrl = `${clientUrl}/order/${orderId}?success=true`;
      const cancelUrl = `${clientUrl}/order/${orderId}?cancelled=true`;
      
      // Log URLs for debugging
      console.log('PayPal URL Configuration:', {
        clientUrl,
        returnUrl,
        cancelUrl,
        orderId,
        envClientUrl: this.configService.get('CLIENT_URL'),
        envVercelUrl: this.configService.get('VERCEL_URL'),
      });
      
      // Validate URLs before sending to PayPal
      try {
        new URL(returnUrl);
        new URL(cancelUrl);
      } catch (urlError) {
        console.error('Invalid URL format for PayPal redirects:', {
          error: urlError.message,
          returnUrl,
          cancelUrl,
          clientUrl,
        });
        return {
          success: false,
          error: `Invalid CLIENT_URL configuration: ${clientUrl}. Error: ${urlError.message}`,
        };
      }

      const paymentData = {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: orderId,
          amount: {
            currency_code: 'USD',
            value: order.totalPrice.toFixed(2),
          },
          description: `Order ${orderId} - ${(typeof order.user === 'object' && 'name' in order.user ? order.user.name : 'Customer')}`,
        }],
        application_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
          brand_name: 'ABCSCHOOL.lk',
        },
      };

      const response = await axios.post(
        `${this.apiUrl}/v2/checkout/orders`,
        paymentData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const approvalLink = response.data.links.find((link: any) => link.rel === 'approve');
      
      return {
        success: true,
        transactionId: response.data.id,
        redirectUrl: approvalLink?.href,
        providerResponse: response.data,
      };
    } catch (error) {
      console.error('PayPal session creation error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'PayPal session creation failed';
      const errorDetails = error.response?.data?.details || [];
      
      console.error('PayPal error details:', {
        message: errorMessage,
        details: errorDetails,
        debug_id: error.response?.data?.debug_id,
      });
      
      return {
        success: false,
        error: errorMessage,
        providerResponse: error.response?.data || error,
      };
    }
  }

  async validatePayment(paymentData: any): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const { token } = paymentData; // PayPal uses 'token' parameter for order ID

      const response = await axios.get(
        `${this.apiUrl}/v2/checkout/orders/${token}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      // Check if the order is approved and capture the payment
      if (response.data.status === 'APPROVED') {
        const captureResponse = await axios.post(
          `${this.apiUrl}/v2/checkout/orders/${token}/capture`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        
        return captureResponse.data.status === 'COMPLETED';
      }

      return false;
    } catch (error) {
      console.error('PayPal validation error:', error);
      return false;
    }
  }

  async refundPayment(order: OrderDocument, amount?: number): Promise<PaymentResult> {
    try {
      const accessToken = await this.getAccessToken();
      const refundAmount = amount || order.totalPrice;

      // First get the capture ID from the order's payment result
      const captureId = (order.paymentResult as any)?.captureId;

      if (!captureId) {
        throw new Error('No capture ID found for refund');
      }

      const refundData = {
        amount: {
          value: refundAmount.toFixed(2),
          currency_code: 'USD',
        },
      };

      const response = await axios.post(
        `${this.apiUrl}/v2/payments/captures/${captureId}/refund`,
        refundData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return {
        success: true,
        transactionId: response.data.id,
        providerResponse: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: 'PayPal refund failed',
        providerResponse: error.response?.data,
      };
    }
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await axios.post(
      `${this.apiUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${auth}`,
        },
      },
    );

    return response.data.access_token;
  }
}
