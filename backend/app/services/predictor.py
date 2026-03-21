"""预测引擎 - 混合统计和机器学习"""
import random
from typing import List, Dict, Tuple
from collections import Counter
from sqlalchemy.orm import Session
from app.models import LotteryHistory, Prediction
from app.services.statistics import StatisticsService

class PredictorService:
    """双色球预测引擎"""

    def __init__(self, db: Session):
        self.db = db
        self.stats_service = StatisticsService(db)

    def statistical_predict(self) -> Tuple[List[int], int]:
        """基于统计分析的预测"""
        hot_cold = self.stats_service.get_hot_cold_stats(50)
        missing = self.stats_service.get_missing_values(50)

        red_scores = {}
        for item in hot_cold["red_balls"]:
            ball = item["ball"]
            freq_score = item["freq"] * 100
            missing_score = min(missing["red_balls"].get(ball, 0) * 2, 50)
            red_scores[ball] = freq_score * 0.4 + missing_score * 0.6

        red_balls = sorted(red_scores.keys(), key=lambda x: red_scores[x], reverse=True)
        selected_red = sorted(red_balls[:6])

        blue_scores = {}
        for item in hot_cold["blue_ball"]:
            ball = item["ball"]
            missing_score = min(missing["blue_ball"].get(ball, 0) * 3, 30)
            blue_scores[ball] = item["freq"] * 100 * 0.5 + missing_score * 0.5

        blue_ball = max(blue_scores.keys(), key=lambda x: blue_scores[x])

        return selected_red, blue_ball

    def random_predict(self) -> Tuple[List[int], int]:
        """随机预测"""
        red_balls = sorted(random.sample(range(1, 34), 6))
        blue_ball = random.randint(1, 16)
        return red_balls, blue_ball

    def balanced_predict(self) -> Tuple[List[int], int]:
        """均衡型预测 - 结合热号和冷号"""
        hot_cold = self.stats_service.get_hot_cold_stats(50)

        hot_reds = [item["ball"] for item in hot_cold["red_balls"][:11]]
        cold_reds = [item["ball"] for item in hot_cold["red_balls"][-11:]]

        selected = set()
        selected.update(random.sample(hot_reds, 3))
        selected.update(random.sample(cold_reds, 3))

        blue_hot = [item["ball"] for item in hot_cold["blue_ball"][:5]]
        blue_ball = random.choice(blue_hot)

        return sorted(list(selected)), blue_ball

    def ml_predict(self) -> Tuple[List[int], int]:
        """机器学习预测（简化版 - 使用频率分析）"""
        records = self.stats_service.get_recent_records(100)

        red_probs = {i: 0.0 for i in range(1, 34)}
        blue_probs = {i: 0.0 for i in range(1, 17)}

        for record in records:
            for ball in record.red_balls.split(","):
                red_probs[int(ball)] += 1
            blue_probs[record.blue_ball] += 1

        total = len(records)
        for ball in red_probs:
            red_probs[ball] /= total
        for ball in blue_probs:
            blue_probs[ball] /= total

        red_balls = sorted(
            random.choices(
                list(red_probs.keys()),
                weights=list(red_probs.values()),
                k=6
            )
        )

        while len(set(red_balls)) < 6:
            red_balls = sorted(
                random.choices(
                    list(red_probs.keys()),
                    weights=list(red_probs.values()),
                    k=6
                )
            )
        red_balls = sorted(list(set(red_balls)))[:6]

        blue_ball = random.choices(
            list(blue_probs.keys()),
            weights=list(blue_probs.values()),
            k=1
        )[0]

        return red_balls, blue_ball

    def generate_predictions(self, period: str, source: str = "auto") -> List[Dict]:
        """生成5组预测号码"""
        predictions = []

        predict_methods = [
            ("统计主导", self.statistical_predict),
            ("ML主导", self.ml_predict),
            ("均衡型", self.balanced_predict),
            ("冷号回补", self.statistical_predict),
            ("热号持续", self.balanced_predict),
        ]

        for name, method in predict_methods:
            red_balls, blue_ball = method()
            red_str = ",".join([f"{b:02d}" for b in red_balls])
            predictions.append({
                "period": period,
                "predict_date": None,
                "red_balls": red_str,
                "blue_ball": blue_ball,
                "source": source,
            })

        return predictions

    def save_predictions(self, predictions: List[Dict]) -> int:
        """保存预测到数据库"""
        saved = 0
        for pred in predictions:
            existing = self.db.query(Prediction).filter(
                Prediction.period == pred["period"],
                Prediction.red_balls == pred["red_balls"],
                Prediction.source == pred["source"]
            ).first()
            if not existing:
                self.db.add(Prediction(**pred))
                saved += 1
        self.db.commit()
        return saved
