import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('combank/:id')
  @ApiOperation({ summary: 'Create Commercial Bank payment session' })
  async createCombankSession(@Param('id') id: string) {
    return this.paymentsService.createCombankSession(id);
  }
}

