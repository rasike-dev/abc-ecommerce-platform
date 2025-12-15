import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wishlist, WishlistDocument } from './schemas/wishlist.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name) private wishlistModel: Model<WishlistDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getWishlist(userId: string): Promise<WishlistDocument | null> {
    let wishlist = await this.wishlistModel
      .findOne({ user: userId })
      .populate('items.product')
      .exec();

    if (!wishlist) {
      // Create a new wishlist if it doesn't exist using findOneAndUpdate with upsert
      wishlist = await this.wishlistModel.findOneAndUpdate(
        { user: new Types.ObjectId(userId) },
        { $setOnInsert: { user: new Types.ObjectId(userId), items: [] } },
        { upsert: true, new: true }
      ).populate('items.product').exec();
    }

    return wishlist;
  }

  async addToWishlist(userId: string, productId: string): Promise<WishlistDocument | null> {
    // Verify product exists
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if product already exists in wishlist
    const existingWishlist = await this.wishlistModel.findOne({ 
      user: userId,
      'items.product': productId 
    });

    if (existingWishlist) {
      throw new BadRequestException('Product already in wishlist');
    }

    // Use atomic operation to add item - handles both creation and update
    const wishlist = await this.wishlistModel.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      { 
        $setOnInsert: { 
          user: new Types.ObjectId(userId),
          createdAt: new Date()
        },
        $push: { 
          items: { 
            product: new Types.ObjectId(productId), 
            addedAt: new Date() 
          } 
        }
      },
      { upsert: true, new: true }
    )
    .populate('items.product')
    .exec();

    return wishlist;
  }

  async removeFromWishlist(userId: string, productId: string): Promise<WishlistDocument | null> {
    const wishlist = await this.wishlistModel.findOne({ user: userId });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    // Remove product from wishlist
    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== productId,
    );

    await wishlist.save();

    // Populate and return
    return await this.wishlistModel
      .findById(wishlist._id)
      .populate('items.product')
      .exec();
  }

  async clearWishlist(userId: string): Promise<WishlistDocument> {
    const wishlist = await this.wishlistModel.findOne({ user: userId });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    wishlist.items = [];
    await wishlist.save();

    return wishlist;
  }
}

