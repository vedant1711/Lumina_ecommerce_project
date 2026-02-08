from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import database
from app.models.product import Product, Category
from app.models.review import Review
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate, CategoryCreate, Category as CategorySchema

router = APIRouter(tags=["Products"])

# --- Categories ---
@router.post("/categories/", response_model=CategorySchema)
def create_category(category: CategoryCreate, db: Session = Depends(database.get_db)):
    db_category = Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.get("/categories/", response_model=List[CategorySchema])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(Category).offset(skip).limit(limit).all()

@router.get("/categories/{category_id}", response_model=CategorySchema)
def read_category(category_id: int, db: Session = Depends(database.get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

# --- Products ---
@router.post("/products/", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(database.get_db)):
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/products/", response_model=List[Any])
def read_products(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = Query(None, min_length=1, description="Search products by name or description"),
    category_id: Optional[int] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    in_stock: Optional[bool] = None,
    is_featured: Optional[bool] = None,
    sort_by: Optional[str] = Query(None, description="Sort by: price_asc, price_desc, rating, newest, name"),
    db: Session = Depends(database.get_db)
):
    """Get products with advanced filtering."""
    query = db.query(Product).filter(Product.is_active == True)
    
    # Category filter
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    # Brand filter
    if brand:
        query = query.filter(Product.brand.ilike(f"%{brand}%"))
    
    # Search
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            Product.name.ilike(search_fmt) | 
            Product.description.ilike(search_fmt) |
            Product.brand.ilike(search_fmt)
        )
    
    # Price filters
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    # Stock filter
    if in_stock:
        query = query.filter(Product.stock > 0)
    
    # Featured filter
    if is_featured:
        query = query.filter(Product.is_featured == True)
    
    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "newest":
        query = query.order_by(Product.created_at.desc())
    elif sort_by == "name":
        query = query.order_by(Product.name.asc())
    else:
        query = query.order_by(Product.created_at.desc())
    
    products = query.offset(skip).limit(limit).all()
    
    # Build response with computed fields
    result = []
    for p in products:
        # Calculate average rating
        reviews = db.query(Review).filter(Review.product_id == p.id).all()
        avg_rating = sum(r.rating for r in reviews) / len(reviews) if reviews else 0
        review_count = len(reviews)
        
        # Filter by rating if specified
        if min_rating is not None and avg_rating < min_rating:
            continue
        
        discount = 0
        if p.compare_at_price and p.compare_at_price > p.price:
            discount = round((1 - p.price / p.compare_at_price) * 100)
        
        result.append({
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": p.price,
            "compare_at_price": p.compare_at_price,
            "stock": p.stock,
            "brand": p.brand,
            "sku": p.sku,
            "image_url": p.image_url,
            "images": p.images,
            "specifications": p.specifications,
            "tags": p.tags,
            "is_featured": p.is_featured,
            "is_active": p.is_active,
            "category_id": p.category_id,
            "merchant_id": p.merchant_id,
            "average_rating": round(avg_rating, 1),
            "review_count": review_count,
            "discount_percent": discount,
            "created_at": p.created_at,
            "updated_at": p.updated_at,
            "category": {"id": p.category.id, "name": p.category.name} if p.category else None
        })
    
    return result

@router.get("/products/featured", response_model=List[Any])
def get_featured_products(limit: int = 10, db: Session = Depends(database.get_db)):
    """Get featured products."""
    products = db.query(Product).filter(
        Product.is_featured == True,
        Product.is_active == True
    ).limit(limit).all()
    
    result = []
    for p in products:
        reviews = db.query(Review).filter(Review.product_id == p.id).all()
        avg_rating = sum(r.rating for r in reviews) / len(reviews) if reviews else 0
        
        result.append({
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "compare_at_price": p.compare_at_price,
            "image_url": p.image_url,
            "brand": p.brand,
            "average_rating": round(avg_rating, 1),
            "review_count": len(reviews)
        })
    
    return result

@router.get("/products/brands")
def get_all_brands(db: Session = Depends(database.get_db)):
    """Get all unique brand names for filter."""
    brands = db.query(Product.brand).filter(
        Product.brand.isnot(None),
        Product.is_active == True
    ).distinct().all()
    return [b[0] for b in brands if b[0]]

@router.get("/products/{product_id}", response_model=Any)
def read_product(product_id: int, db: Session = Depends(database.get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    reviews = db.query(Review).filter(Review.product_id == product.id).all()
    avg_rating = sum(r.rating for r in reviews) / len(reviews) if reviews else 0
    
    discount = 0
    if product.compare_at_price and product.compare_at_price > product.price:
        discount = round((1 - product.price / product.compare_at_price) * 100)
    
    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "compare_at_price": product.compare_at_price,
        "stock": product.stock,
        "brand": product.brand,
        "sku": product.sku,
        "weight": product.weight,
        "dimensions": product.dimensions,
        "image_url": product.image_url,
        "images": product.images,
        "specifications": product.specifications,
        "tags": product.tags,
        "is_featured": product.is_featured,
        "is_active": product.is_active,
        "category_id": product.category_id,
        "merchant_id": product.merchant_id,
        "average_rating": round(avg_rating, 1),
        "review_count": len(reviews),
        "discount_percent": discount,
        "created_at": product.created_at,
        "updated_at": product.updated_at,
        "category": {"id": product.category.id, "name": product.category.name, "description": product.category.description} if product.category else None
    }

@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product_update: ProductUpdate, db: Session = Depends(database.get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product_update.dict(exclude_unset=True).items():
        setattr(product, key, value)
    
    db.commit()
    db.refresh(product)
    return product
