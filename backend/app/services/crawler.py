"""双色球爬虫服务"""
import os
import logging
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import LotteryHistory

logger = logging.getLogger(__name__)

class CrawlerService:
    """双色球爬虫服务"""

    API_URL = "https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice?name=ssq&issueCount=30"

    async def initialize(self):
        """初始化Playwright浏览器"""
        from playwright.async_api import async_playwright
        self.playwright = await async_playwright().start()
        executable_path = os.path.expanduser("~/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome")
        self.browser = await self.playwright.chromium.launch(headless=True, executable_path=executable_path)

    async def close(self):
        """关闭浏览器"""
        await self.browser.close()
        await self.playwright.stop()

    async def fetch_data(self) -> Optional[List[dict]]:
        """获取开奖数据"""
        page = await self.browser.new_page()
        try:
            await page.goto(self.API_URL, timeout=30000)
            await page.wait_for_timeout(3000)
            content = await page.content()

            # 解析JSON数据
            import re
            match = re.search(r'\{.*"state":0.*\}', content, re.DOTALL)
            if not match:
                logger.error("Failed to find JSON data in response")
                return None

            import json
            data = json.loads(match.group())
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

            return records
        except Exception as e:
            logger.error(f"Failed to fetch data: {e}")
            return None
        finally:
            await page.close()

    async def crawl(self, db: Session) -> int:
        """执行爬取"""
        await self.initialize()
        fetched = 0
        try:
            latest_local = db.query(LotteryHistory).order_by(
                LotteryHistory.period.desc()
            ).first()
            latest_period = latest_local.period if latest_local else "0"

            records = await self.fetch_data()
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
        finally:
            await self.close()
        return fetched
