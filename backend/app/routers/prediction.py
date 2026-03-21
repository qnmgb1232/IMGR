from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Prediction
from app.schemas import PredictionResponse, ApiResponse

router = APIRouter()

@router.get("/history", response_model=ApiResponse)
def get_history(limit: int = 20, db: Session = Depends(get_db)):
    records = db.query(Prediction).order_by(
        Prediction.predict_date.desc()
    ).limit(limit).all()
    return ApiResponse(data={"records": [r.__dict__ for r in records]})

@router.get("/latest", response_model=ApiResponse)
def get_latest(db: Session = Depends(get_db)):
    records = db.query(Prediction).order_by(
        Prediction.predict_date.desc()
    ).limit(5).all()
    return ApiResponse(data={"records": [r.__dict__ for r in records]})

@router.post("/generate", response_model=ApiResponse)
def generate_prediction(source: str = Query("manual"), db: Session = Depends(get_db)):
    return ApiResponse(message="预测生成功能待实现", data={"records": []})

@router.get("/{period}", response_model=ApiResponse)
def get_by_period(period: str, db: Session = Depends(get_db)):
    records = db.query(Prediction).filter(Prediction.period == period).all()
    return ApiResponse(data={"records": [r.__dict__ for r in records]})
