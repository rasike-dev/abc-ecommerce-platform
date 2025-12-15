import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CouponDocument = Coupon & Document;

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, enum: ['percentage', 'fixed'] })
  discountType: string;

  @Prop({ required: true, min: 0 })
  discountValue: number;

  @Prop()
  description: string;

  @Prop({ required: true })
  expiryDate: Date;

  @Prop({ default: 0 })
  minPurchaseAmount: number;

  @Prop({ default: null })
  maxDiscountAmount: number;

  @Prop({ default: null })
  usageLimit: number;

  @Prop({ default: 0 })
  usedCount: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  applicableCategories: string[];

  @Prop({ type: [String], default: [] })
  applicableProducts: string[];
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

