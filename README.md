# ABC Online School - eCommerce Platform

> Full-stack eCommerce platform built with React, Redux, NestJS, and MongoDB.

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
- PayPal / Stripe integration
- Database seeder (products & users)
- Robust authentication and authorization using JWT
- Secure payment processing with multiple providers
- Admin dashboards for managing products, users, and orders
- Responsive design for various devices

## Architecture and Structure

The platform follows a monolithic repository (monorepo) structure, housing both the frontend and backend applications.

### Backend (NestJS, MongoDB)

The backend is built with NestJS, a progressive Node.js framework for building efficient, reliable, and scalable server-side applications. It leverages TypeScript for strong typing and better maintainability.

- **Modular Structure:** Organized into distinct modules (e.g., `Auth`, `Users`, `Products`, `Orders`, `Payments`), promoting separation of concerns and reusability.
- **RESTful API:** Provides a comprehensive set of RESTful endpoints for interacting with the frontend and other services.
- **Authentication & Authorization:** Implemented using JWT (JSON Web Tokens) and Passport.js strategies, ensuring secure access to protected resources.
- **Database:** MongoDB is used as the primary data store, with Mongoose as the ODM (Object Data Modeling) library for elegant schema definitions and interactions.
- **Payment Integration:** A flexible payment factory pattern allows for easy integration of multiple payment gateways (e.g., PayPal, Stripe).
- **Dependency Injection:** Utilizes NestJS's robust dependency injection system for managing services and controllers.

### Frontend (React, Redux)

The frontend is a single-page application (SPA) developed with React.js, providing a dynamic and interactive user experience. Redux is used for predictable state management across the application.

- **Component-Based:** Structured into reusable React components for UI elements, screens, and layouts.
- **State Management:** Redux manages the application's global state, with reducers, actions, and constants organized for clarity.
- **Routing:** React Router handles client-side routing, enabling seamless navigation between different sections of the application.
- **Styling:** React Bootstrap is used for responsive and consistent UI components.
- **API Communication:** Axios is used for making HTTP requests to the backend API.

## Tech Stack

**Frontend:**
- React with Hooks
- Redux for state management
- React Router
- React Bootstrap
- Axios

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
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
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

## Payment Testing Details

This section provides details for testing the integrated payment gateways. You will need to manually add test card data for Stripe and ensure your PayPal developer account is set up for sandbox testing.

### PayPal Testing

For PayPal, ensure your `PAYPAL_CLIENT_ID` in the `.env` file is configured for a sandbox account. During checkout, select PayPal as the payment method. You will be redirected to the PayPal sandbox environment where you can log in with a sandbox buyer account to complete the payment.

### Stripe Testing

For Stripe, use the provided test card numbers during the checkout process when Stripe is selected as the payment method.

TestCardDetails for Sandbox Testing
 - Card: 4242424242424242
 - Expiry: 12/25
 - CVC: 123
 - Name: Test Use

Make sure `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` are correctly configured in your `.env` file.

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

MIT License

Copyright (c) 2024 ABC Online School

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
