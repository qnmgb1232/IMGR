# 历史数据爬取功能设计

## 背景

当前爬虫只获取最新 30 条记录，无法满足用户获取完整历史数据的需求。本设计扩展爬虫支持任意数量的历史数据爬取。

## 改动范围

### 1. CrawlerService (`backend/app/services/crawler.py`)

**修改 `fetch_data` 方法：**
- 新增参数 `issueCount: int = 30`
- `API_URL` 中的 `issueCount` 改为动态参数

**修改 `crawl` 方法：**
- 新增参数 `issueCount: int = 30`，传递给 `fetch_data`

```python
async def fetch_data(self, issueCount: int = 30) -> Optional[List[dict]]:
    url = f"https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice?name=ssq&issueCount={issueCount}"
    ...

async def crawl(self, db: Session, issueCount: int = 30) -> int:
    ...
    records = await self.fetch_data(issueCount)
    ...
```

### 2. API 端点 (`backend/app/routers/crawler.py`)

新增 `POST /api/crawler/fetch_history`：

```python
@router.post("/fetch_history", response_model=ApiResponse)
async def fetch_history(count: int = 3000, db: Session = Depends(get_db)):
    """爬取历史开奖数据"""
    crawler = CrawlerService()
    try:
        fetched = await crawler.crawl(db, issueCount=count)
        return ApiResponse(code=0, message="success", data={"fetched": fetched})
    except Exception as e:
        return ApiResponse(code=1, message=str(e), data={"fetched": 0})
```

### 3. CLI 脚本 (`backend/scripts/crawl_history.py`)

创建独立脚本，支持命令行执行：

```bash
python -m scripts.crawl_history --count 3000
```

脚本逻辑：
- 解析命令行参数
- 调用 `CrawlerService.crawl()`
- 输出爬取结果

### 4. 首次启动自动爬取 (`backend/app/main.py`)

在 FastAPI 启动时检测数据库是否为空，若为空则自动爬取：

```python
@app.on_event("startup")
async def startup_event():
    from app.services.crawler import CrawlerService
    from app.database import SessionLocal
    from app.models import LotteryHistory

    db = SessionLocal()
    try:
        count = db.query(LotteryHistory).count()
        if count == 0:
            logger.info("数据库为空，自动爬取历史数据...")
            crawler = CrawlerService()
            fetched = await crawler.crawl(db, issueCount=3000)
            logger.info(f"首次启动爬取了 {fetched} 条历史数据")
    finally:
        db.close()

    start_scheduler()
```

## 数据流

```
用户触发 (API / CLI / 自动)
    ↓
CrawlerService.crawl(issueCount=N)
    ↓
CrawlerService.fetch_data(issueCount=N) → 请求官方 API
    ↓
解析 JSON → 构建 Record 列表
    ↓
写入数据库 (去重，已存在则跳过)
    ↓
返回新增记录数
```

## 错误处理

- API 请求超时：重试 3 次，每次间隔 5 秒
- API 返回错误码：记录日志，返回已爬取数量
- 数据库写入失败：回滚事务，返回错误信息

## 测试要点

1. `fetch_data` 不同 issueCount 值（30, 100, 3000）
2. `crawl` 去重逻辑（已有数据不会重复插入）
3. API 端点参数验证（count 必须 > 0）
4. CLI 脚本参数解析
