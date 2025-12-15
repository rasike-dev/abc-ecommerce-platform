import { Test, TestingModule } from '@nestjs/testing';
import { CarouselController } from './carousel.controller';
import { CarouselService } from './carousel.service';
import { CreateCarouselDto } from './dto/create-carousel.dto';
import { UpdateCarouselDto } from './dto/update-carousel.dto';

describe('CarouselController', () => {
  let controller: CarouselController;
  let carouselService: CarouselService;

  const mockCarouselService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCarousel = {
    _id: 'carousel123',
    title: 'Test Carousel',
    image: 'test.jpg',
    link: 'https://example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarouselController],
      providers: [
        {
          provide: CarouselService,
          useValue: mockCarouselService,
        },
      ],
    }).compile();

    controller = module.get<CarouselController>(CarouselController);
    carouselService = module.get<CarouselService>(CarouselService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /carousel', () => {
    it('should return all carousel items', async () => {
      const carousels = [mockCarousel, mockCarousel];
      mockCarouselService.findAll.mockResolvedValue(carousels);

      const result = await controller.findAll();

      expect(result).toEqual(carousels);
      expect(carouselService.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /carousel/:id', () => {
    it('should return a carousel by id', async () => {
      mockCarouselService.findById.mockResolvedValue(mockCarousel);

      const result = await controller.findOne('carousel123');

      expect(result).toEqual(mockCarousel);
      expect(carouselService.findById).toHaveBeenCalledWith('carousel123');
    });
  });

  describe('POST /carousel', () => {
    it('should create a new carousel item', async () => {
      const user = { _id: 'user123' };
      const createDto: CreateCarouselDto = {
        title: 'New Carousel',
        image: 'new.jpg',
        link: 'https://example.com/new',
      };

      mockCarouselService.create.mockResolvedValue(mockCarousel);

      const result = await controller.create(user, createDto);

      expect(result).toEqual(mockCarousel);
      expect(carouselService.create).toHaveBeenCalledWith(user._id, createDto);
    });
  });

  describe('PUT /carousel/:id', () => {
    it('should update a carousel item', async () => {
      const updateDto: UpdateCarouselDto = {
        title: 'Updated Carousel',
      };
      const updatedCarousel = { ...mockCarousel, ...updateDto };

      mockCarouselService.update.mockResolvedValue(updatedCarousel);

      const result = await controller.update('carousel123', updateDto);

      expect(result).toEqual(updatedCarousel);
      expect(carouselService.update).toHaveBeenCalledWith('carousel123', updateDto);
    });
  });

  describe('DELETE /carousel/:id', () => {
    it('should delete a carousel item', async () => {
      mockCarouselService.remove.mockResolvedValue({ message: 'Carousel removed' });

      const result = await controller.remove('carousel123');

      expect(result).toEqual({ message: 'Carousel removed' });
      expect(carouselService.remove).toHaveBeenCalledWith('carousel123');
    });
  });
});

