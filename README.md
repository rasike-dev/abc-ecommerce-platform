# ProShop eCommerce Platform

> Full-stack eCommerce platform built with React, Redux, NestJS, and MongoDB.

![screenshot](https://github.com/bradtraversy/proshop_mern/blob/master/uploads/Screen%20Shot%202020-09-29%20at%205.50.52%20PM.png)

## Features

- Full featured shopping cart
- Product reviews and ratings
- Top products carousel
- Product pagination
- Product search feature
- User profile with orders
- Admin product management
- Admin user management
- Admin order details page
- Mark orders as delivered option
- Checkout process (shipping, payment method, etc)
- PayPal / credit card integration
- Commercial Bank payment gateway integration
- Database seeder (products & users)

## Tech Stack

**Frontend:**
- React with Hooks
- Redux for state management
- React Router
- React Bootstrap

**Backend:**
- NestJS (TypeScript)
- MongoDB with Mongoose
- JWT Authentication
- Passport

## Quick Start

### Prerequisites

- Node.js v16+
- MongoDB

### Environment Variables

Create a `.env` file in the backend directory:

```
NODE_ENV=development
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_random_secret_minimum_32_characters
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:3000
PAYPAL_CLIENT_ID=your_paypal_client_id
COMBANK_API_USERNAME=your_combank_username
COMBANK_API_PASSWORD=your_combank_password
COMBANK_MERCHANT_ID=your_combank_merchant_id
COMBANK_TEST_URL=https://cbcmpgs.gateway.mastercard.com/api/nvp/version/56
COMBANK_PROD_URL=https://cbcmpgs.gateway.mastercard.com/api/nvp/version/56
```

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

```bash
# Run backend (from backend directory)
cd backend
npm run start:dev

# Run frontend (from frontend directory)
cd frontend
npm start
```

The frontend will run on http://localhost:3000 and the backend on http://localhost:5001

### Seed Database

```bash
# From backend directory
cd backend

# Import sample data
npm run seed

# Destroy all data
npm run seed:destroy
```

### Sample User Logins

```
Admin Account:
admin@example.com
123456

Customer Account:
john@example.com
123456
```

## API Documentation

Once the backend is running, access Swagger API documentation at:
http://localhost:5001/api/docs

## Build for Production

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build
npm run start:prod
```

## License

The MIT License

Copyright (c) 2020 Traversy Media https://traversymedia.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
