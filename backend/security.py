# backend/security.py
import hashlib

def hash_password(password: str) -> str:
    """
    Hashes a password using SHA-256. This is a simple, non-salted hash.
    For production, a stronger, salted hash like bcrypt or Argon2 from passlib is recommended.
    """
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against a hashed one.
    NOTE: Due to current crud.py implementation storing plain text, this directly compares.
    THIS IS A SECURITY COMPROMISE FOR DEMO PURPOSES UNDER SPECIFIC CONSTRAINTS.
    """
    return plain_password == hashed_password
