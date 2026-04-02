# 蓝血菁英（Blue Blood Elite）— 产品架构设计

> **文档版本：** v1.0  
> **编写日期：** 2026-04-02  
> **基于文档：** PRD v3.0 Final + 技术可行性评估（双版本）+ PRD评审  
> **状态：** ✅ 可交付开发

---

## 1. 架构总览

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端 (H5 / Mobile First)               │
│  Next.js 14 App Router · TailwindCSS · Zustand · Radix UI       │
│  Privy React SDK · viem + wagmi · SWR · react-markdown          │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS / WebSocket
┌───────────────────────────▼─────────────────────────────────────┐
│                     应用服务层 (BFF)                              │
│  Next.js API Routes — 认证/CRUD/通知/合约交互                     │
│  Privy JWT 验证 · 中间件鉴权 · 事件监听同步                       │
└──────┬────────────────┬──────────────────┬──────────────────────┘
       │                │                  │
┌──────▼──────┐  ┌──────▼───────┐  ┌───────▼──────────┐
│  Supabase   │  │   Base L2    │  │   Privy Auth     │
│ PostgreSQL  │  │  Ethereum    │  │   MPC Wallet     │
│ Storage·RLS │  │  Escrow·SBT  │  │   Embedded Auth  │
└─────────────┘  └──────────────┘  └──────────────────┘
```

---

## 2. 模块拆解

### 2.1 用户系统（Privy MPC）

| 维度 | 说明 |
|------|------|
| **职责** | 注册/登录、Privy MPC钱包自动创建、个人资料管理、VERIFIED认证、连接关系 |
| **输入** | 邮箱/手机号、密码、头像、昵称、技能标签、学校、公司、GitHub链接、认证材料 |
| **输出** | JWT Token、Privy wallet address、用户 profile、VERIFIED 状态 |
| **依赖** | Privy Auth API（外部）、Supabase users 表、verify_applications 表 |

**关键流程：**

```
注册请求 → Privy 创建 Auth + MPC 钱包
         → 后端接收 Privy JWT → 写入 users 表（含 wallet_address）
         → 返回 JWT + 用户信息
```

### 2.2 任务系统

| 维度 | 说明 |
|------|------|
| **职责** | 任务的发布/浏览/筛选/认领/交付/验收/取消全生命周期管理 |
| **输入** | 标题、描述(Markdown)、分类、技术标签、悬赏金额(USDC)、截止日期、交付标准、认领申请、交付物 |
| **输出** | 任务列表(分页)、任务详情、申请列表、交付记录、状态变更通知 |
| **依赖** | 用户系统（发布方/认领方身份）、Escrow 合约（资金锁定/释放）、Supabase bounties/applications/deliveries 表 |

### 2.3 Escrow 合约（USDC）

| 维度 | 说明 |
|------|------|
| **职责** | 链上 USDC 资金托管：锁定、释放、退款，自动分配平台佣金(10%) |
| **输入** | publisher 地址、USDC 金额、executor 地址、approve/dispute/cancel 指令 |
| **输出** | 链上状态变更事件（EscrowCreated / FundsReleased / Refunded） |
| **依赖** | Base L2、USDC contract (Base)、OpenZeppelin 安全库 |

### 2.4 SBT 信誉系统

| 维度 | 说明 |
|------|------|
| **职责** | 任务完成后自动铸造不可转让的信誉 Token，计算并缓存信誉分 |
| **输入** | 任务 ID、双方地址、满意度评分 |
| **输出** | SBT tokenId、信誉分(0-100)、信誉等级（新手/可靠/精英/传说） |
| **依赖** | 任务系统（完成事件触发）、ERC-5192 合约、reputation 缓存表 |

### 2.5 NFT 徽章系统（Post-MVP）

| 维度 | 说明 |
|------|------|
| **职责** | 里程碑成就 NFT 铸造与展示（黑客松获奖/收入里程碑/首个任务） |
| **输入** | 触发事件（完成任务/收入达标/获奖） |
| **输出** | ERC-721 NFT、个人主页徽章展示 |
| **依赖** | ERC-721 合约、任务系统、交易记录 |

### 2.6 通知系统

| 维度 | 说明 |
|------|------|
| **职责** | 站内实时通知（认领申请/审核结果/交付提醒/资金到账/SBT 铸造） |
| **输入** | 系统事件（任务状态变更/链上事件/用户操作） |
| **输出** | 通知列表（已读/未读）、推送消息（Post-MVP: 邮件/Browser Push） |
| **依赖** | Supabase notifications 表、任务系统状态变更 |

### 2.7 后台管理

| 维度 | 说明 |
|------|------|
| **职责** | 用户管理、VERIFIED 审核审批、任务争议处理、数据看板、平台配置 |
| **输入** | 管理员操作指令、审核材料、争议证据 |
| **输出** | 审核结果、数据报表、系统配置变更 |
| **依赖** | 所有业务模块的读写权限、Supabase、链上管理操作 |

---

## 3. 数据流图

### 3.1 核心交易闭环数据流

```
[发布方]              平台后端                 Base L2              [工程师]
   │                    │                       │                      │
   │ ① 发布任务表单     │                       │                      │
   │ ─────────────────→ │ ② 写入 bounties 表    │                      │
   │                    │                       │                      │
   │ ③ approve + deposit USDC to EscrowFactory  │                      │
   │ ────────────────────────────────────────→ │                      │
   │                    │ ④ 监听 EscrowCreated   │                      │
   │                    │    更新 status='open'   │                      │
   │                    │ ⑤ 推送通知给匹配工程师  │                      │
   │                    │ ───────────────────────────────────────────→ │
   │                    │                       │                      │
   │                    │ ⑥ 申请认领(message)    │                      │
   │                    │ ←─────────────────────────────────────────── │
   │ ⑦ 推送认领申请通知  │                       │                      │
   │ ←───────────────── │                       │                      │
   │ ⑧ 选择工程师        │                       │                      │
   │ ─────────────────→ │ 更新 status='in_progress'                    │
   │                    │ 推送通知：已被选中      │                      │
   │                    │                       │                      │
   │                    │ ⑨ 提交交付物           │                      │
   │                    │ ←─────────────────────────────────────────── │
   │                    │ 写入 deliveries + status='delivered'          │
   │ ⑩ 推送交付通知     │                       │                      │
   │ ←───────────────── │                       │                      │
   │ ⑪ 确认验收          │                       │                      │
   │ ─────────────────→ │ ⑫ 调用 Escrow.approve()                     │
   │                    │ ───────────────────────────────────────────→ │
   │                    │ ⑬ USDC 释放: 90%→工程师 + 10%→平台           │
   │                    │ ←─────────────────── │                      │
   │                    │ ⑭ 更新 status='completed'                    │
   │                    │ ⑮ 触发 ReputationSBT.mint()                  │
   │                    │ ⑯ 写入 transactions/reviews/reputation 缓存  │
   │                    │ ⑰ 推送双方通知         │                      │
   │ ←───────────────── │ ───────────────────────────────────────────→ │
```

### 3.2 超时退款数据流

```
截止日 + 7天宽限期 → [发布方] 点击退款
  → 后端校验超时 → 调用 Escrow.cancel()
  → USDC 原路返回发布方
  → 更新 bounty = 'cancelled'
  → 工程师信誉扣减
```

### 3.3 自动验收数据流（PRD评审补充）

```
交付提交后 → 定时任务检查
  → 交付满 7 天 + 发布方无操作 → 自动验收
  → 调用 Escrow.approve()
  → 资金释放 + SBT 铸造
```

---

## 4. 核心状态机

### 4.1 TaskStatus 状态转换

```
                         ┌───────────────────────────────────────┐
                         │           状态转换规则                  │
                         └───────────────────────────────────────┘

  ┌─────────┐   claim(address executor)    ┌─────────────┐
  │ Created │ ──────────────────────────→  │  Assigned   │
  │ (open)  │                              │(in_progress)│
  └────┬────┘                              └──────┬──────┘
       │                                          │
       │ cancel_by_publisher()                    │ submit_delivery()
       │ (无认领时可取消)                          │
       ↓                                          ↓
  ┌───────────┐                           ┌───────────┐
  │ Cancelled │                           │ Submitted │
  │ (cancelled)│                          │(delivered) │
  └───────────┘                           └──────┬────┘
                                                  │
                                    ┌─────────────┼─────────────┐
                                    │             │             │
                                    ↓             ↓             ↓
                             ┌──────────┐  ┌──────────┐  ┌──────────┐
                             │ Reviewed │  │ Disputed │  │ Revision │
                             │(completed)│ │(disputed)│  │Requested │
                             └──────────┘  └──────────┘  └──────────┘
                                    ↑                          │
                                    │     approve()            │
                                    │ ←────────────────────────┘
                                    │   (resubmit → 回到 Submitted)
                                    │
                                    ↓
                             ┌───────────────────┐
                             │ Escrow 释放        │
                             │ SBT 铸造           │
                             │ 信誉分更新          │
                             └───────────────────┘
```

### 4.2 状态转换表

| 当前状态 | 事件 | 触发者 | 目标状态 | 条件 |
|---------|------|--------|---------|------|
| `created` | `claim` | 发布方（选中申请者） | `assigned` | 有申请者 + Escrow 已锁定 |
| `created` | `cancel` | 发布方 | `cancelled` | 无人认领 + USDC 退款 |
| `assigned` | `submit_delivery` | 工程师 | `submitted` | 在截止日期前 |
| `assigned` | `timeout_dispute` | 系统 | `disputed` | 超过截止日+7天宽限 |
| `submitted` | `approve` | 发布方 | `completed` | 确认验收 → Escrow 释放 |
| `submitted` | `dispute` | 发布方 | `disputed` | 发起争议 |
| `submitted` | `request_revision` | 发布方 | `assigned` | 要求修改，工程师可重新提交 |
| `submitted` | `auto_approve` | 系统（定时） | `completed` | 交付 7 天无操作 |
| `disputed` | `resolve` | 管理员 / 仲裁 | `completed` / `cancelled` | 仲裁结果执行 |
| `completed` | — | — | **终态** | 资金已释放 + SBT 已铸 |
| `cancelled` | — | — | **终态** | 资金已退款 |

### 4.3 链上状态映射

```
数据库状态            Escrow 合约状态
─────────            ──────────────
created        ←→    Open         (USDC 已锁定)
assigned       ←→    InProgress   (executor 已记录)
submitted      ←→    Delivered    (交付物已提交)
completed      ←→    Completed    (资金已释放)
cancelled      ←→    Cancelled    (资金已退款)
disputed       ←→    Disputed     (资金锁定待仲裁)
```

---

## 5. 接口定义

### 5.1 REST API（前端 ↔ BFF）

#### 用户模块

```
POST   /api/auth/callback          # Privy 认证回调，创建/同步用户
GET    /api/users/:id              # 获取用户 profile
PUT    /api/users/:id              # 更新用户 profile
GET    /api/users/:id/reputation   # 获取用户信誉分 + SBT 列表
GET    /api/users/:id/tasks        # 获取用户参与的任务列表

POST   /api/verify/applications    # 提交 VERIFIED 认证申请
GET    /api/verify/applications    # 管理员：获取认证申请列表
PUT    /api/verify/applications/:id # 管理员：审批认证申请

POST   /api/connections            # 发送连接请求
PUT    /api/connections/:id        # 接受/拒绝连接
GET    /api/connections            # 获取我的连接列表
```

#### 任务模块

```
POST   /api/bounties               # 创建任务（同步创建 Escrow）
GET    /api/bounties               # 任务列表（分页+筛选+排序）
       ?category=Agent开发
       &sort=reward_desc
       &page=1&limit=20
GET    /api/bounties/:id           # 任务详情
PUT    /api/bounties/:id           # 更新任务（仅 created 状态）
GET    /api/bounties/:id/applicants # 获取申请者列表

POST   /api/bounties/:id/apply     # 申请认领
PUT    /api/bounties/:id/claim     # 确认认领（选择申请者）
POST   /api/bounties/:id/deliver   # 提交交付物
PUT    /api/bounties/:id/approve   # 确认验收 → 触发 Escrow 释放
PUT    /api/bounties/:id/revision  # 要求修改
POST   /api/bounties/:id/cancel    # 取消任务（退款）
POST   /api/bounties/:id/dispute   # 发起争议

POST   /api/bounties/:id/review    # 提交评价（1-5星 + 评论）
```

#### 通知模块

```
GET    /api/notifications          # 通知列表（分页）
PUT    /api/notifications/read     # 标记已读（批量/全部）
GET    /api/notifications/unread   # 未读数量
```

#### 钱包模块

```
GET    /api/wallet/balance         # USDC 余额（链上实时查询）
GET    /api/wallet/transactions    # 交易记录（分页）
GET    /api/wallet/address         # 获取 Privy 钱包地址
```

#### 精英搜索

```
GET    /api/discover               # 精英列表
       ?direction=AI模型
       &skill=RAG,PromptEngineering
       &search=关键词
       &sort=active&page=1&limit=20
```

### 5.2 链上合约接口（Solidity）

```solidity
// ── EscrowFactory.sol ──────────────────────────────────
interface IEscrowFactory {
    function createEscrow(bytes32 bountyId, address publisher, uint256 amount)
        external returns (address escrow);
    function getEscrow(bytes32 bountyId) external view returns (address);
    function escrowCount() external view returns (uint256);

    event EscrowCreated(bytes32 indexed bountyId, address indexed escrow,
                        address indexed publisher, uint256 amount);
}

// ── BountyEscrow.sol（单任务托管）────────────────────────
interface IBountyEscrow {
    function claim(address executor) external;        // 认领
    function approve() external;                      // 验收 → 释放资金
    function cancel() external;                       // 取消 → 退款
    function dispute() external;                      // 发起争议
    function resolve(address winner, uint256 share) external; // 仲裁

    function status() external view returns (EscrowStatus);
    function lockedAmount() external view returns (uint256);

    enum EscrowStatus { Open, InProgress, Delivered, Completed, Cancelled, Disputed }

    event FundsDeposited(address indexed publisher, uint256 amount);
    event ExecutorClaimed(address indexed executor);
    event FundsReleased(address indexed executor, uint256 executorAmt, uint256 fee);
    event FundsRefunded(address indexed publisher, uint256 amount);
    event DisputeRaised(address indexed by);
    event DisputeResolved(address indexed winner, uint256 amount);
}

// ── ReputationSBT.sol（ERC-5192 信誉 Token）────────────
interface IReputationSBT {
    function mint(address to, bytes32 bountyId, uint8 rating, uint8 role) external;
    function balanceOf(address owner) external view returns (uint256);
    function reputationScore(address owner) external view returns (uint256);
    function tokenMetadata(uint256 tokenId) external view
        returns (bytes32 bountyId, uint8 rating, uint8 role, uint256 mintedAt);
    function locked(uint256 tokenId) external view returns (bool);  // ERC-5192

    event ReputationMinted(address indexed to, uint256 indexed tokenId,
                           bytes32 indexed bountyId, uint8 rating);
}
```

---

## 6. 扩展点设计

### 6.1 任务类型插件化

```
┌──────────────────────────────────────┐
│          TaskTypeRegistry            │
│  ┌────────────────────────────────┐  │
│  │ type: "bounty"        (默认)   │  │
│  │ type: "hourly"        (v1.1)   │  │
│  │ type: "milestone"     (v2.0)   │  │
│  │ type: "contest"       (v1.3)   │  │
│  └────────────────────────────────┘  │
│                                      │
│  每种类型可自定义:                      │
│  - 发布表单字段                       │
│  - 交付验收规则                       │
│  - Escrow 释放策略                    │
│  - SBT 铸造权重                       │
└──────────────────────────────────────┘
```

**实现方式：** 数据库 `bounties` 表增加 `task_type` 字段，后端通过策略模式加载不同处理器。合约层保持通用，扩展逻辑在应用层。

### 6.2 支付方式扩展

```
当前: USDC on Base (唯一)
  ↓
v1.1: + USDC on Arbitrum (多链)
v2.0: + 法币 On-ramp (MoonPay / Stripe Crypto)
v2.0: + 里程碑分批释放
v3.0: + ERC-20 多币种支持
```

**实现方式：** 前端通过 `PaymentAdapter` 抽象层统一支付接口，新增支付方式只需实现 `deposit/release/refund` 三个方法。

### 6.3 多链支持

```typescript
// 链配置抽象
interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  usdcAddress: string;
  escrowFactory: string;
  reputationSBT: string;
  explorer: string;
}

// MVP: Base Mainnet
// v1.1: + Arbitrum One
// v2.0: + Optimism / Polygon
```

**原则：** 合约代码严格 EVM 标准，不使用链特有 precompiles；链相关参数全部配置化，运行时可切换。

---

## 7. 技术选型建议

### 7.1 逐模块选型

| 模块 | 技术栈 | 理由 |
|------|--------|------|
| **前端框架** | Next.js 14 (App Router) | SSR + 文件路由 + API Routes，前后端一体 |
| **UI 层** | TailwindCSS + Radix UI | 快速开发深色主题 + 无样式原语组件 |
| **状态管理** | Zustand | 轻量，MVP 够用 |
| **链上交互** | viem + wagmi | TypeScript 原生 + React hooks |
| **钱包/认证** | Privy React SDK + MetaMask fallback | MPC 无感上链 + 降级方案 |
| **数据缓存** | SWR | 链上/链下数据统一缓存策略 |
| **后端** | Next.js API Routes | MVP 零额外运维 |
| **数据库** | Supabase (PostgreSQL + RLS) | 免费额度大、实时订阅、零运维 |
| **文件存储** | Supabase Storage | 头像/附件，统一管理 |
| **智能合约** | Solidity + OpenZeppelin + Foundry | EVM 标准 + 安全库 + 快速测试 |
| **链** | Base L2 (主) | Gas $0.001、USDC 原生、2s 出块 |
| **支付** | USDC on Base | 稳定币、Circle 合规发行 |
| **合约安全** | Slither + Foundry fuzz + 专业审计 | MVP 内部审计 + 上线前 CertiK |
| **部署** | Vercel (前端) + Supabase (数据) | 一键部署、全球 CDN |
| **监控** | Sentry + Vercel Analytics + 自定义链上事件监听 | MVP 最低可观测性 |
| **通知** | Supabase Realtime + 定时轮询 | MVP 站内通知 |
| **链上索引** | Supabase 镜像表 + SWR 缓存 | MVP 最简方案；Post-MVP 引入 Ponder |

### 7.2 开发工具链

| 工具 | 用途 |
|------|------|
| **Foundry** | Solidity 开发 + 测试 + 部署（forge + cast） |
| **Slither** | 合约静态安全分析 |
| **Base Sepolia** | 测试网（USDC faucet） |
| **Supabase CLI** | 数据库 migration + 本地开发 |
| **Turborepo**（可选） | monorepo 管理（合约 + 前端） |

### 7.3 安全架构

```
┌─ 前端安全 ──────────────────────────────────┐
│  Privy JWT → 后端验证 → API 鉴权中间件        │
│  CSP 策略 · XSS 过滤 · HTTPS 全站            │
└─────────────────────────────────────────────┘
┌─ 后端安全 ──────────────────────────────────┐
│  Supabase RLS 行级权限                        │
│  Rate Limiting (60 req/min/IP)               │
│  ORM 参数化查询 · 输入校验                    │
└─────────────────────────────────────────────┘
┌─ 合约安全 ──────────────────────────────────┐
│  OpenZeppelin (ReentrancyGuard/SafeERC20)    │
│  Pausable 可暂停 · 单笔 $10K 限额             │
│  Slither + Foundry fuzz + 专业审计            │
└─────────────────────────────────────────────┘
```

---

## 8. 关键架构决策记录

| # | 决策 | 选项 | 选择 | 理由 |
|---|------|------|------|------|
| ADR-1 | 前后端架构 | 全栈 Next.js vs 独立后端 | **Next.js 全栈** | MVP 核心逻辑在链上，后端只做 CRUD，无需独立后端 |
| ADR-2 | 钱包方案 | Privy MPC vs MetaMask vs Dynamic | **Privy (主) + MetaMask (fallback)** | 无感上链是核心 UX，MPC 最优；fallback 保障可用性 |
| ADR-3 | 链选择 | Base vs Arbitrum vs Polygon | **Base L2** | Gas 极低 + USDC 原生 + Coinbase 背书 |
| ADR-4 | 数据库 | Supabase vs 自建 PG | **Supabase** | 免费额度大 + RLS 安全 + 零运维 |
| ADR-5 | Escrow 模式 | 单合约 vs Factory 模式 | **EscrowFactory** | 每个任务独立实例，资金隔离、安全 |
| ADR-6 | SBT 标准 | ERC-721 vs ERC-5192 | **ERC-5192** | 原生不可转让语义，减少合约逻辑 |
| ADR-7 | 首发形态 | H5 Web vs 小程序 vs App | **H5 Web (移动优先)** | 无需审核、迭代快、跨平台 |
| ADR-8 | 自动验收 | 无 vs 定时触发 | **交付 7 天自动验收** | 保障工程师权益，防止发布方恶意拖延 |

---

*本文档为蓝血菁英项目产品架构设计，基于 PRD v3.0 Final + 技术可行性评估综合产出，可直接指导开发。*

*— 产品架构团队, 2026年4月*
