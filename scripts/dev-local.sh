#!/usr/bin/env bash
# 本地联调:同时启动 Bot Platform 服务器(来自 wxbot)与运营控制台(本项目)。
#
#   ./scripts/dev-local.sh
#
# 平台用 memory store + dev admin key,并 bootstrap 一个运营账号。
# 前提:wxbot 已 `npm run build`(dist 存在)。用 Node 22 LTS。
set -euo pipefail

CONSOLE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WXBOT_DIR="${WXBOT_DIR:-$(cd "$CONSOLE_DIR/../wxbot" && pwd)}"

# 与 .env.local 保持一致的 dev 值
API_KEY="${PLATFORM_API_KEY:-dev-local-admin-key}"
OP_EMAIL="${OPERATOR_EMAIL:-ops@example.com}"
OP_PASSWORD="${OPERATOR_PASSWORD:-supersecret123}"
PLATFORM_PORT="${PLATFORM_PORT:-8787}"
CONSOLE_PORT="${CONSOLE_PORT:-3100}"

echo "wxbot   = $WXBOT_DIR"
echo "console = $CONSOLE_DIR"

if [ ! -f "$WXBOT_DIR/dist/src/platform/server-main.js" ]; then
  echo "!! 未找到平台 dist,请先在 wxbot 执行 npm run build" >&2
  exit 1
fi

cleanup() { kill "${PLATFORM_PID:-}" 2>/dev/null || true; }
trap cleanup EXIT

echo ">> 启动平台服务器 :$PLATFORM_PORT (memory store, bootstrap operator)"
(
  cd "$WXBOT_DIR"
  BOT_PLATFORM_STORE=memory \
  BOT_PLATFORM_API_KEY="$API_KEY" \
  BOT_PLATFORM_BOOTSTRAP_OPERATOR_EMAIL="$OP_EMAIL" \
  BOT_PLATFORM_BOOTSTRAP_OPERATOR_PASSWORD="$OP_PASSWORD" \
  BOT_PLATFORM_BOOTSTRAP_OPERATOR_NAME="Ops Admin" \
  BOT_PLATFORM_PORT="$PLATFORM_PORT" \
  BOT_PLATFORM_ADMIN_CONSOLE=false \
  node dist/src/platform/server-main.js
) &
PLATFORM_PID=$!

echo ">> 登录信息: $OP_EMAIL / $OP_PASSWORD"
echo ">> 启动控制台 :$CONSOLE_PORT"
cd "$CONSOLE_DIR"
PORT="$CONSOLE_PORT" yarn dev
