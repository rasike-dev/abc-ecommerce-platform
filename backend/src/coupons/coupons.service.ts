import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from './schemas/coupon.schema';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
    const coupon = new this.couponModel({
      ...createCouponDto,
      code: createCouponDto.code.toUpperCase(),
    });
    return await coupon.save();
  }

  async findAll(): Promise<Coupon[]> {
    return await this.couponModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Coupon> {
    const coupon = await this.couponModel.findById(id).exec();
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  async findByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponModel
      .findOne({ code: code.toUpperCase() })
      .exec();
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  async validateCoupon(validateDto: ValidateCouponDto) {
    const { code, cartTotal, productIds = [] } = validateDto;

    // Find coupon
    const coupon = await this.findByCode(code);

    // Check if active
    if (!coupon.isActive) {
      throw new BadRequestException('This coupon is not active');
    }

    // Check expiry
    if (new Date() > new Date(coupon.expiryDate)) {
      throw new BadRequestException('This coupon has expired');
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }

    // Check minimum purchase amount
    if (coupon.minPurchaseAmount && cartTotal < coupon.minPurchaseAmount) {
      throw new BadRequestException(
        `Minimum purchase amount of LKR${coupon.minPurchaseAmount} required`,
      );
    }

    // Check applicable categories (if specified)
    if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
      // This would require product category checking - simplified for now
      // In a real app, you'd query products and check their categories
    }

    // Check applicable products (if specified)
    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      const hasApplicableProduct = productIds.some((id) =>
        coupon.applicableProducts.includes(id),
      );
      if (!hasApplicableProduct) {
        throw new BadRequestException(
          'This coupon is not applicable to items in your cart',
        );
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      // Apply max discount if specified
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      // Fixed amount
      discountAmount = Math.min(coupon.discountValue, cartTotal);
    }

    return {
      valid: true,
      coupon: {
        _id: (coupon as any)._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
      },
      discountAmount: Number(discountAmount.toFixed(2)),
      finalTotal: Number((cartTotal - discountAmount).toFixed(2)),
    };
  }

  async incrementUsage(code: string): Promise<void> {
    await this.couponModel
      .findOneAndUpdate({ code: code.toUpperCase() }, { $inc: { usedCount: 1 } })
      .exec();
  }

  async update(id: string, updateCouponDto: Partial<CreateCouponDto>): Promise<Coupon> {
    const coupon = await this.couponModel
      .findByIdAndUpdate(id, updateCouponDto, { new: true })
      .exec();
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  async remove(id: string): Promise<void> {
    const result = await this.couponModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Coupon not found');
    }
  }
}

