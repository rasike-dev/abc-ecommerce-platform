import { Test, TestingModule } from '@nestjs/testing';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';

describe('WishlistController', () => {
  let controller: WishlistController;
  let wishlistService: WishlistService;

  const mockWishlistService = {
    getWishlist: jest.fn(),
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
    clearWishlist: jest.fn(),
  };

  const mockWishlist = {
    _id: 'wishlist123',
    user: 'user123',
    items: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishlistController],
      providers: [
        {
          provide: WishlistService,
          useValue: mockWishlistService,
        },
      ],
    }).compile();

    controller = module.get<WishlistController>(WishlistController);
    wishlistService = module.get<WishlistService>(WishlistService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /wishlist', () => {
    it('should return user wishlist', async () => {
      const user = { _id: 'user123' };
      mockWishlistService.getWishlist.mockResolvedValue(mockWishlist);

      const result = await controller.getWishlist(user);

      expect(result).toEqual(mockWishlist);
      expect(wishlistService.getWishlist).toHaveBeenCalledWith('user123');
    });
  });

  describe('POST /wishlist', () => {
    it('should add product to wishlist', async () => {
      const user = { _id: 'user123' };
      const addDto: AddToWishlistDto = { productId: 'product123' };

      mockWishlistService.addToWishlist.mockResolvedValue(mockWishlist);

      const result = await controller.addToWishlist(user, addDto);

      expect(result).toEqual(mockWishlist);
      expect(wishlistService.addToWishlist).toHaveBeenCalledWith('user123', 'product123');
    });
  });

  describe('DELETE /wishlist/:productId', () => {
    it('should remove product from wishlist', async () => {
      const user = { _id: 'user123' };

      mockWishlistService.removeFromWishlist.mockResolvedValue(mockWishlist);

      const result = await controller.removeFromWishlist(user, 'product123');

      expect(result).toEqual(mockWishlist);
      expect(wishlistService.removeFromWishlist).toHaveBeenCalledWith('user123', 'product123');
    });
  });

  describe('DELETE /wishlist', () => {
    it('should clear wishlist', async () => {
      const user = { _id: 'user123' };

      mockWishlistService.clearWishlist.mockResolvedValue(mockWishlist);

      const result = await controller.clearWishlist(user);

      expect(result).toEqual(mockWishlist);
      expect(wishlistService.clearWishlist).toHaveBeenCalledWith('user123');
    });
  });
});

