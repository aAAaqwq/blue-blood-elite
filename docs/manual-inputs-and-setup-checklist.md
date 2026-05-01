# 蓝血菁英后续人工配置与补充清单

> 这份文档专门记录：哪些内容必须由你人工提供、人工配置或在第三方平台侧完成，Claude 才能继续把项目推进到 MVP 可验收状态。

## 1. 必须人工提供的环境变量

以下内容不能由 Claude 自动生成，必须由你提供真实值：

### 1.1 Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_PASSWORD`（如需直连数据库或运行 SQL 脚本）
- `DEV_ACTOR_USER_ID`（开发阶段临时身份绑定，仅非生产环境使用）

### 1.2 Privy
- `NEXT_PUBLIC_PRIVY_APP_ID`
- `NEXT_PUBLIC_PRIVY_CLIENT_ID`
- Privy 控制台允许域名配置
- 实际启用的登录方式（邮箱 / Google / Wallet）

### 1.3 链与钱包
- `NEXT_PUBLIC_BASE_CHAIN_ID`
- `NEXT_PUBLIC_BASE_RPC_URL`
- `NEXT_PUBLIC_USDC_TOKEN_ADDRESS`
- `NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

---

## 2. 必须人工在第三方平台完成的配置

### 2.1 Supabase 控制台
你需要人工确认这些内容已经完成：
- 已创建项目并拿到 URL / Key
- 已执行 `src/lib/db/schema.sql`
- 如需演示数据，已执行 `src/lib/db/seed.sql`
- `users`、`user_skills`、`verify_applications`、`bounties` 等表真实存在
- RLS / Policy 已按最终方案配置（当前仍需后续补强）
- 如有文件上传需求，Storage bucket 已创建

### 2.2 Privy 控制台
你需要人工确认：
- App 已创建
- Client ID / App ID 已可用
- 本地开发域名已加入 allowlist
- 钱包创建策略符合 MVP 预期

### 2.3 Base / 合约侧
后续做到链上 MVP 前，你需要人工补：
- Base / Base Sepolia 真实 RPC
- Escrow 合约部署地址
- Reputation SBT 合约部署地址
- 平台收款地址
- 仲裁 / 管理员地址

---

## 3. 必须人工决定的业务规则

这些不是技术问题，是产品/运营规则，必须由你拍板：

### 3.1 VERIFIED 认证规则
当前代码里已有基础入口，但你需要明确最终口径：
- GitHub 500 stars 的审核标准
- “大厂 AI 方向 3 年经验”的证明材料范围
- “完成平台任务并高评分”的阈值
- 审核通过 / 驳回的状态与文案
- 是否允许人工复审

### 3.2 任务平台规则
后续任务系统真实闭环前，你需要明确：
- 任务分类最终枚举
- 最低悬赏金额
- 平台抽佣比例
- 可否取消任务
- 退款触发条件
- 争议处理流程

### 3.3 用户资料规则
你需要最终确认：
- skills 是否允许自由输入
- 是否采用技能白名单
- 是否允许多个外链
- 是否必须完成资料后才能申请认证 / 接任务

---

## 4. 必须人工提供的演示/运营数据

为了让 MVP 更像真实产品，你最好人工准备：
- 种子用户资料
- 种子技能标签
- 种子 VERIFIED 用户
- 种子任务列表
- 平台默认审核说明文案
- 用户协议 / 隐私政策 / 风险提示

---

## 5. 本地开发前置检查

如果你要我继续高质量推进开发，请先尽量保证：
- `.env.local` 已填写真实可用配置
- Supabase schema 已初始化
- 至少有一个开发态测试用户 ID 可用于 `DEV_ACTOR_USER_ID`
- `pnpm install` 已完成
- 本地可正常执行：

```bash
pnpm test:run
pnpm lint
pnpm typecheck
pnpm build
```

---

## 6. 上线前还需要你人工完成的事项

这些不能靠 Claude 自动完成：
- Vercel / 部署平台环境变量录入
- 生产库与测试库隔离
- 域名配置
- 隐私政策 / 用户协议上线
- 监控与告警接入（如 Sentry）
- 生产管理员身份与审核流程配置

---

## 7. 当前 Claude 可以继续自动推进的部分

即使你还没补齐所有人工项，我仍然可以继续做：
- 前端页面与交互闭环
- server action / repository / 表单校验
- Supabase 数据层读写逻辑
- 任务系统纯数据库 MVP
- 测试、lint、typecheck、build 稳定性
- 文档、README、开发进度维护

---

## 8. 当前最优先建议你人工补的 3 项

1. 把 `.env.local` 中的 Supabase / Privy / Base 配置补齐
2. 提供一个开发态 `DEV_ACTOR_USER_ID`
3. 确认云端 Supabase schema 已真实存在并可访问

---

## 9. 备注

- `DEV_ACTOR_USER_ID` 仅用于开发阶段临时身份绑定，生产环境不会启用。
- 如果你补齐了以上配置，Claude 可以继续把 `/profile/edit`、`/verify`、任务系统主链路往 MVP 验收标准推进。
