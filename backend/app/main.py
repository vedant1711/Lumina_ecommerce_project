from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(title="E-Commerce API", version="1.0.0")

# Setup Prometheus instrumentation
Instrumentator().instrument(app).expose(app)

@app.get("/")
def read_root():
    return {"message": "Welcome to the E-Commerce API", "status": "operational"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
