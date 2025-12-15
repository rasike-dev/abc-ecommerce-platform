import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Admin } from '../common/decorators/admin.decorator';

@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Admin()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new coupon (Admin only)' })
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.create(createCouponDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Admin()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all coupons (Admin only)' })
  findAll() {
    return this.couponsService.findAll();
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Validate a coupon code' })
  validate(@Body() validateCouponDto: ValidateCouponDto) {
    return this.couponsService.validateCoupon(validateCouponDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Admin()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a coupon by ID (Admin only)' })
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Admin()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a coupon (Admin only)' })
  update(@Param('id') id: string, @Body() updateCouponDto: Partial<CreateCouponDto>) {
    return this.couponsService.update(id, updateCouponDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Admin()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a coupon (Admin only)' })
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}

