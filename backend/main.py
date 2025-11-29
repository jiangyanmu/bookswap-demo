import logging
import json
import uuid
import datetime
import os
import threading
from contextvars import ContextVar

import psutil
from fastapi import FastAPI, Request, Response
from prometheus_client import Histogram, Counter, Gauge, make_asgi_app
from pythonjsonlogger import jsonlogger

# -------------------------------
# Context for trace_id
# -------------------------------
trace_id_var = ContextVar("trace_id", default=None)


# -------------------------------
# Custom JSON Formatter
# -------------------------------
class CustomJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super().add_fields(log_record, record, message_dict)
        if not log_record.get("timestamp"):
            # 使用 datetime 支援毫秒
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
log_handler = logging.StreamHandler()
formatter = CustomJsonFormatter("%(timestamp)s %(level)s %(name)s %(message)s")
log_handler.setFormatter(formatter)
logger.addHandler(log_handler)
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
        threading.Event().wait(5)  # sleep 5s


cpu_thread = threading.Thread(target=update_cpu_usage, daemon=True)
cpu_thread.start()

# -------------------------------
# Feature Toggles
# -------------------------------
ONE_CLICK_BID_ENABLED = os.getenv("ONE_CLICK_BID_ENABLED", "true").lower() == "true"

# -------------------------------
# FastAPI App
# -------------------------------
app = FastAPI(title="BookSwap Backend")

logger.info(
    "Starting BookSwap backend",
    extra={"props": {"one_click_bid_enabled": ONE_CLICK_BID_ENABLED}},
)


# -------------------------------
# Middleware for trace_id
# -------------------------------
@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    start_time = datetime.datetime.utcnow().timestamp()
    trace_id = str(uuid.uuid4())
    trace_id_var.set(trace_id)

    response = await call_next(request)

    process_time = datetime.datetime.utcnow().timestamp() - start_time
    log_extra = {
        "props": {
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "process_time_ms": round(process_time * 1000, 2),
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
@app.get("/", tags=["Health Check"])
def read_root():
    return {"status": "ok", "service": "bookswap-backend"}


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
        threading.Event().wait(0.3)  # simulate multi-step fallback

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
