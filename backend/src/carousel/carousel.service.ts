import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Carousel, CarouselDocument } from './schemas/carousel.schema';
import { CreateCarouselDto } from './dto/create-carousel.dto';
import { UpdateCarouselDto } from './dto/update-carousel.dto';

@Injectable()
export class CarouselService {
  constructor(
    @InjectModel(Carousel.name) private carouselModel: Model<CarouselDocument>,
  ) {}

  async findAll(): Promise<CarouselDocument[]> {
    return this.carouselModel.find().exec();
  }

  async findById(id: string): Promise<CarouselDocument> {
    const carousel = await this.carouselModel.findById(id).exec();
    if (!carousel) {
      throw new NotFoundException('Carousel not found');
    }
    return carousel;
  }

  async create(
    userId: string,
    createCarouselDto: CreateCarouselDto,
  ): Promise<CarouselDocument> {
    const carousel = new this.carouselModel({
      ...createCarouselDto,
      user: userId,
    });
    return carousel.save();
  }

  async update(
    id: string,
    updateCarouselDto: UpdateCarouselDto,
  ): Promise<CarouselDocument> {
    const carousel = await this.carouselModel.findById(id);
    if (!carousel) {
      throw new NotFoundException('Carousel not found');
    }

    Object.assign(carousel, updateCarouselDto);
    return carousel.save();
  }

  async remove(id: string): Promise<{ message: string }> {
    const carousel = await this.carouselModel.findById(id);
    if (!carousel) {
      throw new NotFoundException('Carousel not found');
    }

    await carousel.deleteOne();
    return { message: 'Carousel removed' };
  }
}

