import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  const mockUserResponse = {
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    isAdmin: false,
    token: 'mock.jwt.token.here',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /auth/login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return user and token on successful login', async () => {
      // Arrange
      mockAuthService.login.mockResolvedValue(mockUserResponse);

      // Act
      const result = await controller.login(loginDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUserResponse);
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('_id');
      expect(result).toHaveProperty('email');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      // Arrange
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid email or password'),
      );

      // Act & Assert
      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle service errors', async () => {
      // Arrange
      mockAuthService.login.mockRejectedValue(
        new Error('Internal server error'),
      );

      // Act & Assert
      await expect(controller.login(loginDto)).rejects.toThrow(
        'Internal server error',
      );
    });

    it('should pass correct email to service', async () => {
      // Arrange
      mockAuthService.login.mockResolvedValue(mockUserResponse);

      // Act
      await controller.login(loginDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(
        expect.objectContaining({ email: loginDto.email }),
      );
    });

    it('should pass correct password to service', async () => {
      // Arrange
      mockAuthService.login.mockResolvedValue(mockUserResponse);

      // Act
      await controller.login(loginDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(
        expect.objectContaining({ password: loginDto.password }),
      );
    });
  });

  describe('POST /auth/register', () => {
    const registerDto: RegisterDto = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
    };

    it('should create new user and return user with token', async () => {
      // Arrange
      const newUserResponse = {
        ...mockUserResponse,
        _id: 'newuser123',
        name: registerDto.name,
        email: registerDto.email,
      };
      mockAuthService.register.mockResolvedValue(newUserResponse);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
      expect(result).toEqual(newUserResponse);
      expect(result.name).toBe(registerDto.name);
      expect(result.email).toBe(registerDto.email);
    });

    it('should throw ConflictException when user already exists', async () => {
      // Arrange
      mockAuthService.register.mockRejectedValue(
        new ConflictException('User already exists'),
      );

      // Act & Assert
      await expect(controller.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should handle service errors during registration', async () => {
      // Arrange
      mockAuthService.register.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(controller.register(registerDto)).rejects.toThrow(
        'Database error',
      );
    });

    it('should pass all registration data to service', async () => {
      // Arrange
      mockAuthService.register.mockResolvedValue(mockUserResponse);

      // Act
      await controller.register(registerDto);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(
        expect.objectContaining({
          name: registerDto.name,
          email: registerDto.email,
          password: registerDto.password,
        }),
      );
    });

    it('should return token after successful registration', async () => {
      // Arrange
      mockAuthService.register.mockResolvedValue(mockUserResponse);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(result).toHaveProperty('token');
      expect(typeof result.token).toBe('string');
    });

    it('should set isAdmin to false by default for new users', async () => {
      // Arrange
      mockAuthService.register.mockResolvedValue(mockUserResponse);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(result.isAdmin).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should propagate authentication errors', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrong',
      };
      const error = new UnauthorizedException('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.login(loginDto)).rejects.toThrow(error);
    });

    it('should propagate registration conflicts', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        name: 'Test',
        email: 'existing@example.com',
        password: 'password',
      };
      const error = new ConflictException('User already exists');
      mockAuthService.register.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.register(registerDto)).rejects.toThrow(error);
    });
  });
});

