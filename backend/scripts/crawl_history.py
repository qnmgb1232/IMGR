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
