from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import LotteryHistory
from app.schemas import LotteryHistoryResponse, ApiResponse

router = APIRouter()

def record_to_dict(record):
    """将 SQLAlchemy 模型转换为字典，排除内部属性"""
    return {
        "id": record.id,
        "period": record.period,
        "draw_date": record.draw_date.isoformat() if record.draw_date else None,
        "red_balls": record.red_balls,
        "blue_ball": record.blue_ball,
    }

@router.get("/history", response_model=ApiResponse)
def get_history(limit: int = 20, offset: int = 0, db: Session = Depends(get_db)):
    records = db.query(LotteryHistory).order_by(
        LotteryHistory.draw_date.desc()
    ).limit(limit).offset(offset).all()
    return ApiResponse(
        data={"records": [record_to_dict(r) for r in records], "total": db.query(LotteryHistory).count()}
    )

@router.get("/latest", response_model=ApiResponse)
def get_latest(db: Session = Depends(get_db)):
    record = db.query(LotteryHistory).order_by(
        LotteryHistory.draw_date.desc()
    ).first()
    if not record:
        return ApiResponse(data={"record": None})
    return ApiResponse(data={"record": record_to_dict(record)})

@router.get("/{period}", response_model=ApiResponse)
def get_by_period(period: str, db: Session = Depends(get_db)):
    record = db.query(LotteryHistory).filter(LotteryHistory.period == period).first()
    if not record:
        raise HTTPException(status_code=404, detail="期号不存在")
    return ApiResponse(data={"record": record_to_dict(record)})
