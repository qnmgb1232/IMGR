"""手动导入历史数据脚本"""
import sys
sys.path.insert(0, ".")

from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, create_tables
from app.models import LotteryHistory

SAMPLE_DATA = [
    {"period": "2024015", "draw_date": datetime(2024, 2, 4).date(), "red_balls": "08,12,18,24,26,27", "blue_ball": 1},
    {"period": "2024014", "draw_date": datetime(2024, 2, 2).date(), "red_balls": "01,10,15,25,28,32", "blue_ball": 13},
    {"period": "2024013", "draw_date": datetime(2024, 1, 30).date(), "red_balls": "02,03,07,16,30,31", "blue_ball": 6},
    {"period": "2024012", "draw_date": datetime(2024, 1, 28).date(), "red_balls": "07,09,11,19,28,31", "blue_ball": 11},
    {"period": "2024011", "draw_date": datetime(2024, 1, 25).date(), "red_balls": "05,08,13,16,24,27", "blue_ball": 14},
]

def import_data():
    create_tables()
    db: Session = SessionLocal()
    try:
        for data in SAMPLE_DATA:
            existing = db.query(LotteryHistory).filter(
                LotteryHistory.period == data["period"]
            ).first()
            if not existing:
                db.add(LotteryHistory(**data))
                print(f"Imported: {data['period']}")
        db.commit()
        print("Import completed")
    finally:
        db.close()

if __name__ == "__main__":
    import_data()