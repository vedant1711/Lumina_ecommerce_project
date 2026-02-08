from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import database
from app.core import security
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderResponse
from app.routers.cart import router as cart_router, get_cart_key
from app.core.redis import redis_client
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from app.core.config import settings

from pydantic import BaseModel

class CheckoutRequest(BaseModel):
    payment_intent_id: str

router = APIRouter(tags=["Orders"])
from app.core.dependencies import get_current_user

@router.post("/orders/checkout", response_model=OrderResponse)
def checkout(
    checkout_data: CheckoutRequest,
    user: User = Depends(get_current_user), 
    db: Session = Depends(database.get_db)
):
    # Verify payment with Stripe
    import stripe
    import os
    from dotenv import load_dotenv
    load_dotenv()
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    
    try:
        # Retrieve and verify the payment intent
        intent = stripe.PaymentIntent.retrieve(checkout_data.payment_intent_id)
        
        if intent.status != "succeeded":
            raise HTTPException(
                status_code=400, 
                detail=f"Payment not completed. Status: {intent.status}"
            )
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Payment verification failed: {str(e)}"
        )
    
    cart_key = get_cart_key(user.id)
    cart_items_raw = redis_client.hgetall(cart_key)
    
    if not cart_items_raw:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total_amount = 0.0
    items_to_add = []

    # Validate stock and calculate total
    for pid_str, qty_str in cart_items_raw.items():
        pid = int(pid_str)
        qty = int(qty_str)
        
        product = db.query(Product).filter(Product.id == pid).first()
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {pid} not found")
        if product.stock < qty:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name}")
        
        total_amount += product.price * qty
        items_to_add.append({
            "product": product,
            "quantity": qty,
            "price": product.price
        })

    # Create Order
    new_order = Order(
        user_id=user.id, 
        total_amount=total_amount, 
        status="paid",
        payment_intent_id=checkout_data.payment_intent_id
    )
    db.add(new_order)
    db.flush() # get ID

    for item in items_to_add:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item["product"].id,
            quantity=item["quantity"],
            price_at_purchase=item["price"]
        )
        # Deduct stock
        item["product"].stock -= item["quantity"]
        db.add(order_item)

    db.commit()
    db.refresh(new_order)
    
    # Clear cart
    redis_client.delete(cart_key)
    
    # We construct the response manually to match schema slightly easier or rely on ORM
    # The ORM relationships (items) should populate.
    return new_order

@router.get("/orders/", response_model=List[OrderResponse])
def get_orders(user: User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    return user.orders

@router.post("/orders/checkout-demo", response_model=OrderResponse)
def checkout_demo(
    user: User = Depends(get_current_user), 
    db: Session = Depends(database.get_db)
):
    """Demo checkout without payment - for testing only."""
    cart_key = get_cart_key(user.id)
    cart_items_raw = redis_client.hgetall(cart_key)
    
    if not cart_items_raw:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total_amount = 0.0
    items_to_add = []

    for pid_str, qty_str in cart_items_raw.items():
        pid = int(pid_str)
        qty = int(qty_str)
        
        product = db.query(Product).filter(Product.id == pid).first()
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {pid} not found")
        if product.stock < qty:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name}")
        
        total_amount += product.price * qty
        items_to_add.append({
            "product": product,
            "quantity": qty,
            "price": product.price
        })

    # Create Order
    new_order = Order(
        user_id=user.id, 
        total_amount=total_amount, 
        status="paid",
        payment_intent_id="demo_" + str(user.id) + "_" + str(int(__import__('time').time()))
    )
    db.add(new_order)
    db.flush()

    for item in items_to_add:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item["product"].id,
            quantity=item["quantity"],
            price_at_purchase=item["price"]
        )
        item["product"].stock -= item["quantity"]
        db.add(order_item)

    db.commit()
    db.refresh(new_order)
    
    redis_client.delete(cart_key)
    
    return new_order
