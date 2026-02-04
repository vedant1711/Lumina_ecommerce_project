from sqlalchemy import create_engine, MetaData, Table, select
from sqlalchemy.orm import sessionmaker
import sys
import os

# Add parent directory to path to import app modules if needed, 
# but for raw SQL access we just need the DB file.
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

# Assuming SQLite for now based on recent context
DATABASE_URL = "sqlite:///./sql_app.db"
engine = create_engine(DATABASE_URL)
metadata = MetaData()
metadata.reflect(bind=engine)

def print_table(table_name):
    if table_name not in metadata.tables:
        print(f"Table '{table_name}' does not exist.")
        return

    table = metadata.tables[table_name]
    with engine.connect() as conn:
        result = conn.execute(select(table)).fetchall()
        print(f"\n--- Table: {table_name} ---")
        if not result:
            print("(Empty)")
        else:
            # Print headers
            print(" | ".join(table.columns.keys()))
            for row in result:
                print(row)

if __name__ == "__main__":
    print("=== Database State Inspection ===")
    print_table("users")
    print_table("products")
    print_table("cart_items") # If this exists in DB, or we check Redis? 
    # Wait, cart is in Redis. I should check Redis too if possible, 
    # but the user asked for "Database tables". 
    # I'll check 'orders' and 'order_items' too.
    print_table("orders")
    print_table("order_items")
    print("===============================")
