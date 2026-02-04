from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
import sys
import os
import argparse

# Add parent directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

DATABASE_URL = "sqlite:///./sql_app.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def manage_admin(email, action):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"User {email} not found.")
            return
        
        if action == "promote":
            user.is_superuser = True
            print(f"User {email} promoted to Admin.")
        elif action == "demote":
            user.is_superuser = False
            print(f"User {email} demoted from Admin.")
            
        db.commit()
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Manage Admin Users")
    parser.add_argument("--email", required=True, help="User email")
    parser.add_argument("--action", required=True, choices=["promote", "demote"], help="Action to perform")
    
    args = parser.parse_args()
    manage_admin(args.email, args.action)
