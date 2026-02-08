from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app import database
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserResponse, Token, MerchantCreate
from app.core import security
from app.core.config import settings
from app.core.dependencies import get_current_user

router = APIRouter(tags=["Authentication"])

@router.post("/signup", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(database.get_db)):
    """Register a new customer account."""
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = security.get_password_hash(user.password)
    new_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role if hasattr(user, 'role') else UserRole.CUSTOMER
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/signup/merchant", response_model=UserResponse)
def create_merchant(merchant: MerchantCreate, db: Session = Depends(database.get_db)):
    """Register a new merchant account."""
    db_user = db.query(User).filter(User.email == merchant.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = security.get_password_hash(merchant.password)
    new_user = User(
        email=merchant.email,
        hashed_password=hashed_password,
        full_name=merchant.full_name,
        role=UserRole.MERCHANT,
        store_name=merchant.store_name,
        store_description=merchant.store_description
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    """Login and get access token with user info."""
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    password_valid = security.verify_password(form_data.password, user.hashed_password)
    
    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_active": user.is_active,
            "role": user.role,
            "store_name": user.store_name
        }
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current logged-in user info."""
    return current_user

@router.put("/me", response_model=UserResponse)
def update_current_user(
    full_name: str = None,
    store_name: str = None,
    store_description: str = None,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user profile."""
    if full_name:
        current_user.full_name = full_name
    if store_name and current_user.role == UserRole.MERCHANT:
        current_user.store_name = store_name
    if store_description and current_user.role == UserRole.MERCHANT:
        current_user.store_description = store_description
    
    db.commit()
    db.refresh(current_user)
    return current_user
