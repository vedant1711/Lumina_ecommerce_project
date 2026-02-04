from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class OrderItemSchema(BaseModel):
    product_id: int
    quantity: int
    price_at_purchase: float
    product_name: str # For display convenience

    class Config:
        orm_mode = True

class OrderCreate(BaseModel):
    # Depending on design, might just be empty "checkout" call if cart is in server-side session
    # Or client sends list of items. Let's assume client sends cart items for simplicity OR checkout via Redis cart.
    # We will implement "checkout from cart" logic in the router.
    # So this schema might be purely for the API response or manual creation.
    pass

class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: str
    created_at: datetime
    items: List[OrderItemSchema]

    class Config:
        orm_mode = True

# Cart Schemas
class CartItem(BaseModel):
    product_id: int
    quantity: int

class Cart(BaseModel):
    items: List[CartItem]
