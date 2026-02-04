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

@router.get("/cart/")
def get_cart(user: User = Depends(get_current_user), db: Session = Depends(database.get_db)):

    cart_key = get_cart_key(user.id)
    items = redis_client.hgetall(cart_key)
    # items is { "product_id": "quantity", ... }
    cart_items = []
    for pid, qty in items.items():
        cart_items.append({"product_id": int(pid), "quantity": int(qty)})
    
    return {"items": cart_items}

@router.delete("/cart/clear")
def clear_cart(user: User = Depends(get_current_user), db: Session = Depends(database.get_db)):

    cart_key = get_cart_key(user.id)
    redis_client.delete(cart_key)
    return {"message": "Cart cleared"}
