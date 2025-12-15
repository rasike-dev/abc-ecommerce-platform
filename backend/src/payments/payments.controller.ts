import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Public()
  @Get('providers')
  @ApiOperation({ summary: 'Get available payment providers' })
  getAvailableProviders() {
    return {
      providers: this.paymentsService.getAvailableProviders(),
    };
  }

  // Specific routes must come before generic parameter routes
  @Post('validate/:id')
  @ApiOperation({ summary: 'Validate payment for order' })
  async validatePayment(
    @Param('id') orderId: string,
    @Body() paymentData: any,
  ) {
    return this.paymentsService.validatePayment(orderId, paymentData);
  }

  @Post('refund/:id')
  @ApiOperation({ summary: 'Process refund for order' })
  async refundPayment(
    @Param('id') orderId: string,
    @Body() refundData: { amount?: number },
  ) {
    return this.paymentsService.refundPayment(orderId, refundData.amount);
  }

  // Backward compatibility
  @Post('combank/:id')
  @ApiOperation({ summary: 'Create Commercial Bank payment session' })
  async createCombankSession(@Param('id') id: string) {
    return this.paymentsService.createCombankSession(id);
  }

  @Post(':provider/:id')
  @ApiOperation({ summary: 'Create payment session for specified provider' })
  async createPaymentSession(
    @Param('provider') provider: string,
    @Param('id') orderId: string,
  ) {
    return this.paymentsService.createPaymentSession(orderId, provider);
  }
}

