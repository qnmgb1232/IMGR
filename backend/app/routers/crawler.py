from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse

router = APIRouter()

@router.post("/fetch", response_model=ApiResponse)
def fetch_data(db: Session = Depends(get_db)):
    return ApiResponse(message="爬虫功能待实现", data={"fetched": 0})
