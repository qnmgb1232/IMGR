# IMGR - 双色球数据管理系统

> I Must Get Rich! 双色球数据分析与预测系统

## 功能特性

- 📊 **Dashboard 仪表盘** - 所有数据一目了然
- 📈 **趋势分析** - 红球/蓝球出现趋势图
- 📉 **号码分布** - 历史号码分布统计
- 🎯 **智能预测** - 基于历史数据生成预测号码
- 🏆 **中奖查询** - 自动计算预测号码中奖情况
- 🔄 **数据更新** - 自动爬取最新开奖数据

## 快速开始

### 方式一：一键启动（推荐）

```bash
chmod +x start.sh stop.sh  # 首次运行需要赋予执行权限
./start.sh                 # 启动所有服务
./stop.sh                  # 停止所有服务
```

### 方式二：手动启动

**后端**
```bash
cd backend
pip install -r requirements.txt
python3 run.py
```

**前端**
```bash
cd frontend
npm install
npm run dev
```

## 访问地址

- 本地: http://localhost:3000
- 局域网: http://192.168.x.x:3000（其他设备可通过此地址访问）

## 技术栈

- **后端**: Python 3.11+, FastAPI, SQLAlchemy, APScheduler, Playwright
- **前端**: React 18, TypeScript, Vite, TailwindCSS, Recharts

## 项目结构

```
wcc/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI 入口
│   │   ├── database.py      # 数据库配置
│   │   ├── models.py        # 数据模型
│   │   ├── schemas.py       # Pydantic 模型
│   │   ├── routers/         # API 路由
│   │   │   ├── lottery.py   # 开奖数据 API
│   │   │   ├── prediction.py # 预测 API
│   │   │   ├── statistics.py # 统计 API
│   │   │   └── crawler.py   # 爬虫 API
│   │   └── services/        # 业务逻辑
│   │       ├── crawler.py   # 数据爬取
│   │       ├── predictor.py # 预测引擎
│   │       ├── statistics.py # 统计分析
│   │       └── hit_checker.py # 中奖检查
│   └── run.py               # 启动脚本
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # 主应用
│   │   ├── pages/           # 页面组件
│   │   │   └── Dashboard.tsx # 数据中心
│   │   ├── components/       # 通用组件
│   │   └── services/        # API 调用
│   └── vite.config.ts      # Vite 配置
├── data/
│   └── imgr.db             # SQLite 数据库
├── start.sh                # 启动脚本
└── stop.sh                 # 停止脚本
```

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/lottery/history` | GET | 获取历史开奖记录 |
| `/api/lottery/latest` | GET | 获取最新开奖 |
| `/api/prediction/latest` | GET | 获取最新预测 |
| `/api/prediction/generate` | POST | 生成新预测 |
| `/api/prediction/last/hit-result` | GET | 获取上期预测中奖结果 |
| `/api/statistics/trend` | GET | 获取号码趋势 |
| `/api/statistics/distribution` | GET | 获取号码分布 |
| `/api/crawler/fetch` | POST | 爬取最新数据 |

## 数据说明

- 数据库包含 **2013年至今** 的所有双色球开奖数据
- 爬虫数据源: 中国福利彩票官方 API
- 预测基于历史数据的频率统计分析

## 注意事项

- 前端代理配置: Vite 将 `/api` 请求转发到 `http://localhost:8000`
- 确保 3000 和 8000 端口未被占用
- 首次启动会自动爬取最新数据

## 许可证

MIT License
