from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app import database
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token
from app.core import security
from app.core.config import settings

router = APIRouter(tags=["Authentication"])

@router.post("/signup", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = security.get_password_hash(user.password)
    new_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    # Note: OAuth2PasswordRequestForm expects username field, so we just use email as username
    print(f"DEBUG LOGIN: Attempting login for username: {form_data.username}")
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user:
        print(f"DEBUG LOGIN: User not found for email: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"DEBUG LOGIN: User found. ID={user.id}, Email={user.email}")
    print(f"DEBUG LOGIN: Stored hash (first 20 chars): {user.hashed_password[:20]}")
    
    password_valid = security.verify_password(form_data.password, user.hashed_password)
    print(f"DEBUG LOGIN: Password verification result: {password_valid}")
    
    if not password_valid:
        print(f"DEBUG LOGIN: Password verification FAILED")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
