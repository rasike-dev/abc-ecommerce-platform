import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CarouselDocument = Carousel & Document;

@Schema({ timestamps: true })
export class Carousel {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  description: string;
}

export const CarouselSchema = SchemaFactory.createForClass(Carousel);

