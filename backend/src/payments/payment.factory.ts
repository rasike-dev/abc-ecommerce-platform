import { Injectable, Inject } from '@nestjs/common';
import { PaymentStrategy } from './interfaces/payment-strategy.interface';
import { CombankProvider } from './providers/combank.provider';
import { PaypalProvider } from './providers/paypal.provider';
import { StripeProvider } from './providers/stripe.provider';

@Injectable()
export class PaymentFactory {
  private providers: Map<string, PaymentStrategy> = new Map();

  constructor(
    private combankProvider: CombankProvider,
    private paypalProvider: PaypalProvider,
    private stripeProvider: StripeProvider,
  ) {
    // Register all payment providers
    this.providers.set(combankProvider.getProviderName(), combankProvider);
    this.providers.set(paypalProvider.getProviderName(), paypalProvider);
    this.providers.set(stripeProvider.getProviderName(), stripeProvider);
  }

  getProvider(providerName: string): PaymentStrategy {
    const provider = this.providers.get(providerName.toLowerCase());
    if (!provider) {
      throw new Error(`Payment provider '${providerName}' not found`);
    }
    return provider;
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  isProviderAvailable(providerName: string): boolean {
    return this.providers.has(providerName.toLowerCase());
  }
}
