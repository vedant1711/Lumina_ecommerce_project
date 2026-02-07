# Lumina E-Commerce Platform

A modern, full-stack e-commerce application built with **Next.js 16** and **FastAPI**, featuring Stripe payment integration, real-time cart management, and a premium UI experience.

![Checkout with Stripe](/Users/vedantsomani/.gemini/antigravity/brain/8e965bec-4037-4f69-a0c2-165f5d3bcc94/checkout_page_stripe_1770340758727.png)

## ✨ Features

### Customer Features
- 🛍️ **Product Catalog** - Browse products with search and category filtering
- 🛒 **Shopping Cart** - Real-time cart with quantity controls (Redis-backed)
- 💳 **Stripe Checkout** - Secure payments with multiple payment methods (Card, Affirm, Cash App, Klarna, Amazon Pay, Crypto)
- 📦 **Order History** - View past orders and order details
- 🌙 **Dark/Light Mode** - Theme switching with system preference detection
- 🔐 **Authentication** - Secure JWT-based login and registration

### Admin Features
- 👥 **User Management** - View all users, promote/demote admin privileges
- 📊 **Dashboard** - Overview of users, products, orders, and categories
- 📝 **Order Management** - View all orders across the platform

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | FastAPI (Python), Pydantic, SQLAlchemy |
| **Database** | PostgreSQL / SQLite |
| **Cache** | Redis (cart storage) |
| **Payments** | Stripe API |
| **Auth** | JWT (python-jose) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Redis (or Docker)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ecommerce_project.git
cd ecommerce_project
```

### 2. Backend Setup
```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your values

# Run the server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

### 4. Start Redis
```bash
# Using Docker
docker run -d -p 6379:6379 redis

# Or install locally
redis-server
```

### 5. Seed Database (Optional)
```bash
cd backend
python seed_data.py
```

---

## 🔑 Environment Variables

### Backend (`.env`)
```env
SECRET_KEY=your-jwt-secret-key-change-in-production
DATABASE_URL=sqlite:///./app.db  # or postgresql://...
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

---

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Create new user account |
| POST | `/auth/login` | Login and receive JWT token |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products/` | List all products (with search/filter) |
| GET | `/products/{id}` | Get product details |
| POST | `/products/` | Create product |
| PUT | `/products/{id}` | Update product |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories/` | List all categories |
| POST | `/categories/` | Create category |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cart/` | Get user's cart |
| POST | `/cart/add` | Add item to cart |
| PUT | `/cart/update` | Update item quantity |
| DELETE | `/cart/remove/{id}` | Remove item |
| DELETE | `/cart/clear` | Clear entire cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders/` | Get user's orders |
| POST | `/orders/checkout` | Complete checkout (requires payment_intent_id) |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payment/create-intent` | Create Stripe PaymentIntent |
| GET | `/payment/verify/{id}` | Verify payment status |

### Admin (🔒 Superuser only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | List all users |
| PUT | `/admin/users/{id}/role` | Update user role |
| GET | `/admin/orders` | List all orders |
| GET | `/admin/products` | List all products |
| GET | `/admin/categories` | List all categories |

---

## 🧪 Testing

### Test Credentials
- **Admin**: `verify@test.com` / `password`

### Stripe Test Cards
| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | ✅ Successful payment |
| `4000 0000 0000 0002` | ❌ Card declined |
| `4000 0025 0000 3155` | 🔐 Requires authentication |

Use any future expiry date, any 3-digit CVC, and any ZIP code.

---

## 📁 Project Structure

```
ecommerce_project/
├── backend/
│   ├── app/
│   │   ├── core/         # Config, security, dependencies
│   │   ├── models/       # SQLAlchemy models
│   │   ├── routers/      # API endpoints
│   │   └── schemas/      # Pydantic schemas
│   ├── requirements.txt
│   └── seed_data.py
├── frontend/
│   ├── app/              # Next.js pages (App Router)
│   ├── components/       # React components
│   ├── lib/              # API client, utilities
│   └── context/          # Auth context
└── documentation/
    ├── api_documentation.md
    └── postman.json
```

---

## 🚀 Deployment

### Free Tier Deployment Stack
| Service | Provider | Free Tier |
|---------|----------|-----------|
| Frontend | Vercel | Unlimited deploys |
| Backend | Render | 750 hrs/month |
| Database | Neon PostgreSQL | 0.5GB storage |
| Redis | Upstash | 10K commands/day |

See the [Deployment Guide](./documentation/deployment.md) for detailed instructions.

---

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
