#!/bin/bash

# IMGR 停止脚本

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 从文件读取PID
if [ -f "$SCRIPT_DIR/.pids" ]; then
    PIDS=$(cat "$SCRIPT_DIR/.pids")
    echo "正在停止服务 (PID: $PIDS)..."
    kill $PIDS 2>/dev/null
    rm -f "$SCRIPT_DIR/.pids"
    echo "✓ 服务已停止"
else
    # 手动查找并停止
    echo "查找并停止 IMGR 相关进程..."
    pkill -f "python3 run.py" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    echo "✓ 服务已停止"
fi
