# NestJS Unit Testing Best Practices Guide

## 🎯 Introduction Strategy

### Why Start with Unit Tests?
1. **Fast Execution** - Run in milliseconds
2. **Easy to Debug** - Isolated failures
3. **Better Design** - Forces you to think about dependencies
4. **Documentation** - Tests serve as living documentation

---

## 🏗️ NestJS Testing Architecture

### Key Components

1. **Test.createTestingModule()** - Creates isolated module for testing
2. **Mocking** - Replace real dependencies with test doubles
3. **Jest Matchers** - Assertions (expect, toBe, toThrow, etc.)
4. **Async Testing** - Handle promises and async operations

---

## 📋 Step-by-Step Implementation

### Phase 1: Start Simple - Service Tests

Services are the **best place to start** because they:
- Contain business logic
- Have clear inputs/outputs
- Are easy to mock

### Phase 2: Controller Tests

Controllers are easier to test after services because:
- They delegate to services (which you can mock)
- Focus on HTTP layer concerns

### Phase 3: Guards, Pipes, Interceptors

These are middleware components that need special attention.

---

## 🔨 Practical Examples from Your Codebase

### Example 1: Testing AuthService

Let's start with your authentication service - a critical component.

**File: `src/auth/auth.service.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';

// Mock bcryptjs
jest.mock('bcryptjs');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  // Mock user data
  const mockUser = {
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$10$hashedPassword',
    isAdmin: false,
  };

  // Mock services
  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
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

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  // Basic test to ensure service is created
  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return user and token on successful login', async () => {
      // Arrange
      const expectedToken = 'jwt.token.here';
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(expectedToken);

      // Act
      const result = await authService.login(loginDto);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: mockUser._id,
        email: mockUser.email,
      });
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
      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      // Arrange
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
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
      const hashedPassword = '$2a$10$newHashedPassword';
      const newUser = { ...mockUser, ...registerDto, password: hashedPassword };
      const expectedToken = 'jwt.token.here';

      mockUsersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUsersService.create.mockResolvedValue(newUser);
      mockJwtService.sign.mockReturnValue(expectedToken);

      // Act
      const result = await authService.register(registerDto);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(usersService.create).toHaveBeenCalledWith({
        ...registerDto,
        password: hashedPassword,
      });
      expect(result).toHaveProperty('token', expectedToken);
    });

    it('should throw ConflictException if user already exists', async () => {
      // Arrange
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.register(registerDto)).rejects.toThrow();
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return user if validation succeeds', async () => {
      // Arrange
      mockUsersService.findById.mockResolvedValue(mockUser);

      // Act
      const result = await authService.validateUser(mockUser._id);

      // Assert
      expect(result).toEqual(mockUser);
      expect(usersService.findById).toHaveBeenCalledWith(mockUser._id);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      mockUsersService.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.validateUser('invalid-id')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
```

---

### Example 2: Testing ProductsService

**File: `src/products/products.service.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockProductModel: any;

  const mockProduct = {
    _id: 'product123',
    name: 'Test Product',
    price: 99.99,
    description: 'Test description',
    category: 'Electronics',
    countInStock: 10,
    rating: 4.5,
    numReviews: 10,
    reviews: [],
    save: jest.fn(),
  };

  beforeEach(async () => {
    // Mock Mongoose Model
    mockProductModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn(),
      create: jest.fn(),
      new: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      // Arrange
      const products = [mockProduct];
      const query = { limit: jest.fn().mockReturnThis(), skip: jest.fn().mockResolvedValue(products) };
      mockProductModel.find.mockReturnValue(query);
      mockProductModel.countDocuments.mockResolvedValue(1);

      // Act
      const result = await service.findAll({ page: 1, limit: 10 });

      // Assert
      expect(result).toEqual({
        products,
        page: 1,
        pages: 1,
        total: 1,
      });
      expect(mockProductModel.find).toHaveBeenCalled();
    });

    it('should filter by keyword', async () => {
      // Arrange
      const keyword = 'laptop';
      const query = { 
        limit: jest.fn().mockReturnThis(), 
        skip: jest.fn().mockResolvedValue([mockProduct]) 
      };
      mockProductModel.find.mockReturnValue(query);
      mockProductModel.countDocuments.mockResolvedValue(1);

      // Act
      await service.findAll({ keyword, page: 1, limit: 10 });

      // Assert
      expect(mockProductModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.any(Object), // RegExp for case-insensitive search
        })
      );
    });
  });

  describe('findById', () => {
    it('should return a product by id', async () => {
      // Arrange
      mockProductModel.findById.mockResolvedValue(mockProduct);

      // Act
      const result = await service.findById('product123');

      // Assert
      expect(result).toEqual(mockProduct);
      expect(mockProductModel.findById).toHaveBeenCalledWith('product123');
    });

    it('should throw NotFoundException if product not found', async () => {
      // Arrange
      mockProductModel.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      // Arrange
      const createProductDto: CreateProductDto = {
        name: 'New Product',
        price: 199.99,
        description: 'New description',
        category: 'Electronics',
        countInStock: 5,
        image: 'image.jpg',
      };
      mockProductModel.create.mockResolvedValue(mockProduct);

      // Act
      const result = await service.create(createProductDto);

      // Assert
      expect(result).toEqual(mockProduct);
      expect(mockProductModel.create).toHaveBeenCalledWith(createProductDto);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      // Arrange
      const updateDto = { name: 'Updated Product' };
      const updatedProduct = { ...mockProduct, ...updateDto };
      mockProductModel.findByIdAndUpdate.mockResolvedValue(updatedProduct);

      // Act
      const result = await service.update('product123', updateDto);

      // Assert
      expect(result).toEqual(updatedProduct);
      expect(mockProductModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'product123',
        updateDto,
        { new: true },
      );
    });

    it('should throw NotFoundException if product not found', async () => {
      // Arrange
      mockProductModel.findByIdAndUpdate.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update('invalid-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addReview', () => {
    it('should add a review to product', async () => {
      // Arrange
      const reviewDto = {
        rating: 5,
        comment: 'Great product!',
      };
      const userId = 'user123';
      const userName = 'Test User';

      mockProductModel.findById.mockResolvedValue({
        ...mockProduct,
        reviews: [],
      });

      // Act
      await service.addReview('product123', reviewDto, userId, userName);

      // Assert
      expect(mockProductModel.findById).toHaveBeenCalledWith('product123');
      // Additional assertions for review logic
    });

    it('should throw BadRequestException if user already reviewed', async () => {
      // Arrange
      const existingReview = {
        user: 'user123',
        name: 'Test User',
        rating: 4,
        comment: 'Good',
      };

      mockProductModel.findById.mockResolvedValue({
        ...mockProduct,
        reviews: [existingReview],
      });

      // Act & Assert
      await expect(
        service.addReview('product123', { rating: 5, comment: 'test' }, 'user123', 'Test User'),
      ).rejects.toThrow();
    });
  });
});
```

---

### Example 3: Testing AuthController

**File: `src/auth/auth.controller.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
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

  const mockUser = {
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    isAdmin: false,
    token: 'jwt.token.here',
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /auth/login', () => {
    it('should return user and token on successful login', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockAuthService.login.mockResolvedValue(mockUser);

      // Act
      const result = await controller.login(loginDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockUser);
    });

    it('should propagate errors from service', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrong',
      };
      const error = new Error('Unauthorized');
      mockAuthService.login.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.login(loginDto)).rejects.toThrow(error);
    });
  });

  describe('POST /auth/register', () => {
    it('should create new user and return token', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
      };
      mockAuthService.register.mockResolvedValue(mockUser);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockUser);
    });
  });
});
```

---

### Example 4: Testing Guards

**File: `src/common/guards/admin.guard.spec.ts`**

```typescript
import { ExecutionContext } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(() => {
    guard = new AdminGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access for admin users', () => {
    // Arrange
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            _id: 'admin123',
            isAdmin: true,
          },
        }),
      }),
    } as ExecutionContext;

    // Act
    const result = guard.canActivate(mockExecutionContext);

    // Assert
    expect(result).toBe(true);
  });

  it('should deny access for non-admin users', () => {
    // Arrange
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            _id: 'user123',
            isAdmin: false,
          },
        }),
      }),
    } as ExecutionContext;

    // Act & Assert
    expect(() => guard.canActivate(mockExecutionContext)).toThrow();
  });

  it('should deny access when user is not authenticated', () => {
    // Arrange
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as ExecutionContext;

    // Act & Assert
    expect(() => guard.canActivate(mockExecutionContext)).toThrow();
  });
});
```

---

## 🎯 Testing Best Practices

### 1. AAA Pattern (Arrange-Act-Assert)

```typescript
it('should do something', () => {
  // Arrange - Setup test data and mocks
  const input = { ... };
  mockService.method.mockResolvedValue(expectedOutput);

  // Act - Execute the code being tested
  const result = await service.someMethod(input);

  // Assert - Verify the results
  expect(result).toEqual(expectedOutput);
  expect(mockService.method).toHaveBeenCalledWith(input);
});
```

### 2. Mock External Dependencies

```typescript
// Mock Mongoose Models
{
  provide: getModelToken(User.name),
  useValue: mockUserModel,
}

// Mock Services
{
  provide: UserService,
  useValue: {
    findById: jest.fn(),
    create: jest.fn(),
  },
}

// Mock External Libraries
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
```

### 3. Test Edge Cases

```typescript
describe('calculateDiscount', () => {
  it('should calculate discount correctly', () => { ... });
  it('should return 0 for invalid coupon', () => { ... });
  it('should handle expired coupons', () => { ... });
  it('should handle maximum discount limits', () => { ... });
  it('should throw error for negative amounts', () => { ... });
});
```

### 4. Use Descriptive Test Names

❌ **Bad:**
```typescript
it('test 1', () => { ... });
it('should work', () => { ... });
```

✅ **Good:**
```typescript
it('should throw UnauthorizedException when password is incorrect', () => { ... });
it('should return empty array when no products match search criteria', () => { ... });
```

### 5. Keep Tests Independent

```typescript
// ❌ Bad - Tests depend on each other
let sharedData;
it('test 1', () => { sharedData = ... });
it('test 2', () => { use sharedData });

// ✅ Good - Each test is independent
beforeEach(() => {
  testData = createTestData();
});
```

### 6. Mock Database Operations

```typescript
// Don't connect to real database
const mockProductModel = {
  find: jest.fn().mockReturnValue({
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockResolvedValue([...products]),
  }),
  findById: jest.fn().mockResolvedValue(product),
  create: jest.fn().mockResolvedValue(newProduct),
};
```

---

## 🚀 Quick Start Workflow

### Step 1: Create Test File
```bash
# In the same directory as your service/controller
touch src/auth/auth.service.spec.ts
```

### Step 2: Import Testing Utilities
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your.service';
```

### Step 3: Setup Testing Module
```typescript
beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [YourService, ...mockProviders],
  }).compile();
  
  service = module.get<YourService>(YourService);
});
```

### Step 4: Write Tests
```typescript
describe('methodName', () => {
  it('should ...', async () => {
    // Test implementation
  });
});
```

### Step 5: Run Tests
```bash
npm test                    # Run all tests
npm test auth.service       # Run specific test
npm run test:watch          # Watch mode
npm run test:cov            # With coverage
```

---

## 📊 Coverage Goals

### Minimum Coverage by Module Type

| Module Type | Target Coverage |
|------------|----------------|
| Auth & Security | 90%+ |
| Payment Processing | 90%+ |
| Core Business Logic | 85%+ |
| CRUD Operations | 80%+ |
| Utilities | 75%+ |

### How to Check Coverage
```bash
npm run test:cov
```

Coverage report will be generated in `coverage/lcov-report/index.html`

---

## 🛠️ Useful Jest Matchers

```typescript
// Equality
expect(value).toBe(5);
expect(value).toEqual({ a: 1 });

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThan(10);
expect(value).toBeCloseTo(0.3);

// Strings
expect(value).toMatch(/pattern/);
expect(value).toContain('substring');

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Objects
expect(obj).toHaveProperty('key');
expect(obj).toMatchObject({ key: 'value' });

// Exceptions
expect(() => fn()).toThrow();
expect(() => fn()).toThrow(ErrorClass);
expect(async () => asyncFn()).rejects.toThrow();

// Function calls
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
```

---

## 🎓 Learning Resources

1. **NestJS Testing Documentation**
   - https://docs.nestjs.com/fundamentals/testing

2. **Jest Documentation**
   - https://jestjs.io/docs/getting-started

3. **Testing Best Practices**
   - https://github.com/goldbergyoni/javascript-testing-best-practices

---

## 📝 Quick Reference Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run specific test file
npm test -- auth.service.spec

# Run tests matching pattern
npm test -- --testNamePattern="should login"

# Update snapshots
npm test -- -u

# Run in debug mode
npm run test:debug
```

---

## ✅ Testing Checklist

Before committing code, ensure:

- [ ] All new code has corresponding tests
- [ ] Tests follow AAA pattern
- [ ] External dependencies are mocked
- [ ] Edge cases are covered
- [ ] Error scenarios are tested
- [ ] Test names are descriptive
- [ ] Tests are independent
- [ ] All tests pass
- [ ] Coverage meets minimum thresholds
- [ ] No console.logs in test code

---

**Last Updated:** December 15, 2025

