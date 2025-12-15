import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Group, GroupSchema } from '../groups/schemas/group.schema';
import { Carousel, CarouselSchema } from '../carousel/schemas/carousel.schema';
import { Coupon, CouponSchema } from '../coupons/schemas/coupon.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Carousel.name, schema: CarouselSchema },
      { name: Coupon.name, schema: CouponSchema },
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}

