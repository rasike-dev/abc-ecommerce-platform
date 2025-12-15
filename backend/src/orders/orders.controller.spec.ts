import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: OrdersService;

  const mockOrdersService = {
    create: jest.fn(),
    findById: jest.fn(),
    updateToPaid: jest.fn(),
    updateToDelivered: jest.fn(),
    findUserOrders: jest.fn(),
    findAll: jest.fn(),
  };

  const mockOrder = {
    _id: 'order123',
    user: 'user123',
    totalPrice: 100,
    isPaid: false,
    isDelivered: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /orders', () => {
    it('should create a new order', async () => {
      const user = { _id: 'user123' };
      const createOrderDto = {
        orderItems: [],
        shippingAddress: {},
        paymentMethod: 'Card',
        totalPrice: 100,
      };

      mockOrdersService.create.mockResolvedValue(mockOrder);

      const result = await controller.create(user, createOrderDto as any);

      expect(ordersService.create).toHaveBeenCalledWith(user._id, createOrderDto);
    });
  });

  describe('GET /orders/myorders', () => {
    it('should return user orders', async () => {
      const user = { _id: 'user123' };
      const userOrders = [mockOrder];

      mockOrdersService.findUserOrders.mockResolvedValue(userOrders);

      const result = await controller.getMyOrders(user);

      expect(result).toEqual(userOrders);
      expect(ordersService.findUserOrders).toHaveBeenCalledWith(user._id);
    });
  });

  describe('GET /orders/:id', () => {
    it('should return an order by id', async () => {
      mockOrdersService.findById.mockResolvedValue(mockOrder);

      const result = await controller.findOne('order123');

      expect(result).toEqual(mockOrder);
      expect(ordersService.findById).toHaveBeenCalledWith('order123');
    });
  });

  describe('PUT /orders/:id/pay', () => {
    it('should update order to paid', async () => {
      const updateDto = {
        resultIndicator: 'SUCCESS',
        sessionVersion: '1.0',
      };
      const paidOrder = { ...mockOrder, isPaid: true };

      mockOrdersService.updateToPaid.mockResolvedValue(paidOrder);

      const result = await controller.updateOrderToPaid('order123', updateDto);

      expect(result).toEqual(paidOrder);
      expect(ordersService.updateToPaid).toHaveBeenCalledWith('order123', updateDto);
    });
  });

  describe('PUT /orders/:id/deliver', () => {
    it('should update order to delivered', async () => {
      const deliveredOrder = { ...mockOrder, isDelivered: true };

      mockOrdersService.updateToDelivered.mockResolvedValue(deliveredOrder);

      const result = await controller.updateOrderToDelivered('order123');

      expect(result).toEqual(deliveredOrder);
      expect(ordersService.updateToDelivered).toHaveBeenCalledWith('order123');
    });
  });

  describe('GET /orders', () => {
    it('should return all orders (admin)', async () => {
      const allOrders = [mockOrder, mockOrder];

      mockOrdersService.findAll.mockResolvedValue(allOrders);

      const result = await controller.findAll();

      expect(result).toEqual(allOrders);
      expect(ordersService.findAll).toHaveBeenCalled();
    });
  });
});

