from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator
from app.database import engine, Base
from app.routers import auth, product, cart, order, admin

# Create tables (simple init, use alembic for migrations in prod)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="E-Commerce API", version="1.0.0")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Prometheus instrumentation
Instrumentator().instrument(app).expose(app)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(product.router)
app.include_router(cart.router)
app.include_router(order.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the E-Commerce API", "status": "operational"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
