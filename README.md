# Bot Platform 运营工作台 (wxbot-console)

Bot Platform(`@tencent-weixin/openclaw-weixin`)的运营端 Web 控制台。运营方用邮箱+密码登录后,可管理租户 / 应用,并监控全平台(Webhook 投递、事件、用量计费、渠道健康)。

基于 [Horizon UI Tailwind Next.js Pro](https://horizon-ui.com/pro) 模板(Next.js 15 App Router + React 19 + Chakra UI + Tailwind + ApexCharts + TanStack Table)。

## 架构

```
浏览器 ── 控制台 SPA(Next.js,全站 CSR)
   │   · 登录页 → /api/auth/login
   │   · 数据页 → /api/* (BFF)
   ▼  httpOnly JWT cookie(console_session)
Next.js BFF(本项目的 route handlers)
   │   · 校验运营会话(jose / HS256)
   │   · 服务端持有平台 admin API key,代调平台 —— 浏览器永不接触 key
   ▼  Bearer <PLATFORM_API_KEY>
Bot Platform API(wxbot / src/platform)
```

- **认证**:运营账号存平台后端(`operators`,scrypt 哈希),BFF `/api/auth/login` 校验后签发 JWT cookie;`src/middleware.ts` 守卫 `/admin/*`。
- **鉴权隔离**:v1 运营为平台超管,复用平台 `admin:*` scope。租户级隔离授权留待 v2(租户自助端)。

## 环境变量(`.env.local`,见 `.env.example`)

| 变量 | 说明 |
|------|------|
| `PLATFORM_API_URL` | 平台 API 地址,默认 `http://localhost:8787` |
| `PLATFORM_API_KEY` | 平台 admin API key(BFF 服务端持有),须与平台 `BOT_PLATFORM_API_KEY` 一致 |
| `CONSOLE_JWT_SECRET` | 会话 JWT 签名密钥,生产用 `openssl rand -base64 48` |

## 本地开发

需 **Node 22 LTS** 与 **yarn**。

```bash
# 1) 装依赖
yarn install

# 2) 配置环境
cp .env.example .env.local   # 按需修改

# 3a) 一键联调(自动起平台 + 控制台;需 wxbot 已 npm run build)
./scripts/dev-local.sh

# 3b) 或分别启动:
#   平台(在 wxbot 目录):
#   BOT_PLATFORM_STORE=memory BOT_PLATFORM_API_KEY=dev-local-admin-key \
#   BOT_PLATFORM_BOOTSTRAP_OPERATOR_EMAIL=ops@example.com \
#   BOT_PLATFORM_BOOTSTRAP_OPERATOR_PASSWORD=supersecret123 \
#   npm run platform:serve
#   控制台:
   PORT=3100 yarn dev
```

打开 http://localhost:3100 ,用 bootstrap 运营账号登录(默认 `ops@example.com` / `supersecret123`)。

## 首个运营账号

平台通过环境变量 bootstrap(幂等,不会覆盖已有密码):
`BOT_PLATFORM_BOOTSTRAP_OPERATOR_EMAIL` + `BOT_PLATFORM_BOOTSTRAP_OPERATOR_PASSWORD`。
之后可经平台 `POST /v1/admin/operators` 增开账号。

## 页面(运营端 v1)

| 页面 | 数据源(平台 API) |
|------|-------------------|
| Overview | `GET /v1/admin/dashboard` |
| Tenants | `GET/POST /v1/admin/tenants`、`/tenants/:id/status` |
| Apps | `GET/POST /v1/admin/apps`、`/workspaces`、`/apps/:id/status` |
| Delivery Logs | `GET /v1/admin/delivery-logs` |
| Events | `GET /v1/admin/events` |
| Usage & Billing | `GET /v1/admin/billing-summary` |
| Channel Health | `GET /v1/admin/channel-health` |

## 后续(v2)

租户自助端:平台侧补租户隔离授权(`verifyApiKey` 按 tenantId 校验)、角色强制、租户自助注册;控制台增加租户视图与 webhook/邀请码自助配置。
