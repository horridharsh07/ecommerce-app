from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Using SQLite for initial local development. Can migrate to Supabase Postgres later easily.
SQLALCHEMY_DATABASE_URL = "sqlite:///./luma_ecommerce.db" 

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
