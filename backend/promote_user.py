from sqlalchemy import create_engine, update
from sqlalchemy.orm import sessionmaker
from app.models.user import User
import sys
import os

# Add parent directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

DATABASE_URL = "sqlite:///./sql_app.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def promote_user(email):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"User {email} not found.")
            return
        
        user.is_superuser = True
        db.commit()
        print(f"User {email} promoted to superuser.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # Promote the user we created in verification
    promote_user("verify@test.com")
