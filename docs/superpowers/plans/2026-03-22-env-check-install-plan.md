# 环境检查与依赖安装脚本实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建 `check_env.sh` 和 `install_deps.sh` 两个脚本，实现环境检查和依赖安装功能。

**Architecture:** 模块化设计，check_env.sh 独立检查环境，install_deps.sh 负责安装所有依赖并调用 check_env 做前置检查。

**Tech Stack:** Bash 脚本

---

## 文件结构

```
scripts/
├── check_env.sh      # Create: 环境检查脚本
└── install_deps.sh   # Create: 依赖安装脚本
```

---

## Task 1: 创建 check_env.sh

**Files:**
- Create: `scripts/check_env.sh`

- [ ] **Step 1: 创建脚本文件并写入头部**

```bash
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
```

- [ ] **Step 2: 检查 Python 版本**

```bash
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
```

- [ ] **Step 3: 检查 Node.js 版本**

```bash
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
```

- [ ] **Step 4: 检查 npm 版本**

```bash
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
```

- [ ] **Step 5: 检查 pip 可用性**

```bash
# 检查 pip 可用性
if python3 -m pip --version &> /dev/null; then
    echo -e "${GREEN}✓${NC} pip 可用"
else
    echo -e "${RED}✗${NC} pip 不可用"
    exit 1
fi
```

- [ ] **Step 6: 添加结尾输出**

```bash
echo ""
echo "========================================"
echo -e "${GREEN}✓ 环境检查通过${NC}"
echo "========================================"
exit 0
```

- [ ] **Step 7: 设置执行权限并提交**

```bash
chmod +x scripts/check_env.sh
git add scripts/check_env.sh
git commit -m "feat: 添加环境检查脚本

检查 Python 3.11+、Node.js 18+、npm 9+ 和 pip 可用性"
```

---

## Task 2: 创建 install_deps.sh

**Files:**
- Create: `scripts/install_deps.sh`

- [ ] **Step 1: 创建脚本文件并写入头部**

```bash
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
```

- [ ] **Step 2: 添加环境检查调用**

```bash
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
```

- [ ] **Step 3: 添加后端依赖安装**

```bash
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
```

- [ ] **Step 4: 添加 Playwright 安装**

```bash
# Step 3: 安装 Playwright 浏览器
echo "[3/4] 安装 Playwright 浏览器..."
if python3 -m playwright install chromium; then
    echo -e "${GREEN}✓${NC} 安装完成"
else
    echo -e "${RED}✗ 安装失败${NC}"
    exit 1
fi
echo ""
```

- [ ] **Step 5: 添加前端依赖安装**

```bash
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
```

- [ ] **Step 6: 添加结尾输出**

```bash
echo "========================================"
echo -e "${GREEN}✓ 所有依赖安装完成${NC}"
echo "========================================"
echo ""
echo "现在可以运行 ./start.sh 启动服务"
exit 0
```

- [ ] **Step 7: 设置执行权限并提交**

```bash
chmod +x scripts/install_deps.sh
git add scripts/install_deps.sh
git commit -m "feat: 添加依赖安装脚本

安装后端 pip 包、Playwright 浏览器和前端 npm 依赖"
```

---

## Task 3: 验证脚本

- [ ] **Step 1: 运行 check_env.sh 验证**

```bash
./scripts/check_env.sh
```
预期输出类似：
```
========================================
  IMGR 环境检查
========================================

✓ Python 3.12.8 (要求 3.11+)
✓ Node.js 20.11.0 (要求 18+)
✓ npm 10.2.4 (要求 9+)
✓ pip 可用

========================================
✓ 环境检查通过
========================================
```

- [ ] **Step 2: 验证脚本可被直接调用**

```bash
bash scripts/check_env.sh
# 或
sh scripts/check_env.sh
```
