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
