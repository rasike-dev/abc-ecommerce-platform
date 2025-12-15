import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { OrdersService } from '../orders/orders.service';
import { CombankProvider } from './providers/combank.provider';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let ordersService: OrdersService;
  let combankProvider: CombankProvider;

  const mockOrder = {
    _id: 'order123',
    user: {
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
    },
    totalPrice: 1000,
    paymentResult: {
      successIndicator: '',
      sessionId: '',
      sessionVersion: '',
    },
    save: jest.fn(),
  };

  const mockOrdersService = {
    findById: jest.fn(),
  };

  const mockCombankProvider = {
    createCheckoutSession: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
        {
          provide: CombankProvider,
          useValue: mockCombankProvider,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    ordersService = module.get<OrdersService>(OrdersService);
    combankProvider = module.get<CombankProvider>(CombankProvider);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCombankSession', () => {
    const orderId = 'order123';

    it('should create checkout session successfully', async () => {
      // Arrange
      const successResponse = {
        result: 'SUCCESS',
        successIndicator: 'SUCCESS_INDICATOR_123',
        sessionId: 'SESSION_123',
        sessionVersion: '1.0',
      };

      mockOrdersService.findById.mockResolvedValue(mockOrder);
      mockCombankProvider.createCheckoutSession.mockResolvedValue(
        successResponse,
      );
      mockOrder.save.mockResolvedValue(mockOrder);

      // Act
      const result = await service.createCombankSession(orderId);

      // Assert
      expect(ordersService.findById).toHaveBeenCalledWith(orderId);
      expect(ordersService.findById).toHaveBeenCalledTimes(1);
      expect(combankProvider.createCheckoutSession).toHaveBeenCalledWith(
        mockOrder,
      );
      expect(mockOrder.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Session created successfully',
        data: successResponse,
      });
      expect(mockOrder.paymentResult.successIndicator).toBe(
        'SUCCESS_INDICATOR_123',
      );
      expect(mockOrder.paymentResult.sessionId).toBe('SESSION_123');
      expect(mockOrder.paymentResult.sessionVersion).toBe('1.0');
    });

    it('should return error when session creation fails', async () => {
      // Arrange
      const errorResponse = {
        result: 'ERROR',
        error: 'Payment gateway unavailable',
      };

      mockOrdersService.findById.mockResolvedValue(mockOrder);
      mockCombankProvider.createCheckoutSession.mockResolvedValue(
        errorResponse,
      );

      // Act
      const result = await service.createCombankSession(orderId);

      // Assert
      expect(ordersService.findById).toHaveBeenCalledWith(orderId);
      expect(combankProvider.createCheckoutSession).toHaveBeenCalledWith(
        mockOrder,
      );
      expect(mockOrder.save).not.toHaveBeenCalled();
      expect(result).toEqual({
        message: 'error: Session creation failed, try again in few minutes',
        error: errorResponse,
        data: null,
      });
    });

    it('should handle missing order', async () => {
      // Arrange
      mockOrdersService.findById.mockResolvedValue(null);

      // Act & Assert
      // Will throw error when trying to access null order properties
      await expect(service.createCombankSession(orderId)).rejects.toThrow();
      expect(ordersService.findById).toHaveBeenCalledWith(orderId);
    });

    it('should handle provider errors', async () => {
      // Arrange
      mockOrdersService.findById.mockResolvedValue(mockOrder);
      mockCombankProvider.createCheckoutSession.mockRejectedValue(
        new Error('Network error'),
      );

      // Act & Assert
      await expect(service.createCombankSession(orderId)).rejects.toThrow(
        'Network error',
      );
      expect(ordersService.findById).toHaveBeenCalledWith(orderId);
      expect(combankProvider.createCheckoutSession).toHaveBeenCalledWith(
        mockOrder,
      );
      expect(mockOrder.save).not.toHaveBeenCalled();
    });

    it('should update order with all payment session details', async () => {
      // Arrange
      const successResponse = {
        result: 'SUCCESS',
        successIndicator: 'IND_123',
        sessionId: 'SESS_456',
        sessionVersion: '2.0',
      };

      mockOrdersService.findById.mockResolvedValue(mockOrder);
      mockCombankProvider.createCheckoutSession.mockResolvedValue(
        successResponse,
      );
      mockOrder.save.mockResolvedValue(mockOrder);

      // Act
      await service.createCombankSession(orderId);

      // Assert
      expect(mockOrder.paymentResult.successIndicator).toBe('IND_123');
      expect(mockOrder.paymentResult.sessionId).toBe('SESS_456');
      expect(mockOrder.paymentResult.sessionVersion).toBe('2.0');
      expect(mockOrder.save).toHaveBeenCalledTimes(1);
    });

    it('should handle order save failure', async () => {
      // Arrange
      const successResponse = {
        result: 'SUCCESS',
        successIndicator: 'SUCCESS_INDICATOR_123',
        sessionId: 'SESSION_123',
        sessionVersion: '1.0',
      };

      mockOrdersService.findById.mockResolvedValue(mockOrder);
      mockCombankProvider.createCheckoutSession.mockResolvedValue(
        successResponse,
      );
      mockOrder.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.createCombankSession(orderId)).rejects.toThrow(
        'Database error',
      );
      expect(mockOrder.save).toHaveBeenCalled();
    });

    it('should handle partial success response', async () => {
      // Arrange
      const partialResponse = {
        result: 'PENDING',
        sessionId: 'SESS_789',
      };

      mockOrdersService.findById.mockResolvedValue(mockOrder);
      mockCombankProvider.createCheckoutSession.mockResolvedValue(
        partialResponse,
      );

      // Act
      const result = await service.createCombankSession(orderId);

      // Assert
      expect(result).toEqual({
        message: 'error: Session creation failed, try again in few minutes',
        error: partialResponse,
        data: null,
      });
      expect(mockOrder.save).not.toHaveBeenCalled();
    });

    it('should not save order if result is not SUCCESS', async () => {
      // Arrange
      const failedResponse = {
        result: 'FAILED',
        reason: 'Invalid merchant credentials',
      };

      mockOrdersService.findById.mockResolvedValue(mockOrder);
      mockCombankProvider.createCheckoutSession.mockResolvedValue(
        failedResponse,
      );

      // Act
      await service.createCombankSession(orderId);

      // Assert
      expect(mockOrder.save).not.toHaveBeenCalled();
    });

    it('should handle different order IDs', async () => {
      // Arrange
      const differentOrderId = 'order456';
      const successResponse = {
        result: 'SUCCESS',
        successIndicator: 'IND_456',
        sessionId: 'SESS_456',
        sessionVersion: '1.0',
      };

      mockOrdersService.findById.mockResolvedValue(mockOrder);
      mockCombankProvider.createCheckoutSession.mockResolvedValue(
        successResponse,
      );
      mockOrder.save.mockResolvedValue(mockOrder);

      // Act
      await service.createCombankSession(differentOrderId);

      // Assert
      expect(ordersService.findById).toHaveBeenCalledWith(differentOrderId);
    });
  });
});

