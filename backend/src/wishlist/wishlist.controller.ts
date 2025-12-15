import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Wishlist')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get user wishlist' })
  async getWishlist(@GetUser() user: any) {
    const userId = user._id || user.id || user;
    return await this.wishlistService.getWishlist(userId.toString());
  }

  @Post()
  @ApiOperation({ summary: 'Add product to wishlist' })
  async addToWishlist(@GetUser() user: any, @Body() addToWishlistDto: AddToWishlistDto) {
    const userId = user._id || user.id || user;
    return await this.wishlistService.addToWishlist(
      userId.toString(),
      addToWishlistDto.productId,
    );
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  async removeFromWishlist(@GetUser() user: any, @Param('productId') productId: string) {
    const userId = user._id || user.id || user;
    return await this.wishlistService.removeFromWishlist(userId.toString(), productId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear wishlist' })
  async clearWishlist(@GetUser() user: any) {
    const userId = user._id || user.id || user;
    return await this.wishlistService.clearWishlist(userId.toString());
  }
}

