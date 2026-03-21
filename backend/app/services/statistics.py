"""统计分析服务"""
from typing import Dict, List
from collections import Counter
from sqlalchemy.orm import Session
from app.models import LotteryHistory

class StatisticsService:
    """双色球统计分析"""

    def __init__(self, db: Session):
        self.db = db

    def get_recent_records(self, limit: int = 50) -> List[LotteryHistory]:
        return self.db.query(LotteryHistory).order_by(
            LotteryHistory.draw_date.desc()
        ).limit(limit).all()

    def get_hot_cold_stats(self, periods: int = 50) -> Dict:
        records = self.get_recent_records(periods)

        red_counter = Counter()
        blue_counter = Counter()

        for record in records:
            for ball in record.red_balls.split(","):
                red_counter[int(ball)] += 1
            blue_counter[record.blue_ball] += 1

        red_hot = sorted(red_counter.items(), key=lambda x: x[1], reverse=True)
        blue_hot = sorted(blue_counter.items(), key=lambda x: x[1], reverse=True)

        return {
            "red_balls": [{"ball": b, "count": c, "freq": round(c/periods, 3)} for b, c in red_hot],
            "blue_ball": [{"ball": b, "count": c, "freq": round(c/periods, 3)} for b, c in blue_hot],
            "total_records": len(records)
        }

    def get_missing_values(self, periods: int = 100) -> Dict:
        records = self.get_recent_records(periods)
        if not records:
            return {"red_balls": {}, "blue_ball": {}}

        red_appearances = {i: -1 for i in range(1, 34)}
        blue_appearances = {i: -1 for i in range(1, 17)}

        for idx, record in enumerate(records):
            for ball in record.red_balls.split(","):
                ball_int = int(ball)
                if red_appearances[ball_int] == -1:
                    red_appearances[ball_int] = idx
            if blue_appearances[record.blue_ball] == -1:
                blue_appearances[record.blue_ball] = idx

        return {
            "red_balls": {ball: idx for ball, idx in red_appearances.items()},
            "blue_ball": {ball: idx for ball, idx in blue_appearances.items()}
        }

    def get_trend_data(self, ball_type: str = "red", limit: int = 50) -> List[Dict]:
        records = self.get_recent_records(limit)
        records.reverse()

        if ball_type == "red":
            result = [[] for _ in range(33)]
            for record in records:
                balls = [int(b) for b in record.red_balls.split(",")]
                for i in range(33):
                    result[i].append(1 if (i+1) in balls else 0)
            return [{"ball": i+1, "data": result[i]} for i in range(33)]
        else:
            result = [[] for _ in range(16)]
            for record in records:
                for i in range(16):
                    result[i].append(1 if (i+1) == record.blue_ball else 0)
            return [{"ball": i+1, "data": result[i]} for i in range(16)]

    def get_distribution(self, ball_type: str = "red") -> Dict:
        records = self.get_recent_records(100)

        if ball_type == "red":
            counter = Counter()
            for record in records:
                for ball in record.red_balls.split(","):
                    counter[int(ball)] += 1
            return {
                "balls": [{"ball": i, "count": counter.get(i, 0)} for i in range(1, 34)]
            }
        else:
            counter = Counter()
            for record in records:
                counter[record.blue_ball] += 1
            return {
                "balls": [{"ball": i, "count": counter.get(i, 0)} for i in range(1, 17)]
            }
