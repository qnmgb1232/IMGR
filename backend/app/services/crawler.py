"""双色球爬虫服务 - 简化版（使用 httpx，无需浏览器）"""
import logging
from datetime import datetime
from typing import List, Optional
import httpx
from sqlalchemy.orm import Session
from app.models import LotteryHistory

logger = logging.getLogger(__name__)


class CrawlerService:
    """双色球爬虫服务"""

    API_URL = "https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice?name=ssq&issueCount={issueCount}"
    USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

    async def fetch_data(self, issueCount: int = 30) -> Optional[List[dict]]:
        """获取开奖数据 - 直接调用官方 JSON API，无需浏览器"""
        try:
            with httpx.AsyncClient(timeout=30.0) as client:
                response = client.get(
                    self.API_URL.format(issueCount=issueCount),
                    headers={"User-Agent": self.USER_AGENT}
                )
                response.raise_for_status()
                data = response.json()

            if data.get("state") != 0:
                logger.error(f"API returned error: {data.get('message')}")
                return None

            records = []
            for item in data.get("result", []):
                red_balls = item.get("red", "")
                blue_ball = item.get("blue", "")
                date_str = item.get("date", "")[:10]

                records.append({
                    "period": item.get("code", ""),
                    "draw_date": datetime.strptime(date_str, "%Y-%m-%d").date(),
                    "red_balls": red_balls,
                    "blue_ball": int(blue_ball) if blue_ball else 0,
                })

            logger.info(f"Fetched {len(records)} records from API")
            return records

        except httpx.HTTPError as e:
            logger.error(f"HTTP error while fetching data: {e}")
            return None
        except (KeyError, ValueError) as e:
            logger.error(f"Data parsing error: {e}")
            return None

    def crawl(self, db: Session, issueCount: int = 30) -> int:
        """执行爬取（同步封装）"""
        import asyncio

        fetched = 0
        try:
            latest_local = db.query(LotteryHistory).order_by(
                LotteryHistory.period.desc()
            ).first()
            latest_period = latest_local.period if latest_local else "0"

            records = asyncio.run(self.fetch_data(issueCount))
            if not records:
                logger.error("No records fetched")
                return 0

            for record in records:
                if record["period"] <= latest_period:
                    break
                existing = db.query(LotteryHistory).filter(
                    LotteryHistory.period == record["period"]
                ).first()
                if not existing:
                    db.add(LotteryHistory(**record))
                    fetched += 1

            db.commit()
            logger.info(f"Crawled {fetched} new records")
        except Exception as e:
            logger.error(f"Crawl error: {e}")
            db.rollback()
        return fetched

    async def crawl_async(self, db: Session, issueCount: int = 30) -> int:
        """执行爬取（异步版本）"""
        fetched = 0
        try:
            latest_local = db.query(LotteryHistory).order_by(
                LotteryHistory.period.desc()
            ).first()
            latest_period = latest_local.period if latest_local else "0"

            records = await self.fetch_data(issueCount)
            if not records:
                logger.error("No records fetched")
                return 0

            for record in records:
                if record["period"] <= latest_period:
                    break
                existing = db.query(LotteryHistory).filter(
                    LotteryHistory.period == record["period"]
                ).first()
                if not existing:
                    db.add(LotteryHistory(**record))
                    fetched += 1

            db.commit()
            logger.info(f"Crawled {fetched} new records")
        except Exception as e:
            logger.error(f"Crawl error: {e}")
            db.rollback()
        return fetched
