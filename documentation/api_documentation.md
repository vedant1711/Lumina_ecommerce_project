# Lumina E-Commerce - API Documentation

Complete API reference for the Lumina E-Commerce platform.

**Base URL**: `http://localhost:8000`

---

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### 🔐 Auth

#### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe"
}
```

**Response (201):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "is_active": true,
  "is_superuser": false
}
```

---

#### POST /auth/login
Authenticate and receive access token.

**Request Body (form-urlencoded):**
```
username=user@example.com
password=securepassword
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

### 🛍️ Products

#### GET /products/
List all products with optional filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `skip` | int | Pagination offset (default: 0) |
| `limit` | int | Max results (default: 100) |
| `search` | string | Search by name/description (min 3 chars) |
| `category_id` | int | Filter by category |

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Wireless Headphones",
    "description": "Premium sound quality",
    "price": 99.99,
    "stock": 50,
    "image_url": "https://...",
    "category_id": 1
  }
]
```

---

#### GET /products/{product_id}
Get single product details.

**Response (200):**
```json
{
  "id": 1,
  "name": "Wireless Headphones",
  "description": "Premium sound quality with noise cancellation",
  "price": 99.99,
  "stock": 50,
  "image_url": "https://...",
  "category_id": 1
}
```

---

### 📁 Categories

#### GET /categories/
List all product categories.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Electronics",
    "description": "All things Electronics"
  }
]
```

---

### 🛒 Cart (🔒 Protected)

#### GET /cart/
Get current user's cart.

**Response (200):**
```json
{
  "items": [
    {
      "product_id": 1,
      "name": "Wireless Headphones",
      "price": 99.99,
      "image_url": "https://...",
      "quantity": 2
    }
  ],
  "total_amount": 199.98
}
```

---

#### POST /cart/add
Add item to cart.

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 1
}
```

**Response (200):**
```json
{
  "message": "Item added to cart"
}
```

---

#### PUT /cart/update
Update item quantity (set to 0 to remove).

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 3
}
```

**Response (200):**
```json
{
  "message": "Cart updated"
}
```

---

#### DELETE /cart/remove/{product_id}
Remove specific item from cart.

**Response (200):**
```json
{
  "message": "Item removed from cart"
}
```

---

#### DELETE /cart/clear
Clear entire cart.

**Response (200):**
```json
{
  "message": "Cart cleared"
}
```

---

### 💳 Payments (🔒 Protected)

#### POST /payment/create-intent
Create a Stripe PaymentIntent for checkout.

**Request Body:**
```json
{
  "amount": 199.98
}
```

**Response (200):**
```json
{
  "client_secret": "pi_xxx_secret_xxx",
  "payment_intent_id": "pi_xxx"
}
```

---

#### GET /payment/verify/{payment_intent_id}
Verify payment status.

**Response (200):**
```json
{
  "status": "succeeded",
  "amount": 199.98,
  "payment_method": "pm_xxx",
  "succeeded": true
}
```

---

### 📦 Orders (🔒 Protected)

#### POST /orders/checkout
Complete checkout after successful payment.

**Request Body:**
```json
{
  "payment_intent_id": "pi_xxx"
}
```

**Response (200):**
```json
{
  "id": 1,
  "user_id": 1,
  "total_amount": 199.98,
  "status": "paid",
  "created_at": "2024-01-15T10:30:00Z",
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "quantity": 2,
      "price_at_purchase": 99.99
    }
  ]
}
```

---

#### GET /orders/
Get current user's order history.

**Response (200):**
```json
[
  {
    "id": 1,
    "total_amount": 199.98,
    "status": "paid",
    "created_at": "2024-01-15T10:30:00Z",
    "items": [...]
  }
]
```

---

### 👑 Admin (🔒 Superuser Only)

#### GET /admin/users
List all users.

**Response (200):**
```json
[
  {
    "id": 1,
    "email": "admin@example.com",
    "full_name": "Admin User",
    "is_active": true,
    "is_superuser": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### PUT /admin/users/{user_id}/role
Update user's admin status.

**Request Body:**
```json
{
  "is_superuser": true
}
```

**Response (200):**
```json
{
  "message": "User role updated",
  "user": {
    "id": 2,
    "is_superuser": true
  }
}
```

---

#### GET /admin/orders
List all orders across the platform.

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "total_amount": 199.98,
    "status": "paid",
    "created_at": "2024-01-15T10:30:00Z",
    "user_email": "user@example.com",
    "items_count": 2
  }
]
```

---

#### GET /admin/products
List all products with category info.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Wireless Headphones",
    "price": 99.99,
    "stock": 50,
    "category_name": "Electronics",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### GET /admin/categories
List all categories.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Electronics",
    "description": "All things Electronics"
  }
]
```

---

## Error Responses

All errors follow this format:
```json
{
  "detail": "Error message here"
}
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error |
