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
    return categories
