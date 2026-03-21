from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse

router = APIRouter()

@router.get("/hot-cold", response_model=ApiResponse)
def get_hot_cold(periods: int = 50, db: Session = Depends(get_db)):
    return ApiResponse(data={"red_balls": [], "blue_ball": []})

@router.get("/trend", response_model=ApiResponse)
def get_trend(ball_type: str = "red", limit: int = 50, db: Session = Depends(get_db)):
    return ApiResponse(data={"records": []})

@router.get("/distribution", response_model=ApiResponse)
def get_distribution(ball_type: str = "red", db: Session = Depends(get_db)):
    return ApiResponse(data={"balls": []})
