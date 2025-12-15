import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PaymentStrategy, PaymentResult } from '../interfaces/payment-strategy.interface';
import { OrderDocument } from '../../orders/schemas/order.schema';

@Injectable()
export class CombankProvider implements PaymentStrategy {
  private apiUsername: string;
  private apiPassword: string;
  private merchant: string;
  private apiUrl: string;
  private clientUrl: string;

  constructor(private configService: ConfigService) {
    this.apiUsername = this.configService.get('COMBANK_API_USERNAME') || '';
    this.apiPassword = this.configService.get('COMBANK_API_PASSWORD') || '';
    this.merchant = this.configService.get('COMBANK_MERCHANT_ID') || '';
    this.apiUrl = this.configService.get('COMBANK_TEST_URL') || '';
    this.clientUrl = this.configService.get('CLIENT_URL') || 'http://localhost:3000';
  }

  getProviderName(): string {
    return 'combank';
  }

  async createCheckoutSession(order: OrderDocument): Promise<PaymentResult> {
    // Handle both populated and non-populated user data
    const user = typeof order.user === 'object' && order.user && 'name' in order.user && 'email' in order.user
      ? order.user as any
      : { name: 'Customer', email: 'customer@example.com' };

    const description = `${user.name} ${user.email}`;

    const requestParams = new URLSearchParams({
      apiOperation: 'CREATE_CHECKOUT_SESSION',
      apiUsername: this.apiUsername,
      apiPassword: this.apiPassword,
      merchant: this.merchant,
      'order.id': order._id.toString(),
      'order.amount': order.totalPrice.toString(),
      'order.currency': 'LKR',
      'order.description': description,
      'interaction.operation': 'PURCHASE',
      'interaction.returnUrl': `${this.clientUrl}/order/${order._id}/`,
      'interaction.merchant.name': 'ABCSCHOOL.lk',
    });

    try {
      const response = await axios.post(
        this.apiUrl,
        requestParams.toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      const parsedResponse = this.parseResponse(response.data, order._id.toString());

      return {
        success: parsedResponse.result === 'SUCCESS',
        transactionId: parsedResponse.sessionId,
        providerResponse: parsedResponse,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Session creation failed, try again in few minutes',
        providerResponse: error.response?.data,
      };
    }
  }

  async validatePayment(paymentData: any): Promise<boolean> {
    // ComBank validation logic - check successIndicator
    const { successIndicator, orderId } = paymentData;
    // Implement validation logic based on ComBank's response
    return successIndicator && successIndicator.length > 0;
  }

  async refundPayment(order: OrderDocument, amount?: number): Promise<PaymentResult> {
    // Implement refund logic for ComBank
    // This would involve calling ComBank's refund API
    throw new Error('Refund not implemented for ComBank yet');
  }

  private parseResponse(data: string, orderId: string) {
    const responseObj: any = { orderId };
    const values = data.split('&');

    for (const value of values) {
      const [key, val] = value.split('=');
      if (key === 'result') responseObj.result = val;
      else if (key === 'session.id') responseObj.sessionId = val;
      else if (key === 'session.version') responseObj.sessionVersion = val;
      else if (key === 'session.updateStatus') responseObj.sessionUpdateStatus = val;
      else if (key === 'successIndicator') responseObj.successIndicator = val;
      else if (key === 'merchant') responseObj.merchant = val;
    }

    return responseObj;
  }
}

