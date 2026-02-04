# API Documentation

## Base URL
`http://localhost:8000`

## Authentication (`/auth`)
- **POST** `/auth/signup`
  - **Body**: `{ "email": "user@example.com", "password": "password", "full_name": "Name" }`
  - **Response**: User object.
- **POST** `/auth/login`
  - **Body**: `username` (email) & `password` (form-urlencoded).
  - **Response**: `{ "access_token": "...", "token_type": "bearer" }`.

## Products (`/products`)
- **GET** `/products/`
  - **Response**: List of products.
- **GET** `/products/{id}`
  - **Response**: Single product details.

## Cart (`/cart`) - Authenticated
- **GET** `/cart/`
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: Current active cart.
- **POST** `/cart/add`
  - **Body**: `{ "product_id": 1, "quantity": 1 }`
  - **Response**: Updated cart item.

## Orders (`/orders`) - Authenticated
- **POST** `/orders/checkout`
  - **Response**: Created order details.
