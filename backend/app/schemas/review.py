from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    title: Optional[str] = None
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    product_id: int

class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None

class ReviewResponse(ReviewBase):
    id: int
    user_id: int
    product_id: int
    helpful_count: int = 0
    verified_purchase: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # User info (populated in response)
    user_name: Optional[str] = None

    class Config:
        from_attributes = True

class ReviewStats(BaseModel):
    average_rating: float
    total_reviews: int
    rating_distribution: dict  # {5: 10, 4: 5, 3: 2, 2: 1, 1: 0}
