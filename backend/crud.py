from sqlalchemy.orm import Session
import models, schemas

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

def create_book(db: Session, book: schemas.Book):
    """
    Creates a new book record in the database.
    Note: This is an example and not used by the current GET-only endpoints,
    but it's good practice to have it.
    """
    db_book = models.Book(
        id=book.id,
        title=book.title,
        author=book.author,
        price=book.price,
        description=book.description,
        cover_image=book.cover_image
    )
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book
