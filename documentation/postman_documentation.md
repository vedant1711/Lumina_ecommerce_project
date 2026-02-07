# Postman Collection Guide

## Importing the Collection

1. Open Postman
2. Click **Import** (top left)
3. Drag and drop `postman.json` or click **Upload Files**
4. The "Lumina E-Commerce API" collection will appear

## Setup

### Set Base URL
1. Click on the collection name "Lumina E-Commerce API"
2. Go to **Variables** tab
3. Set `baseUrl` to your API URL:
   - Local: `http://localhost:8000`
   - Production: `https://your-api.onrender.com`

### Authentication
1. Run the **Login** request first (in Authentication folder)
2. The token is automatically saved to the `token` collection variable
3. All subsequent requests will use this token

## Collection Structure

```
Lumina E-Commerce API
├── Authentication
│   ├── Sign Up
│   └── Login (auto-saves token)
├── Products
│   ├── List Products
│   ├── Search Products
│   ├── Filter by Category
│   ├── Get Product by ID
│   ├── Create Product
│   └── Update Product
├── Categories
│   ├── List Categories
│   └── Create Category
├── Cart
│   ├── Get Cart
│   ├── Add to Cart
│   ├── Update Cart Item
│   ├── Remove Cart Item
│   └── Clear Cart
├── Payments
│   ├── Create Payment Intent
│   └── Verify Payment
├── Orders
│   ├── Checkout
│   └── Get Orders
└── Admin
    ├── List Users
    ├── Update User Role
    ├── List All Orders
    ├── List All Products (Admin)
    └── List All Categories (Admin)
```

## Quick Test Flow

1. **Login** → Get auth token
2. **List Products** → See available products
3. **Add to Cart** → Add product ID 1
4. **Get Cart** → View cart contents
5. **Create Payment Intent** → Get Stripe client secret
6. (Complete payment via frontend)
7. **Checkout** → Complete order with payment_intent_id

## Default Test Credentials

- **Email**: `verify@test.com`
- **Password**: `password`
- **Role**: Admin (superuser)
