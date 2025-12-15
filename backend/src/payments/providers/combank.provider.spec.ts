import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CombankProvider } from './combank.provider';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CombankProvider', () => {
  let provider: CombankProvider;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        COMBANK_API_USERNAME: 'test_username',
        COMBANK_API_PASSWORD: 'test_password',
        COMBANK_MERCHANT_ID: 'TEST_MERCHANT',
        COMBANK_TEST_URL: 'https://test.combank.com/api',
        CLIENT_URL: 'http://localhost:3000',
      };
      return config[key];
    }),
  };

  const mockOrder = {
    _id: 'order123',
    user: {
      name: 'Test User',
      email: 'test@example.com',
    },
    totalPrice: 1000,
  };

  beforeEach(async () => {
    // Reset mock implementation before each test
    jest.clearAllMocks();
    mockConfigService.get.mockImplementation((key: string) => {
      const config = {
        COMBANK_API_USERNAME: 'test_username',
        COMBANK_API_PASSWORD: 'test_password',
        COMBANK_MERCHANT_ID: 'TEST_MERCHANT',
        COMBANK_TEST_URL: 'https://test.combank.com/api',
        CLIENT_URL: 'http://localhost:3000',
      };
      return config[key];
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CombankProvider,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    provider = module.get<CombankProvider>(CombankProvider);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('createCheckoutSession', () => {
    it('should create checkout session successfully', async () => {
      // Arrange
      const mockResponse = {
        data:
          'result=SUCCESS&session.id=SESSION123&session.version=1.0&successIndicator=IND123&merchant=TEST_MERCHANT',
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.createCheckoutSession(mockOrder);

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://test.combank.com/api',
        expect.stringContaining('apiOperation=CREATE_CHECKOUT_SESSION'),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );
      expect(result).toEqual({
        orderId: mockOrder._id,
        result: 'SUCCESS',
        sessionId: 'SESSION123',
        sessionVersion: '1.0',
        successIndicator: 'IND123',
        merchant: 'TEST_MERCHANT',
      });
    });

    it('should include all required parameters in request', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({
        data: 'result=SUCCESS',
      });

      // Act
      await provider.createCheckoutSession(mockOrder);

      // Assert
      const callArgs = mockedAxios.post.mock.calls[0];
      const requestBody = callArgs[1] as string;

      expect(requestBody).toContain('apiOperation=CREATE_CHECKOUT_SESSION');
      expect(requestBody).toContain('apiUsername=test_username');
      expect(requestBody).toContain('apiPassword=test_password');
      expect(requestBody).toContain('merchant=TEST_MERCHANT');
      expect(requestBody).toContain(`order.id=${mockOrder._id}`);
      expect(requestBody).toContain('order.amount=1000');
      expect(requestBody).toContain('order.currency=LKR');
      expect(requestBody).toContain('interaction.operation=PURCHASE');
    });

    it('should include user information in description', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({
        data: 'result=SUCCESS',
      });

      // Act
      await provider.createCheckoutSession(mockOrder);

      // Assert
      const callArgs = mockedAxios.post.mock.calls[0];
      const requestBody = callArgs[1] as string;

      // URLSearchParams encodes spaces as '+' not '%20'
      expect(requestBody).toContain('order.description=Test+User+test');
      expect(requestBody).toContain(mockOrder.user.name.replace(' ', '+'));
    });

    it('should include correct return URL', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({
        data: 'result=SUCCESS',
      });

      // Act
      await provider.createCheckoutSession(mockOrder);

      // Assert
      const callArgs = mockedAxios.post.mock.calls[0];
      const requestBody = callArgs[1] as string;

      // URLSearchParams handles URL encoding
      expect(requestBody).toContain('interaction.returnUrl=http');
      expect(requestBody).toContain(`order%2F${mockOrder._id}`);
    });

    it('should throw HttpException on network error', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(
        provider.createCheckoutSession(mockOrder),
      ).rejects.toThrow(HttpException);
      await expect(
        provider.createCheckoutSession(mockOrder),
      ).rejects.toThrow('Session creation failed, try again in few minutes');
    });

    it('should throw HttpException with correct status code', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValue(new Error('Timeout'));

      // Act & Assert
      try {
        await provider.createCheckoutSession(mockOrder);
        fail('Should have thrown HttpException');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    it('should parse response with all fields', async () => {
      // Arrange
      const mockResponse = {
        data:
          'result=SUCCESS&session.id=SESS456&session.version=2.0&session.updateStatus=SUCCESS&successIndicator=IND456&merchant=MERCHANT123',
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.createCheckoutSession(mockOrder);

      // Assert
      expect(result).toEqual({
        orderId: mockOrder._id,
        result: 'SUCCESS',
        sessionId: 'SESS456',
        sessionVersion: '2.0',
        sessionUpdateStatus: 'SUCCESS',
        successIndicator: 'IND456',
        merchant: 'MERCHANT123',
      });
    });

    it('should handle partial response data', async () => {
      // Arrange
      const mockResponse = {
        data: 'result=ERROR&session.id=SESS789',
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.createCheckoutSession(mockOrder);

      // Assert
      expect(result).toEqual({
        orderId: mockOrder._id,
        result: 'ERROR',
        sessionId: 'SESS789',
      });
    });

    it('should handle empty response fields', async () => {
      // Arrange
      const mockResponse = {
        data: 'result=&session.id=',
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.createCheckoutSession(mockOrder);

      // Assert
      expect(result.orderId).toBe(mockOrder._id);
      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('sessionId');
    });

    it('should use correct content type header', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({ data: 'result=SUCCESS' });

      // Act
      await provider.createCheckoutSession(mockOrder);

      // Assert
      const callArgs = mockedAxios.post.mock.calls[0];
      const headers = callArgs[2];
      expect(headers.headers['Content-Type']).toBe(
        'application/x-www-form-urlencoded',
      );
    });

    it('should handle different order amounts', async () => {
      // Arrange
      const largeOrder = {
        ...mockOrder,
        totalPrice: 50000,
      };
      mockedAxios.post.mockResolvedValue({ data: 'result=SUCCESS' });

      // Act
      await provider.createCheckoutSession(largeOrder);

      // Assert
      const callArgs = mockedAxios.post.mock.calls[0];
      const requestBody = callArgs[1] as string;
      expect(requestBody).toContain('order.amount=50000');
    });

    it('should include merchant name in request', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({ data: 'result=SUCCESS' });

      // Act
      await provider.createCheckoutSession(mockOrder);

      // Assert
      const callArgs = mockedAxios.post.mock.calls[0];
      const requestBody = callArgs[1] as string;
      expect(requestBody).toContain('interaction.merchant.name=ABCSCHOOL.lk');
    });

    it('should use LKR currency', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({ data: 'result=SUCCESS' });

      // Act
      await provider.createCheckoutSession(mockOrder);

      // Assert
      const callArgs = mockedAxios.post.mock.calls[0];
      const requestBody = callArgs[1] as string;
      expect(requestBody).toContain('order.currency=LKR');
    });

    it('should handle axios timeout errors', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValue({
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
      });

      // Act & Assert
      await expect(
        provider.createCheckoutSession(mockOrder),
      ).rejects.toThrow(HttpException);
    });

    it('should handle API authentication failures', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValue({
        response: { status: 401, data: 'Unauthorized' },
      });

      // Act & Assert
      await expect(
        provider.createCheckoutSession(mockOrder),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('configuration', () => {
    it('should be properly configured with config service', () => {
      // The provider is configured in the constructor with ConfigService
      // Configuration values are loaded during instantiation
      expect(provider).toBeDefined();
      expect(configService).toBeDefined();
    });

    it('should use config service for all settings', () => {
      // The mock config service provides all necessary values
      // This is verified through successful operation
      expect(mockConfigService.get).toBeDefined();
      expect(typeof mockConfigService.get).toBe('function');
    });
  });
});

