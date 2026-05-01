# Code Review: blue-blood-elite — 本地审查

**Reviewed**: 2026-04-30
**Branch**: main
**Decision**: WARNING (6 HIGH issues, 0 CRITICAL)

## Summary

项目整体质量良好：97.6% 语句覆盖率、435 测试全部通过、构建成功、无硬编码密钥、无 XSS 风险。主要问题集中在：Supabase null 检查缺失、mutation 错误处理缺失、mock API 架构断裂、以及部分代码重复。

## Validation Results

| Check | Result |
|-------|--------|
| Build (pnpm build) | PASS (720KB JS, 42KB CSS) |
| Type check (tsc) | PASS |
| Lint | SKIP (ESLint config 不兼容) |
| Tests (435) | PASS (57 files, 11.13s) |
| Coverage | 97.6% stmts, 91.4% branch |
| Security scan | PASS (无硬编码密钥、无XSS、无console.log) |

---

## Findings

### HIGH (6)

#### H1. QueryClient 在组件体内实例化
**文件**: `src/components/providers/app-providers.tsx:6`
**问题**: `new QueryClient()` 在组件函数体中调用，每次重渲染创建新实例，导致缓存失效和请求丢失。
**修复**: 提升到模块级别。
```tsx
const queryClient = new QueryClient();
export function AppProviders({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

#### H2. Supabase 客户端 null 检查缺失 (3 文件)
**文件**:
- `src/features/applications/components/application-form.tsx:21`
- `src/features/deliveries/components/delivery-form.tsx:20`
- `src/features/verify/components/verify-application-form.tsx:18`
**问题**: `createBrowserSupabaseClient()` 可能返回 `null`，但直接链式调用 `.from()`，会运行时崩溃。
**修复**: 添加 null 检查（参考 `connection-form.tsx` 的做法）。

#### H3. 登录/注册页面无表单提交逻辑
**文件**: `src/pages/login/index.tsx`, `src/pages/register/index.tsx`
**问题**: 渲染了表单 UI 但没有 `onSubmit`、没有 state 管理、按钮无行为。
**修复**: 添加表单状态和 Supabase auth 调用。

#### H4. 7+ 个 useMutation 缺少 onError 处理
**文件**: `src/pages/tasks/detail/index.tsx` (4个), `src/pages/me/chat/index.tsx`, `src/pages/profile/detail/index.tsx`, `src/pages/notifications/index.tsx`
**问题**: 网络请求失败时用户无反馈，操作静默失败。
**修复**: 为所有 mutation 添加 `onError` 回调，显示 toast/错误提示。

#### H5. Mock API 与实际页面架构断裂
**文件**: `src/features/tasks/api/tasks-api.ts`, `src/features/discover/api/discover-api.ts`
**问题**: Mock API 始终返回空数据，实际页面不使用这些 API 而是直接创建 Supabase client。两套并行数据访问路径。
**修复**: 统一使用 repository pattern，删除未使用的 mock API 文件。

#### H6. statusLabels/categoryColors 在三个文件重复定义
**文件**: `src/pages/tasks/index.tsx`, `src/pages/tasks/detail/index.tsx`, `src/pages/me/bounties/index.tsx`
**问题**: 更新时需同步修改三处，易遗漏。
**修复**: 提取到 `src/features/tasks/constants.ts` 共享常量文件。

---

### MEDIUM (8)

#### M1. Modal 缺少无障碍支持
**文件**: `src/features/connections/components/connect-button.tsx:54-91`
**问题**: 缺少焦点陷阱、Escape 键关闭、`role="dialog"`、`aria-modal`。
**修复**: 使用 `@headlessui/react` Dialog 组件。

#### M2. Supabase .or() 过滤器使用字符串插值
**文件**: `src/repositories/connections.repository.ts:55`, `src/repositories/messages.repository.ts:52-53`
**问题**: `.or(\`from_user_id.eq.${userId}\`)` 通过字符串拼接构造 PostgREST 过滤器。虽然 userId 来自 Supabase auth（UUID 格式），但仍存在 filter injection 理论风险。
**修复**: 使用 Supabase 提供的参数化 `.eq()` 方法组合查询，或验证 userId 为合法 UUID。

#### M3. Supabase client 在页面组件中反复创建
**文件**: `src/pages/me/chat/index.tsx` (5次), `src/pages/profile/detail/index.tsx` (4次), `src/pages/tasks/detail/index.tsx` (7次) 等
**问题**: `createBrowserSupabaseClient()` 在每个 queryFn/mutationFn 闭包中重复调用，每次创建新实例。
**修复**: 组件顶部创建一次或使用模块级单例。

#### M4. setTimeout 未在卸载时清理
**文件**: `src/features/connections/components/connect-button.tsx:86`
**问题**: `setTimeout(() => setShowModal(false), 1500)` 在组件卸载后仍可能执行。
**修复**: 使用 `useRef` 保存 timer ID，在 useEffect 清理函数中 `clearTimeout`。

#### M5. parseFloat 未做 NaN 校验
**文件**: `src/features/tasks/components/create-bounty-form.tsx:39`
**问题**: `parseFloat(rewardUsdc)` 在用户输入非数字时返回 `NaN`，直接发送到 Supabase。
**修复**: 添加 `isNaN()` 检查。

#### M6. 动态 Tailwind 类名不会被 JIT 编译
**文件**: `src/features/discover/components/discover-page-shell.tsx`
**问题**: `from-${color}-400 to-${color}-600` 模板字面量不会被 Tailwind JIT 扫描发现。
**修复**: 使用 safelist 或内联 style。

#### M7. useDebounceCallback 依赖数组包含 ref.current
**文件**: `src/hooks/use-debounce.ts:35`
**问题**: `timeoutId` (useRef.current) 在 `useCallback` 依赖数组中是不必要的。
**修复**: 从依赖数组中移除 `timeoutId`。

#### M8. SelectField 未自动生成 id
**文件**: `src/components/ui/form-fields.tsx:110-126`
**问题**: TextField/TextAreaField 都用 `useId()` 自动生成 id，但 SelectField 没有，导致 label 关联可能失效。
**修复**: 与 TextField 保持一致，使用 `useId()`。

---

### LOW (9)

| # | 问题 | 文件 |
|---|------|------|
| L1 | `"use client"` 指令在 Vite SPA 中无意义 | auth-card.tsx, connect-button.tsx |
| L2 | 手写 SVG 重复 lucide-react 已有图标 | growth/index.tsx |
| L3 | 死代码：隐藏的时间线连接器 | growth/index.tsx:322-326 |
| L4 | 按钮无 onClick 处理（占位符） | growth/index.tsx (3处) |
| L5 | 缺少 404 路由兜底 | router.tsx |
| L6 | 硬编码 mock 统计数据 | home/index.tsx |
| L7 | 数组索引作为 React key | discover-page-shell.tsx:148 |
| L8 | 魔法数字未提取常量 | use-tasks.ts, use-task-filters.ts |
| L9 | DEV_ACTOR_USER_ID 泄露到 UI 描述 | profile/edit/index.tsx:33 |

---

## Files Reviewed

**Tracked changes** (11): .gitignore, AGENTS.md, README.md, next.config.ts (deleted), package.json, pnpm-lock.yaml, pnpm-workspace.yaml, src/app/* (deleted), tsconfig.json

**New source files** (45+): components (7), config (1), domains (6), features (20+), hooks (2), lib (8), pages (17+), repositories (9), router.tsx, main.tsx, styles, etc.

**New test files** (45+): 对应每个模块的测试文件

## Next Steps

1. 修复 H1 (QueryClient) 和 H2 (null 检查) — 影响生产稳定性
2. 为所有 mutation 添加 onError — 防止静默失败
3. 清理架构：统一数据访问模式，删除未使用 mock API
4. 提取重复常量到共享文件
5. M1-M8 可在后续迭代中逐步修复
