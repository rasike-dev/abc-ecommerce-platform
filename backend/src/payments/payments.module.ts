import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentFactory } from './payment.factory';
import { OrdersModule } from '../orders/orders.module';
import { CombankProvider } from './providers/combank.provider';
import { PaypalProvider } from './providers/paypal.provider';
import { StripeProvider } from './providers/stripe.provider';

@Module({
  imports: [OrdersModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentFactory,
    CombankProvider,
    PaypalProvider,
    StripeProvider,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}

