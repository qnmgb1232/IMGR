from sqlalchemy import Column, Integer, String, Date, Boolean, Text, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class LotteryHistory(Base):
    __tablename__ = "lottery_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    period = Column(String(20), unique=True, nullable=False, index=True)
    draw_date = Column(Date, nullable=False, index=True)
    red_balls = Column(Text, nullable=False)
    blue_ball = Column(Integer, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    period = Column(String(20), nullable=False, index=True)
    predict_date = Column(Date, nullable=False)
    red_balls = Column(Text, nullable=False)
    blue_ball = Column(Integer, nullable=False)
    source = Column(String(20), nullable=False)
    is_hit = Column(Boolean, nullable=True)
    hit_level = Column(String(20), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

class StatisticsCache(Base):
    __tablename__ = "statistics_cache"

    id = Column(Integer, primary_key=True, autoincrement=True)
    stat_type = Column(String(50), unique=True, nullable=False)
    data = Column(Text, nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now())