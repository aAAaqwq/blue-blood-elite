# 蓝血精英 - 组件开发规范

## 组件架构

### 组件分层

```
components/
├── ui/                    # 基础UI组件
│   ├── button.tsx
│   ├── input.tsx
│   └── ...
├── layout/                # 布局组件
│   ├── app-shell.tsx
│   ├── navbar.tsx
│   └── ...
├── providers/             # 全局Provider
│   └── query-provider.tsx
└── [feature]/             # 功能组件 (与features对应)
    └── ...
```

### 基础组件 vs 业务组件

| 类型 | 路径 | 依赖 | 复用性 |
|-----|------|------|--------|
| **基础组件** | `components/ui/` | 无业务依赖 | 全局复用 |
| **布局组件** | `components/layout/` | 路由、UI | 全局复用 |
| **功能组件** | `features/*/components/` | 业务逻辑 | 功能内复用 |
| **页面组件** | `pages/` | 所有依赖 | 不复用 |

---

## 组件文件规范

### 文件命名

| 类型 | 命名规范 | 示例 |
|-----|---------|------|
| 组件 | PascalCase | `TaskCard.tsx` |
| 样式 | kebab-case | `task-card.css` |
| 测试 | PascalCase.test.tsx | `TaskCard.test.tsx` |
| 类型 | kebab-case.types.ts | `task.types.ts` |
| 工具 | camelCase | `useTask.ts` |
| 常量 | SCREAMING_SNAKE_CASE | `TASK_STATUS.ts` |

### 文件结构

```typescript
// 组件文件模板
import { type FC } from 'react';                    // 1. React
import { cn } from '@/lib/utils';                  // 2. 工具
import type { TaskCardProps } from './types';       // 3. 类型
import { useTaskActions } from './use-task-actions'; // 4. Hooks
import { Card } from '@/components/ui/card';        // 5. 组件

// 6. 类型定义 (如果不在单独文件)
interface TaskCardProps {
  task: Task;
  onApply?: (id: string) => void;
  className?: string;
}

// 7. 组件实现
export const TaskCard: FC<TaskCardProps> = ({
  task,
  onApply,
  className,
}) => {
  // 逻辑...

  return (
    // JSX...
  );
};

// 8. 默认导出 (可选)
export default TaskCard;
```

---

## 组件开发规范

### 函数组件风格

```typescript
// ✅ 推荐 - 函数声明
function TaskCard({ task, onApply }: TaskCardProps) {
  return <div>{task.title}</div>;
}

// ✅ 可接受 - 箭头函数
const TaskCard = ({ task, onApply }: TaskCardProps) => {
  return <div>{task.title}</div>;
};

// ❌ 避免 - FC 泛型 (React 18+ 不需要)
const TaskCard: FC<TaskCardProps> = ({ task }) => {
  return <div>{task.title}</div>;
};
```

### Props 定义

```typescript
// ✅ 使用 interface
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

// ✅ 使用 type (复杂类型)
type TaskCardProps = {
  task: Task;
} & Pick<CardProps, 'className' | 'onClick'>;

// ❌ 避免 - 内联类型
function Button({ variant }: { variant: string }) {
  // ...
}
```

### 默认 Props

```typescript
// ✅ 解构时设置默认值
function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
}: ButtonProps) {
  // ...
}

// ✅ 使用 satisfies (TypeScript 4.9+)
const defaultProps = {
  variant: 'primary',
  size: 'md',
} as const satisfies Partial<ButtonProps>;
```

---

## 样式规范

### Tailwind 使用规则

```tsx
// ✅ 基础类名在前，条件类名在后
<button
  className={cn(
    // 基础样式
    'h-10 px-5 rounded-xl font-semibold',
    'transition-all duration-150',
    // 变体样式
    variant === 'primary' && 'bg-gold-500 text-blue-900 hover:bg-gold-400',
    variant === 'secondary' && 'border border-blue-400 text-blue-200',
    // 尺寸样式
    size === 'sm' && 'h-8 px-4 text-sm',
    size === 'lg' && 'h-12 px-6 text-base',
    // 状态样式
    disabled && 'opacity-50 cursor-not-allowed',
    // 外部传入
    className
  )}
>

// ❌ 避免 - 长串条件
<button className={`h-10 px-5 rounded-xl ${variant === 'primary' ? 'bg-gold-500' : variant === 'secondary' ? 'border' : ''} ${size === 'sm' ? 'h-8' : ''}`}>
```

### 样式分组

```tsx
// ✅ 按功能分组
<div
  className={cn(
    // 布局
    'flex items-center justify-between gap-4',
    // 尺寸
    'w-full h-16 px-4',
    // 外观
    'bg-blue-800 rounded-xl border border-blue-600',
    // 交互
    'hover:border-blue-500 cursor-pointer',
    // 动画
    'transition-all duration-200',
    className
  )}
/>
```

### 响应式样式

```tsx
// ✅ 移动优先
<div className="
  grid gap-4                /* 基础: 单列 */
  sm:grid-cols-2           /* 平板: 2列 */
  lg:grid-cols-3           /* 桌面: 3列 */
  xl:grid-cols-4           /* 大屏: 4列 */
"/>

// ✅ 响应式字体
<h1 className="
  text-xl                   /* 基础 */
  md:text-2xl              /* 平板 */
  lg:text-3xl              /* 桌面 */
"/>
```

---

## 状态管理规范

### 本地状态

```tsx
// ✅ 简单状态用 useState
const [isOpen, setIsOpen] = useState(false);
const [count, setCount] = useState(0);

// ✅ 复杂状态用 useReducer
interface State {
  items: Item[];
  selectedId: string | null;
  isLoading: boolean;
}

type Action =
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SELECT_ITEM'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) };
    // ...
  }
}
```

### 自定义 Hook

```tsx
// ✅ 封装组件逻辑
function TaskCard({ task }: { task: Task }) {
  const { isApplying, apply } = useTaskApply(task.id);
  
  return (
    <button onClick={apply} disabled={isApplying}>
      {isApplying ? '申请中...' : '申请任务'}
    </button>
  );
}

// hooks/use-task-apply.ts
export function useTaskApply(taskId: string) {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: () => taskRepository.apply(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });
  
  return {
    isApplying: mutation.isPending,
    apply: mutation.mutate,
  };
}
```

---

## 性能优化

### 1. 避免不必要重渲染

```tsx
// ✅ 使用 memo
const TaskCard = memo(function TaskCard({ task }: { task: Task }) {
  return <div>{task.title}</div>;
});

// ✅ 使用 useCallback
function TaskList({ tasks }: { tasks: Task[] }) {
  const [filter, setFilter] = useState('');
  
  const handleApply = useCallback((id: string) => {
    console.log(id);
  }, []);
  
  return tasks.map(task => (
    <TaskCard key={task.id} task={task} onApply={handleApply} />
  ));
}

// ✅ 使用 useMemo
function TaskStats({ tasks }: { tasks: Task[] }) {
  const stats = useMemo(() => {
    return {
      total: tasks.length,
      avgBudget: tasks.reduce((sum, t) => sum + t.budget, 0) / tasks.length,
    };
  }, [tasks]);
  
  return <div>{stats.total}</div>;
}
```

### 2. 懒加载

```tsx
// ✅ 组件懒加载
const TaskDetailPage = lazy(() => import('./pages/tasks/detail'));

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TaskDetailPage />
    </Suspense>
  );
}

// ✅ 图片懒加载
<img
  src={imageUrl}
  loading="lazy"
  decoding="async"
  alt="描述"
/>
```

### 3. 虚拟列表

```tsx
// ✅ 大量数据使用虚拟列表
import { Virtuoso } from 'react-virtuoso';

function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <Virtuoso
      data={tasks}
      itemContent={(index, task) => (
        <TaskCard task={task} />
      )}
    />
  );
}
```

---

## 可访问性规范

### ARIA 属性

```tsx
// ✅ 按钮
<button
  aria-label="关闭"
  aria-pressed={isPressed}
  onClick={handleClose}
>
  <XIcon />
</button>

// ✅ 模态框
<Dialog>
  <DialogTitle>确认删除</DialogTitle>
  <DialogDescription>
    此操作不可撤销，确定要删除吗？
  </DialogDescription>
</Dialog>

// ✅ 表单
<label htmlFor="email">邮箱</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={errors.email ? 'true' : 'false'}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>
{errors.email && (
  <span id="email-error" role="alert">
    {errors.email}
  </span>
)}
```

### 键盘导航

```tsx
// ✅ 支持键盘
<button onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleClick();
  }
}}>

// ✅ 焦点管理
function Modal({ isOpen, onClose }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);
  
  return (
    <button ref={closeButtonRef} onClick={onClose}>
      关闭
    </button>
  );
}
```

---

## 组件文档

### Storybook 规范

```tsx
// TaskCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { TaskCard } from './task-card';

const meta: Meta<typeof TaskCard> = {
  title: 'Components/TaskCard',
  component: TaskCard,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'featured', 'compact'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    task: {
      id: '1',
      title: 'AI客服开发',
      budget: 5000,
      // ...
    },
  },
};

export const Featured: Story = {
  args: {
    ...Default.args,
    variant: 'featured',
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};
```

### JSDoc 注释

```tsx
/**
 * 任务卡片组件
 * 展示任务信息，支持申请操作
 *
 * @example
 * ```tsx
 * <TaskCard
 *   task={task}
 *   onApply={(id) => console.log(id)}
 *   variant="featured"
 * />
 * ```
 */
interface TaskCardProps {
  /** 任务数据 */
  task: Task;
  /** 申请回调 */
  onApply?: (id: string) => void;
  /** 卡片变体 */
  variant?: 'default' | 'featured' | 'compact';
  /** 加载状态 */
  loading?: boolean;
}
```

---

## 测试规范

### 组件测试

```tsx
// TaskCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './task-card';

const mockTask = {
  id: '1',
  title: '测试任务',
  budget: 1000,
  description: '测试描述',
};

describe('TaskCard', () => {
  it('renders task information', () => {
    render(<TaskCard task={mockTask} />);
    
    expect(screen.getByText('测试任务')).toBeInTheDocument();
    expect(screen.getByText('¥1,000')).toBeInTheDocument();
  });
  
  it('calls onApply when apply button clicked', () => {
    const handleApply = vi.fn();
    render(<TaskCard task={mockTask} onApply={handleApply} />);
    
    fireEvent.click(screen.getByText('申请任务'));
    expect(handleApply).toHaveBeenCalledWith('1');
  });
  
  it('shows loading state', () => {
    render(<TaskCard task={mockTask} isApplying />);
    
    expect(screen.getByText('申请中...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## 代码审查检查清单

### 结构
- [ ] 组件单一职责
- [ ] Props 类型完整定义
- [ ] 无副作用的纯组件
- [ ] 适当的拆分粒度

### 样式
- [ ] 使用 cn() 合并类名
- [ ] 响应式设计
- [ ] 支持 className 扩展
- [ ] 动画使用设计系统规范

### 性能
- [ ] 避免不必要重渲染
- [ ] 大数据使用虚拟列表
- [ ] 图片懒加载
- [ ] 按需加载

### 可访问性
- [ ] 语义化 HTML
- [ ] ARIA 属性
- [ ] 键盘导航
- [ ] 焦点管理

### 测试
- [ ] 基础渲染测试
- [ ] 交互测试
- [ ] 边界情况
- [ ] 可访问性测试

---

*组件开发规范版本: 1.0*
