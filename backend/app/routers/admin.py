from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
from app.database import get_db
from app.models.user import User
from app.models.order import Order
from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    responses={404: {"description": "Not found"}},
)

def get_current_superuser(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="The user doesn't have enough privileges"
        )
    return current_user

@router.get("/users", response_model=List[Any])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    users = db.query(User).offset(skip).limit(limit).all()
    # Mask password before returning (though Pydantic response_model should handle it if defined right, 
    # but specific admin response model is better. For now returning partial dicts or relying on default serialization effectively).
    return [{"id": u.id, "email": u.email, "full_name": u.full_name, "is_active": u.is_active, "is_superuser": u.is_superuser, "created_at": u.created_at} for u in users]

from app.schemas.user import UserRoleUpdate

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Optional: Prevent admin from demoting themselves to avoid lockout, 
    # but strictly speaking a superuser *could* remove their own rights.
    if user.id == current_user.id and not role_update.is_superuser:
         # raise HTTPException(status_code=400, detail="Cannot demote yourself")
         pass

    user.is_superuser = role_update.is_superuser
    db.commit()
    db.refresh(user)
    return {"message": "User role updated", "user": {"id": user.id, "is_superuser": user.is_superuser}}

@router.get("/orders", response_model=List[Any])
def read_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    orders = db.query(Order).offset(skip).limit(limit).all()
    # Return all fields including relations
    return [
        {
            "id": o.id,
            "user_id": o.user_id,
            "total_amount": o.total_amount,
            "status": o.status,
            "created_at": o.created_at,
            "user_email": o.user.email if o.user else "Deleted User",
            "items_count": len(o.items)
        } 
        for o in orders
    ]

from app.models.product import Product, Category

@router.get("/products", response_model=List[Any])
def read_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    products = db.query(Product).offset(skip).limit(limit).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": p.price,
            "stock": p.stock,
            "image_url": p.image_url,
            "category_id": p.category_id,
            "category_name": p.category.name if p.category else "Uncategorized",
            "created_at": p.created_at
        }
        for p in products
    ]

@router.get("/categories", response_model=List[Any])
def read_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    categories = db.query(Category).offset(skip).limit(limit).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "description": c.description
        }
        for c in categories
    ]

import random
from datetime import datetime, timedelta
from app.core.security import get_password_hash
from app.models.order import OrderItem

@router.post("/seed")
def seed_database(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """
    Populate the database with dummy data.
    Requires admin authentication.
    """
    try:
        # 1. Categories
        categories_data = ["Electronics", "Clothing", "Home & Garden", "Books", "Sports"]
        db_categories = []
        for cat_name in categories_data:
            cat = db.query(Category).filter(Category.name == cat_name).first()
            if not cat:
                cat = Category(name=cat_name, description=f"All things {cat_name}")
                db.add(cat)
                db.flush()
            db_categories.append(cat)
        
        # 2. Regular Users
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
        for i in range(50):
            # Check if product already exists
            existing = db.query(Product).filter(Product.name == f"Product {i}").first()
            if existing:
                products.append(existing)
                continue
                
            cat = random.choice(db_categories)
            specs = {}
            if cat.name == "Electronics":
                specs = {
                    "Brand": random.choice(["TechBrand", "ElectroCore", "GigaTech"]),
                    "Warranty": "2 Years",
                }
            elif cat.name == "Clothing":
                specs = {
                    "Material": random.choice(["Cotton", "Polyester", "Wool"]),
                    "Size": random.choice(["S", "M", "L", "XL"]),
                }
            
            prod = Product(
                name=f"Product {i}",
                description=f"High quality {cat.name} item. Perfect for your needs.",
                price=round(random.uniform(10.0, 500.0), 2),
                stock=random.randint(10, 100),
                category_id=cat.id,
                image_url=f"https://picsum.photos/seed/{i+100}/400/300",
                specifications=specs
            )
            db.add(prod)
            db.flush()
            products.append(prod)

        # 4. Sample Orders
        for i in range(15):
            user = random.choice(users)
            order = Order(
                user_id=user.id,
                total_amount=0,
                status=random.choice(["pending", "paid", "shipped"]),
                created_at=datetime.now() - timedelta(days=random.randint(0, 30))
            )
            db.add(order)
            db.flush()
            
            total = 0
            for _ in range(random.randint(1, 3)):
                prod = random.choice(products)
                qty = random.randint(1, 2)
                item = OrderItem(
                    order_id=order.id,
                    product_id=prod.id,
                    quantity=qty,
                    price_at_purchase=prod.price
                )
                db.add(item)
                total += prod.price * qty
            
            order.total_amount = round(total, 2)
            
        db.commit()
        
        return {
            "message": "Database seeded successfully!",
            "stats": {
                "categories": len(db_categories),
                "users": len(users),
                "products": len(products),
                "orders": 15
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error seeding database: {str(e)}"
        )
