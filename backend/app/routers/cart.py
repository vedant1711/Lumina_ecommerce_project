from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.core.redis import redis_client
from app.schemas.order import CartItem, Cart
from app.schemas.user import UserResponse
from app.core import security
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.config import settings
from app import database
from sqlalchemy.orm import Session
from app.models.user import User

router = APIRouter(tags=["Cart"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user_optional(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    # This is a bit simplified; in real app we might allow guest carts via session ID
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None
    
    user = db.query(User).filter(User.email == email).first()
    return user

def get_cart_key(user_id: int):
    return f"cart:{user_id}"

from app.core.dependencies import get_current_user

@router.post("/cart/add")
def add_to_cart(item: CartItem, user: User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    cart_key = get_cart_key(user.id)
    # HINCRBY increments the quantity of the product_id field in the hash stored at key
    redis_client.hincrby(cart_key, str(item.product_id), item.quantity)
    return {"message": "Item added to cart"}

from app.models.product import Product

@router.get("/cart/")
def get_cart(user: User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    cart_key = get_cart_key(user.id)
    items = redis_client.hgetall(cart_key)
    # items is { "product_id": "quantity", ... }
    
    if not items:
        return {"items": [], "total_amount": 0.0}

    cart_items = []
    total_amount = 0.0

    # Batch fetch products could be optimized, but loop is fine for small carts
    for pid_str, qty_str in items.items():
        pid = int(pid_str)
        qty = int(qty_str)
        
        product = db.query(Product).filter(Product.id == pid).first()
        if product:
            item_total = product.price * qty
            total_amount += item_total
            cart_items.append({
                "product_id": pid,
                "name": product.name,
                "price": product.price,
                "image_url": product.image_url,
                "quantity": qty
            })
    
    return {"items": cart_items, "total_amount": total_amount}

@router.delete("/cart/clear")
def clear_cart(user: User = Depends(get_current_user), db: Session = Depends(database.get_db)):

    cart_key = get_cart_key(user.id)
    redis_client.delete(cart_key)
    return {"message": "Cart cleared"}

@router.put("/cart/update")
def update_cart_item(item: CartItem, user: User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """Update the quantity of an item in the cart. Set quantity to 0 to remove."""
    cart_key = get_cart_key(user.id)
    
    if item.quantity <= 0:
        # Remove item if quantity is 0 or negative
        redis_client.hdel(cart_key, str(item.product_id))
        return {"message": "Item removed from cart"}
    else:
        # Set the new quantity
        redis_client.hset(cart_key, str(item.product_id), item.quantity)
        return {"message": "Cart updated"}

@router.delete("/cart/remove/{product_id}")
def remove_from_cart(product_id: int, user: User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """Remove a specific item from the cart."""
    cart_key = get_cart_key(user.id)
    redis_client.hdel(cart_key, str(product_id))
    return {"message": "Item removed from cart"}
