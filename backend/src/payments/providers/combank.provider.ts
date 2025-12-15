import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class CombankProvider {
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

  async createCheckoutSession(order: any) {
    const description = `${order.user.name} ${order.user.email}`;

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

      return this.parseResponse(response.data, order._id);
    } catch (error) {
      throw new HttpException(
        'Session creation failed, try again in few minutes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

