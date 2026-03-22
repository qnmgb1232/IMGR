from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse
from app.models import Prediction, LotteryHistory
from app.services.hit_checker import HitCheckerService

router = APIRouter()

@router.get("/history", response_model=ApiResponse)
def get_prediction_history(limit: int = 50, db: Session = Depends(get_db)):
    """获取往期预测历史"""
    records = db.query(Prediction).order_by(
        Prediction.predict_date.desc(),
        Prediction.period.desc()
    ).limit(limit).all()

    results = []
    for pred in records:
        # 获取对应的开奖号码
        lottery = db.query(LotteryHistory).filter(
            LotteryHistory.period == pred.period
        ).first()

        is_hit = pred.is_hit
        hit_level = pred.hit_level

        results.append({
            "id": pred.id,
            "period": pred.period,
            "predict_date": pred.predict_date.isoformat() if pred.predict_date else None,
            "red_balls": pred.red_balls,
            "blue_ball": pred.blue_ball,
            "source": pred.source,
            "is_hit": is_hit,
            "hit_level": hit_level,
            "lottery_red": lottery.red_balls if lottery else None,
            "lottery_blue": lottery.blue_ball if lottery else None,
            "lottery_date": lottery.draw_date.isoformat() if lottery else None,
        })

    return ApiResponse(data={"records": results})

@router.get("/periods", response_model=ApiResponse)
def get_available_periods(db: Session = Depends(get_db)):
    """获取有预测记录的期号列表"""
    periods = db.query(Prediction.period).distinct().order_by(
        Prediction.period.desc()
    ).all()

    return ApiResponse(data={"periods": [p[0] for p in periods]})

@router.get("/by-period/{period}", response_model=ApiResponse)
def get_predictions_by_period(period: str, db: Session = Depends(get_db)):
    """获取指定期号的预测和中奖结果"""
    predictions = db.query(Prediction).filter(
        Prediction.period == period
    ).all()

    lottery = db.query(LotteryHistory).filter(
        LotteryHistory.period == period
    ).first()

    results = []
    for pred in predictions:
        results.append({
            "id": pred.id,
            "period": pred.period,
            "predict_date": pred.predict_date.isoformat() if pred.predict_date else None,
            "red_balls": pred.red_balls,
            "blue_ball": pred.blue_ball,
            "source": pred.source,
            "is_hit": pred.is_hit,
            "hit_level": pred.hit_level,
        })

    return ApiResponse(data={
        "lottery": {
            "period": lottery.period,
            "draw_date": lottery.draw_date.isoformat(),
            "red_balls": lottery.red_balls,
            "blue_ball": lottery.blue_ball,
        } if lottery else None,
        "predictions": results
    })
