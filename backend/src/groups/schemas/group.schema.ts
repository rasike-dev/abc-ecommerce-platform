import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GroupDocument = Group & Document;

@Schema()
export class Teacher {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;
}

@Schema({ timestamps: true })
export class Group {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  code: string;

  @Prop()
  subject: string;

  @Prop()
  medium: string;

  @Prop({ type: Teacher })
  teacher: Teacher;

  @Prop({ required: true })
  description: string;
}

export const GroupSchema = SchemaFactory.createForClass(Group);

