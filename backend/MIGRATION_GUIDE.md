# Express to NestJS Migration Guide

Complete guide for the e-commerce platform migration from Express to NestJS.

## 📊 Migration Summary

### Project Stats

| Metric | Express | NestJS |
|--------|---------|--------|
| **Language** | JavaScript | TypeScript |
| **Files Created** | 42 | 80+ |
| **Type Safety** | None | Full |
| **Validation** | Manual | Automatic |
| **Documentation** | Manual | Auto-generated |
| **Architecture** | MVC | Modular + DI |
| **Testing** | Manual setup | Built-in |

---

## 🗺️ Module Mapping

### Authentication & Users

**Express:**
```
backend/
├── controllers/userController.js
├── models/userModel.js
├── routes/userRoutes.js
├── middleware/authMiddleware.js
└── utils/generateToken.js
```

**NestJS:**
```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/jwt.strategy.ts
│   └── dto/
│       ├── login.dto.ts
│       └── register.dto.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── schemas/user.schema.ts
│   └── dto/
│       ├── create-user.dto.ts
│       └── update-user.dto.ts
└── common/
    ├── guards/
    │   ├── jwt-auth.guard.ts
    │   └── roles.guard.ts
    └── decorators/
        ├── get-user.decorator.ts
        └── admin.decorator.ts
```

---

## 🔄 Code Comparison

### 1. User Registration

**Express (userController.js):**
```javascript
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  
  const userExists = await User.findOne({ email });
  
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  
  const user = await User.create({ name, email, password });
  
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  }
});
```

**NestJS (auth.service.ts):**
```typescript
async register(registerDto: RegisterDto) {
  const userExists = await this.usersService.findByEmail(registerDto.email);
  
  if (userExists) {
    throw new ConflictException('User already exists');
  }
  
  const user = await this.usersService.create(registerDto);
  const payload = { id: user._id };
  
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    token: this.jwtService.sign(payload),
  };
}
```

**Benefits:**
- ✅ Automatic validation via `RegisterDto`
- ✅ Type safety
- ✅ Proper HTTP exceptions
- ✅ Dependency injection
- ✅ Swagger documentation

---

### 2. Protected Routes

**Express (authMiddleware.js):**
```javascript
const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }
  
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});
```

**NestJS (jwt.strategy.ts + Controller):**
```typescript
// Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  async validate(payload: any) {
    const user = await this.usersService.findByIdWithPassword(payload.id);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}

// Controller
@Get('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
async getProfile(@GetUser() user: any) {
  return this.usersService.findById(user._id);
}
```

**Benefits:**
- ✅ Declarative guards with `@UseGuards()`
- ✅ Reusable across all controllers
- ✅ Custom `@GetUser()` decorator
- ✅ Automatic Swagger auth documentation

---

### 3. Input Validation

**Express (Manual):**
```javascript
const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description } = req.body;
  
  // Manual validation
  if (!name || !price || !description) {
    res.status(400);
    throw new Error('Please provide all fields');
  }
  
  if (price < 0) {
    res.status(400);
    throw new Error('Price must be positive');
  }
  
  const product = await Product.create({ name, price, description });
  res.json(product);
});
```

**NestJS (Automatic):**
```typescript
// DTO
export class CreateProductDto {
  @ApiProperty()
  @IsString()
  name: string;
  
  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;
  
  @ApiProperty()
  @IsString()
  description: string;
}

// Controller
@Post()
async create(@Body() createProductDto: CreateProductDto) {
  return this.productsService.create(createProductDto);
}
```

**Benefits:**
- ✅ Automatic validation
- ✅ Clear validation rules
- ✅ Type safety
- ✅ Auto-generated Swagger schema
- ✅ Detailed error messages

---

## 📋 API Endpoint Mapping

### Authentication
| Express | NestJS | Status |
|---------|--------|--------|
| `POST /api/users/login` | `POST /api/auth/login` | ✅ Migrated |
| `POST /api/users` | `POST /api/auth/register` | ✅ Migrated |

### Users
| Express | NestJS | Status |
|---------|--------|--------|
| `GET /api/users` | `GET /api/users` | ✅ Migrated |
| `GET /api/users/profile` | `GET /api/users/profile` | ✅ Migrated |
| `PUT /api/users/profile` | `PUT /api/users/profile` | ✅ Migrated |
| `GET /api/users/:id` | `GET /api/users/:id` | ✅ Migrated |
| `PUT /api/users/:id` | `PUT /api/users/:id` | ✅ Migrated |
| `DELETE /api/users/:id` | `DELETE /api/users/:id` | ✅ Migrated |

### Products
| Express | NestJS | Status |
|---------|--------|--------|
| `GET /api/products` | `GET /api/products` | ✅ Migrated |
| `GET /api/products/top` | `GET /api/products/top` | ✅ Migrated |
| `GET /api/products/:id` | `GET /api/products/:id` | ✅ Migrated |
| `POST /api/products` | `POST /api/products` | ✅ Migrated |
| `PUT /api/products/:id` | `PUT /api/products/:id` | ✅ Migrated |
| `DELETE /api/products/:id` | `DELETE /api/products/:id` | ✅ Migrated |
| `POST /api/products/:id/reviews` | `POST /api/products/:id/reviews` | ✅ Migrated |

### Orders
| Express | NestJS | Status |
|---------|--------|--------|
| `POST /api/orders` | `POST /api/orders` | ✅ Migrated |
| `GET /api/orders/myorders` | `GET /api/orders/myorders` | ✅ Migrated |
| `GET /api/orders/:id` | `GET /api/orders/:id` | ✅ Migrated |
| `PUT /api/orders/:id/pay` | `PUT /api/orders/:id/pay` | ✅ Migrated |
| `PUT /api/orders/:id/deliver` | `PUT /api/orders/:id/deliver` | ✅ Migrated |
| `GET /api/orders` | `GET /api/orders` | ✅ Migrated |

### Groups, Carousel, Payments, Uploads
All endpoints successfully migrated ✅

---

## 🎯 Key Improvements

### 1. Type Safety
**Before:**
```javascript
// No type checking
const user = await User.findById(id);
user.name = 123; // No error!
```

**After:**
```typescript
// Full type checking
const user = await this.userModel.findById(id);
user.name = 123; // ❌ Compile error!
user.name = 'John'; // ✅ Correct
```

### 2. Automatic Validation
**Before:**
```javascript
// Manual validation
if (!email || !isEmail(email)) {
  throw new Error('Invalid email');
}
```

**After:**
```typescript
// Automatic validation
@IsEmail()
email: string;
```

### 3. API Documentation
**Before:**
- Manual documentation
- Often outdated
- No interactive testing

**After:**
- Auto-generated from code
- Always up-to-date
- Interactive Swagger UI at `/api/docs`

### 4. Dependency Injection
**Before:**
```javascript
// Manual imports
import User from '../models/userModel.js';
const user = await User.findById(id);
```

**After:**
```typescript
// Dependency injection
constructor(
  @InjectModel(User.name) 
  private userModel: Model<UserDocument>
) {}
```

### 5. Testing
**Before:**
- Manual test setup
- Hard to mock dependencies

**After:**
```typescript
// Built-in testing utilities
const module = await Test.createTestingModule({
  providers: [UsersService, { provide: getModelToken(User.name), useValue: mockUserModel }]
}).compile();
```

---

## 🚀 Running Both Backends

### Development
```bash
# Express (Old)
cd backend
npm start          # Port 5001

# NestJS (New)
cd backend-nestjs
npm run start:dev  # Port 5001 (use different port if testing both)
```

### Switching Between Backends

Update frontend proxy in `frontend/package.json`:
```json
"proxy": "http://127.0.0.1:5001"  // Both use same port by default
```

---

## 📝 Frontend Integration Changes

### Minimal Changes Required

The NestJS backend maintains API compatibility with Express:

1. **Same endpoint paths** (prefixed with `/api`)
2. **Same request/response formats**
3. **Same authentication mechanism** (JWT Bearer tokens)

### Only Change Needed:

**Authentication endpoint path:**

**Before:**
```javascript
// Login
axios.post('/api/users/login', { email, password })

// Register  
axios.post('/api/users', { name, email, password })
```

**After:**
```javascript
// Login
axios.post('/api/auth/login', { email, password })

// Register
axios.post('/api/auth/register', { name, email, password })
```

All other endpoints remain the same! ✅

---

## 🎓 Learning Resources

### NestJS Official
- [Documentation](https://docs.nestjs.com/)
- [Course](https://courses.nestjs.com/)
- [Recipes](https://docs.nestjs.com/recipes)

### Key Concepts to Understand
1. **Modules** - Feature organization
2. **Controllers** - Route handlers
3. **Services** - Business logic
4. **DTOs** - Data validation
5. **Guards** - Authorization
6. **Decorators** - Metadata
7. **Dependency Injection** - Loose coupling

---

## 🔍 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Solution: Change PORT in .env
PORT=5002
```

**2. MongoDB Connection Failed**
```bash
# Solution: Ensure MongoDB is running
mongod --dbpath /path/to/data
```

**3. JWT Secret Missing**
```bash
# Solution: Set JWT_SECRET in .env
JWT_SECRET=your_strong_secret_here
```

**4. Module Not Found**
```bash
# Solution: Rebuild
npm run build
```

---

## ✅ Migration Checklist

- [x] NestJS project initialized
- [x] All dependencies installed
- [x] Environment configuration
- [x] Auth module (Login/Register)
- [x] Users module (CRUD + Profile)
- [x] Products module (CRUD + Reviews)
- [x] Orders module (CRUD + Payment)
- [x] Groups module (CRUD)
- [x] Carousel module (CRUD)
- [x] Payments module (Combank integration)
- [x] Uploads module (File uploads)
- [x] Guards (JWT + Roles)
- [x] Decorators (GetUser + Admin)
- [x] DTOs (All validated)
- [x] Swagger documentation
- [x] TypeScript compilation successful
- [x] Build successful
- [x] Server starts successfully
- [x] README documentation
- [x] Migration guide

---

## 🎉 What You Got

### ✅ Complete Feature Parity
- All Express endpoints migrated
- Same business logic
- Same database schema
- Same authentication flow

### ✨ Plus These Upgrades
- 100% TypeScript
- Automatic validation
- Auto-generated API docs
- Better error handling
- Role-based access control
- Modular architecture
- Dependency injection
- Built-in testing support
- Better scalability

---

## 🚦 Next Steps

1. **Test the NestJS backend** with your frontend
2. **Update frontend** auth endpoints if needed
3. **Compare performance** between Express and NestJS
4. **Gradually switch** traffic to NestJS
5. **Retire Express** when confident
6. **Add more features** using NestJS patterns

---

**Status**: ✅ Migration Complete!
**Time Invested**: ~2 hours for full migration
**Value Added**: Modern, scalable, maintainable backend

Enjoy your new NestJS backend! 🎉
