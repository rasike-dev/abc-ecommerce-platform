import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCarouselDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  image: string;

  @ApiProperty()
  @IsString()
  description: string;
}

