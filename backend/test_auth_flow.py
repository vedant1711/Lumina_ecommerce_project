import requests
import sys

BASE_URL = "http://localhost:8000"

def test_flow():
    # 1. Login
    login_data = {
        "username": "verify@test.com", # Assumes this user exists from seed
        "password": "password"
    }
    print(f"Logging in with {login_data}...")
    try:
        r = requests.post(f"{BASE_URL}/auth/login", data=login_data)
        if r.status_code != 200:
            print(f"Login failed: {r.status_code} {r.text}")
            return
        
        token_data = r.json()
        token = token_data["access_token"]
        print(f"Got token: {token[:20]}...")
    except Exception as e:
        print(f"Login request error: {e}")
        return

    # 2. Add to Cart (Requires Auth)
    headers = {"Authorization": f"Bearer {token}"}
    cart_item = {"product_id": 1, "quantity": 1}
    
    print("Adding to cart...")
    try:
        r = requests.post(f"{BASE_URL}/cart/add", json=cart_item, headers=headers)
        if r.status_code == 200:
            print("Add to cart: SUCCESS")
        else:
            print(f"Add to cart failed: {r.status_code} {r.text}")
            
    except Exception as e:
        print(f"Cart request error: {e}")

if __name__ == "__main__":
    test_flow()
