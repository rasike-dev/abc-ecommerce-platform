import { Test, TestingModule } from '@nestjs/testing';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

describe('CouponsController', () => {
  let controller: CouponsController;
  let couponsService: CouponsService;

  const mockCouponsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    validateCoupon: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCoupon = {
    _id: 'coupon123',
    code: 'SAVE20',
    discountType: 'percentage',
    discountValue: 20,
    description: 'Save 20%',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponsController],
      providers: [
        {
          provide: CouponsService,
          useValue: mockCouponsService,
        },
      ],
    }).compile();

    controller = module.get<CouponsController>(CouponsController);
    couponsService = module.get<CouponsService>(CouponsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /coupons', () => {
    it('should create a new coupon', async () => {
      const createDto: CreateCouponDto = {
        code: 'SAVE20',
        discountType: 'percentage',
        discountValue: 20,
        description: 'Save 20%',
        isActive: true,
        expiryDate: new Date('2025-12-31'),
      };

      mockCouponsService.create.mockResolvedValue(mockCoupon);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockCoupon);
      expect(couponsService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('GET /coupons', () => {
    it('should return all coupons', async () => {
      const coupons = [mockCoupon, mockCoupon];
      mockCouponsService.findAll.mockResolvedValue(coupons);

      const result = await controller.findAll();

      expect(result).toEqual(coupons);
      expect(couponsService.findAll).toHaveBeenCalled();
    });
  });

  describe('POST /coupons/validate', () => {
    it('should validate a coupon', async () => {
      const validateDto: ValidateCouponDto = {
        code: 'SAVE20',
        cartTotal: 2000,
        productIds: [],
      };

      const validationResult = {
        valid: true,
        coupon: mockCoupon,
        discountAmount: 400,
        finalTotal: 1600,
      };

      mockCouponsService.validateCoupon.mockResolvedValue(validationResult);

      const result = await controller.validate(validateDto);

      expect(result).toEqual(validationResult);
      expect(couponsService.validateCoupon).toHaveBeenCalledWith(validateDto);
    });
  });

  describe('GET /coupons/:id', () => {
    it('should return a coupon by id', async () => {
      mockCouponsService.findOne.mockResolvedValue(mockCoupon);

      const result = await controller.findOne('coupon123');

      expect(result).toEqual(mockCoupon);
      expect(couponsService.findOne).toHaveBeenCalledWith('coupon123');
    });
  });

  describe('PATCH /coupons/:id', () => {
    it('should update a coupon', async () => {
      const updateDto = {
        isActive: false,
      };
      const updatedCoupon = { ...mockCoupon, ...updateDto };

      mockCouponsService.update.mockResolvedValue(updatedCoupon);

      const result = await controller.update('coupon123', updateDto);

      expect(result).toEqual(updatedCoupon);
      expect(couponsService.update).toHaveBeenCalledWith('coupon123', updateDto);
    });
  });

  describe('DELETE /coupons/:id', () => {
    it('should delete a coupon', async () => {
      mockCouponsService.remove.mockResolvedValue(undefined);

      await controller.remove('coupon123');

      expect(couponsService.remove).toHaveBeenCalledWith('coupon123');
    });
  });
});

