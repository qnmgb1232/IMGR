# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

IMGR（我必发财）是一个彩票数据管理与预测系统，采用 FastAPI 后端 + React 前端的标准全栈架构。

## 常用命令

### 一键启动（推荐）

```bash
./start.sh                           # 启动前后端服务
./stop.sh                            # 停止所有服务
```

### 后端

```bash
cd backend
pip install -r requirements.txt
python run.py                        # 启动后端服务 (http://localhost:8000)
uvicorn app.main:app --reload        # 开发模式启动
```

### 前端

```bash
cd frontend
npm install                          # 安装依赖
npm run dev                          # 开发模式 (http://localhost:3000, 代理到后端)
npm run build                        # 构建生产版本 (含 TypeScript 检查)
npm run preview                      # 预览生产构建
```

## 技术栈

- **后端:** Python 3.11+, FastAPI, SQLAlchemy 2.0, SQLite, APScheduler, Playwright, scikit-learn
- **前端:** TypeScript, React 18, Vite, TailwindCSS, Recharts, React Router

## 架构

### 后端结构

```
backend/app/
├── main.py              # FastAPI 应用入口，路由注册
├── config.py            # 应用配置管理
├── database.py          # SQLAlchemy 会话和模型定义
├── models.py            # 数据模型
├── schemas.py           # Pydantic 请求/响应模型
├── scheduler.py         # APScheduler 定时任务配置
├── routers/             # API 路由
│   ├── lottery.py       # 彩票历史数据 API
│   ├── prediction.py    # 预测号码 API
│   ├── statistics.py    # 统计分析 API
│   ├── crawler.py       # 爬虫控制 API
│   └── settings.py      # 设置 API
└── services/            # 业务逻辑服务
    ├── crawler.py        # 数据爬取 (Playwright)
    ├── predictor.py      # 预测引擎 (scikit-learn)
    ├── statistics.py    # 统计分析
    └── hit_checker.py    # 中奖核对
```

- 定时任务: 每周二、四、六 20:35-21:30 自动爬取开奖数据
- API 响应格式: `{ "code": 0, "message": "success", "data": {...} }`
- 数据库: `data/imgr.db` (SQLite)
- 配置管理: `app/config.py` 管理应用配置，`app/routers/settings.py` 提供设置 API

### 前端结构

```
frontend/src/
├── App.tsx                      # 主应用，路由配置
├── services/api.ts              # API 调用层
├── pages/                       # 页面组件
│   ├── Home.tsx                 # 历史开奖
│   ├── Predictions.tsx          # 预测号码
│   ├── Trends.tsx               # 走势图
│   └── Distribution.tsx         # 号码分布
└── components/                  # 可复用组件
    ├── BallNumber.tsx           # 彩票球组件
    ├── LotteryTable.tsx         # 表格组件
    ├── PredictionCard.tsx       # 预测卡片
    ├── TrendChart.tsx           # 折线图
    ├── DistributionChart.tsx    # 分布图
    ├── Sidebar.tsx              # 侧边导航
    └── CountdownTimer.tsx       # 倒计时
```

- Vite 配置了 `/api` 请求代理到 `http://localhost:8000`
- Tailwind 自定义了彩票球颜色 (`ball-red`, `ball-blue`)

### 关键设计

- **颜色主题:** 深色 Bloomberg/Trading 风格 (BG: `#1a1a2e`, 红球: `#e94560`, 蓝球: `#0ea5e9`)
- **字体:** UI 用 Inter, 数字用 JetBrains Mono
- **组件约定:** BallNumber 组件根据 `color` 属性自动选择红/蓝色

## 开发注意事项

- 爬虫使用 Playwright 框架，定时任务每周二、四、六 20:35-21:30 自动爬取开奖数据
- 前端 TypeScript 严格模式，构建时会先检查类型
- 后端使用 Pydantic 模型进行请求验证和响应序列化
