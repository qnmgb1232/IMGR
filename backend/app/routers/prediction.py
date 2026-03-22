from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app.models import Prediction, LotteryHistory
from app.schemas import PredictionResponse, ApiResponse
from app.services.predictor import PredictorService

router = APIRouter()

def prediction_to_dict(pred):
    """将 Prediction 模型转换为字典"""
    return {
        "id": pred.id,
        "period": pred.period,
        "predict_date": pred.predict_date.isoformat() if pred.predict_date else None,
        "red_balls": pred.red_balls,
        "blue_ball": pred.blue_ball,
        "source": pred.source,
        "is_hit": pred.is_hit,
        "hit_level": pred.hit_level,
    }

@router.get("/history", response_model=ApiResponse)
def get_history(limit: int = 20, db: Session = Depends(get_db)):
    records = db.query(Prediction).order_by(
        Prediction.predict_date.desc()
    ).limit(limit).all()
    return ApiResponse(data={"records": [prediction_to_dict(r) for r in records]})

@router.get("/latest", response_model=ApiResponse)
def get_latest(db: Session = Depends(get_db)):
    records = db.query(Prediction).order_by(
        Prediction.predict_date.desc()
    ).limit(5).all()
    return ApiResponse(data={"records": [prediction_to_dict(r) for r in records]})

@router.post("/generate", response_model=ApiResponse)
def generate_prediction(source: str = Query("manual"), db: Session = Depends(get_db)):
    latest = db.query(LotteryHistory).order_by(
        LotteryHistory.draw_date.desc()
    ).first()

    if not latest:
        return ApiResponse(code=1, message="没有历史数据，无法预测", data={})

    year = latest.period[:4]  # 获取年份部分
    next_period_num = int(latest.period[-3:]) + 1
    next_period = f"{year}{next_period_num:03d}"

    service = PredictorService(db)
    predictions = service.generate_predictions(next_period, source)

    for p in predictions:
        p["predict_date"] = date.today()

    saved = service.save_predictions(predictions)

    return ApiResponse(
        message=f"生成了{len(predictions)}组预测",
        data={"predictions": predictions, "saved": saved}
    )

@router.get("/{period}", response_model=ApiResponse)
def get_by_period(period: str, db: Session = Depends(get_db)):
    records = db.query(Prediction).filter(Prediction.period == period).all()
    return ApiResponse(data={"records": [prediction_to_dict(r) for r in records]})

@router.get("/last/hit-result", response_model=ApiResponse)
def get_last_hit_result(db: Session = Depends(get_db)):
    """获取上期预测的中奖结果"""
    # 获取最新一期开奖
    latest_lottery = db.query(LotteryHistory).order_by(
        LotteryHistory.draw_date.desc()
    ).first()

    if not latest_lottery:
        return ApiResponse(data={"lottery": None, "predictions": []})

    # 获取上上期的预测（已开奖的那期）
    predictions = db.query(Prediction).filter(
        Prediction.period == latest_lottery.period
    ).all()

    # 检查中奖
    from app.services.hit_checker import HitCheckerService
    checker = HitCheckerService(db)

    results = []
    for pred in predictions:
        is_hit, hit_level = checker.check_hit(pred, latest_lottery)
        results.append({
            **prediction_to_dict(pred),
            "is_hit": is_hit,
            "hit_level": hit_level,
        })

    return ApiResponse(data={
        "lottery": {
            "period": latest_lottery.period,
            "draw_date": latest_lottery.draw_date.isoformat(),
            "red_balls": latest_lottery.red_balls,
            "blue_ball": latest_lottery.blue_ball,
        },
        "predictions": results
    })
