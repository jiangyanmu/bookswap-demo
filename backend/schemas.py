from pydantic import BaseModel
from typing import Optional, List

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    email: str
    role: str = "buyer" # Default to buyer

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True

# --- Book Schemas ---
class BookBase(BaseModel):
    title: str
    author: str
    price: Optional[float] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None

class BookCreate(BookBase):
    pass

class Book(BookBase):
    id: int
    owner_id: int
    # We can optionally include the full owner object here if needed, 
    # but for now keeping it simple to avoid circular dependency issues if any.
    # owner: User 

    class Config:
        from_attributes = True
