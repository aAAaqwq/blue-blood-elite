# 蓝血精英 - 技术规范文档索引

## 文档结构

```
.claude/tech-spec/
├── 01-architecture-overview.md    # 整体架构设计
├── 02-tech-stack.md               # 技术栈详细规范
├── 03-implementation-plan.md      # 实施计划
├── 04-state-management.md         # 状态管理规范
├── 05-api-design.md               # API设计规范
├── 06-component-guide.md          # 组件开发规范
├── 07-testing-strategy.md         # 测试策略
├── 08-deployment-guide.md         # 部署指南
└── README.md                      # 本文档
```

---

## 快速导航

### 入门必读
1. [架构概览](01-architecture-overview.md) - 理解系统整体设计
2. [技术栈](02-tech-stack.md) - 依赖库和配置
3. [实施计划](03-implementation-plan.md) - 开发路线图

### 开发规范
4. [状态管理](04-state-management.md) - React Query + Zustand
5. [API设计](05-api-design.md) - Repository模式 + Supabase
6. [组件开发](06-component-guide.md) - 组件编写规范

### 质量保障
7. [测试策略](07-testing-strategy.md) - 单元/E2E/视觉测试
8. [部署指南](08-deployment-guide.md) - 生产部署流程

---

## 核心决策摘要

### 技术栈
| 类别 | 选择 | 版本 |
|-----|------|------|
| 构建工具 | Vite | ^5.4 |
| 框架 | React | ^19.0 |
| 路由 | React Router | ^7.0 |
| 样式 | Tailwind CSS | ^4.0 |
| UI组件 | shadcn/ui | latest |
| 图标 | lucide-react | latest |
| 动画 | framer-motion | latest |
| 服务端状态 | TanStack Query | ^5.40 |
| 客户端状态 | Zustand | ^4.5 |
| 表单 | React Hook Form | ^7.51 |
| 校验 | zod | ^3.23 |
| 后端 | Supabase | latest |

### 架构原则
- **领域驱动设计**: 按业务领域组织代码
- **关注点分离**: UI、业务逻辑、数据访问层分离
- **Repository模式**: 统一数据访问接口
- **状态分类管理**: 服务端/客户端/URL/表单状态分离

### 项目结构
```
src/
├── pages/           # 路由页面
├── features/        # 功能模块
├── components/      # 共享组件
├── repositories/    # 数据访问层
├── domains/         # 领域模型
├── lib/             # 工具函数
├── hooks/           # 通用Hooks
└── types/           # 类型定义
```

---

## 实施路线

### 阶段1: 基础架构 (Day 1-5)
- [ ] 项目初始化
- [ ] 设计系统集成
- [ ] 基础布局
- [ ] 基础组件
- [ ] Supabase集成

### 阶段2: 客户端核心 (Day 6-16)
- [ ] 发现页
- [ ] 任务市场
- [ ] 用户认证
- [ ] 个人中心
- [ ] 课程模块

### 阶段3: 管理端核心 (Day 17-24)
- [ ] 管理端布局
- [ ] 仪表盘
- [ ] 用户管理
- [ ] 任务审核

### 阶段4: 复杂功能 (Day 25-35)
- [ ] 消息系统
- [ ] 支付集成
- [ ] 文件上传

### 阶段5: 优化发布 (Day 36-40)
- [ ] 性能优化
- [ ] 测试完善
- [ ] 文档编写
- [ ] 部署上线

---

## 代码规范速查

### 文件命名
| 类型 | 规范 | 示例 |
|-----|------|------|
| 组件 | PascalCase | `TaskCard.tsx` |
| 工具 | camelCase | `useTask.ts` |
| 样式 | kebab-case | `task-card.css` |
| 常量 | UPPER_SNAKE | `TASK_STATUS.ts` |

### 组件结构
```tsx
// 1. 导入
import { cn } from '@/lib/utils';

// 2. 类型
interface Props {
  task: Task;
}

// 3. 组件
export function TaskCard({ task }: Props) {
  return <div>{task.title}</div>;
}

// 4. 默认导出
export default TaskCard;
```

### 样式写法
```tsx
<div className={cn(
  // 布局
  'flex items-center gap-4',
  // 尺寸
  'w-full h-16 px-4',
  // 外观
  'bg-blue-800 rounded-xl',
  // 交互
  'hover:border-gold-500',
  // 外部
  className
)} />
```

---

## 重要约定

### 状态管理
- **服务端状态**: React Query
- **客户端全局**: Zustand
- **客户端本地**: useState/useReducer
- **表单**: React Hook Form

### API调用
```typescript
// Repository层
const task = await taskRepository.findById(id);

// React Query Hook
const { data: tasks } = useTasks(filters);

// Mutation
const { mutate: createTask } = useCreateTask();
```

### 错误处理
```typescript
// Repository错误
try {
  const task = await taskRepository.findById(id);
} catch (error) {
  if (error.code === 'NOT_FOUND') {
    // 处理404
  }
}

// React Query错误
const { error } = useTask(id);
if (error) {
  return <ErrorDisplay error={error} />;
}
```

---

## 开发工具

### 推荐IDE配置
- **VS Code** + 以下扩展
  - Tailwind CSS IntelliSense
  - TypeScript Importer
  - ESLint
  - Prettier
  - GitLens

### 必备命令
```bash
# 开发
npm run dev

# 构建
npm run build

# 测试
npm run test
npm run test:e2e

# 代码检查
npm run lint
npm run type-check

# 格式化
npm run format
```

---

## 相关文档

### 设计系统
- `.claude/design-system/design-principles.md` - 设计原则
- `.claude/design-system/components.md` - 组件规范
- `.claude/design-system/client-ui.md` - 客户端UI
- `.claude/design-system/admin-ui.md` - 管理端UI

### 产品文档
- `.claude/PRPs/prds/lan-xue-jing-ying.prd.md` - 产品需求
- `.claude/design-system/backend-design.md` - 后端设计

---

## 问题反馈

开发过程中遇到问题：
1. 查阅相关规范文档
2. 检查实施计划
3. 参考示例代码
4. 询问技术负责人

---

*技术规范版本: 1.0*
*生成日期: 2026-04-30*
