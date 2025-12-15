import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Admin } from '../common/decorators/admin.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination' })
  @ApiQuery({ name: 'pageNumber', required: false })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'code', required: false })
  async findAll(
    @Query('pageNumber') pageNumber?: number,
    @Query('keyword') keyword?: string,
    @Query('code') code?: string,
  ) {
    return this.productsService.findAll(pageNumber, keyword, code);
  }

  @Get('top')
  @ApiOperation({ summary: 'Get top rated products' })
  async getTopProducts() {
    return this.productsService.getTopProducts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Admin()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a product (Admin only)' })
  async create(
    @GetUser() user: any,
    @Body() createProductDto?: CreateProductDto,
  ) {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // If no body provided, create a sample product
    if (!createProductDto || Object.keys(createProductDto).length === 0) {
      return this.productsService.createSampleProduct(user);
    }
    return this.productsService.create(user, createProductDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Admin()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a product (Admin only)' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Admin()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a product (Admin only)' })
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a product review' })
  async createReview(
    @Param('id') id: string,
    @GetUser() user: any,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.productsService.createReview(id, user, createReviewDto);
  }
}

