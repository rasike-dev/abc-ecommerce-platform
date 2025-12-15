import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderDocument> {
    const order = new this.orderModel({
      ...createOrderDto,
      user: userId,
    });
    return order.save();
  }

  async findById(id: string): Promise<OrderDocument> {
    const order = await this.orderModel
      .findById(id)
      .populate('user', 'name email')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateToPaid(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (
      updatePaymentDto.resultIndicator ===
      order.paymentResult.successIndicator
    ) {
      order.isPaid = true;
      order.isPaymentFail = false;
    } else {
      order.isPaid = false;
      order.isPaymentFail = true;
    }

    order.paidAt = new Date();
    order.paymentResult.resultIndicator = updatePaymentDto.resultIndicator;
    order.paymentResult.sessionVersion = updatePaymentDto.sessionVersion;

    return order.save();
  }

  async updateToDelivered(id: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.isDelivered = true;
    order.deliveredAt = new Date();

    return order.save();
  }

  async findUserOrders(userId: string): Promise<OrderDocument[]> {
    return this.orderModel.find({ user: userId }).exec();
  }

  async findAll(): Promise<OrderDocument[]> {
    return this.orderModel.find({}).populate('user', 'id name').exec();
  }
}

