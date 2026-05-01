# 蓝血精英 - 技术架构概览

## 架构原则

1. **领域驱动设计 (DDD)**: 按业务领域组织代码，而非技术类型
2. **关注点分离**: UI、业务逻辑、数据访问层清晰分离
3. **可测试性**: 依赖注入、接口抽象，便于单元测试
4. **类型安全**: TypeScript 严格模式，运行时校验 (zod)
5. **性能优先**: 懒加载、代码分割、数据缓存

## 系统分层

```
┌─────────────────────────────────────────────────────────────┐
│                        表示层 (UI)                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Pages   │ │Components│ │  Hooks   │ │  Routes  │       │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │
├───────┼────────────┼────────────┼────────────┼─────────────┤
│       │            │            │            │             │
│       ▼            ▼            ▼            ▼             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  应用层 (Application)                │   │
│  │  ┌──────────────┐  ┌──────────────┐                │   │
│  │  │  React Query │  │   Zustand    │                │   │
│  │  │ (Server State)│  │(Client State)│                │   │
│  │  └──────────────┘  └──────────────┘                │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                      领域层 (Domain)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Models  │ │ Services │ │  Events  │ │  Rules   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├─────────────────────────────────────────────────────────────┤
│                     基础设施层 (Infrastructure)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Supabase  │ │  Storage │ │  Auth    │ │ Realtime │       │
│  │Client    │ │          │ │          │ │          │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## 数据流向

```
User Action
    │
    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   React     │───▶│  Repository │───▶│  Supabase   │
│  Component  │    │   Pattern   │    │   Client    │
└─────────────┘    └─────────────┘    └─────────────┘
       │                                    │
       │◀─────────── Response ──────────────│
       │
       ▼
┌─────────────┐    ┌─────────────┐
│ React Query │───▶│   Zustand   │
│   Cache     │    │   Store     │
└─────────────┘    └─────────────┘
       │                  │
       └────────┬─────────┘
                ▼
         UI Re-render
```

## 核心技术选型

| 层级 | 技术 | 版本 | 用途 |
|-----|------|------|------|
| 构建工具 | Vite | ^5.x | 快速开发、HMR |
| 框架 | React | ^19.x | UI 渲染 |
| 路由 | React Router | ^7.x | 路由管理 |
| 样式 | Tailwind CSS | ^4.x | 原子CSS |
| UI组件 | shadcn/ui | latest | 基础组件库 |
| 图标 | lucide-react | latest | 图标系统 |
| 动画 | framer-motion | latest | 动画效果 |
| 表单 | react-hook-form | latest | 表单管理 |
| 校验 | zod | latest | 类型校验 |
| 日期 | date-fns | latest | 日期处理 |
| 服务端状态 | tanstack-query | ^5.x | 数据获取 |
| 客户端状态 | zustand | latest | 全局状态 |
| 后端服务 | Supabase | latest | 数据库、认证、实时 |

## 项目结构

```
src/
├── app/                      # 应用入口
│   ├── entry-client.tsx     # 客户端入口
│   ├── entry-server.tsx     # 服务端入口 (SSR预留)
│   └── root.tsx             # 根组件
│
├── routes/                   # 路由定义
│   ├── _layout.tsx          # 根布局
│   ├── index.tsx            # 首页
│   ├── discover/            # 发现页
│   ├── tasks/               # 任务模块
│   ├── courses/             # 课程模块
│   ├── messages/            # 消息模块
│   ├── profile/             # 个人中心
│   └── admin/               # 管理端
│       ├── _layout.tsx      # 管理端布局
│       ├── dashboard.tsx    # 仪表盘
│       ├── users/           # 用户管理
│       ├── tasks/           # 任务审核
│       └── finance/         # 财务管理
│
├── features/                 # 功能模块 (按领域组织)
│   ├── auth/                # 认证模块
│   │   ├── api/             # API调用
│   │   ├── components/      # 认证组件
│   │   ├── hooks/           # 认证钩子
│   │   ├── stores/          # 认证状态
│   │   └── types.ts         # 类型定义
│   │
│   ├── tasks/               # 任务模块
│   ├── courses/             # 课程模块
│   ├── users/               # 用户模块
│   ├── messages/            # 消息模块
│   └── payments/            # 支付模块
│
├── components/               # 共享UI组件
│   ├── ui/                  # 基础组件
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   │
│   ├── layout/              # 布局组件
│   │   ├── app-shell.tsx    # 客户端外壳
│   │   ├── admin-shell.tsx  # 管理端外壳
│   │   ├── sidebar.tsx
│   │   └── navbar.tsx
│   │
│   └── providers/           # 全局Provider
│       ├── query-provider.tsx
│       └── auth-provider.tsx
│
├── repositories/             # 数据访问层
│   ├── base-repository.ts   # 基础仓储
│   ├── task-repository.ts
│   ├── user-repository.ts
│   └── ...
│
├── domains/                  # 领域模型
│   ├── models/              # 实体模型
│   ├── services/            # 领域服务
│   └── events/              # 领域事件
│
├── lib/                      # 工具函数
│   ├── utils.ts             # 通用工具
│   ├── supabase.ts          # Supabase客户端
│   ├── validations.ts       # 校验规则
│   └── constants.ts         # 常量定义
│
├── hooks/                    # 通用Hooks
│   ├── use-auth.ts
│   ├── use-toast.ts
│   └── ...
│
├── types/                    # 全局类型
│   ├── database.ts          # 数据库类型
│   └── index.ts
│
└── styles/                   # 全局样式
    ├── global.css
    └── animations.css
```

## 模块依赖规则

```
               ┌──────────────┐
               │     app      │
               └──────┬───────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │  routes │  │ features│  │components
   └────┬────┘  └────┬────┘  └────┬────┘
        │            │            │
        └────────────┼────────────┘
                     ▼
               ┌───────────┐
               │repositories│
               └─────┬─────┘
                     │
                     ▼
               ┌───────────┐
               │  domains  │
               └───────────┘
```

**依赖规则**:
- `routes` 可依赖 `features`、`components`、`repositories`
- `features` 可依赖 `components`、`repositories`、`domains`
- `components` 仅依赖 `lib`、`hooks`
- `repositories` 仅依赖 `domains`
- 同层之间不可依赖

## 关键技术决策

### 1. 状态管理策略

| 状态类型 | 管理方案 | 理由 |
|---------|---------|------|
| 服务端状态 | React Query | 缓存、重试、实时更新 |
| 客户端状态 | Zustand | 简洁、TypeScript友好 |
| URL状态 | React Router | 路由参数、搜索参数 |
| 表单状态 | React Hook Form | 性能、校验 |

### 2. 组件设计模式

**复合组件模式 (Compound Components)**:
```tsx
<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">概览</Tabs.Trigger>
    <Tabs.Trigger value="settings">设置</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">...</Tabs.Content>
  <Tabs.Content value="settings">...</Tabs.Content>
</Tabs>
```

**容器/展示组件分离**:
- 容器组件: 数据获取、状态管理
- 展示组件: 纯渲染、可复用

### 3. 数据获取模式

```tsx
// 使用 Repository + React Query
function TaskListPage() {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskRepository.findAll(filters),
    staleTime: 5 * 60 * 1000, // 5分钟
  });

  if (isLoading) return <TaskListSkeleton />;

  return <TaskList tasks={tasks} />;
}
```

### 4. 错误处理策略

**全局错误边界**:
```tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

**API错误处理**:
```tsx
// 统一错误转换
class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message);
  }
}

// React Query 错误处理
useQuery({
  queryFn: fetchData,
  onError: (error: ApiError) => {
    toast.error(error.message);
  },
});
```

## 性能优化策略

### 1. 代码分割
```tsx
// 路由级别分割
const TaskDetailPage = lazy(() => import('./pages/tasks/detail'));

// 组件级别分割
const RichEditor = lazy(() => import('./components/rich-editor'));
```

### 2. 数据预加载
```tsx
// 路由 loader 预加载
export async function loader({ params }) {
  const task = await taskRepository.findById(params.id);
  return defer({ task });
}
```

### 3. 虚拟列表
```tsx
// 大量数据渲染
<Virtuoso
  data={tasks}
  itemContent={(index, task) => <TaskCard task={task} />}
/>
```

## 安全考虑

1. **认证**: Supabase Auth + JWT
2. **授权**: RBAC (角色基础访问控制)
3. **数据校验**: zod 运行时校验
4. **XSS防护**: 内容净化、CSP
5. **CSRF防护**: SameSite cookies

## 扩展性考虑

1. **多语言**: i18n 预留
2. **主题**: CSS变量支持主题切换
3. **移动端**: PWA 支持
4. **微前端**: 模块联邦预留

---

*架构文档版本: 1.0*
*最后更新: 2026-04-29*
