from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator
from app.database import engine, Base
from app.routers import auth, product, cart, order, admin, payment

# Create tables (simple init, use alembic for migrations in prod)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="E-Commerce API", version="1.0.0")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Prometheus instrumentation
Instrumentator().instrument(app).expose(app)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(product.router)
app.include_router(cart.router)
app.include_router(order.router)
app.include_router(admin.router)
app.include_router(payment.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the E-Commerce API", "status": "operational"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# One-time setup endpoint (no auth required)
from app.database import get_db
from app.models.user import User
from app.models.product import Product, Category
from app.models.order import Order, OrderItem
from app.core.security import get_password_hash
from sqlalchemy.orm import Session
from fastapi import Depends
import random
from datetime import datetime, timedelta

@app.post("/setup")
def initial_setup(db: Session = Depends(get_db)):
    """
    One-time setup to create admin user and seed data.
    Only works if no admin user exists yet.
    """
    # Check if already set up
    existing_admin = db.query(User).filter(User.is_superuser == True).first()
    if existing_admin:
        return {"message": "Setup already completed", "admin_email": existing_admin.email}
    
    # Create admin user
    admin = User(
        email="admin@lumina.com",
        full_name="Admin User",
        hashed_password=get_password_hash("admin123"),
        is_active=True,
        is_superuser=True
    )
    db.add(admin)
    db.flush()
    
    # Create categories
    categories_data = ["Electronics", "Clothing", "Home & Garden", "Books", "Sports"]
    db_categories = []
    for cat_name in categories_data:
        cat = Category(name=cat_name, description=f"All things {cat_name}")
        db.add(cat)
        db.flush()
        db_categories.append(cat)
    
    # Create products
    products = []
    for i in range(30):
        cat = random.choice(db_categories)
        prod = Product(
            name=f"Product {i}",
            description=f"High quality {cat.name} item. Perfect for your needs.",
            price=round(random.uniform(19.99, 299.99), 2),
            stock=random.randint(10, 100),
            category_id=cat.id,
            image_url=f"https://picsum.photos/seed/{i+100}/400/300",
            specifications={"Brand": "Lumina", "Quality": "Premium"}
        )
        db.add(prod)
        db.flush()
        products.append(prod)
    
    db.commit()
    
    return {
        "message": "Setup completed successfully!",
        "admin": {
            "email": "admin@lumina.com",
            "password": "admin123"
        },
        "stats": {
            "categories": len(db_categories),
            "products": len(products)
        }
    }
