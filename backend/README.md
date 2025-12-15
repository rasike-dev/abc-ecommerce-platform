# E-Commerce Backend API

NestJS TypeScript backend for the e-commerce platform.

## Tech Stack

- NestJS v11
- TypeScript v5
- MongoDB with Mongoose
- JWT Authentication with Passport
- Swagger/OpenAPI Documentation
- Class Validator for request validation

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the backend directory:

```bash
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_strong_jwt_secret_here
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:3000
COMBANK_API_USERNAME=
COMBANK_API_PASSWORD=
COMBANK_MERCHANT_ID=
COMBANK_TEST_URL=https://cbcmpgs.gateway.mastercard.com/api/nvp/version/56
COMBANK_PROD_URL=https://cbcmpgs.gateway.mastercard.com/api/nvp/version/56
```

Copy `.env.example` to `.env` and update with your values.

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Watch mode
npm run start:dev
```

The API will be available at http://localhost:5001

## API Documentation

Interactive Swagger documentation available at:
http://localhost:5001/api/docs

## Database Seeding

```bash
# Import sample data
npm run seed

# Destroy all data
npm run seed:destroy

# Verify data
npm run seed:verify
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Project Structure

```
src/
├── auth/           # Authentication (login, register, JWT)
├── users/          # User management
├── products/       # Products and reviews
├── orders/         # Order management
├── groups/         # Product groups
├── carousel/       # Homepage carousel
├── payments/       # Payment gateway integration
├── uploads/        # File uploads
├── common/         # Shared decorators, guards, pipes
├── seed/           # Database seeding
├── main.ts         # Application entry
└── app.module.ts   # Root module
```

## Main API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `POST /api/products/:id/reviews` - Add review

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/myorders` - Get user orders
- `GET /api/orders/:id` - Get order
- `PUT /api/orders/:id/pay` - Mark as paid
- `PUT /api/orders/:id/deliver` - Mark as delivered (Admin)

### Users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users` - Get all users (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

## Authentication

Protected routes require JWT token in header:

```
Authorization: Bearer <token>
```

## License

MIT License

Copyright (c) 2024 ABC Online School
