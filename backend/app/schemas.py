from pydantic import BaseModel
from datetime import date
from typing import Optional, List

class LotteryHistoryBase(BaseModel):
    period: str
    draw_date: date
    red_balls: str
    blue_ball: int

class LotteryHistoryResponse(LotteryHistoryBase):
    id: int
    created_at: Optional[date] = None

    class Config:
        from_attributes = True

class PredictionBase(BaseModel):
    period: str
    predict_date: date
    red_balls: str
    blue_ball: int
    source: str

class PredictionResponse(PredictionBase):
    id: int
    is_hit: Optional[bool] = None
    hit_level: Optional[str] = None
    created_at: Optional[date] = None

    class Config:
        from_attributes = True

class ApiResponse(BaseModel):
    code: int = 0
    message: str = "success"
    data: Optional[dict] = None