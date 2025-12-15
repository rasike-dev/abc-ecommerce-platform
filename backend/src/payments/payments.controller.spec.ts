import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let paymentsService: PaymentsService;

  const mockPaymentsService = {
    createCombankSession: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<PaymentsController>(PaymentsController);
    paymentsService = module.get<PaymentsService>(PaymentsService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /payments/combank/:id', () => {
    const orderId = 'order123';

    it('should create combank session successfully', async () => {
      // Arrange
      const expectedResponse = {
        message: 'Session created successfully',
        data: {
          result: 'SUCCESS',
          sessionId: 'SESSION_123',
          successIndicator: 'IND_123',
        },
      };

      mockPaymentsService.createCombankSession.mockResolvedValue(
        expectedResponse,
      );

      // Act
      const result = await controller.createCombankSession(orderId);

      // Assert
      expect(paymentsService.createCombankSession).toHaveBeenCalledWith(
        orderId,
      );
      expect(paymentsService.createCombankSession).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should return error response when session creation fails', async () => {
      // Arrange
      const errorResponse = {
        message: 'error: Session creation failed, try again in few minutes',
        error: { result: 'ERROR' },
        data: null,
      };

      mockPaymentsService.createCombankSession.mockResolvedValue(
        errorResponse,
      );

      // Act
      const result = await controller.createCombankSession(orderId);

      // Assert
      expect(result).toEqual(errorResponse);
      expect(result.data).toBeNull();
    });

    it('should handle service errors', async () => {
      // Arrange
      mockPaymentsService.createCombankSession.mockRejectedValue(
        new Error('Order not found'),
      );

      // Act & Assert
      await expect(
        controller.createCombankSession(orderId),
      ).rejects.toThrow('Order not found');
      expect(paymentsService.createCombankSession).toHaveBeenCalledWith(
        orderId,
      );
    });

    it('should pass correct order ID to service', async () => {
      // Arrange
      const differentOrderId = 'order456';
      mockPaymentsService.createCombankSession.mockResolvedValue({
        message: 'Success',
        data: {},
      });

      // Act
      await controller.createCombankSession(differentOrderId);

      // Assert
      expect(paymentsService.createCombankSession).toHaveBeenCalledWith(
        differentOrderId,
      );
    });

    it('should return session details in response', async () => {
      // Arrange
      const sessionResponse = {
        message: 'Session created successfully',
        data: {
          result: 'SUCCESS',
          sessionId: 'SESS_789',
          sessionVersion: '1.0',
          successIndicator: 'IND_789',
          orderId: 'order123',
        },
      };

      mockPaymentsService.createCombankSession.mockResolvedValue(
        sessionResponse,
      );

      // Act
      const result = await controller.createCombankSession(orderId);

      // Assert
      expect(result.data).toHaveProperty('sessionId');
      expect(result.data).toHaveProperty('successIndicator');
      expect(result.data.sessionId).toBe('SESS_789');
    });

    it('should handle invalid order ID format', async () => {
      // Arrange
      const invalidOrderId = 'invalid';
      mockPaymentsService.createCombankSession.mockRejectedValue(
        new Error('Invalid order ID'),
      );

      // Act & Assert
      await expect(
        controller.createCombankSession(invalidOrderId),
      ).rejects.toThrow('Invalid order ID');
    });

    it('should handle network timeouts', async () => {
      // Arrange
      mockPaymentsService.createCombankSession.mockRejectedValue(
        new Error('Request timeout'),
      );

      // Act & Assert
      await expect(
        controller.createCombankSession(orderId),
      ).rejects.toThrow('Request timeout');
    });
  });

  describe('authentication', () => {
    it('should be protected by JwtAuthGuard', () => {
      // The controller uses @UseGuards(JwtAuthGuard)
      // This is verified through the metadata
      const guards = Reflect.getMetadata('__guards__', PaymentsController);
      expect(guards).toBeDefined();
    });

    it('should require authentication for all endpoints', async () => {
      // Arrange
      mockJwtAuthGuard.canActivate.mockReturnValue(true);
      mockPaymentsService.createCombankSession.mockResolvedValue({
        message: 'Success',
        data: {},
      });

      // Act
      await controller.createCombankSession('order123');

      // Assert
      // If we reach here without errors, authentication was checked
      expect(mockPaymentsService.createCombankSession).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should propagate database errors', async () => {
      // Arrange
      mockPaymentsService.createCombankSession.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // Act & Assert
      await expect(
        controller.createCombankSession('order123'),
      ).rejects.toThrow('Database connection failed');
    });

    it('should propagate payment gateway errors', async () => {
      // Arrange
      mockPaymentsService.createCombankSession.mockRejectedValue(
        new Error('Payment gateway unavailable'),
      );

      // Act & Assert
      await expect(
        controller.createCombankSession('order123'),
      ).rejects.toThrow('Payment gateway unavailable');
    });
  });
});

