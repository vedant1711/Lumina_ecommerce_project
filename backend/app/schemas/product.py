from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    
    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    compare_at_price: Optional[float] = None
    stock: int = 0
    brand: Optional[str] = None
    sku: Optional[str] = None
    weight: Optional[float] = None
    dimensions: Optional[Dict[str, float]] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    specifications: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    is_featured: bool = False
    is_active: bool = True
    category_id: Optional[int] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    compare_at_price: Optional[float] = None
    stock: Optional[int] = None
    brand: Optional[str] = None
    sku: Optional[str] = None
    weight: Optional[float] = None
    dimensions: Optional[Dict[str, float]] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    specifications: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    category_id: Optional[int] = None

class ProductResponse(ProductBase):
    id: int
    merchant_id: Optional[int] = None
    average_rating: float = 0
    review_count: int = 0
    discount_percent: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    category: Optional[Category] = None

    class Config:
        from_attributes = True

# For backwards compatibility
Product = ProductResponse

# Filter schema
class ProductFilter(BaseModel):
    category_id: Optional[int] = None
    brand: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_rating: Optional[float] = None
    in_stock: Optional[bool] = None
    is_featured: Optional[bool] = None
    search: Optional[str] = None
    sort_by: Optional[str] = None  # price_asc, price_desc, rating, newest
