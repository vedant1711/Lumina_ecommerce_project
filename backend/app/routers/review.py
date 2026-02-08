from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.review import Review
from app.models.order import Order
from app.core.dependencies import get_current_user
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse, ReviewStats

router = APIRouter(
    prefix="/reviews",
    tags=["reviews"],
)

@router.get("/product/{product_id}", response_model=List[ReviewResponse])
def get_product_reviews(
    product_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get all reviews for a product."""
    reviews = db.query(Review).filter(
        Review.product_id == product_id
    ).order_by(Review.created_at.desc()).offset(skip).limit(limit).all()
    
    # Add user names to response
    result = []
    for review in reviews:
        review_dict = {
            "id": review.id,
            "user_id": review.user_id,
            "product_id": review.product_id,
            "rating": review.rating,
            "title": review.title,
            "comment": review.comment,
            "helpful_count": review.helpful_count,
            "verified_purchase": review.verified_purchase,
            "created_at": review.created_at,
            "updated_at": review.updated_at,
            "user_name": review.user.full_name if review.user else "Anonymous"
        }
        result.append(review_dict)
    
    return result

@router.get("/product/{product_id}/stats", response_model=ReviewStats)
def get_product_review_stats(product_id: int, db: Session = Depends(get_db)):
    """Get review statistics for a product."""
    reviews = db.query(Review).filter(Review.product_id == product_id).all()
    
    if not reviews:
        return ReviewStats(
            average_rating=0,
            total_reviews=0,
            rating_distribution={5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
        )
    
    total = len(reviews)
    avg = sum(r.rating for r in reviews) / total
    
    distribution = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
    for r in reviews:
        distribution[r.rating] += 1
    
    return ReviewStats(
        average_rating=round(avg, 1),
        total_reviews=total,
        rating_distribution=distribution
    )

@router.post("/", response_model=ReviewResponse)
def create_review(
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new review for a product."""
    # Check if user already reviewed this product
    existing = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.product_id == review.product_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="You have already reviewed this product"
        )
    
    # Check if verified purchase
    verified = db.query(Order).join(Order.items).filter(
        Order.user_id == current_user.id,
        Order.status == "paid"
    ).first() is not None
    
    new_review = Review(
        user_id=current_user.id,
        product_id=review.product_id,
        rating=review.rating,
        title=review.title,
        comment=review.comment,
        verified_purchase=verified
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    return {
        **new_review.__dict__,
        "user_name": current_user.full_name
    }

@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    review_update: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a review (only by the author)."""
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    for key, value in review_update.dict(exclude_unset=True).items():
        setattr(review, key, value)
    
    db.commit()
    db.refresh(review)
    
    return {
        **review.__dict__,
        "user_name": current_user.full_name
    }

@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a review (by author or admin)."""
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    if review.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(review)
    db.commit()
    
    return {"message": "Review deleted"}

@router.post("/{review_id}/helpful")
def mark_review_helpful(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a review as helpful."""
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review.helpful_count += 1
    db.commit()
    
    return {"message": "Marked as helpful", "helpful_count": review.helpful_count}
