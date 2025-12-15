import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CarouselService } from './carousel.service';
import { CreateCarouselDto } from './dto/create-carousel.dto';
import { UpdateCarouselDto } from './dto/update-carousel.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Admin } from '../common/decorators/admin.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Carousel')
@Controller('carousel')
export class CarouselController {
  constructor(private carouselService: CarouselService) {}

  @Get()
  @ApiOperation({ summary: 'Get all carousel items' })
  async findAll() {
    return this.carouselService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get carousel item by ID' })
  async findOne(@Param('id') id: string) {
    return this.carouselService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Admin()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a carousel item (Admin only)' })
  async create(@GetUser() user: any, @Body() createCarouselDto: CreateCarouselDto) {
    return this.carouselService.create(user._id, createCarouselDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Admin()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a carousel item (Admin only)' })
  async update(
    @Param('id') id: string,
    @Body() updateCarouselDto: UpdateCarouselDto,
  ) {
    return this.carouselService.update(id, updateCarouselDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Admin()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a carousel item (Admin only)' })
  async remove(@Param('id') id: string) {
    return this.carouselService.remove(id);
  }
}

