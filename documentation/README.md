# Project Documentation

This folder contains comprehensive documentation for the Lumina E-Commerce Platform.

## 📑 Documentation Files

| File | Description |
|------|-------------|
| [API Documentation](./api_documentation.md) | Complete API reference with endpoints |
| [Frontend Documentation](./frontend_documentation.md) | Frontend architecture and components |
| [Deployment Guide](./deployment.md) | How to deploy to production |
| [Postman Collection](./postman.json) | Import into Postman for API testing |
| [Postman Documentation](./postman_documentation.md) | Guide for using the Postman collection |

## 📸 Screenshots

All UI screenshots are in the [screenshots](./screenshots/) folder:

| Screenshot | Description |
|------------|-------------|
| [Homepage](./screenshots/homepage.png) | Landing page with hero and featured products |
| [Products Page](./screenshots/products_page.png) | Product catalog with filters |
| [Product Details](./screenshots/product_details.png) | Individual product page with specs |
| [Product Reviews](./screenshots/product_reviews.png) | Customer reviews and ratings |
| [Cart Page](./screenshots/cart_page.png) | Shopping cart with item management |
| [Admin Dashboard](./screenshots/admin_dashboard.png) | Admin control panel |

---

## 🧭 Navigation Guide

### Customer Routes
| Route | Description |
|-------|-------------|
| `/` | Landing page with hero section |
| `/products` | Product catalog with search/filter |
| `/products/[id]` | Product details, specs, reviews |
| `/cart` | Shopping cart |
| `/checkout` | Stripe checkout page |
| `/orders` | Order history |
| `/wishlist` | Saved products |

### Auth Routes
| Route | Description |
|-------|-------------|
| `/auth/login` | User login |
| `/auth/signup` | New user registration |

### Merchant Routes (Merchant/Admin only)
| Route | Description |
|-------|-------------|
| `/merchant/dashboard` | Merchant overview |
| `/merchant/products` | Manage products |
| `/merchant/orders` | View orders |

### Admin Routes (Admin only)
| Route | Description |
|-------|-------------|
| `/admin/dashboard` | Full admin panel with 7 tabs |

---

## 🔐 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@lumina.com` | `admin123` |
| Merchant | `merchant@lumina.com` | `merchant123` |
| Customer | `customer@example.com` | `customer123` |

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │────│    Backend      │────│   Database      │
│   (Next.js)     │    │   (FastAPI)     │    │  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 8000    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                      │                      
         │                      │                      
         ▼                      ▼                      
┌─────────────────┐    ┌─────────────────┐           
│   Stripe API    │    │    Redis        │           
│   (Payments)    │    │   (Cart Cache)  │           
└─────────────────┘    └─────────────────┘           
```

---

## 🎨 Key Features

### Customer Experience
- ✅ Dark/Light theme toggle
- ✅ Responsive design (mobile-first)
- ✅ Real-time cart updates
- ✅ Product search and filtering
- ✅ Wishlist functionality
- ✅ Order tracking

### Admin Capabilities
- ✅ User role management
- ✅ Order status updates
- ✅ Review moderation
- ✅ Product featuring
- ✅ Analytics dashboard

### Merchant Tools
- ✅ Product CRUD
- ✅ Sales tracking
- ✅ Order management
