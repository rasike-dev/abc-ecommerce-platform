import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Admin } from '../common/decorators/admin.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new order' })
  async create(@GetUser() user: any, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(user._id, createOrderDto);
  }

  @Get('myorders')
  @ApiOperation({ summary: 'Get logged in user orders' })
  async getMyOrders(@GetUser() user: any) {
    return this.ordersService.findUserOrders(user._id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Put(':id/pay')
  @ApiOperation({ summary: 'Update order to paid' })
  async updateOrderToPaid(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.ordersService.updateToPaid(id, updatePaymentDto);
  }

  @Put(':id/deliver')
  @UseGuards(RolesGuard)
  @Admin()
  @ApiOperation({ summary: 'Update order to delivered (Admin only)' })
  async updateOrderToDelivered(@Param('id') id: string) {
    return this.ordersService.updateToDelivered(id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Admin()
  @ApiOperation({ summary: 'Get all orders (Admin only)' })
  async findAll() {
    return this.ordersService.findAll();
  }
}

