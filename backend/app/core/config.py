"""
Centralised application settings loaded from environment / .env file.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "luma_candles"

    # JWT
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Admin email — the single email that gets admin privileges
    ADMIN_EMAIL: str = "admin@lumacandles.in"

    # Razorpay
    RAZORPAY_KEY_ID: str = "rzp_test_dummykey123"
    RAZORPAY_KEY_SECRET: str = "dummysecret123"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
