import logging
import json
import uuid
import datetime
import os
import threading
from collections import deque
from contextvars import ContextVar

import psutil
from fastapi import FastAPI, Request, Response
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from prometheus_client import Histogram, Counter, Gauge, make_asgi_app
from pythonjsonlogger import jsonlogger

# -------------------------------
# 1. 設定 Templates (Dashboard 前端)
# -------------------------------
# 請確保您的目錄下有 "templates" 資料夾，且裡面有 index.html
templates = Jinja2Templates(directory="templates")

# -------------------------------
# Context for trace_id
# -------------------------------
trace_id_var = ContextVar("trace_id", default=None)

# -------------------------------
# Dashboard Global State (新增：用於儲存給前端顯示的數據)
# -------------------------------
DASHBOARD_STATE = {
    "total_requests": 0,
    "total_errors": 0,
    "latest_latency_ms": 0,
    "logs": deque(maxlen=20)  # 只保留最新 20 筆日誌
}

# -------------------------------
# Custom Log Handler for Dashboard (新增：攔截日誌給前端)
# -------------------------------
class DashboardLogHandler(logging.Handler):
    """將日誌同時寫入記憶體，讓 Dashboard 可以即時讀取"""
    def emit(self, record):
        try:
            log_entry = self.format(record)
            log_obj = json.loads(log_entry)

            # 簡化格式
            simple_log = {
                "type": log_obj.get("level", "INFO"),
                "time": log_obj.get("timestamp", "").split("T")[-1].split(".")[0],
                "msg": log_obj.get("message", "")
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
# Configure Logger (修改：加入 DashboardHandler)
# -------------------------------
logger = logging.getLogger("bookswap-app")
logger.setLevel(os.getenv("LOG_LEVEL", "INFO").upper())

# 原本的 Console Handler
console_handler = logging.StreamHandler()
formatter = CustomJsonFormatter("%(timestamp)s %(level)s %(name)s %(message)s")
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

# 新增的 Dashboard Handler
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
        # 這裡的 interval=1 本身就會阻塞 1 秒，所以不需要額外的 sleep
        CPU_USAGE.set(psutil.cpu_percent(interval=1))

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
# Middleware for trace_id & Dashboard Stats (修改：加入數據統計)
# -------------------------------
@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    start_time = datetime.datetime.utcnow().timestamp()
    trace_id = str(uuid.uuid4())
    trace_id_var.set(trace_id)

    # Dashboard: 統計請求數
    DASHBOARD_STATE["total_requests"] += 1

    response = await call_next(request)

    process_time = datetime.datetime.utcnow().timestamp() - start_time

    # Dashboard: 統計延遲與錯誤
    DASHBOARD_STATE["latest_latency_ms"] = round(process_time * 1000, 2)
    if response.status_code >= 500:
        DASHBOARD_STATE["total_errors"] += 1

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

# 修改：根路徑回傳 Dashboard HTML
@app.get("/", tags=["Dashboard"], response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# 新增：Dashboard 數據 API
@app.get("/api/dashboard-stats", tags=["Dashboard"])
async def dashboard_stats():
    """提供給前端 polling 的 JSON 數據"""
    total = DASHBOARD_STATE["total_requests"]
    errors = DASHBOARD_STATE["total_errors"]

    # 計算可用性
    availability = 100.0
    if total > 0:
        availability = ((total - errors) / total) * 100

    cpu = CPU_USAGE._value.get()
    latency = DASHBOARD_STATE["latest_latency_ms"]

    # 簡易 Alert 邏輯
    alerts = []
    if cpu > 85:
        alerts.append({"level": "WARNING", "title": f"CPU High ({cpu}%)", "component": "Hosting Node"})
    if latency > 500:
        alerts.append({"level": "CRITICAL", "title": "High Latency", "component": "API Gateway"})
    if errors > 0 and (errors / total) > 0.05:
         alerts.append({"level": "CRITICAL", "title": "Error Rate > 5%", "component": "Auth/Bid Service"})

    return JSONResponse({
        "metrics": {
            "availability": round(availability, 2),
            "errorBudgetUsed": min(errors * 10, 100), # 模擬預算消耗
            "p95Latency": int(latency),
            "p95Threshold": 200,
            "cpuUsage": cpu,
            "cpuThreshold": 90,
        },
        "logs": list(DASHBOARD_STATE["logs"]),
        "alerts": alerts
    })

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)