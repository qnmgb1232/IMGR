"""双色球爬虫服务 - 使用Playwright"""
import asyncio
import random
import logging
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import LotteryHistory

logger = logging.getLogger(__name__)

class CrawlerService:
    """双色球爬虫服务 - 使用Playwright"""

    BASE_URL = "https://datachart.500.com/ssq/"
    HISTORY_URL = BASE_URL + "history/new%E5%8E%86%E5%8F%B2%E5%BC%80%E5%A5%96%E6%95%B0%E6%8D%AE"

    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    ]

    async def initialize(self):
        """初始化Playwright浏览器"""
        from playwright.async_api import async_playwright
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(headless=True)
        self.context = await self.browser.new_context(
            user_agent=random.choice(self.USER_AGENTS)
        )

    async def close(self):
        """关闭浏览器"""
        await self.browser.close()
        await self.playwright.stop()

    async def fetch_page(self, url: str) -> Optional[str]:
        """获取页面内容"""
        await asyncio.sleep(random.uniform(3, 5))
        page = await self.context.new_page()
        try:
            await page.goto(url, timeout=30000)
            content = await page.content()
            return content
        except Exception as e:
            logger.error(f"Failed to fetch {url}: {e}")
            return None
        finally:
            await page.close()

    def parse_history_page(self, html: str) -> List[dict]:
        """解析历史开奖页面"""
        from bs4 import BeautifulSoup
        records = []
        soup = BeautifulSoup(html, "lxml")
        table = soup.find("table", {"id": "tdata"})
        if not table:
            return records

        for row in table.find_all("tr"):
            cells = row.find_all("td")
            if len(cells) >= 7:
                try:
                    period = cells[0].text.strip()
                    draw_date = cells[1].text.strip()
                    red_balls = ",".join([
                        cells[2].text.strip(),
                        cells[3].text.strip(),
                        cells[4].text.strip(),
                        cells[5].text.strip(),
                        cells[6].text.strip(),
                    ])
                    blue_ball = int(cells[7].text.strip())

                    records.append({
                        "period": period,
                        "draw_date": datetime.strptime(draw_date, "%Y-%m-%d").date(),
                        "red_balls": red_balls,
                        "blue_ball": blue_ball,
                    })
                except Exception as e:
                    logger.warning(f"Failed to parse row: {e}")
                    continue
        return records

    async def crawl(self, db: Session) -> int:
        """执行爬取"""
        await self.initialize()
        fetched = 0
        try:
            latest_local = db.query(LotteryHistory).order_by(
                LotteryHistory.period.desc()
            ).first()
            latest_period = latest_local.period if latest_local else "0"

            html = await self.fetch_page(self.HISTORY_URL)
            if not html:
                logger.error("Failed to fetch history page")
                return 0

            records = self.parse_history_page(html)
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