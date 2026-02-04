from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.models.product import Product, Category
from app.models.order import Order, OrderItem
from app.core.security import get_password_hash
import random
from datetime import datetime, timedelta
import sys
import os

# Add parent directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

DATABASE_URL = "sqlite:///./sql_app.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_data():
    db = SessionLocal()
    try:
        print("Seeding data...")
        
        # 1. Categories
        categories = [
            "Electronics", "Clothing", "Home & Garden", "Books", "Sports"
        ]
        db_categories = []
        for cat_name in categories:
            cat = db.query(Category).filter(Category.name == cat_name).first()
            if not cat:
                cat = Category(name=cat_name, description=f"All things {cat_name}")
                db.add(cat)
                db.flush()
            db_categories.append(cat)
        
        # 2. Users
        # Admin
        admin_email = "verify@test.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                full_name="Admin User",
                hashed_password=get_password_hash("password"),
                is_active=True,
                is_superuser=True
            )
            db.add(admin)
        else:
            admin.is_superuser = True # Ensure admin
        
        # Regular Users
        users = []
        for i in range(10):
            email = f"user{i}@example.com"
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    email=email,
                    full_name=f"User {i}",
                    hashed_password=get_password_hash("password"),
                    is_active=True,
                    is_superuser=False
                )
                db.add(user)
                db.flush()
            users.append(user)
        
        # 3. Products
        products = []
        for i in range(20):
            cat = random.choice(db_categories)
            prod = Product(
                name=f"{cat.name} Product {i}",
                description=f"This is a description for product {i} in {cat.name}. It is a very good product.",
                price=random.uniform(10.0, 500.0),
                stock=random.randint(0, 100),
                category_id=cat.id,
                image_url=f"https://placehold.co/400x300?text=Product+{i}"
            )
            db.add(prod)
            db.flush()
            products.append(prod)

        # 4. Orders
        for i in range(15):
            user = random.choice(users)
            order = Order(
                user_id=user.id,
                total_amount=0, # Will calc
                status=random.choice(["pending", "paid", "shipped", "cancelled"]),
                created_at=datetime.now() - timedelta(days=random.randint(0, 30))
            )
            db.add(order)
            db.flush()
            
            total = 0
            num_items = random.randint(1, 5)
            for _ in range(num_items):
                prod = random.choice(products)
                qty = random.randint(1, 3)
                item = OrderItem(
                    order_id=order.id,
                    product_id=prod.id,
                    quantity=qty,
                    price_at_purchase=prod.price
                )
                db.add(item)
                total += prod.price * qty
            
            order.total_amount = total
            
        db.commit()
        print("Seeding complete!")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
