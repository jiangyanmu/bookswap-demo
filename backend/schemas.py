from pydantic import BaseModel
from typing import Optional

# Pydantic model (schema) for a Book
# This defines how a book should look in API requests and responses.
class Book(BaseModel):
    id: int
    title: str
    author: str
    price: Optional[float] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None

    # This config class tells Pydantic to work with ORM models,
    # allowing it to map SQLAlchemy model instances directly to this schema.
    class Config:
        from_attributes = True
