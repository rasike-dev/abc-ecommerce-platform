import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { GroupsModule } from './groups/groups.module';
import { CarouselModule } from './carousel/carousel.module';
import { PaymentsModule } from './payments/payments.module';
import { UploadsModule } from './uploads/uploads.module';
import { SeedModule } from './seed/seed.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CouponsModule } from './coupons/coupons.module';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // MongoDB connection - prioritize MONGODB_URI, fallback to MONGO_URI for compatibility
    MongooseModule.forRoot(
      process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce',
    ),

    // Feature modules
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    GroupsModule,
    CarouselModule,
    PaymentsModule,
    UploadsModule,
    SeedModule,
    WishlistModule,
    CouponsModule,
  ],
})
export class AppModule {}
