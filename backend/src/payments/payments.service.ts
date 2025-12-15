import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { CombankProvider } from './providers/combank.provider';

@Injectable()
export class PaymentsService {
  constructor(
    private ordersService: OrdersService,
    private combankProvider: CombankProvider,
  ) {}

  async createCombankSession(orderId: string) {
    const order = await this.ordersService.findById(orderId);

    const response = await this.combankProvider.createCheckoutSession(order);

    // Update order with payment session details
    if (response.result === 'SUCCESS') {
      order.paymentResult.successIndicator = response.successIndicator;
      order.paymentResult.sessionId = response.sessionId;
      order.paymentResult.sessionVersion = response.sessionVersion;
      await order.save();

      return {
        message: 'Session created successfully',
        data: response,
      };
    } else {
      return {
        message: 'error: Session creation failed, try again in few minutes',
        error: response,
        data: null,
      };
    }
  }
}

