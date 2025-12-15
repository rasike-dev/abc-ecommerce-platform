import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Group, GroupDocument } from '../groups/schemas/group.schema';
import { Carousel, CarouselDocument } from '../carousel/schemas/carousel.schema';
import { Coupon, CouponDocument } from '../coupons/schemas/coupon.schema';
import { seedUsers, seedGroups, seedProducts, seedCarousel, seedCoupons } from './seed.data';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(Carousel.name) private carouselModel: Model<CarouselDocument>,
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  async seedDatabase() {
    try {
      this.logger.log('Starting database seeding...');

      // Clear existing data
      await this.clearDatabase();

      // Seed users first (needed for references)
      const users = await this.seedUsers();
      this.logger.log(`✓ Seeded ${users.length} users`);

      // Seed groups (with teacher references to users)
      const groups = await this.seedGroups(users);
      this.logger.log(`✓ Seeded ${groups.length} groups`);

      // Seed products (with user references)
      const products = await this.seedProducts(users);
      this.logger.log(`✓ Seeded ${products.length} products`);

      // Seed carousel (with admin user reference)
      const carouselItems = await this.seedCarousel(users);
      this.logger.log(`✓ Seeded ${carouselItems.length} carousel items`);

      // Seed coupons
      const coupons = await this.seedCoupons();
      this.logger.log(`✓ Seeded ${coupons.length} coupons`);

      this.logger.log('Database seeding completed successfully!');
      return {
        success: true,
        data: {
          users: users.length,
          groups: groups.length,
          products: products.length,
          carousel: carouselItems.length,
          coupons: coupons.length,
        },
      };
    } catch (error) {
      this.logger.error('Error seeding database:', error);
      throw error;
    }
  }

  private async clearDatabase() {
    this.logger.log('Clearing existing data...');
    await Promise.all([
      this.userModel.deleteMany({}),
      this.productModel.deleteMany({}),
      this.groupModel.deleteMany({}),
      this.carouselModel.deleteMany({}),
      this.couponModel.deleteMany({}),
    ]);
    this.logger.log('✓ Database cleared');
  }

  private async seedUsers(): Promise<UserDocument[]> {
    const users = await this.userModel.create(seedUsers);
    return users;
  }

  private async seedGroups(users: UserDocument[]): Promise<GroupDocument[]> {
    // Map teacher names to user references where available
    const groupsWithUsers = seedGroups.map((group, index) => {
      const teacherUser = users.find(
        (u) => u.name.toLowerCase() === group.teacher.name.toLowerCase(),
      );
      
      return {
        ...group,
        teacher: {
          ...group.teacher,
          user: teacherUser?._id || users[index % users.length]._id,
        },
      };
    });

    const groups = await this.groupModel.create(groupsWithUsers);
    return groups;
  }

  private async seedProducts(users: UserDocument[]): Promise<ProductDocument[]> {
    // Assign products to admin user (first user)
    const adminUser = users[0];
    
    const productsWithUsers = seedProducts.map((product) => ({
      ...product,
      user: adminUser._id,
      reviews: [],
    }));

    const products = await this.productModel.create(productsWithUsers);

    // Add some sample reviews
    await this.addSampleReviews(products, users);

    return products;
  }

  private async addSampleReviews(
    products: ProductDocument[],
    users: UserDocument[],
  ) {
    // Add 2-3 reviews to each product
    for (const product of products) {
      const numReviews = Math.floor(Math.random() * 2) + 2; // 2-3 reviews
      const reviews = [];

      for (let i = 0; i < numReviews; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        reviews.push({
          name: randomUser.name,
          rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
          comment: this.getRandomReview(),
          user: randomUser._id,
          createdAt: new Date(),
        });
      }

      product.reviews = reviews;
      product.numReviews = reviews.length;
      product.rating =
        reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
      
      await product.save();
    }
  }

  private getRandomReview(): string {
    const reviews = [
      'Excellent course! Very informative and well-structured.',
      'Great content and easy to follow. Highly recommended!',
      'This course exceeded my expectations. The teacher is amazing!',
      'Very helpful and comprehensive. Worth every penny!',
      'Outstanding quality and great explanations throughout.',
      'Clear, concise, and practical. Loved every lesson!',
      'Best course I\'ve taken in this subject. Very thorough.',
      'Fantastic learning experience. Would recommend to anyone!',
      'Well organized and professionally presented.',
      'Incredible value for money. Learned so much!',
    ];
    return reviews[Math.floor(Math.random() * reviews.length)];
  }

  private async seedCarousel(users: UserDocument[]): Promise<CarouselDocument[]> {
    // Assign all carousel items to admin user
    const adminUser = users[0];
    
    const carouselWithUsers = seedCarousel.map((item) => ({
      ...item,
      user: adminUser._id,
    }));

    const carousel = await this.carouselModel.create(carouselWithUsers);
    return carousel;
  }

  private async seedCoupons(): Promise<CouponDocument[]> {
    const coupons = await this.couponModel.create(seedCoupons);
    return coupons;
  }

  async clearAll() {
    await this.clearDatabase();
    this.logger.log('All data cleared successfully');
    return { success: true, message: 'All data cleared' };
  }
}

