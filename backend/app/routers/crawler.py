from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse
from app.services.crawler import CrawlerService

router = APIRouter()

@router.post("/fetch", response_model=ApiResponse)
async def fetch_data(db: Session = Depends(get_db)):
    crawler = CrawlerService()
    try:
        fetched = await crawler.crawl(db)
        return ApiResponse(
            code=0,
            message="success",
            data={"fetched": fetched}
        )
    except Exception as e:
        return ApiResponse(
            code=1,
            message=str(e),
            data={"fetched": 0}
        )

@router.post("/fetch_history", response_model=ApiResponse)
async def fetch_history(count: int = 3000, db: Session = Depends(get_db)):
    """爬取历史开奖数据"""
    if count <= 0:
        return ApiResponse(code=1, message="count must be positive", data={"fetched": 0})
    crawler = CrawlerService()
    try:
        fetched = await crawler.crawl(db, issueCount=count)
        return ApiResponse(code=0, message="success", data={"fetched": fetched})
    except Exception as e:
        return ApiResponse(code=1, message=str(e), data={"fetched": 0})
