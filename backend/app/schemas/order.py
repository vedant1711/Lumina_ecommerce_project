from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class OrderItemSchema(BaseModel):
    product_id: int
    quantity: int
    price_at_purchase: float
    product_name: str

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    pass

class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: str
    created_at: datetime
    items: List[OrderItemSchema]

    class Config:
        from_attributes = True

# Cart Schemas
class CartItem(BaseModel):
    product_id: int
    quantity: int

class Cart(BaseModel):
    items: List[CartItem]
