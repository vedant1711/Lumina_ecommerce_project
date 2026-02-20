"""
Analytics Router — AI-powered product recommendations.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.ai_service import (
    get_similar_products,
    get_user_recommendations,
    analyze_sentiment,
)

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
)


@router.get("/recommendations/product/{product_id}")
def product_recommendations(
    product_id: int,
    limit: int = 8,
    db: Session = Depends(get_db),
):
    """
    Get products similar to the given product.
    Uses content-based filtering (TF-IDF on descriptions, tags, brands, categories).
    """
    from app.models.product import Product

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    similar = get_similar_products(product_id, db, limit=limit)
    return {
        "product_id": product_id,
        "product_name": product.name,
        "recommendations": similar,
    }


@router.get("/recommendations/user")
def user_recommendations(
    limit: int = 12,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """
    Get personalized product recommendations for the current user.
    Falls back to trending/featured if the user has no history.
    """
    return get_user_recommendations(current_user.id, db, limit=limit)


@router.get("/sentiment/{review_id}")
def get_review_sentiment(review_id: int, db: Session = Depends(get_db)):
    """Get the sentiment analysis for a specific review."""
    from app.models.review import Review

    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    text = f"{review.title or ''} {review.comment or ''}".strip()
    sentiment = analyze_sentiment(text)

    return {
        "review_id": review_id,
        "text": text,
        "sentiment": sentiment,
        "stored_score": review.sentiment_score,
    }


@router.get("/sentiment/product/{product_id}")
def get_product_sentiment(product_id: int, db: Session = Depends(get_db)):
    """Get aggregate sentiment analysis for all reviews of a product."""
    from app.models.review import Review

    reviews = (
        db.query(Review).filter(Review.product_id == product_id).all()
    )

    if not reviews:
        return {
            "product_id": product_id,
            "total_reviews": 0,
            "average_sentiment": 0.0,
            "sentiment_distribution": {"positive": 0, "neutral": 0, "negative": 0},
            "reviews": [],
        }

    sentiments = []
    distribution = {"positive": 0, "neutral": 0, "negative": 0}

    for r in reviews:
        text = f"{r.title or ''} {r.comment or ''}".strip()
        s = analyze_sentiment(text)
        distribution[s["label"]] += 1
        sentiments.append({
            "review_id": r.id,
            "rating": r.rating,
            "sentiment": s,
        })

    avg_polarity = sum(s["sentiment"]["polarity"] for s in sentiments) / len(sentiments)

    return {
        "product_id": product_id,
        "total_reviews": len(reviews),
        "average_sentiment": round(avg_polarity, 4),
        "sentiment_distribution": distribution,
        "reviews": sentiments,
    }


@router.get("/recommendations/trending")
def trending_products(limit: int = 12, db: Session = Depends(get_db)):
    """
    Get trending/popular products.
    Public endpoint, no auth required. Uses featured + recent products.
    """
    from app.models.product import Product

    products = (
        db.query(Product)
        .filter(Product.is_active == True)  # noqa: E712
        .order_by(Product.is_featured.desc(), Product.created_at.desc())
        .limit(limit)
        .all()
    )

    return {
        "strategy": "trending",
        "reason": "Popular and featured products",
        "products": [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "price": p.price,
                "compare_at_price": p.compare_at_price,
                "image_url": p.image_url,
                "brand": p.brand,
                "category": p.category.name if p.category else None,
                "category_id": p.category_id,
                "average_rating": p.average_rating,
                "review_count": p.review_count,
                "discount_percent": p.discount_percent,
                "is_featured": p.is_featured,
                "tags": p.tags,
            }
            for p in products
        ],
    }
