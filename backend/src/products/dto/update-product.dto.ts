import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiProperty({ example: 'Sample Product', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '/images/sample.jpg', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: 'English', required: false })
  @IsOptional()
  @IsString()
  medium?: string;

  @ApiProperty({ example: 'Science', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  grade?: number;

  @ApiProperty({ example: 'Physics', required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ example: 'Mr. Smith', required: false })
  @IsOptional()
  @IsString()
  teacher?: string;

  @ApiProperty({ example: 'Product description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 99.99, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}

