import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { Wishlist } from './schemas/wishlist.schema';
import { Product } from '../products/schemas/product.schema';

describe('WishlistService', () => {
  let service: WishlistService;
  let mockWishlistModel: any;
  let mockProductModel: any;

  const mockProduct = {
    _id: 'product123',
    name: 'Test Product',
    price: 99.99,
  };

  const mockWishlist = {
    _id: 'wishlist123',
    user: 'user123',
    items: [
      {
        product: mockProduct,
        addedAt: new Date(),
      },
    ],
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    mockWishlistModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };

    mockProductModel = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        {
          provide: getModelToken(Wishlist.name),
          useValue: mockWishlistModel,
        },
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWishlist', () => {
    it('should return existing wishlist', async () => {
      const userId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      mockWishlistModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockWishlist),
      });

      const result = await service.getWishlist(userId);

      expect(result).toEqual(mockWishlist);
      expect(mockWishlistModel.findOne).toHaveBeenCalledWith({ user: userId });
    });

    it('should create new wishlist if not exists', async () => {
      const userId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      mockWishlistModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      const newWishlist = {
        ...mockWishlist,
        items: [],
      };

      mockWishlistModel.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(newWishlist),
      });

      const result = await service.getWishlist(userId);

      expect(result).toEqual(newWishlist);
      expect(mockWishlistModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe('addToWishlist', () => {
    it('should add product to wishlist', async () => {
      const userId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      const productId = '507f1f77bcf86cd799439012'; // Valid ObjectId format
      
      mockProductModel.findById.mockResolvedValue(mockProduct);
      mockWishlistModel.findOne.mockResolvedValue(null);
      mockWishlistModel.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockWishlist),
      });

      const result = await service.addToWishlist(userId, productId);

      expect(result).toEqual(mockWishlist);
      expect(mockProductModel.findById).toHaveBeenCalledWith(productId);
    });

    it('should throw NotFoundException if product not found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      mockProductModel.findById.mockResolvedValue(null);

      await expect(
        service.addToWishlist(userId, '507f1f77bcf86cd799439099'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if product already in wishlist', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const productId = '507f1f77bcf86cd799439012';
      
      mockProductModel.findById.mockResolvedValue(mockProduct);
      mockWishlistModel.findOne.mockResolvedValue(mockWishlist);

      await expect(
        service.addToWishlist(userId, productId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeFromWishlist', () => {
    it('should remove product from wishlist', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const productId = '507f1f77bcf86cd799439012';
      
      const wishlistWithSave = {
        ...mockWishlist,
        items: [
          {
            product: { toString: () => productId },
            addedAt: new Date(),
          },
        ],
        save: jest.fn().mockResolvedValue(mockWishlist),
      };

      mockWishlistModel.findOne.mockResolvedValue(wishlistWithSave);
      mockWishlistModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockWishlist),
      });

      const result = await service.removeFromWishlist(userId, productId);

      expect(wishlistWithSave.items).toHaveLength(0);
      expect(wishlistWithSave.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if wishlist not found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      mockWishlistModel.findOne.mockResolvedValue(null);

      await expect(
        service.removeFromWishlist(userId, '507f1f77bcf86cd799439012'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('clearWishlist', () => {
    it('should clear all items from wishlist', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const wishlistWithSave = {
        ...mockWishlist,
        items: [
          { product: mockProduct },
          { product: mockProduct },
        ],
        save: jest.fn().mockResolvedValue({ ...mockWishlist, items: [] }),
      };

      mockWishlistModel.findOne.mockResolvedValue(wishlistWithSave);

      const result = await service.clearWishlist(userId);

      expect(wishlistWithSave.items).toHaveLength(0);
      expect(wishlistWithSave.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if wishlist not found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      mockWishlistModel.findOne.mockResolvedValue(null);

      await expect(service.clearWishlist(userId)).rejects.toThrow(NotFoundException);
    });
  });
});

