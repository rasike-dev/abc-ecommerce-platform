import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional, Min } from 'class-validator';

export class ValidateCouponDto {
  @ApiProperty({ example: 'SAVE20', description: 'Coupon code to validate' })
  @IsString()
  code: string;

  @ApiProperty({ example: 1500, description: 'Cart total amount' })
  @IsNumber()
  @Min(0)
  cartTotal: number;

  @ApiProperty({ example: ['productId1', 'productId2'], required: false })
  @IsArray()
  @IsOptional()
  productIds?: string[];
}

