import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { Coupon } from './schemas/coupon.schema';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

describe('CouponsService', () => {
  let service: CouponsService;
  let mockCouponModel: any;

  const mockCoupon = {
    _id: 'coupon123',
    code: 'SAVE20',
    discountType: 'percentage',
    discountValue: 20,
    description: 'Save 20% on your purchase',
    isActive: true,
    expiryDate: new Date('2025-12-31'),
    usageLimit: 100,
    usedCount: 50,
    minPurchaseAmount: 1000,
    applicableProducts: [],
    applicableCategories: [],
    maxDiscountAmount: 500,
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    const MockModel = jest.fn().mockImplementation((dto) => ({
      ...dto,
      code: dto.code?.toUpperCase(),
      save: jest.fn().mockResolvedValue({ ...dto, _id: 'new123', code: dto.code?.toUpperCase() }),
    }));

    MockModel.find = jest.fn();
    MockModel.findById = jest.fn();
    MockModel.findOne = jest.fn();
    MockModel.findOneAndUpdate = jest.fn();
    MockModel.findByIdAndUpdate = jest.fn();
    MockModel.findByIdAndDelete = jest.fn();

    mockCouponModel = MockModel;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        {
          provide: getModelToken(Coupon.name),
          useValue: mockCouponModel,
        },
      ],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new coupon with uppercase code', async () => {
      const createCouponDto: CreateCouponDto = {
        code: 'save20',
        discountType: 'percentage',
        discountValue: 20,
        description: 'Save 20%',
        isActive: true,
        expiryDate: new Date('2025-12-31'),
      };

      const result = await service.create(createCouponDto);

      expect(mockCouponModel).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createCouponDto,
          code: 'SAVE20',
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all coupons sorted by creation date', async () => {
      const coupons = [mockCoupon, mockCoupon];
      mockCouponModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(coupons),
      });

      const result = await service.findAll();

      expect(result).toEqual(coupons);
      expect(mockCouponModel.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a coupon by id', async () => {
      mockCouponModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCoupon),
      });

      const result = await service.findOne('coupon123');

      expect(result).toEqual(mockCoupon);
      expect(mockCouponModel.findById).toHaveBeenCalledWith('coupon123');
    });

    it('should throw NotFoundException if coupon not found', async () => {
      mockCouponModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCode', () => {
    it('should return a coupon by code (case insensitive)', async () => {
      mockCouponModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCoupon),
      });

      const result = await service.findByCode('save20');

      expect(result).toEqual(mockCoupon);
      expect(mockCouponModel.findOne).toHaveBeenCalledWith({ code: 'SAVE20' });
    });

    it('should throw NotFoundException if coupon not found', async () => {
      mockCouponModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findByCode('INVALID')).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateCoupon', () => {
    const validateDto: ValidateCouponDto = {
      code: 'SAVE20',
      cartTotal: 2000,
      productIds: [],
    };

    it('should validate a valid coupon', async () => {
      mockCouponModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCoupon),
      });

      const result = await service.validateCoupon(validateDto);

      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(400); // 20% of 2000
      expect(result.finalTotal).toBe(1600);
    });

    it('should throw BadRequestException if coupon is not active', async () => {
      const inactiveCoupon = { ...mockCoupon, isActive: false };
      mockCouponModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(inactiveCoupon),
      });

      await expect(service.validateCoupon(validateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.validateCoupon(validateDto)).rejects.toThrow(
        'This coupon is not active',
      );
    });

    it('should throw BadRequestException if coupon has expired', async () => {
      const expiredCoupon = {
        ...mockCoupon,
        expiryDate: new Date('2020-01-01'),
      };
      mockCouponModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(expiredCoupon),
      });

      await expect(service.validateCoupon(validateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.validateCoupon(validateDto)).rejects.toThrow(
        'This coupon has expired',
      );
    });

    it('should throw BadRequestException if usage limit reached', async () => {
      const limitReachedCoupon = {
        ...mockCoupon,
        usageLimit: 100,
        usedCount: 100,
      };
      mockCouponModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(limitReachedCoupon),
      });

      await expect(service.validateCoupon(validateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.validateCoupon(validateDto)).rejects.toThrow(
        'This coupon has reached its usage limit',
      );
    });

    it('should throw BadRequestException if cart total is below minimum purchase', async () => {
      const minPurchaseCoupon = {
        ...mockCoupon,
        minPurchaseAmount: 5000,
      };
      mockCouponModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(minPurchaseCoupon),
      });

      await expect(service.validateCoupon(validateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.validateCoupon(validateDto)).rejects.toThrow(
        'Minimum purchase amount',
      );
    });

    it('should throw BadRequestException if product not in applicable products', async () => {
      const productSpecificCoupon = {
        ...mockCoupon,
        applicableProducts: ['product1', 'product2'],
      };
      mockCouponModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(productSpecificCoupon),
      });

      const invalidDto = {
        ...validateDto,
        productIds: ['product3'],
      };

      await expect(service.validateCoupon(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.validateCoupon(invalidDto)).rejects.toThrow(
        'not applicable to items in your cart',
      );
    });

    it('should apply percentage discount correctly', async () => {
      mockCouponModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCoupon),
      });

      const result = await service.validateCoupon(validateDto);

      expect(result.discountAmount).toBe(400); // 20% of 2000
    });

    it('should apply fixed amount discount correctly', async () => {
      const fixedCoupon = {
        ...mockCoupon,
        discountType: 'fixed',
        discountValue: 500,
      };
      mockCouponModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(fixedCoupon),
      });

      const result = await service.validateCoupon(validateDto);

      expect(result.discountAmount).toBe(500);
    });

    it('should apply max discount limit for percentage coupons', async () => {
      const maxDiscountCoupon = {
        ...mockCoupon,
        discountValue: 50, // 50%
        maxDiscountAmount: 500,
      };
      mockCouponModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(maxDiscountCoupon),
      });

      const highCartDto = {
        ...validateDto,
        cartTotal: 5000, // 50% would be 2500, but max is 500
      };

      const result = await service.validateCoupon(highCartDto);

      expect(result.discountAmount).toBe(500);
    });

    it('should not exceed cart total for fixed discount', async () => {
      const fixedCoupon = {
        ...mockCoupon,
        discountType: 'fixed',
        discountValue: 3000, // More than cart total
      };
      mockCouponModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(fixedCoupon),
      });

      const result = await service.validateCoupon(validateDto);

      expect(result.discountAmount).toBe(2000); // Limited to cart total
      expect(result.finalTotal).toBe(0);
    });

    it('should validate coupon with applicable products', async () => {
      const productCoupon = {
        ...mockCoupon,
        applicableProducts: ['product1', 'product2'],
      };
      mockCouponModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(productCoupon),
      });

      const validDto = {
        ...validateDto,
        productIds: ['product1', 'product3'],
      };

      const result = await service.validateCoupon(validDto);

      expect(result.valid).toBe(true);
    });
  });

  describe('incrementUsage', () => {
    it('should increment coupon usage count', async () => {
      mockCouponModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCoupon),
      });

      await service.incrementUsage('SAVE20');

      expect(mockCouponModel.findOneAndUpdate).toHaveBeenCalledWith(
        { code: 'SAVE20' },
        { $inc: { usedCount: 1 } },
      );
      expect(mockCouponModel.findOneAndUpdate().exec).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a coupon', async () => {
      const updateDto = {
        isActive: false,
        description: 'Updated description',
      };
      const updatedCoupon = { ...mockCoupon, ...updateDto };

      mockCouponModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedCoupon),
      });

      const result = await service.update('coupon123', updateDto);

      expect(result).toEqual(updatedCoupon);
      expect(mockCouponModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'coupon123',
        updateDto,
        { new: true },
      );
    });

    it('should throw NotFoundException if coupon not found', async () => {
      mockCouponModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update('invalid-id', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a coupon', async () => {
      mockCouponModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCoupon),
      });

      await service.remove('coupon123');

      expect(mockCouponModel.findByIdAndDelete).toHaveBeenCalledWith('coupon123');
    });

    it('should throw NotFoundException if coupon not found', async () => {
      mockCouponModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});

