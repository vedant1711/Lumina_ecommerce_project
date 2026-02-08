from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
from app.database import get_db
from app.models.user import User, UserRole
from app.models.product import Product, Category
from app.models.order import Order, OrderItem
from app.core.dependencies import get_current_user
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
import uuid

router = APIRouter(
    prefix="/merchant",
    tags=["merchant"],
)

def get_current_merchant(current_user: User = Depends(get_current_user)) -> User:
    """Verify user is a merchant or admin."""
    if not current_user.is_merchant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Merchant access required"
        )
    return current_user

@router.get("/dashboard")
def get_merchant_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_merchant)
):
    """Get merchant dashboard stats."""
    products = db.query(Product).filter(Product.merchant_id == current_user.id).all()
    product_ids = [p.id for p in products]
    
    # Get orders containing merchant's products
    total_sales = 0
    total_orders = 0
    
    if product_ids:
        order_items = db.query(OrderItem).filter(
            OrderItem.product_id.in_(product_ids)
        ).all()
        
        total_sales = sum(item.price_at_purchase * item.quantity for item in order_items)
        order_ids = set(item.order_id for item in order_items)
        total_orders = len(order_ids)
    
    return {
        "store_name": current_user.store_name,
        "total_products": len(products),
        "active_products": len([p for p in products if p.is_active]),
        "total_orders": total_orders,
        "total_sales": round(total_sales, 2),
        "low_stock_products": len([p for p in products if p.stock < 10])
    }

@router.get("/products", response_model=List[Any])
def get_merchant_products(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_merchant)
):
    """Get all products owned by the merchant."""
    products = db.query(Product).filter(
        Product.merchant_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return [
        {
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "stock": p.stock,
            "image_url": p.image_url,
            "is_active": p.is_active,
            "is_featured": p.is_featured,
            "category_name": p.category.name if p.category else None,
            "average_rating": p.average_rating,
            "review_count": p.review_count,
            "created_at": p.created_at
        }
        for p in products
    ]

@router.post("/products", response_model=ProductResponse)
def create_merchant_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_merchant)
):
    """Create a new product as merchant."""
    # Generate SKU if not provided
    sku = product.sku or f"SKU-{uuid.uuid4().hex[:8].upper()}"
    
    new_product = Product(
        **product.dict(exclude={"sku"}),
        sku=sku,
        merchant_id=current_user.id
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    
    return new_product

@router.put("/products/{product_id}", response_model=ProductResponse)
def update_merchant_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_merchant)
):
    """Update a product (only if owned by merchant)."""
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.merchant_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    for key, value in product_update.dict(exclude_unset=True).items():
        setattr(product, key, value)
    
    db.commit()
    db.refresh(product)
    
    return product

@router.delete("/products/{product_id}")
def delete_merchant_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_merchant)
):
    """Delete a product (only if owned by merchant)."""
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.merchant_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Soft delete - mark as inactive
    product.is_active = False
    db.commit()
    
    return {"message": "Product deleted"}

@router.get("/orders")
def get_merchant_orders(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_merchant)
):
    """Get orders containing merchant's products."""
    products = db.query(Product).filter(Product.merchant_id == current_user.id).all()
    product_ids = [p.id for p in products]
    
    if not product_ids:
        return []
    
    order_items = db.query(OrderItem).filter(
        OrderItem.product_id.in_(product_ids)
    ).all()
    
    # Group by order
    orders_map = {}
    for item in order_items:
        order = db.query(Order).filter(Order.id == item.order_id).first()
        if order.id not in orders_map:
            orders_map[order.id] = {
                "id": order.id,
                "status": order.status,
                "created_at": order.created_at,
                "customer_email": order.user.email if order.user else None,
                "items": []
            }
        
        product = db.query(Product).filter(Product.id == item.product_id).first()
        orders_map[order.id]["items"].append({
            "product_name": product.name if product else "Deleted",
            "quantity": item.quantity,
            "price": item.price_at_purchase
        })
    
    return list(orders_map.values())[skip:skip+limit]
