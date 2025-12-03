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
from fastapi import FastAPI, Request, Response, HTTPException, Depends
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import Histogram, Counter, Gauge, make_asgi_app
from pythonjsonlogger import jsonlogger
from sqlalchemy.orm import Session

# Import new database modules
import models, schemas, crud
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
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Database Seeding on Startup ---
def seed_database():
    db = SessionLocal()
    # Check if the database is already seeded
    if db.query(models.Book).count() == 0:
        logger.info("Database is empty. Seeding initial book data...")
        seed_books = [
            {
                "id": 1,
                "title": "Designing Data-Intensive Applications",
                "author": "Martin Kleppmann",
                "price": 47.99,
                "description": "The big ideas behind reliable, scalable, and maintainable systems.",
                "cover_image": "https://images-na.ssl-images-amazon.com/images/I/91J9p5S2s0L.jpg",
            },
            {
                "id": 2,
                "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
                "author": "Robert C. Martin",
                "price": 35.50,
                "description": "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees.",
                "cover_image": "https://images-na.ssl-images-amazon.com/images/I/41xShlnlJiL._SX379_BO1,204,203,200_.jpg",
            },
            {
                "id": 3,
                "title": "Introduction to Algorithms",
                "author": "Thomas H. Cormen",
                "price": 95.25,
                "description": "The 'bible' of algorithms, a comprehensive textbook covering the full spectrum of modern algorithms.",
                "cover_image": "https://images-na.ssl-images-amazon.com/images/I/81maAFxDEtL.jpg",
            },
            {
                "id": 4,
                "title": "The Pragmatic Programmer: Your Journey to Mastery",
                "author": "David Thomas, Andrew Hunt",
                "price": 42.00,
                "description": "Examines the core of what it means to be a modern programmer, exploring topics ranging from personal responsibility and career development to architectural techniques.",
                "cover_image": "https://images-na.ssl-images-amazon.com/images/I/71f743sOPoL.jpg",
            },
            {
                "id": 5,
                "title": "Refactoring: Improving the Design of Existing Code",
                "author": "Martin Fowler",
                "price": 53.00,
                "description": "The classic guide to refactoring, updated with new examples and techniques.",
                "cover_image": "https://images-na.ssl-images-amazon.com/images/I/41odjX7oQpL._SX379_BO1,204,203,200_.jpg",
            },
        ]
        for book_data in seed_books:
            # Pydantic schema validation is not strictly needed here as we trust the seed data,
            # but it's good practice for consistency.
            book_schema = schemas.Book(**book_data)
            crud.create_book(db, book=book_schema)
        logger.info("Database seeded successfully.")
    else:
        logger.info("Database already contains data. Skipping seeding.")
    db.close()


@app.on_event("startup")
async def startup_event():
    seed_database()
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


@app.get("/api/books", response_model=List[schemas.Book], tags=["Books"])
async def get_all_books(db: Session = Depends(get_db)):
    """Returns a list of all available books from the database."""
    books = crud.get_books(db)
    return books


@app.get("/api/books/{book_id}", response_model=schemas.Book, tags=["Books"])
async def get_book_by_id(book_id: int, db: Session = Depends(get_db)):
    """Returns a single book by its ID from the database."""
    db_book = crud.get_book(db, book_id=book_id)
    if db_book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return db_book


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


@app.post("/login", tags=["Authentication"])
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


@BID_LATENCY.time()
@app.post("/bid", tags=["Bidding"])
def place_bid(book_id: int, amount: float):
    logger.info(
        f"Received bid for book_id {book_id} with amount {amount}",
        extra={"props": {"book_id": book_id, "amount": amount}},
    )
    if ONE_CLICK_BID_ENABLED:
        logger.info("Processing with 'One-Click Bid' flow (Feature ON)")
        threading.Event().wait(0.05)
    else:
        logger.info("Processing with 'Traditional Bid' flow (Feature OFF)")
        threading.Event().wait(0.3)
    try:
        logger.info("Connecting to database to save bid...")
        if book_id == 999:
            threading.Event().wait(2)
            raise ConnectionError("DB Timeout while saving bid")
        threading.Event().wait(0.2)
        logger.info("Successfully saved bid to database.")
    except ConnectionError as e:
        logger.error(
            f"Failed to save bid for book_id {book_id}",
            extra={"props": {"book_id": book_id, "error": str(e), "is_timeout": True}},
        )
        return Response(
            content=json.dumps({"error": "Database operation failed"}),
            status_code=503,
            media_type="application/json",
        )
    return {"message": f"Bid for book {book_id} of ${amount} placed successfully."}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
