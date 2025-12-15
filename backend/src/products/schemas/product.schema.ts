import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  rating: number;

  @Prop({ required: true })
  comment: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: false, default: 'Sample Product' })
  name: string;

  @Prop({ required: false, default: '/images/sample.jpg' })
  image: string;

  @Prop({ required: false, default: 'English' })
  medium: string;

  @Prop({ required: false, default: 'Uncategorized' })
  category: string;

  @Prop({ default: 0 })
  grade: number;

  @Prop({ default: '' })
  subject: string;

  @Prop({ default: '' })
  teacher: string;

  @Prop({ required: false, default: 'Product description' })
  description: string;

  @Prop({ type: [ReviewSchema], default: [] })
  reviews: Review[];

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  numReviews: number;

  @Prop({ default: 0 })
  price: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
