from typing import Optional
from pydantic import BaseModel, EmailStr
from enum import Enum

class UserRole(str, Enum):
    CUSTOMER = "customer"
    MERCHANT = "merchant"
    ADMIN = "admin"

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.CUSTOMER

class MerchantCreate(UserBase):
    password: str
    store_name: str
    store_description: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    role: UserRole
    store_name: Optional[str] = None

    class Config:
        from_attributes = True

class UserRoleUpdate(BaseModel):
    role: UserRole

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[UserResponse] = None

class TokenData(BaseModel):
    email: Optional[str] = None
