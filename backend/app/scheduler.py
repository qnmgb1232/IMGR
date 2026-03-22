"""定时任务调度器"""
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.services.crawler import CrawlerService
from app.services.predictor import PredictorService
from app.services.hit_checker import HitCheckerService
from app.services.statistics import StatisticsService
from app.models import LotteryHistory, StatisticsCache

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

def crawl_latest():
    """爬取最新开奖数据"""
    logger.info("Starting scheduled crawl...")
    db: Session = SessionLocal()
    try:
        crawler = CrawlerService()
        fetched = crawler.crawl(db)
        logger.info(f"Crawl completed, fetched {fetched} records")
    except Exception as e:
        logger.error(f"Crawl failed: {e}")
    finally:
        db.close()

def auto_predict():
    """自动生成预测"""
    logger.info("Starting auto prediction...")
    db: Session = SessionLocal()
    try:
        latest = db.query(LotteryHistory).order_by(
            LotteryHistory.draw_date.desc()
        ).first()
        if not latest:
            logger.warning("No lottery history, skip prediction")
            return

        from datetime import date
        next_period_num = int(latest.period[-3:]) + 1
        next_period = f"2024{next_period_num:03d}"

        service = PredictorService(db)
        predictions = service.generate_predictions(next_period, "auto")
        for p in predictions:
            p["predict_date"] = date.today()
        service.save_predictions(predictions)
        logger.info(f"Generated {len(predictions)} predictions for {next_period}")
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
    finally:
        db.close()

def check_hits():
    """检查预测中奖情况"""
    logger.info("Starting hit check...")
    db: Session = SessionLocal()
    try:
        latest = db.query(LotteryHistory).order_by(
            LotteryHistory.draw_date.desc()
        ).first()
        if not latest:
            return

        service = HitCheckerService(db)
        result = service.update_prediction_hits(latest.period)
        logger.info(f"Hit check completed: {result}")
    except Exception as e:
        logger.error(f"Hit check failed: {e}")
    finally:
        db.close()

def update_statistics_cache():
    """更新统计缓存数据"""
    import json
    logger.info("Starting statistics cache update...")
    db: Session = SessionLocal()
    try:
        service = StatisticsService(db)
        hot_cold = service.get_hot_cold_stats(100)

        cache_record = db.query(StatisticsCache).filter(
            StatisticsCache.stat_type == "hot_cold"
        ).first()
        if cache_record:
            cache_record.data = json.dumps(hot_cold)
        else:
            cache_record = StatisticsCache(
                stat_type="hot_cold",
                data=json.dumps(hot_cold)
            )
            db.add(cache_record)

        db.commit()
        logger.info("Statistics cache updated successfully")
    except Exception as e:
        db.rollback()
        logger.error(f"Statistics cache update failed: {e}")
    finally:
        db.close()

def setup_scheduler():
    """配置定时任务"""
    scheduler.add_job(
        crawl_latest,
        CronTrigger(day_of_week='tue,thu,sat', hour=20, minute=35),
        id='crawl_latest',
        name='爬取最新开奖数据'
    )

    scheduler.add_job(
        auto_predict,
        CronTrigger(day_of_week='tue,thu,sat', hour=21, minute=5),
        id='auto_predict',
        name='自动生成预测'
    )

    scheduler.add_job(
        check_hits,
        CronTrigger(day_of_week='tue,thu,sat', hour=21, minute=30),
        id='check_hits',
        name='检查预测中奖'
    )

    scheduler.add_job(
        update_statistics_cache,
        CronTrigger(hour=21, minute=0),
        id='update_stats',
        name='更新统计缓存'
    )

    logger.info("Scheduler configured")

def start_scheduler():
    if not scheduler.running:
        scheduler.start()
        logger.info("Scheduler started")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler stopped")
