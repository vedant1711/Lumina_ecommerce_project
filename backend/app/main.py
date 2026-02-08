from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from sqlalchemy.orm import Session

from app.database import engine, Base, get_db

# Import all models to register them with SQLAlchemy
from app.models.user import User
from app.models.product import Product, Category
from app.models.order import Order, OrderItem
from app.models.review import Review
from app.models.wishlist import WishlistItem

# Import routers
from app.routers import auth, product, cart, order, admin, payment, review, wishlist, merchant

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Lumina E-Commerce API",
    version="2.0.0",
    description="Full-featured e-commerce API with multi-role support"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics
Instrumentator().instrument(app).expose(app)

# Register routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(product.router)
app.include_router(cart.router)
app.include_router(order.router)
app.include_router(admin.router)
app.include_router(payment.router)
app.include_router(review.router)
app.include_router(wishlist.router)
app.include_router(merchant.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Lumina E-Commerce API", "version": "2.0.0", "status": "operational"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# One-time setup endpoint
from app.models.user import UserRole
from app.core.security import get_password_hash
import random
from datetime import datetime, timedelta

@app.post("/setup")
def initial_setup(db: Session = Depends(get_db)):
    """One-time setup to create admin, merchant, sample data."""
    try:
        # Check if already set up
        existing_admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if existing_admin:
            return {"message": "Setup already completed", "admin_email": existing_admin.email}
        
        # Create admin
        admin = User(
            email="admin@lumina.com",
            full_name="Admin User",
            hashed_password=get_password_hash("admin123"),
            is_active=True,
            role=UserRole.ADMIN,
            is_superuser=True
        )
        db.add(admin)
        
        # Create merchant
        merchant = User(
            email="merchant@lumina.com",
            full_name="Lumina Store",
            hashed_password=get_password_hash("merchant123"),
            is_active=True,
            role=UserRole.MERCHANT,
            store_name="Lumina Official Store",
            store_description="Official store for premium products"
        )
        db.add(merchant)
        db.flush()
        
        # Create categories
        categories_data = [
            {"name": "Electronics", "description": "Phones, Laptops, Accessories", "image_url": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400"},
            {"name": "Fashion", "description": "Clothing, Shoes, Accessories", "image_url": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400"},
            {"name": "Home & Living", "description": "Furniture, Decor, Kitchen", "image_url": "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400"},
            {"name": "Sports & Outdoors", "description": "Equipment, Apparel, Gear", "image_url": "https://images.unsplash.com/photo-1461896836934-2a01a5e7e6a2?w=400"},
            {"name": "Books & Media", "description": "Books, Games, Entertainment", "image_url": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400"},
        ]
        
        db_categories = []
        for cat_data in categories_data:
            cat = Category(**cat_data)
            db.add(cat)
            db.flush()
            db_categories.append(cat)
        
        # Create products with real data
        products_data = [
            # Electronics
            {"name": "iPhone 15 Pro", "brand": "Apple", "price": 999.99, "compare_at_price": 1099.99, "category_idx": 0,
             "description": "The most powerful iPhone ever with A17 Pro chip, titanium design, and advanced camera system.",
             "image_url": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400",
             "specifications": {"Display": "6.1 inch Super Retina XDR", "Chip": "A17 Pro", "Storage": "256GB", "Camera": "48MP Main"},
             "tags": ["new", "bestseller"], "is_featured": True},
            {"name": "MacBook Air M3", "brand": "Apple", "price": 1099.00, "category_idx": 0,
             "description": "Supercharged by M3 chip. Incredibly thin and light laptop with all-day battery life.",
             "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
             "specifications": {"Display": "13.6 inch Liquid Retina", "Chip": "Apple M3", "RAM": "8GB", "Storage": "256GB SSD"},
             "tags": ["new"], "is_featured": True},
            {"name": "AirPods Pro 2", "brand": "Apple", "price": 249.00, "compare_at_price": 279.00, "category_idx": 0,
             "description": "Active Noise Cancellation, Adaptive Audio, and Personalized Spatial Audio.",
             "image_url": "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400",
             "specifications": {"Noise Cancellation": "Active", "Battery": "6 hours", "Chip": "H2"},
             "tags": ["bestseller"], "is_featured": True},
            {"name": "Samsung Galaxy S24 Ultra", "brand": "Samsung", "price": 1199.99, "category_idx": 0,
             "description": "Galaxy AI is here. The ultimate smartphone with built-in S Pen and 200MP camera.",
             "image_url": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400",
             "specifications": {"Display": "6.8 inch Dynamic AMOLED", "Camera": "200MP", "Battery": "5000mAh"},
             "tags": ["new"]},
            {"name": "Sony WH-1000XM5", "brand": "Sony", "price": 348.00, "compare_at_price": 399.00, "category_idx": 0,
             "description": "Industry-leading noise cancellation with exceptional sound quality.",
             "image_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400",
             "specifications": {"Noise Cancellation": "Best in class", "Battery": "30 hours", "Weight": "250g"},
             "tags": ["sale"]},
            {"name": "iPad Pro 12.9", "brand": "Apple", "price": 1099.00, "category_idx": 0,
             "description": "The ultimate iPad experience with M2 chip and stunning Liquid Retina XDR display.",
             "image_url": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
             "specifications": {"Display": "12.9 inch Liquid Retina XDR", "Chip": "M2", "Storage": "128GB"}},
            
            # Fashion
            {"name": "Nike Air Max 270", "brand": "Nike", "price": 150.00, "compare_at_price": 180.00, "category_idx": 1,
             "description": "Iconic style meets modern comfort with Nike's largest Air unit yet.",
             "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
             "specifications": {"Style": "Lifestyle", "Cushioning": "Air Max 270", "Material": "Mesh upper"},
             "tags": ["bestseller"], "is_featured": True},
            {"name": "Levi's 501 Original Jeans", "brand": "Levi's", "price": 79.50, "category_idx": 1,
             "description": "The original blue jean since 1873. Straight fit with signature button fly.",
             "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
             "specifications": {"Fit": "Straight", "Rise": "Regular", "Material": "100% Cotton"}},
            {"name": "Ray-Ban Aviator Classic", "brand": "Ray-Ban", "price": 161.00, "category_idx": 1,
             "description": "The iconic aviator that started it all. Timeless style with crystal lenses.",
             "image_url": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
             "specifications": {"Lens": "Crystal Green", "Frame": "Gold Metal", "Size": "58mm"},
             "is_featured": True},
            {"name": "Adidas Ultraboost 23", "brand": "Adidas", "price": 190.00, "category_idx": 1,
             "description": "Responsive cushioning and endless energy return for your daily run.",
             "image_url": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400",
             "specifications": {"Cushioning": "Boost", "Upper": "Primeknit", "Drop": "10mm"}},
            {"name": "The North Face Puffer Jacket", "brand": "The North Face", "price": 229.00, "compare_at_price": 280.00, "category_idx": 1,
             "description": "Stay warm in style with 700-fill down insulation.",
             "image_url": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400",
             "specifications": {"Insulation": "700-fill Down", "Water Resistant": "Yes"},
             "tags": ["sale"]},
            
            # Home & Living
            {"name": "IKEA MALM Desk", "brand": "IKEA", "price": 179.00, "category_idx": 2,
             "description": "Clean lines and a minimalist design make this desk perfect for any room.",
             "image_url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400",
             "specifications": {"Width": "140cm", "Depth": "65cm", "Height": "73cm", "Material": "Particleboard"}},
            {"name": "Dyson V15 Detect", "brand": "Dyson", "price": 749.00, "compare_at_price": 849.00, "category_idx": 2,
             "description": "Reveals hidden dust with laser. Our most powerful intelligent vacuum.",
             "image_url": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400",
             "specifications": {"Runtime": "60 min", "Bin Volume": "0.76L", "Laser": "Yes"},
             "tags": ["sale"], "is_featured": True},
            {"name": "KitchenAid Stand Mixer", "brand": "KitchenAid", "price": 379.99, "category_idx": 2,
             "description": "The iconic stand mixer for all your baking needs. 10+ attachments available.",
             "image_url": "https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=400",
             "specifications": {"Capacity": "5 Quart", "Motor": "325 Watt", "Speeds": "10"},
             "is_featured": True},
            {"name": "Philips Hue Starter Kit", "brand": "Philips", "price": 199.99, "category_idx": 2,
             "description": "Smart lighting that sets the mood. Control with your voice or app.",
             "image_url": "https://images.unsplash.com/photo-1507494924047-60b8ee826ca9?w=400",
             "specifications": {"Bulbs": "4x A19", "Bridge": "Included", "Colors": "16 million"}},
            {"name": "Nespresso Vertuo Plus", "brand": "Nespresso", "price": 159.00, "compare_at_price": 199.00, "category_idx": 2,
             "description": "Barista-grade coffee at home with Centrifusion technology.",
             "image_url": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400",
             "specifications": {"Sizes": "5 cup sizes", "Pressure": "19 bar", "Water Tank": "1.1L"},
             "tags": ["sale"]},
            
            # Sports
            {"name": "Peloton Bike+", "brand": "Peloton", "price": 2495.00, "category_idx": 3,
             "description": "The ultimate home cycling experience with live and on-demand classes.",
             "image_url": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400",
             "specifications": {"Display": "24 inch HD", "Resistance": "Auto-Follow", "Sound": "4 speakers"},
             "is_featured": True},
            {"name": "Yeti Tundra 45 Cooler", "brand": "Yeti", "price": 325.00, "category_idx": 3,
             "description": "Built for the wild. Keeps ice for days, not hours.",
             "image_url": "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=400",
             "specifications": {"Capacity": "45L", "Ice Retention": "5+ days", "Weight": "23 lbs"}},
            {"name": "Garmin Fenix 7", "brand": "Garmin", "price": 699.99, "compare_at_price": 799.99, "category_idx": 3,
             "description": "Rugged GPS smartwatch built for athletes who demand the best.",
             "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
             "specifications": {"Battery": "18 days", "GPS": "Multi-band", "Water Rating": "10 ATM"},
             "tags": ["sale"]},
            {"name": "TaylorMade Stealth Driver", "brand": "TaylorMade", "price": 579.99, "category_idx": 3,
             "description": "Carbon face technology for explosive distance off the tee.",
             "image_url": "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400",
             "specifications": {"Loft": "10.5", "Face": "60X Carbon Twist", "Adjustable": "Yes"}},
            
            # Books & Media
            {"name": "Kindle Paperwhite", "brand": "Amazon", "price": 139.99, "category_idx": 4,
             "description": "The best Kindle for reading with a flush-front design and warm light.",
             "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
             "specifications": {"Display": "6.8 inch 300ppi", "Storage": "8GB", "Battery": "Up to 10 weeks"},
             "is_featured": True},
            {"name": "PlayStation 5", "brand": "Sony", "price": 499.99, "category_idx": 4,
             "description": "Experience lightning-fast loading, haptic feedback, and 3D Audio.",
             "image_url": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400",
             "specifications": {"Storage": "825GB SSD", "Resolution": "Up to 8K", "Ray Tracing": "Yes"},
             "is_featured": True},
            {"name": "Nintendo Switch OLED", "brand": "Nintendo", "price": 349.99, "category_idx": 4,
             "description": "Vivid 7-inch OLED screen. Play at home or on the go.",
             "image_url": "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400",
             "specifications": {"Display": "7 inch OLED", "Storage": "64GB", "Battery": "4.5-9 hours"}},
        ]
        
        products = []
        for p_data in products_data:
            cat_idx = p_data.pop("category_idx")
            product = Product(
                **p_data,
                category_id=db_categories[cat_idx].id,
                merchant_id=merchant.id,
                stock=random.randint(10, 100),
                sku=f"SKU-{random.randint(10000, 99999)}"
            )
            db.add(product)
            db.flush()
            products.append(product)
        
        # Create sample customer
        customer = User(
            email="customer@example.com",
            full_name="John Doe",
            hashed_password=get_password_hash("customer123"),
            is_active=True,
            role=UserRole.CUSTOMER
        )
        db.add(customer)
        db.flush()
        
        # Create sample reviews
        review_comments = [
            ("Excellent product!", "Exceeded my expectations. Would definitely recommend to anyone looking for quality."),
            ("Great value", "Good quality for the price. Very happy with my purchase."),
            ("Solid choice", "Does exactly what it's supposed to do. No complaints."),
            ("Love it!", "This has become my go-to. Fantastic quality and fast shipping."),
            ("Good but...", "Overall good product but could be improved in some areas.")
        ]
        
        for product in products[:15]:  # Add reviews to first 15 products
            for i in range(random.randint(2, 5)):
                title, comment = random.choice(review_comments)
                review = Review(
                    user_id=customer.id,
                    product_id=product.id,
                    rating=random.randint(3, 5),
                    title=title,
                    comment=comment,
                    verified_purchase=random.choice([True, False])
                )
                db.add(review)
        
        db.commit()
        
        return {
            "message": "Setup completed successfully!",
            "users": {
                "admin": {"email": "admin@lumina.com", "password": "admin123"},
                "merchant": {"email": "merchant@lumina.com", "password": "merchant123"},
                "customer": {"email": "customer@example.com", "password": "customer123"}
            },
            "stats": {
                "categories": len(db_categories),
                "products": len(products),
                "reviews": "Sample reviews added"
            }
        }
    except Exception as e:
        db.rollback()
        import traceback
        return {"error": str(e), "traceback": traceback.format_exc()}

