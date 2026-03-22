# 历史数据爬取功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 扩展爬虫支持爬取任意数量的历史数据，支持 API/CLI/首次启动自动三种触发方式

**Architecture:** 修改 `CrawlerService` 支持 `issueCount` 参数，新增 API 端点和 CLI 脚本，FastAPI 启动时自动检测并爬取

**Tech Stack:** Python, FastAPI, Playwright, SQLAlchemy, APScheduler

---

## 文件变更

| 文件 | 操作 | 职责 |
|------|------|------|
| `backend/app/services/crawler.py` | 修改 | `fetch_data` 和 `crawl` 方法新增 `issueCount` 参数 |
| `backend/app/routers/crawler.py` | 修改 | 新增 `POST /api/crawler/fetch_history` 端点 |
| `backend/scripts/crawl_history.py` | 创建 | CLI 脚本，支持 `--count` 参数 |
| `backend/app/main.py` | 修改 | 启动时检测空数据库并自动爬取 |

---

## Task 1: 修改 CrawlerService 支持 issueCount 参数

**Files:**
- Modify: `backend/app/services/crawler.py:14-28`
- Modify: `backend/app/services/crawler.py:69-101`

- [ ] **Step 1: 修改 `fetch_data` 方法签名和 API_URL**

修改 `backend/app/services/crawler.py` 第 14 行和第 28 行：

```python
# 第 14 行：API_URL 改为动态
API_URL_TEMPLATE = "https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice?name=ssq&issueCount={issueCount}"

# 第 28 行：fetch_data 方法增加 issueCount 参数
async def fetch_data(self, issueCount: int = 30) -> Optional[List[dict]]:
    """获取开奖数据"""
    page = await self.browser.new_page()
    try:
        url = self.API_URL_TEMPLATE.format(issueCount=issueCount)
        await page.goto(url, timeout=30000)
        await page.wait_for_timeout(3000)
        content = await page.content()
        # ... 其余代码保持不变
```

- [ ] **Step 2: 修改 `crawl` 方法签名**

修改 `backend/app/services/crawler.py` 第 69 行：

```python
async def crawl(self, db: Session, issueCount: int = 30) -> int:
    """执行爬取"""
    await self.initialize()
    fetched = 0
    try:
        latest_local = db.query(LotteryHistory).order_by(
            LotteryHistory.period.desc()
        ).first()
        latest_period = latest_local.period if latest_local else "0"

        records = await self.fetch_data(issueCount)  # 传递 issueCount
        # ... 其余代码保持不变
```

- [ ] **Step 3: 提交代码**

```bash
git add backend/app/services/crawler.py
git commit -m "feat: CrawlerService 支持 issueCount 参数"
```

---

## Task 2: 新增 API 端点 fetch_history

**Files:**
- Modify: `backend/app/routers/crawler.py`

- [ ] **Step 1: 添加新的 API 端点**

在 `backend/app/routers/crawler.py` 末尾添加：

```python
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
```

- [ ] **Step 2: 提交代码**

```bash
git add backend/app/routers/crawler.py
git commit -m "feat: 新增 POST /api/crawler/fetch_history 端点"
```

---

## Task 3: 创建 CLI 脚本 crawl_history.py

**Files:**
- Create: `backend/scripts/crawl_history.py`

- [ ] **Step 1: 创建 CLI 脚本**

创建 `backend/scripts/crawl_history.py`：

```python
"""历史数据爬取 CLI 脚本

Usage:
    python -m scripts.crawl_history --count 3000
"""
import argparse
import asyncio
import sys
import os

# 添加 backend 目录到 path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.services.crawler import CrawlerService


def main():
    parser = argparse.ArgumentParser(description="爬取双色球历史开奖数据")
    parser.add_argument("--count", type=int, default=3000, help="要爬取的记录数量 (默认: 3000)")
    args = parser.parse_args()

    if args.count <= 0:
        print("错误: count 必须大于 0")
        sys.exit(1)

    print(f"开始爬取最近 {args.count} 条历史数据...")

    db = SessionLocal()
    try:
        crawler = CrawlerService()
        fetched = asyncio.run(crawler.crawl(db, issueCount=args.count))
        print(f"爬取完成，新增 {fetched} 条记录")
    except Exception as e:
        print(f"爬取失败: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: 提交代码**

```bash
git add backend/scripts/crawl_history.py
git commit -m "feat: 添加历史数据爬取 CLI 脚本"
```

---

## Task 4: 首次启动自动爬取

**Files:**
- Modify: `backend/app/main.py:26-30`

- [ ] **Step 1: 修改 startup_event 函数**

修改 `backend/app/main.py` 第 26-30 行：

```python
@app.on_event("startup")
async def startup_event():
    create_tables()
    setup_scheduler()
    start_scheduler()

    # 首次启动时检测空数据库并自动爬取
    from app.database import SessionLocal
    from app.models import LotteryHistory
    db = SessionLocal()
    try:
        count = db.query(LotteryHistory).count()
        if count == 0:
            logger.info("数据库为空，自动爬取历史数据...")
            from app.services.crawler import CrawlerService
            crawler = CrawlerService()
            fetched = await crawler.crawl(db, issueCount=3000)
            logger.info(f"首次启动爬取了 {fetched} 条历史数据")
    finally:
        db.close()
```

注意：需要导入 `logging` 模块（如果没有的话）：
```python
import logging
logger = logging.getLogger(__name__)
```

- [ ] **Step 2: 提交代码**

```bash
git add backend/app/main.py
git commit -m "feat: 首次启动时自动爬取历史数据"
```

---

## Task 5: 验证测试

**Files:**
- Test: 手动测试以下场景

- [ ] **Step 1: 测试 CLI 脚本**

```bash
cd backend
python -m scripts.crawl_history --count 100
```

预期：输出 `爬取完成，新增 X 条记录`

- [ ] **Step 2: 测试 API 端点**

```bash
curl -X POST "http://localhost:8000/api/crawler/fetch_history?count=50"
```

预期：`{"code":0,"message":"success","data":{"fetched":X}}`

- [ ] **Step 3: 测试启动时自动爬取**

```bash
# 1. 停止服务
# 2. 清空或删除数据库 data/imgr.db
# 3. 重启服务
# 4. 检查日志输出
```

预期：日志显示 `数据库为空，自动爬取历史数据...` 和 `首次启动爬取了 X 条历史数据`

---

## 完成检查清单

- [ ] Task 1: `fetch_data` 和 `crawl` 支持 `issueCount` 参数
- [ ] Task 2: API 端点 `/api/crawler/fetch_history` 可用
- [ ] Task 3: CLI 脚本 `python -m scripts.crawl_history --count N` 可用
- [ ] Task 4: 首次启动自动爬取正常工作
- [ ] Task 5: 所有测试通过
- [ ] 推送到远程仓库
