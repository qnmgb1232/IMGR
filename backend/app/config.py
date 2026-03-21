from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

class Settings(BaseSettings):
    app_name: str = "IMGR - 双色球数据管理系统"
    database_url: str = f"sqlite:///{DATA_DIR}/imgr.db"
    log_dir: Path = BASE_DIR / "logs"
    crawl_interval_hours: int = 6

    class Config:
        env_file = ".env"

settings = Settings()
