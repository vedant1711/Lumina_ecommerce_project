from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Any
from app.database import get_db
from app.models.user import User, UserRole
from app.models.order import Order
from app.models.product import Product, Category
from app.models.review import Review
from app.models.wishlist import WishlistItem
from app.core.dependencies import get_current_user
from app.schemas.user import UserRoleUpdate

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    responses={404: {"description": "Not found"}},
)

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Verify user is an admin."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Admin access required"
        )
    return current_user

# Dashboard
@router.get("/dashboard")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get admin dashboard statistics."""
    total_users = db.query(User).count()
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()
    total_reviews = db.query(Review).count()
    
    # Revenue
    paid_orders = db.query(Order).filter(Order.status.in_(["paid", "shipped", "delivered"])).all()
    total_revenue = sum(o.total_amount for o in paid_orders)
    
    # User breakdown
    customers = db.query(User).filter(User.role == UserRole.CUSTOMER).count()
    merchants = db.query(User).filter(User.role == UserRole.MERCHANT).count()
    admins = db.query(User).filter(User.role == UserRole.ADMIN).count()
    
    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_reviews": total_reviews,
        "total_revenue": round(total_revenue, 2),
        "user_breakdown": {
            "customers": customers,
            "merchants": merchants,
            "admins": admins
        }
    }

# Users
@router.get("/users", response_model=List[Any])
def read_users(
    skip: int = 0,
    limit: int = 100,
    role: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Get all users with optional role filter."""
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    
    users = query.offset(skip).limit(limit).all()
    return [
        {
            "id": u.id, 
            "email": u.email, 
            "full_name": u.full_name, 
            "is_active": u.is_active, 
            "role": u.role.value if u.role else "customer",
            "store_name": u.store_name,
            "created_at": u.created_at
        } 
        for u in users
    ]

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Update a user's role."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from demoting themselves
    if user.id == current_user.id and role_update.role != UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Cannot demote yourself")
    
    user.role = role_update.role
    # Sync legacy field
    user.is_superuser = role_update.role == UserRole.ADMIN
    
    db.commit()
    db.refresh(user)
    return {"message": "User role updated", "user": {"id": user.id, "role": user.role.value}}

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Delete a user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}

# Orders
@router.get("/orders", response_model=List[Any])
def read_orders(
    skip: int = 0,
    limit: int = 100,
    status_filter: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Get all orders with optional status filter."""
    query = db.query(Order)
    
    if status_filter:
        query = query.filter(Order.status == status_filter)
    
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
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

@router.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Update an order's status."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    valid_statuses = ["pending", "paid", "shipped", "delivered", "cancelled"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    order.status = new_status
    db.commit()
    return {"message": "Order status updated", "order_id": order_id, "status": new_status}

# Products
@router.get("/products", response_model=List[Any])
def read_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Get all products."""
    products = db.query(Product).offset(skip).limit(limit).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "stock": p.stock,
            "brand": p.brand,
            "is_active": p.is_active,
            "is_featured": p.is_featured,
            "category_name": p.category.name if p.category else "Uncategorized",
            "merchant_id": p.merchant_id,
            "created_at": p.created_at
        }
        for p in products
    ]

@router.put("/products/{product_id}/featured")
def toggle_featured(
    product_id: int,
    is_featured: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Toggle product featured status."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product.is_featured = is_featured
    db.commit()
    return {"message": "Product updated", "is_featured": is_featured}

# Categories
@router.get("/categories", response_model=List[Any])
def read_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Get all categories with product counts."""
    categories = db.query(Category).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "description": c.description,
            "image_url": c.image_url,
            "product_count": len(c.products) if c.products else 0
        }
        for c in categories
    ]

@router.post("/categories")
def create_category(
    name: str,
    description: str = None,
    image_url: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Create a new category."""
    category = Category(name=name, description=description, image_url=image_url)
    db.add(category)
    db.commit()
    db.refresh(category)
    return {"message": "Category created", "id": category.id}

# Reviews
@router.get("/reviews", response_model=List[Any])
def read_reviews(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Get all reviews for moderation."""
    reviews = db.query(Review).order_by(Review.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": r.id,
            "product_id": r.product_id,
            "product_name": r.product.name if r.product else "Deleted",
            "user_email": r.user.email if r.user else "Deleted",
            "rating": r.rating,
            "title": r.title,
            "comment": r.comment,
            "created_at": r.created_at
        }
        for r in reviews
    ]

@router.delete("/reviews/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Delete a review (moderation)."""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    db.delete(review)
    db.commit()
    return {"message": "Review deleted"}

# Wishlist Statistics
@router.get("/wishlist-stats")
def get_wishlist_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Get wishlist statistics for admin dashboard."""
    # Total wishlist items
    total_items = db.query(WishlistItem).count()
    
    # Top wishlisted products
    top_products = db.query(
        Product.id,
        Product.name,
        Product.image_url,
        func.count(WishlistItem.id).label('wishlist_count')
    ).join(WishlistItem).group_by(Product.id).order_by(
        func.count(WishlistItem.id).desc()
    ).limit(10).all()
    
    # Users with most wishlist items
    top_users = db.query(
        User.id,
        User.email,
        func.count(WishlistItem.id).label('item_count')
    ).join(WishlistItem).group_by(User.id).order_by(
        func.count(WishlistItem.id).desc()
    ).limit(10).all()
    
    return {
        "total_wishlist_items": total_items,
        "top_wishlisted_products": [
            {"product_id": p.id, "name": p.name, "image_url": p.image_url, "count": p.wishlist_count}
            for p in top_products
        ],
        "users_with_most_items": [
            {"user_id": u.id, "email": u.email, "item_count": u.item_count}
            for u in top_users
        ]
    }

@router.get("/wishlist-items", response_model=List[Any])
def get_all_wishlist_items(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Get all wishlist items for admin view."""
    items = db.query(WishlistItem).offset(skip).limit(limit).all()
    return [
        {
            "id": w.id,
            "user_id": w.user_id,
            "user_email": w.user.email if w.user else "Deleted",
            "product_id": w.product_id,
            "product_name": w.product.name if w.product else "Deleted",
            "created_at": w.created_at
        }
        for w in items
    ]
