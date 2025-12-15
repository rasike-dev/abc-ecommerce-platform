import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { PaymentFactory } from './payment.factory';

@Injectable()
export class PaymentsService {
  constructor(
    private ordersService: OrdersService,
    private paymentFactory: PaymentFactory,
  ) {}

  async createPaymentSession(orderId: string, providerName?: string) {
    const order = await this.ordersService.findById(orderId);

    // Determine provider - use order's paymentProvider or fallback to parameter
    const provider = providerName || order.paymentProvider || 'stripe';
    const paymentProvider = this.paymentFactory.getProvider(provider);

    const result = await paymentProvider.createCheckoutSession(order);

    if (result.success) {
      // Update order with payment session details
      order.paymentResult = {
        ...order.paymentResult,
        sessionId: result.transactionId,
        ...(result.providerResponse && { providerResponse: result.providerResponse }),
      };
      await order.save();

      return {
        success: true,
        message: 'Payment session created successfully',
        data: {
          ...result.providerResponse,
          redirectUrl: result.redirectUrl,
        },
        provider: provider,
        redirectUrl: result.redirectUrl,
      };
    } else {
      return {
        success: false,
        message: result.error || 'Payment session creation failed',
        error: result.providerResponse,
        data: null,
      };
    }
  }

  // Backward compatibility - keep existing ComBank method
  async createCombankSession(orderId: string) {
    return this.createPaymentSession(orderId, 'combank');
  }

  async validatePayment(orderId: string, paymentData: any) {
    console.log('=== PAYMENT VALIDATION SERVICE ===');
    console.log('Order ID:', orderId);
    console.log('Payment Data:', paymentData);
    
    const order = await this.ordersService.findById(orderId);
    console.log('Order found:', !!order);
    console.log('Order payment provider:', order?.paymentProvider);
    
    const provider = this.paymentFactory.getProvider(order.paymentProvider || 'combank');
    console.log('Payment provider:', provider.getProviderName());

    const isValid = await provider.validatePayment(paymentData);
    console.log('Payment validation result:', isValid);

    if (isValid) {
      order.isPaid = true;
      order.paidAt = new Date();
      await order.save();
      console.log('✅ Order marked as paid');

      return {
        success: true,
        message: 'Payment validated successfully',
        order,
      };
    } else {
      order.isPaymentFail = true;
      await order.save();
      console.log('❌ Order marked as payment failed');

      return {
        success: false,
        message: 'Payment validation failed',
        order,
      };
    }
  }

  async refundPayment(orderId: string, amount?: number) {
    const order = await this.ordersService.findById(orderId);
    const provider = this.paymentFactory.getProvider(order.paymentProvider || 'combank');

    const result = await provider.refundPayment(order, amount);

    return {
      success: result.success,
      message: result.success ? 'Refund processed successfully' : 'Refund failed',
      data: result.providerResponse,
      error: result.error,
    };
  }

  getAvailableProviders() {
    return this.paymentFactory.getAvailableProviders();
  }
}

