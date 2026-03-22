#!/bin/bash

# IMGR 环境检查脚本
# 检查 Python、Node.js、npm 版本是否满足要求

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "  IMGR 环境检查"
echo "========================================"
echo ""

# 检查 Python 版本 (需要 3.11+)
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:3])))')
    PYTHON_MAJOR=$(python3 -c 'import sys; print(sys.version_info.major)')
    PYTHON_MINOR=$(python3 -c 'import sys; print(sys.version_info.minor)')

    if [ "$PYTHON_MAJOR" -gt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -ge 11 ]); then
        echo -e "${GREEN}✓${NC} Python $PYTHON_VERSION (要求 3.11+)"
    else
        echo -e "${RED}✗${NC} Python $PYTHON_VERSION (需要 3.11+)"
        exit 1
    fi
else
    echo -e "${RED}✗${NC} 未找到 Python (需要 3.11+)"
    exit 1
fi

# 检查 Node.js 版本 (需要 18+)
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | sed 's/v//')
    NODE_MAJOR=$(node --version | sed 's/v//' | cut -d. -f1)

    if [ "$NODE_MAJOR" -ge 18 ]; then
        echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION (要求 18+)"
    else
        echo -e "${RED}✗${NC} Node.js $NODE_VERSION (需要 18+)"
        exit 1
    fi
else
    echo -e "${RED}✗${NC} 未找到 Node.js (需要 18+)"
    exit 1
fi

# 检查 npm 版本 (需要 9+)
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    NPM_MAJOR=$(npm --version | cut -d. -f1)

    if [ "$NPM_MAJOR" -ge 9 ]; then
        echo -e "${GREEN}✓${NC} npm $NPM_VERSION (要求 9+)"
    else
        echo -e "${RED}✗${NC} npm $NPM_VERSION (需要 9+)"
        exit 1
    fi
else
    echo -e "${RED}✗${NC} 未找到 npm (需要 9+)"
    exit 1
fi

# 检查 pip 可用性
if python3 -m pip --version &> /dev/null; then
    echo -e "${GREEN}✓${NC} pip 可用"
else
    echo -e "${RED}✗${NC} pip 不可用"
    exit 1
fi

echo ""
echo "========================================"
echo -e "${GREEN}✓ 环境检查通过${NC}"
echo "========================================"
exit 0
