import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './schemas/order.schema';

describe('OrdersService', () => {
  let service: OrdersService;
  let mockOrderModel: any;

  const mockOrder = {
    _id: 'order123',
    user: 'user123',
    orderItems: [],
    shippingAddress: {},
    paymentMethod: 'Card',
    totalPrice: 100,
    isPaid: false,
    isDelivered: false,
    paymentResult: {
      successIndicator: 'SUCCESS_123',
      sessionId: 'SESSION_123',
    },
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    const MockModel = jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({ ...dto, _id: 'new123' }),
    }));

    MockModel.find = jest.fn();
    MockModel.findById = jest.fn();

    mockOrderModel = MockModel;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getModelToken(Order.name),
          useValue: mockOrderModel,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const userId = 'user123';
      const createOrderDto = {
        orderItems: [{ product: 'product123', qty: 2, price: 50 }],
        shippingAddress: { address: '123 Main St' },
        paymentMethod: 'Card',
        totalPrice: 100,
      };

      await service.create(userId, createOrderDto as any);

      expect(mockOrderModel).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createOrderDto,
          user: userId,
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return an order by id', async () => {
      mockOrderModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockOrder),
      });

      const result = await service.findById('order123');

      expect(result).toEqual(mockOrder);
      expect(mockOrderModel.findById).toHaveBeenCalledWith('order123');
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findById('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateToPaid', () => {
    it('should mark order as paid when indicators match', async () => {
      const orderWithSave = {
        ...mockOrder,
        save: jest.fn().mockResolvedValue(mockOrder),
      };
      mockOrderModel.findById.mockResolvedValue(orderWithSave);

      const updateDto = {
        resultIndicator: 'SUCCESS_123',
        sessionVersion: '1.0',
      };

      await service.updateToPaid('order123', updateDto);

      expect(orderWithSave.isPaid).toBe(true);
      expect(orderWithSave.isPaymentFail).toBe(false);
      expect(orderWithSave.save).toHaveBeenCalled();
    });

    it('should mark order as payment failed when indicators do not match', async () => {
      const orderWithSave = {
        ...mockOrder,
        save: jest.fn().mockResolvedValue(mockOrder),
      };
      mockOrderModel.findById.mockResolvedValue(orderWithSave);

      const updateDto = {
        resultIndicator: 'WRONG_INDICATOR',
        sessionVersion: '1.0',
      };

      await service.updateToPaid('order123', updateDto);

      expect(orderWithSave.isPaid).toBe(false);
      expect(orderWithSave.isPaymentFail).toBe(true);
      expect(orderWithSave.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderModel.findById.mockResolvedValue(null);

      await expect(
        service.updateToPaid('invalid-id', { resultIndicator: 'TEST', sessionVersion: '1.0' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateToDelivered', () => {
    it('should mark order as delivered', async () => {
      const orderWithSave = {
        ...mockOrder,
        save: jest.fn().mockResolvedValue(mockOrder),
      };
      mockOrderModel.findById.mockResolvedValue(orderWithSave);

      await service.updateToDelivered('order123');

      expect(orderWithSave.isDelivered).toBe(true);
      expect(orderWithSave.deliveredAt).toBeInstanceOf(Date);
      expect(orderWithSave.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderModel.findById.mockResolvedValue(null);

      await expect(service.updateToDelivered('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findUserOrders', () => {
    it('should return all orders for a user', async () => {
      const userOrders = [mockOrder, mockOrder];
      mockOrderModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(userOrders),
      });

      const result = await service.findUserOrders('user123');

      expect(result).toEqual(userOrders);
      expect(mockOrderModel.find).toHaveBeenCalledWith({ user: 'user123' });
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const allOrders = [mockOrder, mockOrder];
      mockOrderModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(allOrders),
      });

      const result = await service.findAll();

      expect(result).toEqual(allOrders);
      expect(mockOrderModel.find).toHaveBeenCalledWith({});
    });
  });
});

