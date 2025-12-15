import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePaymentDto {
  @ApiProperty()
  @IsString()
  resultIndicator: string;

  @ApiProperty()
  @IsString()
  sessionVersion: string;
}

