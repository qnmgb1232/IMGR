#!/bin/bash

# IMGR 一键启动脚本

echo "========================================"
echo "  IMGR - 双色球数据管理系统"
echo "========================================"
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到 python3，请先安装 Python 3.11+"
    exit 1
fi

# 检查Node.js环境
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 node，请先安装 Node.js"
    exit 1
fi

echo "✓ 环境检查通过"

# 启动后端
echo ""
echo "🚀 启动后端服务 (http://localhost:8000)..."
cd "$SCRIPT_DIR/backend"
python3 run.py &
BACKEND_PID=$!
echo "✓ 后端已启动 (PID: $BACKEND_PID)"

# 启动前端
echo ""
echo "🚀 启动前端服务 (http://localhost:3000)..."
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!
echo "✓ 前端已启动 (PID: $FRONTEND_PID)"

# 等待一下确保服务启动
sleep 3

echo ""
echo "========================================"
echo "  服务已全部启动！"
echo "========================================"
echo ""
echo "  前端: http://localhost:3000"
echo "  后端: http://localhost:8000"
echo "  局域网: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "  按 Ctrl+C 停止所有服务"
echo "========================================"

# 保存PID到文件
echo "$BACKEND_PID $FRONTEND_PID" > "$SCRIPT_DIR/.pids"

# 等待中断信号
trap "echo ''; echo '正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f '$SCRIPT_DIR/.pids'; echo '✓ 服务已停止'; exit 0" SIGINT SIGTERM

wait
