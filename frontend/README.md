# E-Commerce Frontend

React frontend for the e-commerce platform built with Create React App.

## Tech Stack

- React with Hooks
- Redux for state management
- React Router
- React Bootstrap
- Axios for API calls

## Installation

```bash
npm install
```

## Environment Setup

The frontend uses a proxy to connect to the backend API. The proxy is configured in `src/setupProxy.js` to forward API requests to `http://localhost:5001`.

## Available Scripts

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

The page will reload when you make changes.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

The build is minified and optimized for best performance.

## Features

- Product browsing with pagination and search
- Shopping cart functionality
- User authentication and profile management
- Order history and tracking
- Product reviews and ratings
- Admin dashboard for managing products, users, and orders
- Responsive design with React Bootstrap

## Project Structure

```
src/
├── actions/        # Redux actions
├── reducers/       # Redux reducers
├── constants/      # Redux constants
├── components/     # Reusable components
├── screens/        # Page components
├── store.js        # Redux store configuration
└── App.js          # Main app component
```

## Learn More

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://reactjs.org/)
- [Redux documentation](https://redux.js.org/)

## License

MIT License

Copyright (c) 2024 ABC Online School
