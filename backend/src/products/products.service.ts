import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findAll(
    pageNumber = 1,
    keyword = '',
    code = '',
    grade?: number,
    subject?: string,
    minPrice?: number,
    maxPrice?: number,
    sortBy?: string,
  ): Promise<{ products: ProductDocument[]; page: number; pages: number }> {
    const pageSize = 10;
    const page = Number(pageNumber) || 1;

    const query: any = {};

    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }

    if (code) {
      query.category = code;
    }

    if (grade) {
      query.grade = Number(grade);
    }

    if (subject) {
      query.subject = { $regex: subject, $options: 'i' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // Sorting
    let sortOptions: any = { createdAt: -1 }; // Default: newest first
    
    if (sortBy) {
      switch (sortBy) {
        case 'price-asc':
          sortOptions = { price: 1 };
          break;
        case 'price-desc':
          sortOptions = { price: -1 };
          break;
        case 'rating-desc':
          sortOptions = { rating: -1 };
          break;
        case 'rating-asc':
          sortOptions = { rating: 1 };
          break;
        case 'name-asc':
          sortOptions = { name: 1 };
          break;
        case 'name-desc':
          sortOptions = { name: -1 };
          break;
      }
    }

    const count = await this.productModel.countDocuments(query);
    const products = await this.productModel
      .find(query)
      .sort(sortOptions)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .exec();

    return {
      products,
      page,
      pages: Math.ceil(count / pageSize),
    };
  }

  async findById(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async createSampleProduct(user: any): Promise<ProductDocument> {
    const userId = user._id || user.id || user;
    
    const product = new this.productModel({
      name: 'Sample Product Name',
      image: '/images/sample.jpg',
      medium: 'English',
      category: 'sample-category',
      grade: 10,
      subject: 'Sample Subject',
      teacher: 'Sample Teacher',
      description: 'Sample description',
      price: 0,
      user: userId,
      numReviews: 0,
      rating: 0,
      reviews: [],
    });
    return product.save();
  }

  async create(
    user: any,
    createProductDto: CreateProductDto,
  ): Promise<ProductDocument> {
    const userId = user._id || user.id || user;
    
    const product = new this.productModel({
      ...createProductDto,
      user: userId,
    });
    return product.save();
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductDocument> {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    Object.assign(product, updateProductDto);
    return product.save();
  }

  async remove(id: string): Promise<{ message: string }> {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await product.deleteOne();
    return { message: 'Product removed' };
  }

  async createReview(
    id: string,
    user: any,
    createReviewDto: CreateReviewDto,
  ): Promise<{ message: string }> {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === user._id.toString(),
    );

    if (alreadyReviewed) {
      throw new BadRequestException('Product already reviewed');
    }

    const review = {
      name: user.name,
      rating: Number(createReviewDto.rating),
      comment: createReviewDto.comment,
      user: user._id,
      createdAt: new Date(),
    };

    product.reviews.push(review as any);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    return { message: 'Review added' };
  }

  async getTopProducts(): Promise<ProductDocument[]> {
    return this.productModel.find({}).sort({ rating: -1 }).limit(3).exec();
  }
}

