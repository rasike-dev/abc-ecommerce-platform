import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { CarouselService } from './carousel.service';
import { Carousel } from './schemas/carousel.schema';
import { CreateCarouselDto } from './dto/create-carousel.dto';
import { UpdateCarouselDto } from './dto/update-carousel.dto';

describe('CarouselService', () => {
  let service: CarouselService;
  let mockCarouselModel: any;

  const mockCarousel = {
    _id: 'carousel123',
    title: 'Test Carousel',
    image: 'test.jpg',
    link: 'https://example.com',
    user: 'user123',
    save: jest.fn().mockResolvedValue(this),
    deleteOne: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const MockModel = jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({ ...dto, _id: 'new123' }),
    }));

    MockModel.find = jest.fn();
    MockModel.findById = jest.fn();

    mockCarouselModel = MockModel;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarouselService,
        {
          provide: getModelToken(Carousel.name),
          useValue: mockCarouselModel,
        },
      ],
    }).compile();

    service = module.get<CarouselService>(CarouselService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all carousel items', async () => {
      const carousels = [mockCarousel, mockCarousel];
      mockCarouselModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(carousels),
      });

      const result = await service.findAll();

      expect(result).toEqual(carousels);
      expect(mockCarouselModel.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a carousel by id', async () => {
      mockCarouselModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCarousel),
      });

      const result = await service.findById('carousel123');

      expect(result).toEqual(mockCarousel);
      expect(mockCarouselModel.findById).toHaveBeenCalledWith('carousel123');
    });

    it('should throw NotFoundException if carousel not found', async () => {
      mockCarouselModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findById('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new carousel item', async () => {
      const userId = 'user123';
      const createDto: CreateCarouselDto = {
        title: 'New Carousel',
        image: 'new.jpg',
        link: 'https://example.com/new',
      };

      await service.create(userId, createDto);

      expect(mockCarouselModel).toHaveBeenCalledWith({
        ...createDto,
        user: userId,
      });
    });
  });

  describe('update', () => {
    it('should update a carousel item', async () => {
      const updateDto: UpdateCarouselDto = {
        title: 'Updated Carousel',
      };

      const carouselWithSave = {
        ...mockCarousel,
        save: jest.fn().mockResolvedValue({ ...mockCarousel, ...updateDto }),
      };

      mockCarouselModel.findById.mockResolvedValue(carouselWithSave);

      const result = await service.update('carousel123', updateDto);

      expect(carouselWithSave.title).toBe('Updated Carousel');
      expect(carouselWithSave.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if carousel not found', async () => {
      mockCarouselModel.findById.mockResolvedValue(null);

      await expect(service.update('invalid-id', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a carousel item', async () => {
      const carouselWithDelete = {
        ...mockCarousel,
        deleteOne: jest.fn().mockResolvedValue(true),
      };
      mockCarouselModel.findById.mockResolvedValue(carouselWithDelete);

      const result = await service.remove('carousel123');

      expect(result).toEqual({ message: 'Carousel removed' });
      expect(carouselWithDelete.deleteOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException if carousel not found', async () => {
      mockCarouselModel.findById.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});

