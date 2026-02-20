"""
AI Service for the E-commerce Platform.

Provides:
- Sentiment Analysis on review text (using TextBlob).
- Content-Based Product Recommendations (using TF-IDF + Cosine Similarity).
- Personalized User Recommendations (based on order/wishlist history).
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from textblob import TextBlob
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import json


# ─────────────────────────────────────────────
# Sentiment Analysis
# ─────────────────────────────────────────────

def analyze_sentiment(text: str) -> Dict[str, Any]:
    """
    Analyze the sentiment of a text string.

    Returns:
        dict with:
          - polarity: float from -1.0 (very negative) to 1.0 (very positive)
          - subjectivity: float from 0.0 (very objective) to 1.0 (very subjective)
          - label: "positive", "negative", or "neutral"
    """
    if not text or not text.strip():
        return {"polarity": 0.0, "subjectivity": 0.0, "label": "neutral"}

    blob = TextBlob(text)
    polarity = round(blob.sentiment.polarity, 4)
    subjectivity = round(blob.sentiment.subjectivity, 4)

    if polarity > 0.1:
        label = "positive"
    elif polarity < -0.1:
        label = "negative"
    else:
        label = "neutral"

    return {
        "polarity": polarity,
        "subjectivity": subjectivity,
        "label": label,
    }


# ─────────────────────────────────────────────
# Content-Based Product Recommendations
# ─────────────────────────────────────────────

def _build_product_text(product) -> str:
    """Build a composite text string from product attributes for TF-IDF."""
    parts = []

    if product.name:
        parts.append(product.name)
    if product.description:
        parts.append(product.description)
    if product.brand:
        parts.append(product.brand)

    # Unpack tags
    tags = product.tags
    if tags:
        if isinstance(tags, str):
            try:
                tags = json.loads(tags)
            except (json.JSONDecodeError, TypeError):
                tags = [tags]
        if isinstance(tags, list):
            parts.extend(tags)

    # Category name
    if product.category and product.category.name:
        parts.append(product.category.name)

    return " ".join(parts).lower()


def get_similar_products(
    product_id: int,
    db: Session,
    limit: int = 8,
) -> List[Dict[str, Any]]:
    """
    Return products similar to the given product, ranked by cosine similarity
    of TF-IDF vectors built from name + description + brand + tags + category.
    """
    from app.models.product import Product, Category

    # Load all active products (eagerly load category relationship)
    all_products = (
        db.query(Product)
        .filter(Product.is_active == True)  # noqa: E712
        .all()
    )

    if len(all_products) < 2:
        return []

    # Find the target product index
    target_idx = None
    product_texts = []
    for i, p in enumerate(all_products):
        product_texts.append(_build_product_text(p))
        if p.id == product_id:
            target_idx = i

    if target_idx is None:
        return []

    # Build TF-IDF matrix and compute cosine similarities
    vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
    tfidf_matrix = vectorizer.fit_transform(product_texts)
    similarity_scores = cosine_similarity(
        tfidf_matrix[target_idx : target_idx + 1], tfidf_matrix
    ).flatten()

    # Sort indices by similarity (descending), exclude the target itself
    similar_indices = np.argsort(similarity_scores)[::-1]
    similar_indices = [i for i in similar_indices if i != target_idx][:limit]

    # Build response
    results = []
    for idx in similar_indices:
        p = all_products[idx]
        results.append({
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "compare_at_price": p.compare_at_price,
            "image_url": p.image_url,
            "brand": p.brand,
            "category": p.category.name if p.category else None,
            "average_rating": p.average_rating,
            "review_count": p.review_count,
            "similarity_score": round(float(similarity_scores[idx]), 4),
            "discount_percent": p.discount_percent,
        })

    return results


# ─────────────────────────────────────────────
# Personalized User Recommendations
# ─────────────────────────────────────────────

def get_user_recommendations(
    user_id: int,
    db: Session,
    limit: int = 12,
) -> Dict[str, Any]:
    """
    Generate personalized product recommendations for a user based on:
    1. Their order history (purchased products' categories/tags).
    2. Their wishlist items.
    3. Their review ratings (highly rated ≥ 4 stars → boost that category/brand).

    Falls back to featured/popular products for users with no history.
    """
    from app.models.product import Product, Category
    from app.models.order import Order, OrderItem
    from app.models.review import Review
    from app.models.wishlist import WishlistItem

    # ── Gather user interaction data ──
    # 1) Purchased product IDs
    purchased_ids = set()
    orders = (
        db.query(Order)
        .filter(Order.user_id == user_id, Order.status.in_(["paid", "shipped"]))
        .all()
    )
    for order in orders:
        for item in order.items:
            purchased_ids.add(item.product_id)

    # 2) Wishlisted product IDs
    wishlisted_ids = set()
    wishlisted = db.query(WishlistItem).filter(WishlistItem.user_id == user_id).all()
    for w in wishlisted:
        wishlisted_ids.add(w.product_id)

    # 3) Highly-rated product IDs (4+ stars)
    liked_ids = set()
    reviews = (
        db.query(Review)
        .filter(Review.user_id == user_id, Review.rating >= 4)
        .all()
    )
    for r in reviews:
        liked_ids.add(r.product_id)

    interacted_ids = purchased_ids | wishlisted_ids | liked_ids

    # ── If user has NO history, return featured/trending ──
    if not interacted_ids:
        featured = (
            db.query(Product)
            .filter(Product.is_active == True)  # noqa: E712
            .order_by(Product.is_featured.desc(), Product.created_at.desc())
            .limit(limit)
            .all()
        )
        return {
            "strategy": "trending",
            "reason": "Popular and featured products",
            "products": [_product_to_dict(p) for p in featured],
        }

    # ── Build preference profile ──
    interacted_products = (
        db.query(Product).filter(Product.id.in_(interacted_ids)).all()
    )

    preferred_categories: Dict[int, int] = {}
    preferred_brands: Dict[str, int] = {}
    preferred_tags: Dict[str, int] = {}

    for p in interacted_products:
        # Weight: review liked > purchased > wishlisted
        weight = 1
        if p.id in liked_ids:
            weight = 3
        elif p.id in purchased_ids:
            weight = 2

        if p.category_id:
            preferred_categories[p.category_id] = (
                preferred_categories.get(p.category_id, 0) + weight
            )
        if p.brand:
            preferred_brands[p.brand] = preferred_brands.get(p.brand, 0) + weight
        if p.tags:
            tags = p.tags
            if isinstance(tags, str):
                try:
                    tags = json.loads(tags)
                except (json.JSONDecodeError, TypeError):
                    tags = []
            if isinstance(tags, list):
                for t in tags:
                    preferred_tags[t] = preferred_tags.get(t, 0) + weight

    # ── Score all candidate products ──
    candidates = (
        db.query(Product)
        .filter(
            Product.is_active == True,  # noqa: E712
            ~Product.id.in_(purchased_ids),  # exclude already purchased
        )
        .all()
    )

    scored: List[tuple] = []
    for p in candidates:
        score = 0.0

        # Category match
        if p.category_id and p.category_id in preferred_categories:
            score += preferred_categories[p.category_id] * 3.0

        # Brand match
        if p.brand and p.brand in preferred_brands:
            score += preferred_brands[p.brand] * 2.0

        # Tag overlap
        tags = p.tags
        if tags:
            if isinstance(tags, str):
                try:
                    tags = json.loads(tags)
                except (json.JSONDecodeError, TypeError):
                    tags = []
            if isinstance(tags, list):
                for t in tags:
                    if t in preferred_tags:
                        score += preferred_tags[t] * 1.0

        # Boost featured items slightly
        if p.is_featured:
            score += 1.0

        # Boost highly rated items
        if p.average_rating >= 4:
            score += 0.5

        scored.append((p, score))

    # Sort by score descending
    scored.sort(key=lambda x: x[1], reverse=True)
    top = scored[:limit]

    # Determine top preference for explanation
    top_category_name = None
    if preferred_categories:
        top_cat_id = max(preferred_categories, key=preferred_categories.get)
        cat = db.query(Category).filter(Category.id == top_cat_id).first()
        if cat:
            top_category_name = cat.name

    reason_parts = []
    if top_category_name:
        reason_parts.append(f"your interest in {top_category_name}")
    if preferred_brands:
        top_brand = max(preferred_brands, key=preferred_brands.get)
        reason_parts.append(f"brands like {top_brand}")

    reason = (
        "Based on " + " and ".join(reason_parts)
        if reason_parts
        else "Recommended for you"
    )

    return {
        "strategy": "personalized",
        "reason": reason,
        "products": [
            {**_product_to_dict(p), "relevance_score": round(score, 2)}
            for p, score in top
        ],
    }


def _product_to_dict(product) -> Dict[str, Any]:
    """Convert a Product ORM object to a serializable dict."""
    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "compare_at_price": product.compare_at_price,
        "image_url": product.image_url,
        "brand": product.brand,
        "category": product.category.name if product.category else None,
        "category_id": product.category_id,
        "average_rating": product.average_rating,
        "review_count": product.review_count,
        "discount_percent": product.discount_percent,
        "is_featured": product.is_featured,
        "tags": product.tags,
    }
