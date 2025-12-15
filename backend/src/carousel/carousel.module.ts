import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarouselService } from './carousel.service';
import { CarouselController } from './carousel.controller';
import { Carousel, CarouselSchema } from './schemas/carousel.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Carousel.name, schema: CarouselSchema }]),
  ],
  controllers: [CarouselController],
  providers: [CarouselService],
  exports: [CarouselService],
})
export class CarouselModule {}

