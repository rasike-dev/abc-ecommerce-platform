# E-Commerce Platform - NestJS Backend

Modern TypeScript backend built with NestJS framework, featuring complete CRUD operations, JWT authentication, file uploads, and payment gateway integration.

## 🚀 Features

- **TypeScript** - Full type safety and IntelliSense support
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Admin and user roles with guards
- **Automatic Validation** - DTOs with class-validator
- **Swagger Documentation** - Auto-generated API documentation
- **MongoDB Integration** - Mongoose ODM
- **File Upload** - Multer for image uploads
- **Payment Gateway** - Commercial Bank integration
- **Modular Architecture** - Feature-based modules

## 📦 Tech Stack

- **NestJS** v11.x
- **TypeScript** v5.x
- **MongoDB** with Mongoose v9.x
- **Passport JWT** for authentication
- **Swagger/OpenAPI** for documentation
- **Class Validator** for request validation

## 🏗️ Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── dto/                # Login/Register DTOs
│   ├── strategies/         # JWT strategy
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
│
├── users/                   # Users module
│   ├── dto/                # User DTOs
│   ├── schemas/            # Mongoose schemas
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
│
├── products/                # Products module
│   ├── dto/                # Product DTOs
│   ├── schemas/            # Product & Review schemas
│   ├── products.controller.ts
│   ├── products.service.ts
│   └── products.module.ts
│
├── orders/                  # Orders module
│   ├── dto/                # Order DTOs
│   ├── schemas/            # Order schema
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   └── orders.module.ts
│
├── groups/                  # Groups module
├── carousel/                # Carousel module
│
├── payments/                # Payment gateway module
│   ├── providers/          # Payment providers
│   ├── payments.controller.ts
│   ├── payments.service.ts
│   └── payments.module.ts
│
├── uploads/                 # File upload module
│
├── common/                  # Shared utilities
│   ├── decorators/         # Custom decorators
│   ├── guards/            # Auth guards
│   ├── filters/           # Exception filters
│   └── pipes/             # Validation pipes
│
├── main.ts                  # Application entry point
└── app.module.ts           # Root module
```

## 🔧 Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your configuration
```

## 🔐 Environment Variables

```bash
# Environment
NODE_ENV=development

# Server
PORT=5001

# Database
MONGO_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=your_strong_jwt_secret_here
JWT_EXPIRES_IN=30d

# Client URL (Frontend)
CLIENT_URL=http://localhost:3000

# Commercial Bank Payment Gateway
COMBANK_API_USERNAME=
COMBANK_API_PASSWORD=
COMBANK_MERCHANT_ID=
COMBANK_TEST_URL=https://cbcmpgs.gateway.mastercard.com/api/nvp/version/56
COMBANK_PROD_URL=https://cbcmpgs.gateway.mastercard.com/api/nvp/version/56
```

## 🚀 Running the Application

### Development
```bash
npm run start:dev
```

### Production Build
```bash
npm run build
npm run start:prod
```

### Watch Mode
```bash
npm run start:dev
```

## 📚 API Documentation

Once the server is running, access the Swagger documentation at:

```
http://localhost:5001/api/docs
```

Features:
- Interactive API testing
- Request/Response schemas
- Authentication support
- Auto-generated from decorators

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Products
- `GET /api/products` - Get all products (with pagination)
- `GET /api/products/top` - Get top rated products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `POST /api/products/:id/reviews` - Add product review

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/myorders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/pay` - Update order to paid
- `PUT /api/orders/:id/deliver` - Update order to delivered (Admin)
- `GET /api/orders` - Get all orders (Admin)

### Groups
- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get group by ID
- `POST /api/groups` - Create group (Admin)
- `PUT /api/groups/:id` - Update group (Admin)
- `DELETE /api/groups/:id` - Delete group (Admin)

### Carousel
- `GET /api/carousel` - Get all carousel items
- `GET /api/carousel/:id` - Get carousel item
- `POST /api/carousel` - Create carousel item (Admin)
- `PUT /api/carousel/:id` - Update carousel item (Admin)
- `DELETE /api/carousel/:id` - Delete carousel item (Admin)

### Payments
- `POST /api/payments/combank/:id` - Create Commercial Bank payment session

### Uploads
- `POST /api/uploads` - Upload image (Admin)

## 🔒 Authentication

All protected routes require JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Role-Based Access

- **Public** - No authentication required
- **User** - Requires valid JWT token
- **Admin** - Requires JWT token with admin privileges

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Validation

All request DTOs are automatically validated using class-validator:

```typescript
// Example: CreateProductDto
{
  "name": "Product Name",        // Required, string
  "price": 99.99,               // Required, number, min: 0
  "description": "Description",  // Required, string
  "category": "Category",        // Required, string
  "grade": 10                   // Optional, number, min: 1
}
```

Invalid requests automatically return 400 Bad Request with detailed error messages.

## 🏛️ Architecture Benefits

### vs Express Backend

| Feature | Express | NestJS |
|---------|---------|--------|
| Type Safety | ❌ JavaScript | ✅ TypeScript |
| Validation | Manual | ✅ Automatic |
| Documentation | Manual | ✅ Auto-generated |
| Testing | Manual setup | ✅ Built-in |
| Architecture | Loose | ✅ Enforced modules |
| Dependency Injection | ❌ No | ✅ Yes |
| Scalability | Manual | ✅ Built-in patterns |

## 🔄 Migration from Express

This NestJS backend maintains feature parity with the Express backend:

- All endpoints migrated
- Same database schema (MongoDB)
- Same authentication flow
- Same business logic
- Enhanced with validation and documentation

## 🚦 Development Workflow

1. **Create Module**
   ```bash
   nest g module feature
   ```

2. **Create Controller**
   ```bash
   nest g controller feature
   ```

3. **Create Service**
   ```bash
   nest g service feature
   ```

4. **Define DTOs** - Create validation DTOs
5. **Add Swagger Decorators** - Document endpoints
6. **Write Tests** - Unit and E2E tests

## 📊 Performance

- **Startup Time**: ~2 seconds
- **Build Time**: ~5 seconds
- **Hot Reload**: < 1 second
- **Type Checking**: Real-time

## 🐛 Debugging

```bash
# Debug mode
npm run start:debug
```

Then attach debugger in VS Code (port 9229)

## 📈 Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set environment variables**
   - Update all production values in .env
   - Use strong JWT_SECRET
   - Configure production MONGO_URI

3. **Run in production**
   ```bash
   npm run start:prod
   ```

4. **Using PM2**
   ```bash
   pm2 start dist/main.js --name ecommerce-api
   ```

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Request validation
- Type safety
- CORS enabled

## 📜 License

MIT

## 👥 Contributors

Built with NestJS, TypeScript, and MongoDB

---

**Server**: http://localhost:5001
**API Docs**: http://localhost:5001/api/docs
