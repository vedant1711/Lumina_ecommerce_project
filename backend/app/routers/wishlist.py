from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.wishlist import WishlistItem
from app.models.product import Product
from app.core.dependencies import get_current_user
from app.schemas.wishlist import WishlistItemResponse

router = APIRouter(
    prefix="/wishlist",
    tags=["wishlist"],
)

@router.get("/", response_model=List[WishlistItemResponse])
def get_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's wishlist with product details."""
    items = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id
    ).all()
    
    result = []
    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        result.append({
            "id": item.id,
            "user_id": item.user_id,
            "product_id": item.product_id,
            "created_at": item.created_at,
            "product": {
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "compare_at_price": product.compare_at_price,
                "image_url": product.image_url,
                "brand": product.brand,
                "stock": product.stock,
                "average_rating": product.average_rating,
                "review_count": product.review_count,
                "discount_percent": product.discount_percent
            } if product else None
        })
    
    return result

@router.post("/{product_id}")
def add_to_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a product to wishlist."""
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if already in wishlist
    existing = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == product_id
    ).first()
    
    if existing:
        return {"message": "Product already in wishlist", "id": existing.id}
    
    item = WishlistItem(
        user_id=current_user.id,
        product_id=product_id
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return {"message": "Added to wishlist", "id": item.id}

@router.delete("/{product_id}")
def remove_from_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a product from wishlist."""
    item = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == product_id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not in wishlist")
    
    db.delete(item)
    db.commit()
    
    return {"message": "Removed from wishlist"}

@router.get("/check/{product_id}")
def check_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if a product is in user's wishlist."""
    item = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == product_id
    ).first()
    
    return {"in_wishlist": item is not None}
