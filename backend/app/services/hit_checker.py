"""中奖检查服务"""
from typing import Tuple, Optional
from sqlalchemy.orm import Session
from app.models import Prediction, LotteryHistory

class HitCheckerService:
    """检查预测号码是否中奖"""

    def __init__(self, db: Session):
        self.db = db

    def check_hit(self, prediction: Prediction, lottery: LotteryHistory) -> Tuple[bool, Optional[str]]:
        """检查单条预测是否中奖"""
        pred_red = set(int(b) for b in prediction.red_balls.split(","))
        lottery_red = set(int(b) for b in lottery.red_balls.split(","))
        pred_blue = prediction.blue_ball
        lottery_blue = lottery.blue_ball

        red_matches = len(pred_red & lottery_red)
        blue_match = pred_blue == lottery_blue

        if red_matches == 6 and blue_match:
            return True, "一等奖(6+1)"
        elif red_matches == 6:
            return True, "二等奖(6+0)"
        elif red_matches == 5 and blue_match:
            return True, "三等奖(5+1)"
        elif red_matches == 5 or (red_matches == 4 and blue_match):
            return True, "四等奖(4+1或5+0)"
        elif red_matches == 4 or (red_matches == 3 and blue_match):
            return True, "五等奖(3+1或4+0)"
        elif red_matches == 2 and blue_match:
            return True, "六等奖(2+1)"
        elif red_matches == 1 and blue_match:
            return True, "六等奖(1+1)"
        elif blue_match:
            return True, "六等奖(0+1)"
        else:
            return False, None

    def update_prediction_hits(self, period: str) -> dict:
        """更新指定期号的所有预测的中奖情况"""
        lottery = self.db.query(LotteryHistory).filter(
            LotteryHistory.period == period
        ).first()

        if not lottery:
            return {"message": f"期号 {period} 不存在", "updated": 0}

        predictions = self.db.query(Prediction).filter(
            Prediction.period == period
        ).all()

        updated = 0
        for pred in predictions:
            is_hit, hit_level = self.check_hit(pred, lottery)
            if pred.is_hit != is_hit or pred.hit_level != hit_level:
                pred.is_hit = is_hit
                pred.hit_level = hit_level
                updated += 1

        self.db.commit()
        return {"message": f"更新了 {updated} 条记录", "updated": updated}

    def get_hit_rate_stats(self) -> dict:
        """获取预测命中率统计"""
        total = self.db.query(Prediction).filter(
            Prediction.is_hit == True
        ).count()

        by_level = {}
        predictions = self.db.query(Prediction).filter(
            Prediction.is_hit == True,
            Prediction.hit_level != None
        ).all()

        for pred in predictions:
            level = pred.hit_level
            by_level[level] = by_level.get(level, 0) + 1

        total_predictions = self.db.query(Prediction).count()

        return {
            "total_predictions": total_predictions,
            "total_hits": total,
            "hit_rate": round(total / total_predictions * 100, 2) if total_predictions > 0 else 0,
            "by_level": by_level
        }