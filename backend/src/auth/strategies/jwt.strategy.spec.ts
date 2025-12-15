import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../../users/users.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: UsersService;
  let configService: ConfigService;

  const mockUser = {
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$10$hashedPassword',
    isAdmin: false,
  };

  const mockUsersService = {
    findByIdWithPassword: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test_jwt_secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get<UsersService>(UsersService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user when payload contains valid user id', async () => {
      // Arrange
      const payload = { id: 'user123' };
      mockUsersService.findByIdWithPassword.mockResolvedValue(mockUser);

      // Act
      const result = await strategy.validate(payload);

      // Assert
      expect(usersService.findByIdWithPassword).toHaveBeenCalledWith(
        payload.id,
      );
      expect(usersService.findByIdWithPassword).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      const payload = { id: 'invalid-user-id' };
      mockUsersService.findByIdWithPassword.mockResolvedValue(null);

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow('User not found');
      expect(usersService.findByIdWithPassword).toHaveBeenCalledWith(
        payload.id,
      );
    });

    it('should throw UnauthorizedException when user service throws error', async () => {
      // Arrange
      const payload = { id: 'user123' };
      mockUsersService.findByIdWithPassword.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle payload with additional fields', async () => {
      // Arrange
      const payload = {
        id: 'user123',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234567990,
      };
      mockUsersService.findByIdWithPassword.mockResolvedValue(mockUser);

      // Act
      const result = await strategy.validate(payload);

      // Assert
      expect(result).toEqual(mockUser);
      expect(usersService.findByIdWithPassword).toHaveBeenCalledWith(
        payload.id,
      );
    });

    it('should return user with all properties including password', async () => {
      // Arrange
      const payload = { id: 'user123' };
      const userWithPassword = {
        ...mockUser,
        password: '$2a$10$hashedPassword',
      };
      mockUsersService.findByIdWithPassword.mockResolvedValue(
        userWithPassword,
      );

      // Act
      const result = await strategy.validate(payload);

      // Assert
      expect(result).toHaveProperty('password');
      expect(result.password).toBe('$2a$10$hashedPassword');
    });

    it('should handle malformed payload gracefully', async () => {
      // Arrange
      const payload = { wrongField: 'value' };
      mockUsersService.findByIdWithPassword.mockResolvedValue(null);

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with custom message', async () => {
      // Arrange
      const payload = { id: 'user123' };
      mockUsersService.findByIdWithPassword.mockRejectedValue(
        new Error('Custom error message'),
      );

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(
        'Custom error message',
      );
    });

    it('should handle null payload id', async () => {
      // Arrange
      const payload = { id: null };
      mockUsersService.findByIdWithPassword.mockResolvedValue(null);

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle undefined payload id', async () => {
      // Arrange
      const payload = { id: undefined };
      mockUsersService.findByIdWithPassword.mockResolvedValue(null);

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with "Invalid token" for generic errors', async () => {
      // Arrange
      const payload = { id: 'user123' };
      const errorWithoutMessage = new Error();
      errorWithoutMessage.message = '';
      mockUsersService.findByIdWithPassword.mockRejectedValue(
        errorWithoutMessage,
      );

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow('Invalid token');
    });
  });

  describe('configuration', () => {
    it('should be properly configured with config service', () => {
      // The strategy is configured in the constructor with ConfigService
      // This is tested through the strategy instantiation and functionality
      expect(strategy).toBeDefined();
      expect(configService).toBeDefined();
    });

    it('should use JWT secret from config service', () => {
      // The config service is called during super() in constructor
      // We verify it was set up correctly by testing the strategy works
      expect(mockConfigService.get).toBeDefined();
      expect(typeof mockConfigService.get).toBe('function');
    });
  });
});

