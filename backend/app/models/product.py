from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    image_url = Column(String, nullable=True)
    
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    compare_at_price = Column(Float, nullable=True)  # Original price for discount display
    stock = Column(Integer, default=0)
    
    # Enhanced product details
    brand = Column(String, index=True, nullable=True)
    sku = Column(String, unique=True, nullable=True)
    weight = Column(Float, nullable=True)  # in kg
    dimensions = Column(JSON, nullable=True)  # {"length": 10, "width": 5, "height": 3}
    
    # Images
    image_url = Column(String)
    images = Column(JSON, nullable=True)  # Array of additional image URLs
    
    # Product attributes
    specifications = Column(JSON, nullable=True)
    tags = Column(JSON, nullable=True)  # ["new", "bestseller", "sale"]
    
    # Flags
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    category_id = Column(Integer, ForeignKey("categories.id"))
    merchant_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    category = relationship("Category", back_populates="products")
    merchant = relationship("User", back_populates="products", foreign_keys=[merchant_id])
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")
    wishlist_items = relationship("WishlistItem", back_populates="product", cascade="all, delete-orphan")
    
    @property
    def discount_percent(self):
        if self.compare_at_price and self.compare_at_price > self.price:
            return round((1 - self.price / self.compare_at_price) * 100)
        return 0
    
    @property
    def average_rating(self):
        if not self.reviews:
            return 0
        return sum(r.rating for r in self.reviews) / len(self.reviews)
    
    @property
    def review_count(self):
        return len(self.reviews) if self.reviews else 0
