# Quick Start: Unit Testing Your NestJS Application

## ✅ You're Ready to Start Testing!

### Current Status
- ✅ Jest configured and working
- ✅ First test file created: `src/auth/auth.service.spec.ts`
- ✅ Tests passing: 6/6
- ✅ Coverage tracking enabled
- ✅ Current overall coverage: **2.24%** (auth.service.ts: 42%)

---

## 🚀 5-Minute Quick Start

### 1. Run Your First Test
```bash
cd backend
npm test
```

You should see:
```
PASS src/auth/auth.service.spec.ts
  ✓ 6 tests passing
```

### 2. Watch Mode (Recommended for Development)
```bash
npm run test:watch
```
This will re-run tests automatically when you save files.

### 3. Check Coverage
```bash
npm run test:cov
```
Open `coverage/lcov-report/index.html` in your browser for a visual report.

---

## 📝 Best Way to Introduce Tests

### Recommended Approach: **Start with Critical Modules**

#### Phase 1: Security & Payments (Week 1)
**Start Here** ⭐
```
1. src/auth/auth.service.spec.ts        (Template created - TODO items)
2. src/auth/auth.controller.spec.ts     (Create next)
3. src/payments/payments.service.spec.ts
4. src/common/guards/admin.guard.spec.ts
```

**Why start here?**
- These handle money and security
- Bugs here are most critical
- Relatively small and focused

#### Phase 2: Core Business (Week 2)
```
5. src/products/products.service.spec.ts
6. src/orders/orders.service.spec.ts
7. src/users/users.service.spec.ts
```

#### Phase 3: Supporting Features (Week 3)
```
8. src/coupons/coupons.service.spec.ts
9. src/wishlist/wishlist.service.spec.ts
10. src/groups/groups.service.spec.ts
```

---

## 🎯 The "Test-First" Mindset

### For New Features
```
1. Write test first (TDD)
   ↓
2. Watch it fail (Red)
   ↓
3. Implement feature (Green)
   ↓
4. Refactor if needed
   ↓
5. Commit with tests
```

### For Existing Code
```
1. Read the code
   ↓
2. Write test for happy path
   ↓
3. Add tests for edge cases
   ↓
4. Add tests for error cases
   ↓
5. Refactor code if needed
```

---

## 📚 Key Testing Concepts for NestJS

### 1. **Test.createTestingModule()** - Your Testing Foundation

This creates an isolated NestJS module just for testing:

```typescript
const module: TestingModule = await Test.createTestingModule({
  providers: [
    ServiceToTest,           // The actual service
    { 
      provide: Dependency,   // Mock its dependencies
      useValue: mockDependency 
    }
  ],
}).compile();
```

**Why?**
- Isolates the code you're testing
- No database connections needed
- Fast execution
- Predictable results

### 2. **Mocking** - Simulate Dependencies

Instead of calling real services, use mocks:

```typescript
const mockUserService = {
  findById: jest.fn().mockResolvedValue(fakeUser),
  create: jest.fn().mockResolvedValue(newUser),
};
```

**Why?**
- Control the behavior
- Test error scenarios easily
- No side effects (no real database changes)

### 3. **AAA Pattern** - Structure Your Tests

```typescript
it('should do something', async () => {
  // ARRANGE - Set up test data and mocks
  const input = { email: 'test@example.com' };
  mockService.findByEmail.mockResolvedValue(null);
  
  // ACT - Execute the code
  const result = await service.register(input);
  
  // ASSERT - Verify results
  expect(result).toBeDefined();
  expect(mockService.findByEmail).toHaveBeenCalledWith(input.email);
});
```

### 4. **Test Edge Cases** - Don't Just Test Happy Path

```typescript
describe('calculateTotal', () => {
  it('should calculate total correctly');           // Happy path
  it('should throw error for negative quantity');   // Invalid input
  it('should handle zero quantity');                // Edge case
  it('should handle very large numbers');          // Edge case
  it('should apply maximum discount limit');        // Business rule
});
```

---

## 🛠️ Common Testing Patterns

### Pattern 1: Testing Service Methods

```typescript
// src/products/products.service.spec.ts
describe('ProductsService', () => {
  let service: ProductsService;
  let mockProductModel: any;

  beforeEach(async () => {
    mockProductModel = {
      find: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getModelToken(Product.name), useValue: mockProductModel }
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should find product by id', async () => {
    const mockProduct = { _id: '123', name: 'Test' };
    mockProductModel.findById.mockResolvedValue(mockProduct);

    const result = await service.findById('123');

    expect(result).toEqual(mockProduct);
    expect(mockProductModel.findById).toHaveBeenCalledWith('123');
  });
});
```

### Pattern 2: Testing Controllers

```typescript
// src/products/products.controller.spec.ts
describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: { findAll: jest.fn() } }
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should return products', async () => {
    const mockProducts = [{ _id: '1', name: 'Product 1' }];
    jest.spyOn(service, 'findAll').mockResolvedValue(mockProducts);

    const result = await controller.findAll();

    expect(result).toEqual(mockProducts);
  });
});
```

### Pattern 3: Testing with Authentication

```typescript
describe('getProfile', () => {
  it('should return user profile', async () => {
    const mockUser = { _id: 'user123', email: 'test@example.com' };
    const mockRequest = { user: mockUser };

    const result = await controller.getProfile(mockRequest);

    expect(result).toEqual(mockUser);
  });
});
```

### Pattern 4: Testing Error Scenarios

```typescript
it('should throw NotFoundException when product not found', async () => {
  mockProductModel.findById.mockResolvedValue(null);

  await expect(service.findById('invalid-id'))
    .rejects
    .toThrow(NotFoundException);
});
```

---

## 📊 Coverage Goals

| Module | Target | Current |
|--------|--------|---------|
| auth.service.ts | 90% | 42% ⚠️ |
| payments.service.ts | 90% | 0% ❌ |
| orders.service.ts | 85% | 0% ❌ |
| products.service.ts | 85% | 0% ❌ |
| Overall | 80% | 2.24% ❌ |

---

## ✅ Your Next Actions

### Today (30 minutes)
1. ✅ Read `TESTING_GUIDE.md` (comprehensive examples)
2. ⬜ Complete the TODO tests in `src/auth/auth.service.spec.ts`
3. ⬜ Run `npm run test:watch` and see them pass

### This Week
1. ⬜ Create `auth.controller.spec.ts`
2. ⬜ Create `payments.service.spec.ts`
3. ⬜ Target: 80%+ coverage for auth and payments

### Command Cheat Sheet
```bash
# Run all tests
npm test

# Watch mode (auto-rerun on save)
npm run test:watch

# Coverage report
npm run test:cov

# Run specific test file
npm test auth.service

# Run tests matching pattern
npm test -- --testNamePattern="should login"

# Debug tests
npm run test:debug
```

---

## 📖 Documentation Files Created

1. **BACKEND_TEST_STATUS.md** - Complete status and module breakdown
2. **TESTING_GUIDE.md** - Comprehensive guide with examples ⭐ **START HERE**
3. **QUICK_START_TESTING.md** - This file

---

## 💡 Pro Tips

### 1. Start Small
Don't try to test everything at once. One module at a time.

### 2. Test Behavior, Not Implementation
```typescript
// ❌ Bad - Testing implementation
expect(service.calculateDiscount.toString()).toContain('if');

// ✅ Good - Testing behavior
expect(service.calculateDiscount(100, 10)).toBe(90);
```

### 3. Use Descriptive Test Names
```typescript
// ❌ Bad
it('test1', () => { ... });

// ✅ Good
it('should throw UnauthorizedException when password is incorrect', () => { ... });
```

### 4. Keep Tests Simple
One test should verify one thing.

### 5. Mock External Dependencies
Database, APIs, file system - mock them all.

---

## 🎓 Learning Path

### Day 1-2: Basics
- Read TESTING_GUIDE.md
- Complete auth.service.spec.ts TODOs
- Run tests and see them pass

### Day 3-4: Services
- Create tests for 2-3 more services
- Focus on business logic

### Day 5-7: Controllers
- Add controller tests
- Test HTTP layer

### Week 2+: Full Coverage
- Cover all modules
- Add E2E tests
- Reach 80% coverage

---

## 🆘 Common Issues

### Issue: "Cannot find module"
**Solution:** Check your imports and mocks

### Issue: "Test timeout"
**Solution:** Add `await` to async operations

### Issue: "Mock not working"
**Solution:** Call `jest.clearAllMocks()` in `beforeEach()`

### Issue: "Coverage not counting"
**Solution:** Make sure test file is named `*.spec.ts`

---

## 🎯 Success Criteria

You'll know you're doing well when:
- [ ] All new code has tests
- [ ] Tests run in < 10 seconds
- [ ] Coverage is > 80%
- [ ] Tests are green in CI/CD
- [ ] Team reviews tests in PRs

---

**Remember:** The goal is not 100% coverage. The goal is **confidence** that your code works.

Start with the critical paths, then expand coverage over time.

**Happy Testing!** 🚀

---

**Created:** December 15, 2025  
**Starter Template:** `src/auth/auth.service.spec.ts` (with TODOs)

