# 蓝血精英 - 状态管理规范

## 状态管理策略

### 状态分类

| 状态类型 | 管理方案 | 特点 |
|---------|---------|------|
| **服务端状态** | React Query | 缓存、自动同步、乐观更新 |
| **客户端全局状态** | Zustand | 简单、响应式、DevTools支持 |
| **客户端本地状态** | useState/useReducer | 组件级、简单场景 |
| **URL状态** | React Router | 可分享、可书签 |
| **表单状态** | React Hook Form | 高性能、验证、控件 |

### 决策树

```
状态需要持久化?
├── 是 → 服务端状态 → React Query
│
└── 否 → 需要在多个组件共享?
    ├── 是 → 全局状态 → Zustand
    │
    └── 否 → 表单状态?
        ├── 是 → React Hook Form
        └── 否 → useState/useReducer
```

---

## React Query (服务端状态)

### 目录结构

```
src/
├── lib/
│   └── query-client.ts       # QueryClient配置
│
├── hooks/
│   └── query/
│       ├── use-tasks.ts      # 任务相关query
│       ├── use-users.ts      # 用户相关query
│       ├── use-courses.ts    # 课程相关query
│       └── use-messages.ts   # 消息相关query
│
└── providers/
    └── query-provider.tsx    # QueryClientProvider
```

### QueryClient配置

```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5分钟数据过期
      gcTime: 10 * 60 * 1000,        // 10分钟垃圾回收
      retry: 3,                       // 失败重试3次
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,    // 窗口聚焦不重刷
      refetchOnReconnect: true,       // 重连时刷新
    },
    mutations: {
      retry: 1,                       //  mutation重试1次
    },
  },
});

// 预取数据
export function prefetchTasks(filters: TaskFilters) {
  return queryClient.prefetchQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskRepository.findAll(filters),
  });
}

// 乐观更新
export function optimisticUpdateTask(taskId: string, updates: Partial<Task>) {
  const previousTask = queryClient.getQueryData<Task>(['task', taskId]);
  
  queryClient.setQueryData(['task', taskId], (old: Task | undefined) => {
    if (!old) return old;
    return { ...old, ...updates };
  });
  
  return previousTask;
}
```

### 自定义Query Hooks

```typescript
// src/hooks/query/use-tasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskRepository } from '@/repositories/task-repository';
import type { Task, TaskFilters, CreateTaskInput } from '@/types';

// Query Keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

// 获取任务列表
export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => taskRepository.findAll(filters),
    placeholderData: (previousData) => previousData, // 保持旧数据
  });
}

// 获取单个任务
export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => taskRepository.findById(id),
    enabled: !!id, // 有ID才执行
  });
}

// 创建任务
export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateTaskInput) => taskRepository.create(input),
    onSuccess: (newTask) => {
      // 刷新任务列表
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      // 添加到缓存
      queryClient.setQueryData(taskKeys.detail(newTask.id), newTask);
    },
  });
}

// 更新任务（乐观更新）
export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      taskRepository.update(id, updates),
      
    onMutate: async ({ id, updates }) => {
      // 取消正在进行的重新获取
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) });
      
      // 保存之前的状态
      const previousTask = queryClient.getQueryData<Task>(taskKeys.detail(id));
      
      // 乐观更新
      queryClient.setQueryData(taskKeys.detail(id), (old: Task | undefined) => {
        if (!old) return old;
        return { ...old, ...updates };
      });
      
      return { previousTask };
    },
    
    onError: (err, variables, context) => {
      // 回滚到之前的状态
      if (context?.previousTask) {
        queryClient.setQueryData(
          taskKeys.detail(variables.id),
          context.previousTask
        );
      }
    },
    
    onSettled: (data, error, variables) => {
      // 无论成功失败都刷新
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(variables.id),
      });
    },
  });
}

// 删除任务
export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => taskRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
```

### Infinite Query (无限滚动)

```typescript
// src/hooks/query/use-task-feed.ts
export function useTaskFeed(initialFilters: TaskFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['taskFeed', initialFilters],
    queryFn: ({ pageParam = 0 }) =>
      taskRepository.findAll({
        ...initialFilters,
        offset: pageParam * 20,
        limit: 20,
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
  });
}

// 使用
function TaskFeed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useTaskFeed();
  
  const tasks = data?.pages.flat() ?? [];
  
  return (
    <InfiniteScroll
      items={tasks}
      onLoadMore={fetchNextPage}
      hasMore={hasNextPage}
      isLoading={isFetchingNextPage}
    />
  );
}
```

---

## Zustand (客户端全局状态)

### 目录结构

```
src/
├── stores/
│   ├── auth-store.ts         # 认证状态
│   ├── ui-store.ts           # UI状态
│   ├── filter-store.ts       # 筛选状态
│   └── notification-store.ts # 通知状态
```

### Store定义规范

```typescript
// src/stores/auth-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setLoading: (loading) => set({ isLoading: loading }),
        
        login: (user) => set({
          user,
          isAuthenticated: true,
          isLoading: false,
        }),
        
        logout: () => set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      }
    ),
    { name: 'AuthStore' }
  )
);
```

### UI状态Store

```typescript
// src/stores/ui-store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  // Sidebar状态
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Modal状态
  activeModal: string | null;
  modalData: Record<string, unknown> | null;
  
  // Toast通知
  toasts: Toast[];
  
  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openModal: (modal: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      sidebarOpen: false,
      sidebarCollapsed: false,
      activeModal: null,
      modalData: null,
      toasts: [],
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      openModal: (modal, data) => set({
        activeModal: modal,
        modalData: data || null,
      }),
      
      closeModal: () => set({
        activeModal: null,
        modalData: null,
      }),
      
      addToast: (toast) => set((state) => ({
        toasts: [
          ...state.toasts,
          { ...toast, id: Math.random().toString(36).substr(2, 9) },
        ],
      })),
      
      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      })),
    }),
    { name: 'UIStore' }
  )
);
```

### Filter状态Store

```typescript
// src/stores/filter-store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface TaskFilters {
  category: string | null;
  budgetRange: [number, number] | null;
  skills: string[];
  sortBy: 'newest' | 'budget' | 'deadline';
}

interface FilterState {
  // Task筛选
  taskFilters: TaskFilters;
  setTaskFilter: <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => void;
  resetTaskFilters: () => void;
  
  // User筛选
  userSearch: string;
  setUserSearch: (search: string) => void;
}

const defaultTaskFilters: TaskFilters = {
  category: null,
  budgetRange: null,
  skills: [],
  sortBy: 'newest',
};

export const useFilterStore = create<FilterState>()(
  devtools(
    (set) => ({
      taskFilters: defaultTaskFilters,
      userSearch: '',
      
      setTaskFilter: (key, value) =>
        set((state) => ({
          taskFilters: { ...state.taskFilters, [key]: value },
        })),
      
      resetTaskFilters: () => set({ taskFilters: defaultTaskFilters }),
      
      setUserSearch: (search) => set({ userSearch: search }),
    }),
    { name: 'FilterStore' }
  )
);
```

### 组合使用Selector

```typescript
// 优化重渲染
function TaskList() {
  // ❌ 每次store变化都重渲染
  const { taskFilters } = useFilterStore();
  
  // ✅ 只有taskFilters.category变化才重渲染
  const category = useFilterStore((state) => state.taskFilters.category);
  
  // ✅ 或者使用selector
  const setTaskFilter = useFilterStore((state) => state.setTaskFilter);
}
```

---

## React Hook Form (表单状态)

### 基础表单

```typescript
// src/features/auth/components/login-form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  
  const onSubmit = async (data: LoginFormData) => {
    await login(data.email, data.password);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">邮箱</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          aria-invalid={errors.email ? 'true' : 'false'}
        />
        {errors.email && (
          <p className="text-sm text-error">{errors.email.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="password">密码</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          aria-invalid={errors.password ? 'true' : 'false'}
        />
        {errors.password && (
          <p className="text-sm text-error">{errors.password.message}</p>
        )}
      </div>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '登录中...' : '登录'}
      </Button>
    </form>
  );
}
```

### 复杂表单

```typescript
// src/features/tasks/components/task-form.tsx
import { useFieldArray, useForm } from 'react-hook-form';

const taskSchema = z.object({
  title: z.string().min(5, '标题至少5个字符'),
  description: z.string().min(20, '描述至少20个字符'),
  budget: z.number().min(100, '预算至少100元'),
  deadline: z.date(),
  skills: z.array(z.string()).min(1, '至少选择一个技能'),
  milestones: z.array(z.object({
    title: z.string(),
    amount: z.number(),
  })),
});

export function TaskForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      skills: [],
      milestones: [{ title: '', amount: 0 }],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'milestones',
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 基础字段 */}
      <Input {...register('title')} />
      <Textarea {...register('description')} />
      
      {/* 动态数组字段 */}
      {fields.map((field, index) => (
        <div key={field.id}>
          <Input {...register(`milestones.${index}.title`)} />
          <Input
            type="number"
            {...register(`milestones.${index}.amount`, { valueAsNumber: true })}
          />
          <Button type="button" onClick={() => remove(index)}>
            删除
          </Button>
        </div>
      ))}
      
      <Button
        type="button"
        onClick={() => append({ title: '', amount: 0 })}
      >
        添加里程碑
      </Button>
    </form>
  );
}
```

---

## URL状态

### 搜索参数同步

```typescript
// src/hooks/use-task-filters.ts
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useFilterStore } from '@/stores/filter-store';

export function useTaskFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { taskFilters, setTaskFilter, resetTaskFilters } = useFilterStore();
  
  // URL -> Store
  useEffect(() => {
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') as TaskFilters['sortBy'];
    
    if (category) setTaskFilter('category', category);
    if (sortBy) setTaskFilter('sortBy', sortBy);
  }, []);
  
  // Store -> URL
  const updateURL = (filters: TaskFilters) => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.sortBy !== 'newest') params.set('sortBy', filters.sortBy);
    
    setSearchParams(params, { replace: true });
  };
  
  return {
    filters: taskFilters,
    setFilter: (key: keyof TaskFilters, value: unknown) => {
      setTaskFilter(key, value);
      updateURL({ ...taskFilters, [key]: value });
    },
    resetFilters: () => {
      resetTaskFilters();
      setSearchParams(new URLSearchParams());
    },
  };
}
```

---

## 最佳实践

### 1. 不要混合状态管理
```typescript
// ❌ 错误
const [data, setData] = useState<Task[]>();
const { data: queryData } = useTasks(); // 重复!

// ✅ 正确
const { data: tasks } = useTasks(); // 只用React Query
```

### 2. Store保持精简
```typescript
// ❌ 错误 - 放太多
const useBigStore = create(() => ({
  ...authState,
  ...uiState,
  ...dataState, // 服务端状态不该放这里
}));

// ✅ 正确 - 拆分
const useAuthStore = create(() => authState);
const useUIStore = create(() => uiState);
```

### 3. 使用Selector避免不必要重渲染
```typescript
// ❌ 重渲染频繁
const state = useStore();

// ✅ 精确订阅
const user = useStore((state) => state.user);
```

### 4. Query Key规范
```typescript
// ❌ 不一致
taskKeys.list({ cat: 'ai' })
taskKeys.list({ category: 'ai' })

// ✅ 规范化
const normalizeFilters = (filters) => ({
  category: filters.category || null,
  page: filters.page || 1,
});

taskKeys.list(normalizeFilters(filters))
```

---

## 调试工具

### React Query DevTools
```tsx
// main.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Redux DevTools (Zustand)
```typescript
// 已内置在store定义中
devtools({ name: 'StoreName' })
```

---

*状态管理规范版本: 1.0*
