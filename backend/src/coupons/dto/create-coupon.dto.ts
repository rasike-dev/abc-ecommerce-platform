import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsDate,
  IsBoolean,
  IsOptional,
  IsArray,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCouponDto {
  @ApiProperty({ example: 'SAVE20', description: 'Coupon code (uppercase)' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'percentage', enum: ['percentage', 'fixed'] })
  @IsEnum(['percentage', 'fixed'])
  discountType: string;

  @ApiProperty({ example: 20, description: 'Discount value (20 for 20% or 20 for $20)' })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiProperty({ example: 'Get 20% off on all courses', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2025-12-31', description: 'Coupon expiry date' })
  @Type(() => Date)
  @IsDate()
  expiryDate: Date;

  @ApiProperty({ example: 100, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minPurchaseAmount?: number;

  @ApiProperty({ example: 50, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscountAmount?: number;

  @ApiProperty({ example: 100, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  usageLimit?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: ['A/L'], required: false })
  @IsArray()
  @IsOptional()
  applicableCategories?: string[];

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  applicableProducts?: string[];
}

