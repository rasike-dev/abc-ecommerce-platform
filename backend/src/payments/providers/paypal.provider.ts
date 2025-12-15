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
  private clientUrl: string;

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get('PAYPAL_CLIENT_ID') || '';
    this.clientSecret = this.configService.get('PAYPAL_CLIENT_SECRET') || '';
    this.apiUrl = this.configService.get('PAYPAL_API_URL') || 'https://api-m.sandbox.paypal.com';
    this.clientUrl = this.configService.get('CLIENT_URL') || 'http://localhost:3000';
  }

  getProviderName(): string {
    return 'paypal';
  }

  async createCheckoutSession(order: OrderDocument): Promise<PaymentResult> {
    try {
      const accessToken = await this.getAccessToken();

      const paymentData = {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: order._id.toString(),
          amount: {
            currency_code: 'USD',
            value: order.totalPrice.toFixed(2),
          },
          description: `Order ${order._id} - ${(typeof order.user === 'object' && 'name' in order.user ? order.user.name : 'Customer')}`,
        }],
        application_context: {
          return_url: `${this.clientUrl}/order/${order._id}?success=true`,
          cancel_url: `${this.clientUrl}/order/${order._id}?cancelled=true`,
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

      return {
        success: true,
        transactionId: response.data.id,
        providerResponse: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: 'PayPal session creation failed',
        providerResponse: error.response?.data,
      };
    }
  }

  async validatePayment(paymentData: any): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const { orderId } = paymentData;

      const response = await axios.get(
        `${this.apiUrl}/v2/checkout/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data.status === 'APPROVED';
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
