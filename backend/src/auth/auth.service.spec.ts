import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$10$hashedPassword',
    isAdmin: false,
    matchPassword: jest.fn(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdWithPassword: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    // Reset and configure mock with default return value
    mockJwtService.sign.mockReturnValue('mock.jwt.token.here');
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return user and token on successful login', async () => {
      // Arrange
      const expectedToken = 'mock.jwt.token.here';
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUser.matchPassword.mockResolvedValue(true);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
      expect(mockUser.matchPassword).toHaveBeenCalledWith(loginDto.password);
      expect(jwtService.sign).toHaveBeenCalledWith({ id: mockUser._id });
      expect(result).toEqual({
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        isAdmin: mockUser.isAdmin,
        token: expectedToken,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      mockUsersService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid email or password',
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockUser.matchPassword).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      // Arrange
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUser.matchPassword.mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid email or password',
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockUser.matchPassword).toHaveBeenCalledWith(loginDto.password);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should handle empty email', async () => {
      // Arrange
      const invalidDto: LoginDto = { email: '', password: 'password123' };
      mockUsersService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(invalidDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle empty password', async () => {
      // Arrange
      const invalidDto: LoginDto = {
        email: 'test@example.com',
        password: '',
      };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUser.matchPassword.mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(invalidDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
    };

    it('should create new user and return user with token', async () => {
      // Arrange
      const newUser = {
        ...mockUser,
        _id: 'newuser123',
        name: registerDto.name,
        email: registerDto.email,
      };
      const expectedToken = 'mock.jwt.token.here';

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(newUser);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(usersService.create).toHaveBeenCalledWith(registerDto);
      expect(jwtService.sign).toHaveBeenCalledWith({ id: newUser._id });
      expect(result).toEqual({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
        token: expectedToken,
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      // Arrange
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'User already exists',
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(usersService.create).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should handle registration with admin flag set to false by default', async () => {
      // Arrange
      const newUser = {
        ...mockUser,
        _id: 'newuser123',
        name: registerDto.name,
        email: registerDto.email,
        isAdmin: false,
      };

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(newUser);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result.isAdmin).toBe(false);
    });

    it('should handle case-sensitive email check', async () => {
      // Arrange
      const upperCaseDto: RegisterDto = {
        name: 'Test User',
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.register(upperCaseDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should propagate errors from user service', async () => {
      // Arrange
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        'Database connection failed',
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle JWT service failure during login', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUser.matchPassword.mockResolvedValue(true);
      mockJwtService.sign.mockImplementation(() => {
        throw new Error('JWT signing failed');
      });

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        'JWT signing failed',
      );
    });

    it('should handle JWT service failure during registration', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
      };
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockImplementation(() => {
        throw new Error('JWT signing failed');
      });

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        'JWT signing failed',
      );
    });
  });
});
