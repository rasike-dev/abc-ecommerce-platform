import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateReviewDto } from './dto/create-review.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: ProductsService;

  const mockProductsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    createSampleProduct: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createReview: jest.fn(),
    getTopProducts: jest.fn(),
  };

  const mockProduct = {
    _id: 'product123',
    name: 'Test Product',
    price: 99.99,
    description: 'Test description',
    category: 'ELECTRONICS',
    rating: 4.5,
    numReviews: 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    productsService = module.get<ProductsService>(ProductsService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /products', () => {
    it('should return paginated products', async () => {
      const expectedResponse = {
        products: [mockProduct],
        page: 1,
        pages: 1,
      };
      mockProductsService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResponse);
      expect(productsService.findAll).toHaveBeenCalled();
    });

    it('should pass query parameters to service', async () => {
      mockProductsService.findAll.mockResolvedValue({
        products: [],
        page: 1,
        pages: 1,
      });

      await controller.findAll(2, 'laptop', 'ELECTRONICS', 10, 'Science', 50, 150, 'price-asc');

      expect(productsService.findAll).toHaveBeenCalledWith(
        2,
        'laptop',
        'ELECTRONICS',
        10,
        'Science',
        50,
        150,
        'price-asc',
      );
    });
  });

  describe('GET /products/top', () => {
    it('should return top rated products', async () => {
      const topProducts = [mockProduct, mockProduct, mockProduct];
      mockProductsService.getTopProducts.mockResolvedValue(topProducts);

      const result = await controller.getTopProducts();

      expect(result).toEqual(topProducts);
      expect(productsService.getTopProducts).toHaveBeenCalled();
    });
  });

  describe('GET /products/:id', () => {
    it('should return a product by id', async () => {
      mockProductsService.findById.mockResolvedValue(mockProduct);

      const result = await controller.findOne('product123');

      expect(result).toEqual(mockProduct);
      expect(productsService.findById).toHaveBeenCalledWith('product123');
    });
  });

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const user = { _id: 'user123' };
      const createDto: CreateProductDto = {
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

      mockProductsService.create.mockResolvedValue({ ...mockProduct, ...createDto });

      const result = await controller.create(user, createDto);

      expect(productsService.create).toHaveBeenCalledWith(user, createDto);
    });
  });

  describe('POST /products (without body)', () => {
    it('should create a sample product when no body provided', async () => {
      const user = { _id: 'user123' };
      const sampleProduct = { ...mockProduct, name: 'Sample Product' };

      mockProductsService.createSampleProduct.mockResolvedValue(sampleProduct);

      const result = await controller.create(user, undefined);

      expect(result).toEqual(sampleProduct);
      expect(productsService.createSampleProduct).toHaveBeenCalledWith(user);
    });
  });

  describe('PUT /products/:id', () => {
    it('should update a product', async () => {
      const updateDto: UpdateProductDto = {
        name: 'Updated Product',
        price: 149.99,
      };
      const updatedProduct = { ...mockProduct, ...updateDto };

      mockProductsService.update.mockResolvedValue(updatedProduct);

      const result = await controller.update('product123', updateDto);

      expect(result).toEqual(updatedProduct);
      expect(productsService.update).toHaveBeenCalledWith('product123', updateDto);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product', async () => {
      mockProductsService.remove.mockResolvedValue({ message: 'Product removed' });

      const result = await controller.remove('product123');

      expect(result).toEqual({ message: 'Product removed' });
      expect(productsService.remove).toHaveBeenCalledWith('product123');
    });
  });

  describe('POST /products/:id/reviews', () => {
    it('should add a review to product', async () => {
      const user = { _id: 'user123', name: 'Test User' };
      const reviewDto: CreateReviewDto = {
        rating: 5,
        comment: 'Great product!',
      };

      mockProductsService.createReview.mockResolvedValue({ message: 'Review added' });

      const result = await controller.createReview('product123', user, reviewDto);

      expect(result).toEqual({ message: 'Review added' });
      expect(productsService.createReview).toHaveBeenCalledWith('product123', user, reviewDto);
    });
  });
});

