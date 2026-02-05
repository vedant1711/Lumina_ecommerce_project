from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "E-Commerce API"
    SECRET_KEY: str = "YOUR_SECRET_KEY_HERE_CHANGE_IN_PROD" # TODO: Change this
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours for dev convenience
    DATABASE_URL: str = "postgresql://user:password@db:5432/ecommerce_db"

    class Config:
        env_file = ".env"

settings = Settings()
