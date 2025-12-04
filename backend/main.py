import logging
import json
import uuid
import datetime
import os
import threading
from collections import deque
from contextvars import ContextVar
from typing import List

import psutil
from fastapi import FastAPI, Request, Response, HTTPException, Depends, status
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import Histogram, Counter, Gauge, make_asgi_app
from pythonjsonlogger import jsonlogger
from sqlalchemy.orm import Session
from pydantic import BaseModel

# Import database modules
import models, schemas, crud, security
from database import SessionLocal, engine, get_db


# --- Database Initialization ---
# Create all database tables based on the models
models.Base.metadata.create_all(bind=engine)

# -------------------------------
# 1. 設定 Templates (Dashboard 前端)
# -------------------------------
templates = Jinja2Templates(directory="templates")

# -------------------------------
# Context for trace_id
# -------------------------------
trace_id_var = ContextVar("trace_id", default=None)

# -------------------------------
# Dashboard Global State
# -------------------------------
DASHBOARD_STATE = {
    "total_requests": 0,
    "total_errors": 0,
    "latest_latency_ms": 0,
    "logs": deque(maxlen=20),
}


# -------------------------------
# Custom Log Handler for Dashboard
# -------------------------------
class DashboardLogHandler(logging.Handler):
    def emit(self, record):
        try:
            log_entry = self.format(record)
            log_obj = json.loads(log_entry)
            simple_log = {
                "type": log_obj.get("level", "INFO"),
                "time": log_obj.get("timestamp", "").split("T")[-1].split(".")[0],
                "msg": log_obj.get("message", ""),
            }
            DASHBOARD_STATE["logs"].appendleft(simple_log)
        except Exception:
            self.handleError(record)


# -------------------------------
# Custom JSON Formatter
# -------------------------------
class CustomJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super().add_fields(log_record, record, message_dict)
        if not log_record.get("timestamp"):
            log_record["timestamp"] = datetime.datetime.utcfromtimestamp(
                record.created
            ).strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        if not log_record.get("level"):
            log_record["level"] = record.levelname.upper()
        else:
            log_record["level"] = log_record["level"].upper()
        trace_id = trace_id_var.get()
        if trace_id:
            log_record["trace_id"] = trace_id


# -------------------------------
# Configure Logger
# -------------------------------
logger = logging.getLogger("bookswap-app")
logger.setLevel(os.getenv("LOG_LEVEL", "INFO").upper())
console_handler = logging.StreamHandler()
formatter = CustomJsonFormatter("%(timestamp)s %(level)s %(name)s %(message)s")
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)
dashboard_handler = DashboardLogHandler()
dashboard_handler.setFormatter(formatter)
logger.addHandler(dashboard_handler)
logger.propagate = False

# -------------------------------
# Prometheus Metrics
# -------------------------------
BID_LATENCY = Histogram(
    "bookswap_bid_latency_seconds", "Latency of the bid flow in seconds"
)
LOGIN_ERRORS = Counter(
    "bookswap_login_errors_total", "Total number of login errors", ["error_code"]
)
CPU_USAGE = Gauge(
    "bookswap_cpu_usage_percent", "Current CPU usage of the application host"
)


def update_cpu_usage():
    while True:
        CPU_USAGE.set(psutil.cpu_percent(interval=1))


cpu_thread = threading.Thread(target=update_cpu_usage, daemon=True)
cpu_thread.start()

# -------------------------------
# Feature Toggles & Constants
# -------------------------------
ONE_CLICK_BID_ENABLED = os.getenv("ONE_CLICK_BID_ENABLED", "true").lower() == "true"
LATENCY_THRESHOLD_MS = 500

# -------------------------------
# FastAPI App
# -------------------------------
app = FastAPI(title="BookSwap Backend")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Simple Token Model ---
class SimpleToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --- Auth Dependencies ---
async def get_current_user_simple(request: Request, db: Session = Depends(get_db)):
    auth_token = request.headers.get("X-Auth-Token")
    if not auth_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )
    try:
        username, role = auth_token.split(":", 1)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token format"
        )

    user = crud.get_user_by_username(db, username=username)
    if not user or user.role != role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    return user


async def get_current_seller_simple(
    current_user: models.User = Depends(get_current_user_simple),
):
    if current_user.role != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Seller role required"
        )
    return current_user


# --- Database Seeding on Startup ---
@app.on_event("startup")
async def startup_event():
    db = SessionLocal()
    if db.query(models.User).count() == 0:
        logger.info("Database is empty. Seeding initial users and books...")
        # Create default users
        seller = crud.create_user(
            db,
            schemas.UserCreate(
                username="seller",
                email="seller@example.com",
                password="password",
                role="seller",
            ),
        )
        buyer = crud.create_user(
            db,
            schemas.UserCreate(
                username="buyer",
                email="buyer@example.com",
                password="password",
                role="buyer",
            ),
        )

        # Create default books
        seed_books = [
            {
                "title": "富爸爸，窮爸爸【25週年紀念版】",
                "author": "羅勃特．T．清崎",
                "price": 331,
                "description": "This is a book about financial education.",
                "cover_image": "https://im1.book.com.tw/image/getImage?i=https://www.books.com.tw/img/001/093/54/0010935466.jpg&v=631872bdk&w=348&h=348",
                "current_bid": 150.0,
                "starting_bid": 100.0,
                "bid_increment": 10.0,
            },
            {
                "title": "張忠謀自傳全集",
                "author": "張忠謀",
                "price": 825,
                "description": "The autobiography of Morris Chang, founder of TSMC.",
                "cover_image": "https://im2.book.com.tw/image/getImage?i=https://www.books.com.tw/img/001/100/55/0011005571.jpg&v=672b7d6ck&w=348&h=348",
                "current_bid": 400.0,
                "starting_bid": 300.0,
                "bid_increment": 50.0,
            },
        ]
        for book_data in seed_books:
            crud.create_book(db, schemas.BookCreate(**book_data), owner_id=seller.id)
        logger.info("Database seeded successfully.")
    else:
        logger.info("Database already contains data.")
    db.close()

    logger.info(
        "Starting BookSwap backend",
        extra={"props": {"one_click_bid_enabled": ONE_CLICK_BID_ENABLED}},
    )


# -------------------------------
# Middleware for trace_id & Dashboard Stats
# -------------------------------
@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    start_time = datetime.datetime.utcnow().timestamp()
    trace_id = str(uuid.uuid4())
    trace_id_var.set(trace_id)
    DASHBOARD_STATE["total_requests"] += 1
    response = await call_next(request)
    process_time = datetime.datetime.utcnow().timestamp() - start_time
    process_time_ms = round(process_time * 1000, 2)
    DASHBOARD_STATE["latest_latency_ms"] = process_time_ms
    if response.status_code >= 500:
        DASHBOARD_STATE["total_errors"] += 1
        logger.warning(
            f"Server error detected for {request.url.path} with status {response.status_code}",
            extra={
                "props": {
                    "event": "server_error",
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "trace_id": trace_id,
                }
            },
        )
    if process_time_ms > LATENCY_THRESHOLD_MS:
        logger.warning(
            f"High latency detected for {request.url.path}: {process_time_ms}ms > {LATENCY_THRESHOLD_MS}ms",
            extra={
                "props": {
                    "event": "high_latency",
                    "path": request.url.path,
                    "latency_ms": process_time_ms,
                    "threshold_ms": LATENCY_THRESHOLD_MS,
                    "trace_id": trace_id,
                }
            },
        )
    log_extra = {
        "props": {
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "process_time_ms": process_time_ms,
        }
    }
    logger.info(
        f"{request.method} {request.url.path} - {response.status_code}", extra=log_extra
    )
    response.headers["X-Trace-ID"] = trace_id
    return response


# -------------------------------
# Mount Prometheus /metrics
# -------------------------------
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# -------------------------------
# API Endpoints
# -------------------------------


# --- New Auth Endpoints ---
@app.post("/api/login", response_model=SimpleToken, tags=["Authentication"])
def simple_login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, username=login_data.username)
    if not user or not security.verify_password(
        login_data.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    return SimpleToken(access_token=f"{user.username}:{user.role}")


@app.post("/api/users/", response_model=schemas.User, tags=["Users"])
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if crud.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db, user)


@app.get("/api/users/me", response_model=schemas.User, tags=["Users"])
def read_users_me(current_user: models.User = Depends(get_current_user_simple)):
    return current_user


# --- Book Endpoints ---
@app.post("/api/books/", response_model=schemas.Book, tags=["Books"])
def create_book(
    book: schemas.BookCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_seller_simple),
):
    return crud.create_book(db, book, current_user.id)


@app.get("/api/books/", response_model=List[schemas.Book], tags=["Books"])
def read_books(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_books(db, skip=skip, limit=limit)


@app.get("/api/books/{book_id}", response_model=schemas.Book, tags=["Books"])
def read_book(book_id: int, db: Session = Depends(get_db)):
    db_book = crud.get_book(db, book_id=book_id)
    if db_book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return db_book


# --- Original Endpoints (Preserved) ---


@app.get("/", tags=["Dashboard"], response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/api/dashboard-stats", tags=["Dashboard"])
async def dashboard_stats():
    total = DASHBOARD_STATE["total_requests"]
    errors = DASHBOARD_STATE["total_errors"]
    availability = ((total - errors) / total) * 100 if total > 0 else 100.0
    cpu = CPU_USAGE._value.get()
    latency = DASHBOARD_STATE["latest_latency_ms"]
    alerts = []
    if cpu > 85:
        alerts.append(
            {
                "level": "WARNING",
                "title": f"CPU High ({cpu}%)",
                "component": "Hosting Node",
            }
        )
    if latency > 500:
        alerts.append(
            {"level": "CRITICAL", "title": "High Latency", "component": "API Gateway"}
        )
    if errors > 0 and (errors / total) > 0.05:
        alerts.append(
            {
                "level": "CRITICAL",
                "title": "Error Rate > 5%",
                "component": "Auth/Bid Service",
            }
        )
    return JSONResponse(
        {
            "metrics": {
                "availability": round(availability, 2),
                "errorBudgetUsed": min(errors * 10, 100),
                "p95Latency": int(latency),
                "p95Threshold": 200,
                "cpuUsage": cpu,
                "cpuThreshold": 90,
            },
            "logs": list(DASHBOARD_STATE["logs"]),
            "alerts": alerts,
        }
    )


@app.post("/login", tags=["Authentication (Old)"])
def login(password: str):
    if password != "correct-password":
        LOGIN_ERRORS.labels(error_code="401_INVALID_PASSWORD").inc()
        logger.warning(
            "Failed login attempt", extra={"props": {"reason": "Invalid password"}}
        )
        return Response(
            content=json.dumps({"error": "Invalid credentials"}),
            status_code=401,
            media_type="application/json",
        )
    logger.info("Successful login")
    return {"message": "Login successful"}


class BidCreate(BaseModel):
    book_id: int
    amount: float


@BID_LATENCY.time()
@app.post("/bid", tags=["Bidding"])
def place_bid(bid: BidCreate, db: Session = Depends(get_db)):
    book_id = bid.book_id
    amount = bid.amount
    logger.info(
        f"Received bid for book_id {book_id} with amount {amount}",
        extra={"props": {"book_id": book_id, "amount": amount}},
    )

    # 1. Find the book
    book = crud.get_book(db, book_id=book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # 2. Simulate processing delay based on feature flag (Optional: keep or remove based on preference, keeping for consistency with latency metrics)
    if ONE_CLICK_BID_ENABLED:
        logger.info("Processing with 'One-Click Bid' flow (Feature ON)")
        threading.Event().wait(0.05)
    else:
        logger.info("Processing with 'Traditional Bid' flow (Feature OFF)")
        threading.Event().wait(0.3)

    # 3. Validation Logic
    # Rule 1: Bid cannot be higher than Buy Now price
    if amount > book.price:
        logger.warning(f"Bid ${amount} exceeds buy now price ${book.price}")
        raise HTTPException(
            status_code=400,
            detail=f"Bid cannot be higher than the Buy Now price of ${book.price}",
        )

    # Rule 2: Check against Starting Bid or Increment
    current_highest = book.current_bid if book.current_bid else 0.0

    if current_highest == 0.0:
        # First bid logic
        if amount < book.starting_bid:
            logger.warning(
                f"Bid ${amount} is lower than starting bid ${book.starting_bid}"
            )
            raise HTTPException(
                status_code=400,
                detail=f"Bid must be at least the starting bid of ${book.starting_bid}",
            )
    else:
        # Subsequent bid logic
        min_next_bid = current_highest + book.bid_increment
        # Allow if amount is exactly the Buy Now price (even if increment rule would push it over, usually Buy Now overrides)
        # But based on user rule "not greater than price", and normal increment logic:
        if amount < min_next_bid and amount != book.price:
            logger.warning(
                f"Bid ${amount} is lower than min increment. Needed: ${min_next_bid}"
            )
            raise HTTPException(
                status_code=400,
                detail=f"Bid must be at least ${min_next_bid} (Current bid ${current_highest} + Increment ${book.bid_increment})",
            )

    try:
        logger.info("Connecting to database to save bid...")

        book.current_bid = amount
        db.commit()
        db.refresh(book)
        logger.info(f"Successfully updated bid to ${amount} for book {book_id}.")

    except Exception as e:
        logger.error(
            f"Failed to save bid for book_id {book_id}",
            extra={"props": {"book_id": book_id, "error": str(e)}},
        )
        return Response(
            content=json.dumps({"error": "Database operation failed"}),
            status_code=503,
            media_type="application/json",
        )

    return {
        "message": f"Bid for book {book_id} of ${amount} placed successfully.",
        "current_bid": book.current_bid,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
