# Lumina E-Commerce - API Documentation

Complete API reference for the Lumina E-Commerce platform.

**Base URL**: `http://localhost:8000`  
**API Docs**: `http://localhost:8000/docs` (Swagger UI)

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
  "role": "customer",
  "is_active": true
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

#### GET /auth/me (🔒 Protected)
Get current authenticated user's information.

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "customer",
  "store_name": null
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
| `search` | string | Search by name/description |
| `category_id` | int | Filter by category |
| `brand` | string | Filter by brand |
| `min_price` | float | Minimum price |
| `max_price` | float | Maximum price |
| `sort_by` | string | Sort: price_asc, price_desc, newest, rating |

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "MacBook Air M3",
    "description": "Supercharged by M3 chip",
    "price": 1099.00,
    "compare_at_price": 1299.00,
    "stock": 84,
    "image_url": "https://...",
    "brand": "Apple",
    "sku": "MBA-M3",
    "category_id": 1,
    "is_featured": true,
    "average_rating": 4.5,
    "review_count": 12,
    "specifications": {"Chip": "Apple M3", "RAM": "8GB"}
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
  "name": "MacBook Air M3",
  "description": "Supercharged by M3 chip",
  "price": 1099.00,
  "stock": 84,
  "brand": "Apple",
  "sku": "MBA-M3",
  "specifications": {"Chip": "Apple M3", "RAM": "8GB", "Storage": "256GB SSD"},
  "average_rating": 4.5,
  "review_count": 12
}
```

---

#### GET /products/featured
Get featured products.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "MacBook Air M3",
    "is_featured": true
  }
]
```

---

#### GET /products/brands
Get all unique product brands.

**Response (200):**
```json
["Apple", "Samsung", "Sony", "Sony WH"]
```

---

### 📁 Categories

#### GET /categories/
List all product categories.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | int | Max results (optional) |

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Electronics",
    "description": "All electronic devices",
    "image_url": "https://..."
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
      "name": "MacBook Air M3",
      "price": 1099.00,
      "image_url": "https://...",
      "quantity": 2
    }
  ],
  "total_amount": 2198.00
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

---

#### DELETE /cart/remove/{product_id}
Remove specific item from cart.

---

#### DELETE /cart/clear
Clear entire cart.

---

### ❤️ Wishlist (🔒 Protected)

#### GET /wishlist/
Get user's wishlist.

**Response (200):**
```json
[
  {
    "id": 1,
    "product_id": 2,
    "added_at": "2024-01-15T10:30:00Z",
    "product": {
      "id": 2,
      "name": "MacBook Air M3",
      "price": 1099.00
    }
  }
]
```

---

#### POST /wishlist/{product_id}
Add product to wishlist.

---

#### DELETE /wishlist/{product_id}
Remove product from wishlist.

---

#### GET /wishlist/check/{product_id}
Check if product is in wishlist.

**Response (200):**
```json
{
  "in_wishlist": true
}
```

---

### ⭐ Reviews

#### GET /reviews/product/{product_id}
Get all reviews for a product.

**Response (200):**
```json
[
  {
    "id": 1,
    "product_id": 2,
    "user_id": 3,
    "rating": 5,
    "title": "Amazing laptop!",
    "comment": "Best purchase I've made...",
    "created_at": "2024-01-15T10:30:00Z",
    "user_name": "John D."
  }
]
```

---

#### GET /reviews/product/{product_id}/stats
Get rating statistics for a product.

**Response (200):**
```json
{
  "average_rating": 4.5,
  "total_reviews": 12,
  "rating_breakdown": {
    "5": 7,
    "4": 3,
    "3": 1,
    "2": 0,
    "1": 1
  }
}
```

---

#### POST /reviews/ (🔒 Protected)
Submit a product review.

**Request Body:**
```json
{
  "product_id": 2,
  "rating": 5,
  "title": "Great product!",
  "comment": "Highly recommend this..."
}
```

---

#### POST /reviews/{review_id}/helpful (🔒 Protected)
Mark a review as helpful.

---

### 💳 Payments (🔒 Protected)

#### POST /payment/create-intent
Create a Stripe PaymentIntent for checkout.

**Request Body:**
```json
{
  "amount": 2198.00
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
  "amount": 2198.00,
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
  "payment_intent_id": "pi_xxx",
  "shipping_address": "123 Main St, City, ST 12345"
}
```

---

#### GET /orders/
Get current user's order history.

---

### 🏪 Merchant (🔒 Merchant/Admin Only)

#### GET /merchant/dashboard
Get merchant dashboard statistics.

**Response (200):**
```json
{
  "total_products": 5,
  "total_orders": 12,
  "total_revenue": 15420.00,
  "recent_orders": [...]
}
```

---

#### GET /merchant/products
List merchant's products.

---

#### POST /merchant/products
Create a new product.

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "stock": 100,
  "category_id": 1,
  "brand": "Brand Name",
  "sku": "SKU-001"
}
```

---

#### PUT /merchant/products/{product_id}
Update an existing product.

---

#### GET /merchant/orders
Get orders containing merchant's products.

---

### 👑 Admin (🔒 Admin Only)

#### GET /admin/dashboard
Get platform-wide statistics.

**Response (200):**
```json
{
  "total_users": 150,
  "total_products": 500,
  "total_orders": 1200,
  "total_revenue": 125000.00,
  "total_reviews": 800,
  "user_breakdown": {
    "customers": 140,
    "merchants": 8,
    "admins": 2
  }
}
```

---

#### GET /admin/users
List all users.

---

#### PUT /admin/users/{user_id}/role
Update user role.

**Request Body:**
```json
{
  "role": "merchant"
}
```

---

#### DELETE /admin/users/{user_id}
Delete a user.

---

#### GET /admin/orders
List all orders.

---

#### PUT /admin/orders/{order_id}/status?new_status=shipped
Update order status.

---

#### GET /admin/products
List all products.

---

#### PUT /admin/products/{product_id}/featured
Toggle product featured status.

---

#### GET /admin/categories
List all categories.

---

#### POST /admin/categories
Create a new category.

---

#### GET /admin/reviews
List all reviews for moderation.

**Response (200):**
```json
[
  {
    "id": 1,
    "product_id": 2,
    "product_name": "MacBook Air M3",
    "user_id": 3,
    "user_email": "customer@example.com",
    "rating": 5,
    "title": "Great!",
    "comment": "...",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

#### DELETE /admin/reviews/{review_id}
Delete a review (moderation).

---

#### GET /admin/wishlist-stats
Get wishlist statistics.

**Response (200):**
```json
{
  "total_wishlist_items": 45,
  "top_wishlisted_products": [
    {"product_id": 2, "name": "MacBook Air M3", "count": 15}
  ],
  "users_with_most_items": [
    {"user_id": 5, "email": "user@example.com", "item_count": 8}
  ]
}
```

---

#### GET /admin/wishlist-items
Get all wishlist items.

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 3,
    "user_email": "customer@example.com",
    "product_id": 2,
    "product_name": "MacBook Air M3",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

## Error Responses

### 🤖 Analytics / AI

#### GET /analytics/recommendations/product/{product_id}
Get AI-powered similar product recommendations using TF-IDF + Cosine Similarity.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | int | Max results (default: 8) |

**Response (200):**
```json
{
  "product_id": 1,
  "product_name": "iPhone 15 Pro",
  "recommendations": [
    {
      "id": 3,
      "name": "AirPods Pro 2",
      "price": 249.00,
      "brand": "Apple",
      "category": "Electronics",
      "similarity_score": 0.207,
      "image_url": "https://...",
      "average_rating": 4.5,
      "discount_percent": 11
    }
  ]
}
```

---

#### GET /analytics/recommendations/user (🔒 Protected)
Personalized recommendations based on purchase history, wishlist, and review ratings.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | int | Max results (default: 12) |

**Response (200):**
```json
{
  "strategy": "personalized",
  "reason": "Based on your interest in Electronics and brands like Apple",
  "products": [
    {
      "id": 3,
      "name": "AirPods Pro 2",
      "price": 249.00,
      "relevance_score": 15.0
    }
  ]
}
```

---

#### GET /analytics/recommendations/trending
Trending/featured products. **Public endpoint, no auth required.**

**Response (200):**
```json
{
  "strategy": "trending",
  "reason": "Popular and featured products",
  "products": [...]
}
```

---

#### GET /analytics/sentiment/product/{product_id}
Aggregate sentiment analysis for all reviews of a product.

**Response (200):**
```json
{
  "product_id": 1,
  "total_reviews": 2,
  "average_sentiment": -0.165,
  "sentiment_distribution": {
    "positive": 1,
    "neutral": 0,
    "negative": 1
  },
  "reviews": [
    {
      "review_id": 1,
      "rating": 5,
      "sentiment": {
        "polarity": 0.67,
        "subjectivity": 0.628,
        "label": "positive"
      }
    }
  ]
}
```

---

#### GET /analytics/sentiment/{review_id}
Get sentiment for a single review.

**Response (200):**
```json
{
  "review_id": 1,
  "text": "Absolutely amazing! Best phone ever.",
  "sentiment": {
    "polarity": 0.67,
    "subjectivity": 0.628,
    "label": "positive"
  },
  "stored_score": 0.67
}
```

> **Note:** Sentiment is automatically computed when reviews are created (`POST /reviews/`) or updated (`PUT /reviews/{id}`). Review responses now include `sentiment_score` and `sentiment_label` fields.

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
| 422 | Validation Error - Invalid request body |
| 500 | Server Error |

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding rate limiting middleware.

---

## WebSocket (Future)

Real-time notifications planned for:
- Order status updates
- New review notifications
- Stock alerts
