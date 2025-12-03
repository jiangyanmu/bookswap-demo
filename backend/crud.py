from sqlalchemy.orm import Session
import models, schemas, security

# --- User CRUD ---

def get_user_by_username(db: Session, username: str):
    """Fetches a user by their username."""
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    """Fetches a user by their email."""
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    """Creates a new user and hashes their password using the simple hasher."""
    hashed_password = user.password
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Book CRUD ---

def get_book(db: Session, book_id: int):
    """
    Fetches a single book from the database by its ID.
    """
    return db.query(models.Book).filter(models.Book.id == book_id).first()

def get_books(db: Session, skip: int = 0, limit: int = 100):
    """
    Fetches a list of books from the database with optional pagination.
    """
    return db.query(models.Book).offset(skip).limit(limit).all()

def create_book(db: Session, book: schemas.BookCreate, owner_id: int):
    """
    Creates a new book record in the database and associates it with an owner.
    """
    db_book = models.Book(**book.dict(), owner_id=owner_id)
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book
