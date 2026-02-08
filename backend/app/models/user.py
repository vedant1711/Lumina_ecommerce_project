from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    MERCHANT = "merchant"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    
    # Role-based access
    role = Column(SQLEnum(UserRole), default=UserRole.CUSTOMER)
    
    # Merchant-specific fields
    store_name = Column(String, nullable=True)
    store_description = Column(String, nullable=True)
    
    # Legacy field for backwards compatibility (will be deprecated)
    is_superuser = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    wishlist_items = relationship("WishlistItem", back_populates="user", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="merchant", foreign_keys="Product.merchant_id")
    
    @property
    def is_admin(self):
        return self.role == UserRole.ADMIN or self.is_superuser
    
    @property
    def is_merchant(self):
        return self.role == UserRole.MERCHANT or self.role == UserRole.ADMIN
