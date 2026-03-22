from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_tables
from app.config import settings
from app.routers import lottery, prediction, statistics, crawler, settings
from app.schemas import ApiResponse
from app.scheduler import setup_scheduler, start_scheduler, stop_scheduler

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(lottery.router, prefix="/api/lottery", tags=["lottery"])
app.include_router(prediction.router, prefix="/api/prediction", tags=["prediction"])
app.include_router(statistics.router, prefix="/api/statistics", tags=["statistics"])
app.include_router(crawler.router, prefix="/api/crawler", tags=["crawler"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])

@app.on_event("startup")
def startup_event():
    create_tables()
    setup_scheduler()
    start_scheduler()

@app.on_event("shutdown")
def shutdown_event():
    stop_scheduler()

@app.get("/api/health", response_model=ApiResponse)
def health_check():
    return ApiResponse(data={"status": "ok", "app": settings.app_name})

@app.get("/")
def root():
    return {"message": "IMGR API", "docs": "/docs"}
