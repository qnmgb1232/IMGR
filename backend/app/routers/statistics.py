from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse
from app.services.statistics import StatisticsService

router = APIRouter()

@router.get("/hot-cold", response_model=ApiResponse)
def get_hot_cold(periods: int = 50, db: Session = Depends(get_db)):
    service = StatisticsService(db)
    data = service.get_hot_cold_stats(periods)
    return ApiResponse(data=data)

@router.get("/trend", response_model=ApiResponse)
def get_trend(ball_type: str = "red", limit: int = 50, db: Session = Depends(get_db)):
    service = StatisticsService(db)
    data = service.get_trend_data(ball_type, limit)
    return ApiResponse(data={"records": data})

@router.get("/distribution", response_model=ApiResponse)
def get_distribution(ball_type: str = "red", db: Session = Depends(get_db)):
    service = StatisticsService(db)
    data = service.get_distribution(ball_type)
    return ApiResponse(data=data)
