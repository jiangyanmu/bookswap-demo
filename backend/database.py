from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Define the database URL. For SQLite, it's a file path.
# The database file 'bookswap.db' will be created in the same 'backend' directory.
SQLALCHEMY_DATABASE_URL = "sqlite:///./bookswap.db"

# 2. Create the SQLAlchemy engine.
# The 'connect_args' is needed only for SQLite to allow multi-threaded access.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. Create a SessionLocal class.
# Each instance of a SessionLocal will be a database session.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Create a Base class.
# We will inherit from this class to create each of the ORM models.
Base = declarative_base()

# 5. Dependency to get a DB session
# This function will be used in API endpoints to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
