# 蓝血菁英 (Blue Blood Elite)

> AI超级个体的精英社交 + 技能变现 + 成长赋能一站式平台

## 快速启动

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，填入以下配置：

| 变量 | 说明 | 必填 |
|------|------|------|
| `VITE_SUPABASE_URL` | Supabase 项目 URL | 是 |
| `VITE_SUPABASE_ANON_KEY` | Supabase 匿名 Key | 是 |
| `VITE_PRIVY_APP_ID` | Privy 应用 ID | 否（缺省时安全降级） |
| `VITE_PRIVY_CLIENT_ID` | Privy Client ID | 否（缺省时安全降级） |
| `VITE_BASE_CHAIN_ID` | Base 链 ID | 是 |
| `VITE_BASE_RPC_URL` | Base RPC URL | 是 |
| `VITE_USDC_TOKEN_ADDRESS` | USDC 合约地址 | 是 |
| `VITE_PLATFORM_WALLET_ADDRESS` | 平台钱包地址 | 是 |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect 项目 ID | 否 |
| `VITE_DEV_ACTOR_USER_ID` | 开发环境模拟用户 ID | 开发时使用 |

### 3. 初始化数据库

在 Supabase SQL Editor 中依次执行：

```bash
# 1. 创建表结构
supabase/schema.sql

# 2. 插入种子数据（可选）
supabase/seed.sql
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:5173

## 开发命令

```bash
pnpm dev            # 启动开发服务器 (http://localhost:5173)
pnpm build          # 生产构建
pnpm preview        # 预览生产构建
pnpm lint           # ESLint 代码检查
pnpm typecheck      # TypeScript 类型检查
pnpm test:run       # 运行全部单元测试
pnpm test           # 运行测试 (watch 模式)
```

## 项目结构

```
blue-blood-elite/
├── docs/                        # 产品文档
│   └── PRD-v3.0-final.md       # 产品需求文档
├── src/
│   ├── pages/                   # 页面组件（React Router 路由）
│   │   ├── home/                # 首页
│   │   ├── discover/            # 发现精英页
│   │   ├── growth/              # 成长入口页
│   │   ├── login/               # 登录页
│   │   ├── register/            # 注册页
│   │   ├── verify/              # VERIFIED 认证
│   │   ├── tasks/               # 任务池
│   │   │   ├── create/          # 发布任务
│   │   │   └── detail/          # 任务详情
│   │   ├── me/                  # 个人中心
│   │   │   ├── bounties/        # 我的任务
│   │   │   ├── connections/     # 连接管理
│   │   │   ├── messages/        # 私信列表
│   │   │   └── chat/            # 聊天界面
│   │   ├── profile/             # 精英档案
│   │   │   ├── detail/          # 精英详情页
│   │   │   └── edit/            # 编辑资料
│   │   └── notifications/       # 通知中心
│   ├── components/              # 可复用 UI 组件
│   │   ├── layout/              # AppShell、TabBar
│   │   ├── auth/                # 认证相关组件
│   │   ├── providers/           # AppProviders (QueryClient, Privy, Wagmi)
│   │   └── ui/                  # 通用 UI 组件
│   ├── config/                  # 前端静态配置
│   ├── domains/                 # 领域规则（状态机、合约、校验）
│   ├── features/                # 功能模块（按业务划分）
│   │   ├── applications/        # 申请认领
│   │   ├── connections/         # 连接关系
│   │   ├── deliveries/          # 交付验收
│   │   ├── discover/            # 发现页组件
│   │   ├── profile/             # 资料编辑
│   │   ├── tasks/               # 任务表单
│   │   └── verify/              # 认证表单
│   ├── lib/                     # 工具函数、Supabase client、env 校验
│   ├── repositories/            # 数据访问层（仓储模式）
│   ├── styles/                  # 全局样式
│   ├── router.tsx               # React Router 路由配置
│   └── main.tsx                 # 应用入口
├── supabase/
│   ├── schema.sql               # 数据库表结构
│   └── seed.sql                 # 种子数据
├── vitest.config.ts             # 单元测试配置
├── vite-env.d.ts                # Vite 类型声明
└── .env.example                 # 环境变量模板
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 构建 | Vite 8 |
| 框架 | React 19 + React Router 7 |
| 语言 | TypeScript 5 |
| 样式 | Tailwind CSS 4 + iOS 风格暗色设计系统 |
| 数据库 | Supabase (PostgreSQL + RLS) |
| 数据获取 | TanStack Query (React Query) |
| 认证 | Privy MPC 钱包（邮箱/Google 登录） |
| 状态 | Zustand + TanStack Query |
| 表单 | React Hook Form + Zod 校验 |
| 测试 | Vitest (单元) |
| 主链 | Base (Ethereum L2) |
| 支付 | USDC 稳定币 |

## 核心页面路由

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 项目介绍与导航 |
| 发现 | `/discover` | 精英列表 + 搜索 + 智能匹配 |
| 精英详情 | `/profile/:id` | 完整资料 + 信誉 + 历史任务 |
| 任务池 | `/tasks` | 筛选 + 任务卡片列表 |
| 任务详情 | `/tasks/:id` | 完整信息 + 认领 + 交付 + 评价 |
| 发布任务 | `/tasks/create` | 表单创建 |
| 注册 | `/register` | 邮箱/Google + Privy 钱包 |
| 登录 | `/login` | 邮箱登录 |
| 编辑资料 | `/profile/edit` | 头像/技能/简介 |
| 个人中心 | `/me` | 钱包、信誉、等级、成果 |
| 认证申请 | `/verify` | VERIFIED 认证 |
| 通知 | `/notifications` | 站内通知列表 |
| 我的任务 | `/me/bounties` | 已发布/已认领任务 |
| 连接管理 | `/me/connections` | 连接请求列表 |
| 私信列表 | `/me/messages` | 会话列表 |
| 聊天 | `/me/messages/:userId` | 实时聊天 |

## 测试

```bash
# 运行全部单元测试
pnpm test:run

# 运行特定模块测试
npx vitest run src/repositories/
```

## 开发注意事项

- 所有数据访问通过 `src/repositories/` 仓储层，不直接在页面中写查询
- 新功能遵循 TDD：先写测试 → 确认失败 → 实现 → 确认通过
- 页面为纯客户端组件，数据通过 TanStack Query 获取
- 写操作通过 `useMutation` + `supabase.rpc()` 调用 Supabase RPC
- 环境变量前缀为 `VITE_`，通过 `import.meta.env` 访问
- 任务状态转换遵循 `src/domains/bounties/status-machine.ts` 中定义的状态机
- 缺少 Privy 配置时系统安全降级，不阻断其他功能
