from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import database
from app.models.product import Product, Category
from app.schemas.product import ProductCreate, Product as ProductSchema, ProductUpdate, CategoryCreate, Category as CategorySchema

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

# --- Products ---
@router.post("/products/", response_model=ProductSchema)
def create_product(product: ProductCreate, db: Session = Depends(database.get_db)):
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/products/", response_model=List[ProductSchema])
def read_products(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = Query(None, min_length=3, description="Search products by name or description"),
    category_id: Optional[int] = None,
    db: Session = Depends(database.get_db)
):
    query = db.query(Product)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(Product.name.ilike(search_fmt) | Product.description.ilike(search_fmt))
    
    return query.offset(skip).limit(limit).all()

@router.get("/products/{product_id}", response_model=ProductSchema)
def read_product(product_id: int, db: Session = Depends(database.get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/products/{product_id}", response_model=ProductSchema)
def update_product(product_id: int, product_update: ProductUpdate, db: Session = Depends(database.get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product_update.dict(exclude_unset=True).items():
        setattr(product, key, value)
    
    db.commit()
    db.refresh(product)
    return product
