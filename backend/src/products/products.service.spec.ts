import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateReviewDto } from './dto/create-review.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockProductModel: any;

  const mockProduct = {
    _id: 'product123',
    name: 'Test Product',
    price: 99.99,
    description: 'Test description',
    category: 'ELECTRONICS',
    image: 'test.jpg',
    brand: 'Test Brand',
    countInStock: 10,
    rating: 4.5,
    numReviews: 10,
    reviews: [],
    grade: 10,
    subject: 'Science',
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    // Create a constructor function for the model
    const MockModel = jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({ ...dto, _id: 'new123' }),
    }));

    MockModel.find = jest.fn();
    MockModel.findById = jest.fn();
    MockModel.findByIdAndUpdate = jest.fn();
    MockModel.findByIdAndDelete = jest.fn();
    MockModel.countDocuments = jest.fn();
    MockModel.create = jest.fn();

    mockProductModel = MockModel;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const products = [mockProduct];

    beforeEach(() => {
      mockProductModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(products),
      });
      mockProductModel.countDocuments.mockResolvedValue(1);
    });

    it('should return paginated products', async () => {
      const result = await service.findAll();

      expect(result).toEqual({
        products,
        page: 1,
        pages: 1,
      });
      expect(mockProductModel.find).toHaveBeenCalledWith({});
      expect(mockProductModel.countDocuments).toHaveBeenCalledWith({});
    });

    it('should filter by keyword', async () => {
      await service.findAll(1, 'laptop');

      expect(mockProductModel.find).toHaveBeenCalledWith({
        name: { $regex: 'laptop', $options: 'i' },
      });
    });

    it('should filter by category code', async () => {
      await service.findAll(1, '', 'ELECTRONICS');

      expect(mockProductModel.find).toHaveBeenCalledWith({
        category: 'ELECTRONICS',
      });
    });

    it('should filter by grade', async () => {
      await service.findAll(1, '', '', 10);

      expect(mockProductModel.find).toHaveBeenCalledWith({
        grade: 10,
      });
    });

    it('should filter by subject', async () => {
      await service.findAll(1, '', '', undefined, 'Science');

      expect(mockProductModel.find).toHaveBeenCalledWith({
        subject: { $regex: 'Science', $options: 'i' },
      });
    });

    it('should filter by price range', async () => {
      await service.findAll(1, '', '', undefined, undefined, 50, 150);

      expect(mockProductModel.find).toHaveBeenCalledWith({
        price: { $gte: 50, $lte: 150 },
      });
    });

    it('should filter by minimum price only', async () => {
      await service.findAll(1, '', '', undefined, undefined, 50);

      expect(mockProductModel.find).toHaveBeenCalledWith({
        price: { $gte: 50 },
      });
    });

    it('should filter by maximum price only', async () => {
      await service.findAll(1, '', '', undefined, undefined, undefined, 150);

      expect(mockProductModel.find).toHaveBeenCalledWith({
        price: { $lte: 150 },
      });
    });

    it('should sort by price ascending', async () => {
      const sortSpy = jest.fn().mockReturnThis();
      mockProductModel.find.mockReturnValue({
        sort: sortSpy,
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(products),
      });

      await service.findAll(1, '', '', undefined, undefined, undefined, undefined, 'price-asc');

      expect(sortSpy).toHaveBeenCalledWith({ price: 1 });
    });

    it('should sort by price descending', async () => {
      const sortSpy = jest.fn().mockReturnThis();
      mockProductModel.find.mockReturnValue({
        sort: sortSpy,
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(products),
      });

      await service.findAll(1, '', '', undefined, undefined, undefined, undefined, 'price-desc');

      expect(sortSpy).toHaveBeenCalledWith({ price: -1 });
    });

    it('should sort by rating descending', async () => {
      const sortSpy = jest.fn().mockReturnThis();
      mockProductModel.find.mockReturnValue({
        sort: sortSpy,
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(products),
      });

      await service.findAll(1, '', '', undefined, undefined, undefined, undefined, 'rating-desc');

      expect(sortSpy).toHaveBeenCalledWith({ rating: -1 });
    });

    it('should handle pagination', async () => {
      mockProductModel.countDocuments.mockResolvedValue(25);

      const result = await service.findAll(2);

      expect(result.page).toBe(2);
      expect(result.pages).toBe(3);
    });

    it('should handle combined filters', async () => {
      await service.findAll(1, 'laptop', 'ELECTRONICS', 10, 'Science', 50, 150);

      expect(mockProductModel.find).toHaveBeenCalledWith({
        name: { $regex: 'laptop', $options: 'i' },
        category: 'ELECTRONICS',
        grade: 10,
        subject: { $regex: 'Science', $options: 'i' },
        price: { $gte: 50, $lte: 150 },
      });
    });

    it('should use default page number if invalid', async () => {
      const result = await service.findAll(0);

      expect(result.page).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return a product by id', async () => {
      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct),
      });

      const result = await service.findById('product123');

      expect(result).toEqual(mockProduct);
      expect(mockProductModel.findById).toHaveBeenCalledWith('product123');
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const user = { _id: 'user123' };
      const createProductDto: CreateProductDto = {
        name: 'New Product',
        price: 199.99,
        description: 'New description',
        category: 'ELECTRONICS',
        image: 'new.jpg',
        brand: 'New Brand',
        countInStock: 5,
        grade: 11,
        subject: 'Math',
      };

      const result = await service.create(user, createProductDto);

      expect(mockProductModel).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createProductDto,
          user: user._id,
        }),
      );
    });
  });

  describe('createSampleProduct', () => {
    it('should create a sample product', async () => {
      const user = { _id: 'user123' };

      const result = await service.createSampleProduct(user);

      expect(mockProductModel).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Sample Product Name',
          user: user._id,
        }),
      );
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateDto: UpdateProductDto = {
        name: 'Updated Product',
        price: 149.99,
      };
      const productWithSave = {
        ...mockProduct,
        save: jest.fn().mockResolvedValue({ ...mockProduct, ...updateDto }),
      };

      mockProductModel.findById.mockResolvedValue(productWithSave);

      const result = await service.update('product123', updateDto);

      expect(mockProductModel.findById).toHaveBeenCalledWith('product123');
      expect(productWithSave.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductModel.findById.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const productWithDelete = {
        ...mockProduct,
        deleteOne: jest.fn().mockResolvedValue(true),
      };
      mockProductModel.findById.mockResolvedValue(productWithDelete);

      const result = await service.remove('product123');

      expect(result).toEqual({ message: 'Product removed' });
      expect(mockProductModel.findById).toHaveBeenCalledWith('product123');
      expect(productWithDelete.deleteOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductModel.findById.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createReview', () => {
    const reviewDto: CreateReviewDto = {
      rating: 5,
      comment: 'Great product!',
    };
    const user = { _id: 'user123', name: 'Test User' };

    it('should add a review to product', async () => {
      const productWithSave = {
        ...mockProduct,
        reviews: [],
        save: jest.fn().mockResolvedValue(true),
      };
      mockProductModel.findById.mockResolvedValue(productWithSave);

      const result = await service.createReview('product123', user, reviewDto);

      expect(result).toEqual({ message: 'Review added' });
      expect(mockProductModel.findById).toHaveBeenCalledWith('product123');
      expect(productWithSave.reviews).toHaveLength(1);
      expect(productWithSave.reviews[0]).toMatchObject({
        rating: 5,
        comment: 'Great product!',
        user: user._id,
        name: user.name,
      });
      expect(productWithSave.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductModel.findById.mockResolvedValue(null);

      await expect(
        service.createReview('invalid-id', user, reviewDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user already reviewed', async () => {
      const productWithReview = {
        ...mockProduct,
        reviews: [{ 
          user: { 
            toString: () => user._id,
            _id: user._id 
          },
          rating: 4, 
          comment: 'Good' 
        }],
        save: jest.fn(),
      };
      // Mock the find method to return the existing review
      productWithReview.reviews.find = function(callback) {
        return callback({ user: { toString: () => user._id } });
      };
      mockProductModel.findById.mockResolvedValue(productWithReview);

      await expect(
        service.createReview('product123', user, reviewDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update product rating and review count', async () => {
      const productWithSave = {
        ...mockProduct,
        reviews: [{ 
          rating: 4,
          user: { toString: () => 'otheruser123' }
        }],
        rating: 4,
        numReviews: 1,
        save: jest.fn().mockResolvedValue(true),
      };
      mockProductModel.findById.mockResolvedValue(productWithSave);

      await service.createReview('product123', user, reviewDto);

      expect(productWithSave.numReviews).toBe(2);
      expect(productWithSave.rating).toBe(4.5); // (4 + 5) / 2
    });
  });

  describe('getTopProducts', () => {
    it('should return top rated products', async () => {
      const topProducts = [
        { ...mockProduct, rating: 5 },
        { ...mockProduct, rating: 4.8 },
        { ...mockProduct, rating: 4.5 },
      ];

      mockProductModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(topProducts),
      });

      const result = await service.getTopProducts();

      expect(result).toEqual(topProducts);
      expect(mockProductModel.find).toHaveBeenCalledWith({});
    });
  });
});

