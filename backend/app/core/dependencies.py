from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            print(f"DEBUG: Token payload missing 'sub'. Payload: {payload}")
            raise credentials_exception
    except JWTError as e:
        print(f"DEBUG: JWT Decode Error: {e}")
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        print(f"DEBUG: User not found for email: {email}")
        raise credentials_exception
    return user
