#!/bin/bash

# IMGR 依赖安装脚本
# 检查环境并安装所有必要依赖

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "========================================"
echo "  IMGR 依赖安装"
echo "========================================"
echo ""

# Step 1: 检查环境
echo "[1/4] 检查环境..."
if [ -f "$SCRIPT_DIR/check_env.sh" ]; then
    if ! "$SCRIPT_DIR/check_env.sh" > /dev/null 2>&1; then
        echo -e "${RED}✗ 环境检查未通过，请先安装所需环境${NC}"
        echo ""
        "$SCRIPT_DIR/check_env.sh"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} 环境检查通过"
else
    echo -e "${RED}✗ 未找到 check_env.sh${NC}"
    exit 1
fi
echo ""

# Step 2: 安装后端依赖
echo "[2/4] 安装后端依赖..."
cd "$PROJECT_DIR/backend"
if python3 -m pip install -r requirements.txt; then
    echo -e "${GREEN}✓${NC} 安装完成"
else
    echo -e "${RED}✗ 安装失败${NC}"
    exit 1
fi
echo ""

# Step 3: 安装 Playwright 浏览器
echo "[3/4] 安装 Playwright 浏览器..."
if python3 -m playwright install chromium; then
    echo -e "${GREEN}✓${NC} 安装完成"
else
    echo -e "${RED}✗ 安装失败${NC}"
    exit 1
fi
echo ""

# Step 4: 安装前端依赖
echo "[4/4] 安装前端依赖..."
cd "$PROJECT_DIR/frontend"
if npm install; then
    echo -e "${GREEN}✓${NC} 安装完成"
else
    echo -e "${RED}✗ 安装失败${NC}"
    exit 1
fi
echo ""

echo "========================================"
echo -e "${GREEN}✓ 所有依赖安装完成${NC}"
echo "========================================"
echo ""
echo "现在可以运行 ./start.sh 启动服务"
exit 0