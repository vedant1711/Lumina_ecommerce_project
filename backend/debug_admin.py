from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.core.security import verify_password, get_password_hash
import sys
import os

DATABASE_URL = "sqlite:///./sql_app.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_admin():
    db = SessionLocal()
    email = "verify@test.com"
    password = "password"
    
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        print(f"User {email} NOT FOUND in database!")
        # Create it if missing
        print("Creating admin user now...")
        admin = User(
            email=email,
            full_name="Admin User",
            hashed_password=get_password_hash(password),
            is_active=True,
            is_superuser=True
        )
        db.add(admin)
        db.commit()
        print("Admin user created.")
        return

    print(f"User found: ID={user.id}, Superuser={user.is_superuser}")
    
    if verify_password(password, user.hashed_password):
        print("Password check: VALID")
    else:
        print("Password check: INVALID")
        print(f"Stored hash start: {user.hashed_password[:10]}")
        # Reset password
        print("Resetting password...")
        user.hashed_password = get_password_hash(password)
        db.commit()
        print("Password reset to 'password'.")

if __name__ == "__main__":
    check_admin()
