# Next.js → Vite + React Router 迁移计划

## Context

用户要求将前端从 Next.js 16 App Router 迁移到 Vite + React Router，保留 Supabase 后端和所有业务逻辑。

### 当前项目规模
- **17 个页面路由**（16 个 Server Component + 1 个 Client Component）
- **9 个 API Route Handler**（~742 行）
- **9 个 Server Action 文件**（~887 行）
- **9 个 Repository 文件**（数据访问层）
- **6 个共享组件** + **7 个功能组件** = **13 个可复用组件**
- **24 个测试文件**
- 总计约 5,000+ 行代码

---

## 技术方案

### 架构选择

| 层级 | 当前 | 迁移后 |
|------|------|--------|
| 框架 | Next.js 16 App Router | Vite 6 + React 19 + React Router 7 |
| 路由 | 文件系统路由 (app/) | React Router 声明式路由 |
| 数据获取 | Server Components + Supabase Server Client | React Query + Supabase Browser Client |
| API Routes | Next.js Route Handlers | **Supabase RPC（数据库函数）** |
| Server Actions | `"use server"` + `revalidatePath` | React Query mutations + `queryClient.invalidateQueries()` |
| 认证 | Privy MPC 钱包 + wagmi + viem | Privy MPC 钱包 + wagmi + viem（不变） |
| 环境变量 | `NEXT_PUBLIC_*` (10个) + 服务端 (4个) + 开发 (1个) | `VITE_*` (11个)，服务端变量删除 |
| 构建 | `next build` | `vite build` |
| 测试 | Vitest (不变) | Vitest (不变) |
| CSS | Tailwind CSS 4 (不变) | Tailwind CSS 4 (不变) |

### RLS 策略（关键变更）

**当前架构**：
- Server Components / API Routes / Server Actions 使用 `SERVICE_ROLE_KEY`（**绕过 RLS**）
- 只有 `createBrowserSupabaseClient()` 使用 `ANON_KEY`（受 RLS 约束）

**迁移后架构**：
- 所有操作使用 `ANON_KEY`（受 RLS 约束）
- 必须先审计所有 RLS 策略，确保客户端操作被允许
- 事务性操作（如 accept-application 需同时更新 bounty、applications、notifications）转为 **Supabase RPC**

**需要创建的 Supabase RPC 函数**：

| RPC 函数名 | 替代的 API Route | 操作内容 |
|-------------|-----------------|----------|
| `accept_application(p_app_id, p_bounty_id)` | `POST /api/applications/[id]/accept` | 更新申请状态 + 拒绝其他申请 + 更新任务状态 + 创建通知（4步事务） |
| `reject_application(p_app_id)` | `POST /api/applications/[id]/reject` | 更新申请状态 + 创建通知 |
| `accept_delivery(p_delivery_id, p_bounty_id)` | `POST /api/deliveries/[id]/accept` | 更新交付状态 + 更新任务状态 + 创建通知 |
| `reject_delivery(p_delivery_id)` | `POST /api/deliveries/[id]/reject` | 更新交付状态 + 创建通知 |
| `cancel_bounty(p_bounty_id)` | `POST /api/bounties/[id]/cancel` | 更新任务状态 |
| `create_connection(p_from, p_to)` | `POST /api/connections` | 创建连接 + 创建通知 |
| `apply_for_bounty(p_bounty_id, p_message, p_applicant_id)` | `POST /api/bounties/[id]/apply` | 验证重复 + INSERT 申请 + INSERT 通知 |
| `submit_delivery(p_bounty_id, p_content, p_claimed_by)` | `POST /api/bounties/[id]/deliver` | INSERT 交付 + UPDATE 任务状态 + INSERT 通知 |
| `create_review(p_bounty_id, p_rating, p_content, p_reviewer_id)` | `POST /api/bounties/[id]/review` | INSERT 评价 + UPDATE 任务状态 + INSERT 通知 |

**迁移前必须完成的 RLS 审计**：
1. 列出所有数据库表的 RLS 策略
2. 确认 ANON_KEY 用户能执行当前所有 SERVICE_ROLE_KEY 用户的操作
3. 为缺失的权限添加 RLS 策略
4. 对于涉及多表事务的操作，创建 RPC 函数（使用 `SECURITY DEFINER` 在服务端执行）

### API Routes 处理策略

**方案：混合模式 — Supabase RPC + 客户端直接操作**

- **简单 CRUD**（create-application, submit-delivery, apply-bounty, create-review）：直接用 Supabase Browser Client 执行（前提：RLS 策略允许）
- **多步事务操作**（accept-application, reject-application, accept-delivery, reject-delivery, cancel-bounty, create-connection）：调用 Supabase RPC

---

## 环境变量迁移

| 当前变量 | 迁移后变量 | 用途 |
|---------|-----------|------|
| `NEXT_PUBLIC_APP_URL` | `VITE_APP_URL` | 应用 URL |
| `NEXT_PUBLIC_PRIVY_APP_ID` | `VITE_PRIVY_APP_ID` | Privy 认证 |
| `NEXT_PUBLIC_PRIVY_CLIENT_ID` | `VITE_PRIVY_CLIENT_ID` | Privy OAuth Client |
| `NEXT_PUBLIC_BASE_CHAIN_ID` | `VITE_BASE_CHAIN_ID` | Base 链 ID |
| `NEXT_PUBLIC_BASE_RPC_URL` | `VITE_BASE_RPC_URL` | Base RPC |
| `NEXT_PUBLIC_USDC_TOKEN_ADDRESS` | `VITE_USDC_TOKEN_ADDRESS` | USDC 合约地址 |
| `NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS` | `VITE_PLATFORM_WALLET_ADDRESS` | 平台钱包 |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect |
| `NEXT_PUBLIC_SUPABASE_URL` | `VITE_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `VITE_SUPABASE_ANON_KEY` | Supabase Anon Key |
| `SUPABASE_URL` | **删除** | 仅服务端使用 |
| `SUPABASE_ANON_KEY` | **删除** | 仅服务端使用 |
| `SUPABASE_SERVICE_ROLE_KEY` | **删除** | 仅服务端使用 |
| `SUPABASE_DB_PASSWORD` | **删除** | 仅服务端使用 |
| `DEV_ACTOR_USER_ID` | `VITE_DEV_ACTOR_USER_ID` | 开发模式 actor |

---

## 迁移步骤

### 阶段 0：RLS 审计 + RPC 创建（前置条件）

**目标**：确保 Supabase 端的权限和事务逻辑到位

#### 0.1 RLS 策略审计

```sql
-- 列出所有表的 RLS 策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies WHERE schemaname = 'public';
```

对每个表检查：
- `users` — SELECT（认证用户可读自己的 + 公开字段）、UPDATE（仅自己）
- `bounties` — SELECT（公开）、INSERT（认证用户）、UPDATE（发布者）
- `applications` — SELECT（涉及用户）、INSERT（认证用户）、UPDATE（任务发布者）
- `deliveries` — SELECT（涉及用户）、INSERT（认领者）、UPDATE（任务发布者）
- `notifications` — SELECT（自己的）、INSERT（系统/RPC）、UPDATE（自己的）
- `connections` — SELECT（涉及用户）、INSERT（认证用户）、UPDATE（目标用户）
- `messages` — SELECT（参与者）、INSERT（参与者）

#### 0.2 创建 Supabase RPC 函数

```sql
-- 示例：accept_application
CREATE OR REPLACE FUNCTION accept_application(p_app_id uuid, p_bounty_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_applicant_id uuid;
  v_publisher_id uuid;
BEGIN
  -- 获取申请信息
  SELECT applicant_id INTO v_applicant_id FROM applications WHERE id = p_app_id;
  -- 获取发布者
  SELECT publisher_id INTO v_publisher_id FROM bounties WHERE id = p_bounty_id;

  -- 验证调用者是发布者（通过 RLS 或显式检查）
  IF v_publisher_id != auth.uid() THEN
    RAISE EXCEPTION '无权操作';
  END IF;

  -- 更新申请状态
  UPDATE applications SET status = 'accepted', reviewed_at = now() WHERE id = p_app_id;
  -- 拒绝其他申请
  UPDATE applications SET status = 'rejected', reviewed_at = now()
    WHERE bounty_id = p_bounty_id AND status = 'pending' AND id != p_app_id;
  -- 更新任务状态
  UPDATE bounties SET status = 'in_progress', claimed_by = v_applicant_id, claimed_at = now()
    WHERE id = p_bounty_id;
  -- 通知
  INSERT INTO notifications (user_id, type, title, content, related_id)
    VALUES (v_applicant_id, 'application_accepted', '申请已通过',
            '恭喜！您的任务申请已被接受，请尽快开始工作。', p_bounty_id);
END;
$$;
```

为每个多步事务操作创建类似 RPC。

### 阶段 1：项目骨架搭建

**目标**：创建新的 Vite 项目，配置基础工具链

#### 1.1 初始化 Vite 项目

```bash
pnpm create vite blue-blood-elite-v2 --template react-ts
```

#### 1.2 安装依赖

```bash
# 核心依赖
pnpm add react-router @tanstack/react-query @supabase/supabase-js zustand zod react-hook-form @hookform/resolvers

# Web3 认证（从当前项目保留）
pnpm add @privy-io/react-auth @privy-io/wagmi wagmi viem

# UI 工具
pnpm add clsx tailwind-merge lucide-react react-markdown remark-gfm

# 开发依赖
pnpm add -D @vitejs/plugin-react tailwindcss @tailwindcss/vite vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**关键**：`react-router`（v7 统一包，**不是** `react-router-dom`）

#### 1.3 配置文件

**`vite.config.ts`**
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**`tsconfig.json`** — 更新 paths alias 和移除 Next.js 类型，添加 `vite/client` 类型

**`.env.example`** — `NEXT_PUBLIC_*` → `VITE_*`（见上方环境变量表）

### 阶段 2：迁移设计系统和静态资源

**目标**：完整迁移 CSS、字体、图片

| 源文件 | 操作 | 目标位置 |
|--------|------|----------|
| `src/app/globals.css` | 直接复制 | `src/styles/globals.css` |
| `public/` | 直接复制 | `public/` |
| `supabase/` | 直接复制 | `supabase/` |

### 阶段 3：迁移基础设施层

**目标**：迁移不依赖 Next.js 的底层模块

| 源文件 | 操作 | 说明 |
|--------|------|----------|
| `src/lib/supabase/client.ts` | 重构 | `process.env.NEXT_PUBLIC_*` → `import.meta.env.VITE_*` |
| `src/lib/supabase/server.ts` | **删除** | Vite 无服务端 |
| `src/lib/supabase/server.test.ts` | **删除** | 测试服务端 client |
| `src/lib/server-env.ts` + `server-env.test.ts` | **删除** | 服务端环境变量验证 |
| `src/lib/actor.ts` | 重构 | 移除 `resolveServerActor`，改为客户端 auth hook |
| `src/lib/env.ts` + `env.test.ts` | 更新 | `NEXT_PUBLIC_*` → `VITE_*` |
| `src/config/app.ts` | 直接复制 | 无 Next.js 依赖 |
| `src/domains/**/*` | 直接复制 | 纯业务逻辑 |

#### 3.1 Auth Hook（替代 resolveServerActor）

```ts
// src/lib/hooks/use-auth.ts
import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'

export function useAuth() {
  const [devUserId, setDevUserId] = useState<string | null>(null)
  const { authenticated, user } = usePrivy()

  useEffect(() => {
    // Dev mode: read from env
    const id = import.meta.env.VITE_DEV_ACTOR_USER_ID
    if (id) setDevUserId(id)
  }, [])

  // Prod: use Privy wallet address as user ID
  const privyUserId = authenticated ? user?.id ?? null : null
  const userId = devUserId ?? privyUserId

  return {
    userId,
    isAuthenticated: !!userId,
    isDevMode: !!devUserId,
  }
}
```

#### 3.2 Web3 Provider（从 AppProviders 迁移）

```tsx
// src/components/providers/app-providers.tsx
import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from '@privy-io/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMemo } from 'react'

const privyAppId = import.meta.env.VITE_PRIVY_APP_ID
const privyClientId = import.meta.env.VITE_PRIVY_CLIENT_ID

export function AppProviders({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), [])

  if (!privyAppId || !privyClientId) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return (
    <PrivyProvider appId={privyAppId} clientId={privyClientId} config={{
      appearance: { theme: 'dark', accentColor: '#1890FF' },
      embeddedWallets: { ethereum: { createOnLogin: 'users-without-wallets' } },
      loginMethods: ['email', 'google'],
    }}>
      <WagmiProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  )
}
```

### 阶段 4：迁移 Repository 层

**目标**：将所有 Repository 从 Server Supabase Client 改为 Browser Client

**关键变更**：每个 repository 函数接收 `SupabaseClient` 参数不变，但传入的是 browser client 而非 server client。

| 文件 | 操作 |
|------|------|
| `src/repositories/*.ts` (9个) | 直接复制（接口不变） |
| `src/repositories/*.test.ts` (6个) | 直接复制（mock 模式不变） |

**注意**：当前 repository 的测试全部使用 mock，不依赖真实数据库，所以迁移无需改动测试。

### 阶段 5：迁移 UI 组件

**目标**：迁移所有共享组件

| 组件 | 操作 | 说明 |
|------|------|------|
| `components/layout/app-shell.tsx` | 直接复制 | 纯 React |
| `components/layout/mobile-tab-bar.tsx` | 改 2 行 | `next/link` → `react-router Link`，`usePathname` → `useLocation` |
| `components/ui/page-hero.tsx` | 直接复制 | 无 Next.js 依赖 |
| `components/ui/form-fields.tsx` | 直接复制 | 无 Next.js 依赖 |
| `components/auth/auth-card.tsx` | 直接复制 | 无 Next.js 依赖 |
| `components/providers/app-providers.tsx` | 重构 | `process.env.NEXT_PUBLIC_*` → `import.meta.env.VITE_*`，添加 WagmiProvider |

### 阶段 6：迁移页面路由

**目标**：将所有 17 个页面转为 React Router 路由组件

#### 6.1 路由配置

```tsx
// src/router.tsx
import { createBrowserRouter } from 'react-router'
import { AppShell } from '@/components/layout/app-shell'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/discover', element: <DiscoverPage /> },
      { path: '/tasks', element: <TasksPage /> },
      { path: '/tasks/create', element: <TaskCreatePage /> },
      { path: '/tasks/:id', element: <TaskDetailPage /> },
      { path: '/growth', element: <GrowthPage /> },
      { path: '/me', element: <MePage /> },
      { path: '/me/bounties', element: <MeBountiesPage /> },
      { path: '/me/connections', element: <MeConnectionsPage /> },
      { path: '/me/messages', element: <MeMessagesPage /> },
      { path: '/me/messages/:userId', element: <ChatPage /> },
      { path: '/profile/:id', element: <ProfileDetailPage /> },
      { path: '/profile/edit', element: <ProfileEditPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/verify', element: <VerifyPage /> },
      { path: '/notifications', element: <NotificationsPage /> },
    ],
  },
])
```

#### 6.2 页面迁移模式

**每个 Server Component 页面的迁移模式：**

```tsx
// Before (Next.js Server Component)
export default async function TasksPage() {
  const supabase = createServerSupabaseClientSafely()
  const bounties = await listBounties(supabase)
  return <TasksView bounties={bounties} />
}

// After (Vite + React Query)
export default function TasksPage() {
  const { data: bounties = [], isLoading } = useQuery({
    queryKey: ['bounties'],
    queryFn: () => {
      const supabase = createBrowserSupabaseClient()
      return listBounties(supabase)
    },
  })
  if (isLoading) return <LoadingSpinner />
  return <TasksView bounties={bounties} />
}
```

**迁移优先级（从易到难）：**

| 优先级 | 页面 | 复杂度 | 说明 |
|--------|------|--------|------|
| 1 | `growth/page.tsx` | ⭐ | 纯 Client Component，直接复制 |
| 2 | `page.tsx`（首页） | ⭐ | 无数据获取，直接复制 |
| 3 | `login/page.tsx` | ⭐ | 无数据获取 |
| 4 | `register/page.tsx` | ⭐ | 无数据获取 |
| 5 | `notifications/page.tsx` | ⭐⭐ | 1 个数据获取 + 1 个 server action |
| 6 | `discover/page.tsx` | ⭐⭐ | 2 个数据获取 |
| 7 | `tasks/page.tsx` | ⭐⭐ | 1 个数据获取 + searchParams |
| 8 | `me/page.tsx` | ⭐⭐⭐ | 4 个并行数据获取 |
| 9 | `me/bounties/page.tsx` | ⭐⭐⭐ | 2 个数据获取 |
| 10 | `me/connections/page.tsx` | ⭐⭐⭐ | 1 个数据获取 |
| 11 | `me/messages/page.tsx` | ⭐⭐⭐ | 2 个数据获取 |
| 12 | `me/messages/[userId]/chat-interface.tsx` | ⭐⭐⭐ | 实时聊天 |
| 13 | `profile/edit/page.tsx` | ⭐⭐ | 1 个数据获取 + redirect |
| 14 | `profile/[id]/page.tsx` | ⭐⭐⭐⭐ | 3 个并行数据获取 |
| 15 | `verify/page.tsx` | ⭐⭐⭐ | auth guard + redirect |
| 16 | `tasks/create/page.tsx` | ⭐⭐ | redirect guard |
| 17 | `tasks/[id]/page.tsx` | ⭐⭐⭐⭐⭐ | 6 个数据获取 + 多角色 UI |

### 阶段 7：迁移 API 逻辑

**目标**：将 9 个 API Route Handler 转为 React Query mutations / RPC 调用

#### 7.1 需要转为 Supabase RPC 的 API routes（多步事务）

| 原 API Route | RPC 函数 | Mutation Hook |
|--------------|----------|---------------|
| `POST /api/applications/[id]/accept` | `accept_application()` | `useAcceptApplication()` |
| `POST /api/applications/[id]/reject` | `reject_application()` | `useRejectApplication()` |
| `POST /api/deliveries/[id]/accept` | `accept_delivery()` | `useAcceptDelivery()` |
| `POST /api/deliveries/[id]/reject` | `reject_delivery()` | `useRejectDelivery()` |
| `POST /api/bounties/[id]/cancel` | `cancel_bounty()` | `useCancelBounty()` |
| `POST /api/connections` | `create_connection()` | `useCreateConnection()` |

```tsx
// 示例：src/features/applications/mutations/use-accept-application.ts
export function useAcceptApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ applicationId, bountyId }: { applicationId: string; bountyId: string }) => {
      const supabase = createBrowserSupabaseClient()
      const { error } = await supabase.rpc('accept_application', {
        p_app_id: applicationId,
        p_bounty_id: bountyId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bounties'] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}
```

#### 7.2 需要转为 Supabase RPC 的 API routes（多步操作）

| 原 API Route | RPC 函数 | Mutation Hook | 操作 |
|--------------|----------|---------------|------|
| `POST /api/bounties/[id]/apply` | `apply_for_bounty()` | `useApplyBounty()` | 验证用户已认证 + 检查重复申请 + INSERT application + INSERT notification |
| `POST /api/bounties/[id]/deliver` | `submit_delivery()` | `useSubmitDelivery()` | INSERT delivery + UPDATE bounty status + INSERT notification |
| `POST /api/bounties/[id]/review` | `create_review()` | `useCreateReview()` | INSERT review + UPDATE bounty status + INSERT notification |

### 阶段 8：迁移 Server Actions

**目标**：将 9 个 Server Action 文件转为 mutations

Server Actions 已有 Zod 校验，迁移时保留校验逻辑：

| Server Action 文件 | 函数 | 转为 |
|-------------------|------|------|
| `features/tasks/actions/create-bounty.ts` | `createBountyAction` | `useCreateBounty()` mutation |
| `features/applications/actions/create-application.ts` | `createApplicationAction` | `useApplyBounty()` mutation |
| `features/deliveries/actions/submit-delivery.ts` | `submitDeliveryAction` | `useSubmitDelivery()` mutation |
| `features/notifications/actions/mark-read.ts` | `markNotificationAsReadAction` + `markAllNotificationsAsReadAction` | `useMarkRead()` + `useMarkAllRead()` mutation |
| `features/connections/actions/create-connection.ts` | `createConnectionAction` | `useCreateConnection()` mutation |
| `features/connections/actions/respond-connection.ts` | `acceptConnectionAction` + `rejectConnectionAction` | `useAcceptConnection()` + `useRejectConnection()` mutation |
| `features/messages/actions/send-message.ts` | `sendMessageAction` | `useSendMessage()` mutation |
| `features/profile/actions.ts` | `updateProfileAction` | `useUpdateProfile()` mutation |
| `features/verify/actions.ts` | `submitVerificationAction` | `useSubmitVerification()` mutation |

**注意**：部分 mutation 与阶段 7 的 API route mutation 重叠（如 apply-bounty 同时存在于 API route 和 server action），合并为同一个 hook。

### 阶段 9：更新测试

**需要修改的测试文件（9个）：**

| 文件 | 修改内容 |
|------|----------|
| `src/lib/supabase/client.test.ts` | `process.env.NEXT_PUBLIC_*` → `import.meta.env.VITE_*`，`validateClientEnv` 参数 key 更新 |
| `src/lib/env.test.ts` | `NEXT_PUBLIC_*` → `VITE_*` |
| `src/lib/actor.test.ts` | `process.env.DEV_ACTOR_USER_ID` → `import.meta.env.VITE_DEV_ACTOR_USER_ID`，移除 `resolveServerActor` 测试 |
| `src/components/providers/app-providers.test.tsx` | `process.env.NEXT_PUBLIC_*` → `import.meta.env.VITE_*` |
| `src/app/routes.test.tsx` | 重写为 React Router `MemoryRouter` 包裹的测试 |
| `src/app/user-routes.test.tsx` | 同上 |
| `src/app/discover/page.test.tsx` | 重写 — 当前 mock 了 `@/lib/supabase/server`（要删除），需要改为 React Query 测试模式 |
| `src/features/profile/actions.test.ts` | 重写 — 当前 mock 了 `@/lib/supabase/server`、`resolveServerActor`、`next/cache`（全部要删除），需改为 mutation 测试 |
| `src/features/verify/actions.test.ts` | 重写 — 同上，mock 了 `@/lib/supabase/server`、`resolveServerActor`、`next/cache` |

**需要删除的测试文件（2个）：**

| 文件 | 原因 |
|------|------|
| `src/lib/supabase/server.test.ts` | 服务端 client 删除 |
| `src/lib/server-env.test.ts` | 服务端环境变量验证删除 |

**无需修改的测试文件（13个）：**

| 类型 | 文件 |
|------|------|
| Repository 测试 (6) | `discover.repository.test.ts`, `deliveries.repository.test.ts`, `applications.repository.test.ts`, `bounties.repository.test.ts`, `users.repository.test.ts`, `reviews.repository.test.ts` |
| Domain 测试 (4) | `status-machine.test.ts`, `contracts.test.ts`(×2), `mappers.test.ts` |
| Feature 组件测试 (3) | `discover-page-shell.test.tsx`, `profile-edit-form.test.tsx`, `verify-application-form.test.tsx` |

**vitest.config.ts 更新**：
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
})
```

移除所有 `next/*` 相关的测试 mock/配置。

### 阶段 10：清理和部署

| 操作 | 说明 |
|------|------|
| 删除 `next.config.ts` | 不再需要 |
| 删除 `src/app/` 目录 | 被新结构替代 |
| 删除 `src/lib/supabase/server.ts` | 服务端 client |
| 删除 `src/lib/server-env.ts` | 服务端环境变量 |
| 更新 `package.json` scripts | `dev` → `vite`, `build` → `vite build`, 移除 `next` 相关依赖 |
| 更新 `.gitignore` | `.next/` → `dist/` |
| 更新 `README.md` | 更新启动命令 |

**需要从 package.json 移除的依赖：**
- `next`, `eslint-config-next`, `@tailwindcss/postcss`

**需要保留的依赖：**
- `@privy-io/react-auth`, `@privy-io/wagmi`, `wagmi`, `viem`（Web3 认证栈）
- `@supabase/supabase-js`（数据库）
- `@tanstack/react-query`（数据获取）
- `react-hook-form`, `@hookform/resolvers`, `zod`（表单验证）
- `zustand`（状态管理）
- `clsx`, `tailwind-merge`（样式工具）
- `lucide-react`（图标）
- `react-markdown`, `remark-gfm`（Markdown 渲染）

---

## 最终文件结构

```
blue-blood-elite-v2/
├── public/
├── src/
│   ├── main.tsx                    # 入口文件
│   ├── router.tsx                  # React Router 配置
│   ├── styles/
│   │   └── globals.css             # 设计系统（直接复制）
│   ├── components/                 # UI 组件（直接复制或微调）
│   │   ├── layout/
│   │   │   ├── app-shell.tsx
│   │   │   └── mobile-tab-bar.tsx  # next/link → react-router
│   │   ├── ui/
│   │   ├── auth/
│   │   └── providers/
│   │       └── app-providers.tsx   # Web3 + React Query providers
│   ├── features/                   # 功能模块
│   │   ├── applications/
│   │   │   └── mutations/          # accept/reject application
│   │   ├── connections/
│   │   │   └── mutations/
│   │   ├── deliveries/
│   │   │   └── mutations/
│   │   ├── discover/
│   │   ├── messages/
│   │   ├── notifications/
│   │   │   └── mutations/
│   │   ├── profile/
│   │   ├── tasks/
│   │   │   └── mutations/
│   │   └── verify/
│   ├── pages/                      # 页面组件（从 app/ 迁移）
│   │   ├── home/
│   │   ├── discover/
│   │   ├── tasks/
│   │   ├── growth/
│   │   ├── me/
│   │   ├── profile/
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify/
│   │   └── notifications/
│   ├── lib/                        # 工具函数
│   │   ├── supabase/
│   │   │   └── client.ts           # Browser client (VITE_*)
│   │   ├── hooks/
│   │   │   └── use-auth.ts         # Privy + dev mode auth hook
│   │   └── env.ts                  # VITE_* 环境变量验证
│   ├── config/
│   ├── domains/                    # 纯业务逻辑（直接复制）
│   └── repositories/               # 数据访问层（直接复制）
├── supabase/                       # 数据库（直接复制 + 新增 RPC）
├── index.html                      # Vite 入口
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

---

## 风险与缓解

| 风险 | 缓解措施 |
|------|----------|
| **RLS 权限缺失**（关键） | 阶段 0 必须完成 RLS 审计，否则迁移后大部分操作会返回权限错误 |
| **多步事务无法从客户端执行** | 使用 Supabase RPC（SECURITY DEFINER）封装事务 |
| SSR → CSR 导致首屏加载慢 | 使用 React.lazy + Suspense 代码分割 |
| SEO 丢失（CSR 无法被爬虫索引） | 对于 MVP 可忽略，后续可加 prerender |
| 测试回归 | 逐页面迁移，每迁移一个页面跑一次测试 |
| 环境变量遗漏 | 全局搜索 `NEXT_PUBLIC_` 和 `process.env`（已在上方完整列出 15 个变量） |
| Privy/wagmi/viem 兼容性 | 保留相同版本号，仅更新环境变量前缀 |
| React Router v7 API 变化 | v7 已统一为 `react-router` 包，API 与 v6 的 `react-router-dom` 有差异，需查文档 |

---

## 预计工作量

| 阶段 | 内容 | 预计文件数 |
|------|------|-----------|
| 0 | RLS 审计 + RPC 创建 | 9 个 SQL 函数 |
| 1 | 骨架搭建 | 5 个新文件 |
| 2 | 设计系统迁移 | 1 个文件 |
| 3 | 基础设施层 | 5 个文件（含 Web3 provider） |
| 4 | Repository 层 | 14 个文件（直接复制） |
| 5 | UI 组件 | 6 个文件 |
| 6 | 页面路由 | 17 个文件 |
| 7 | API → mutations/RPC | 9 个新文件 |
| 8 | Server Actions → mutations | 9 个文件 |
| 9 | 测试更新 | 9 个修改 + 2 个删除 |
| 10 | 清理部署 | 3 个文件 |

**总计约 75+ 文件操作（其中 ~30 个直接复制，~20 个微调，~25 个重写）**

---

## SESSION_ID
- CODEX_SESSION: N/A (外部模型不可用)
- GEMINI_SESSION: N/A (外部模型不可用)
