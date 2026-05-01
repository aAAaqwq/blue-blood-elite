# 蓝血精英 - API设计规范

## API架构

### 基于 Supabase 的 API 策略

```
┌─────────────────────────────────────────────────────────────┐
│                         客户端                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Repository Pattern                      │   │
│  │                                                      │   │
│  │   ┌──────────────┐     ┌──────────────────────┐    │   │
│  │   │  TaskRepo    │────▶│  Supabase Client     │────┼───┼──▶
│  │   └──────────────┘     └──────────────────────┘    │   │   │
│  │                                                      │   │   │
│  │   ┌──────────────┐     ┌──────────────────────┐    │   │   │
│  │   │  UserRepo    │────▶│  Edge Functions      │────┼───┼──▶
│  │   └──────────────┘     └──────────────────────┘    │   │   │
│  └─────────────────────────────────────────────────────┘   │   │
└─────────────────────────────────────────────────────────────┘   │
                              │                                   │
                              ▼                                   │
┌─────────────────────────────────────────────────────────────┐   │
│                        Supabase                             │◀──┘
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │  Auth        │  │  Realtime    │      │
│  │  Database    │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  Storage     │  │  Edge        │                        │
│  │              │  │  Functions   │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### API层次

| 层级 | 职责 | 示例 |
|-----|------|------|
| **Repository** | 封装数据访问逻辑 | `taskRepository.findAll()` |
| **Service** | 业务逻辑 | `taskService.apply()` |
| **Hook** | React集成 | `useTasks()` |
| **Component** | UI渲染 | `<TaskList />` |

---

## Repository 模式

### 基础 Repository

```typescript
// src/repositories/base-repository.ts
import { supabase } from '@/lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';

export interface RepositoryError {
  code: string;
  message: string;
  details?: string;
}

export class BaseRepository {
  protected supabase = supabase;
  
  protected handleError(error: PostgrestError): RepositoryError {
    return {
      code: error.code,
      message: this.getErrorMessage(error.code),
      details: error.details,
    };
  }
  
  private getErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      '23505': '数据已存在',
      '23503': '关联数据不存在',
      '42501': '权限不足',
      'PGRST116': '记录不存在',
    };
    return messages[code] || '操作失败，请稍后重试';
  }
  
  protected getPagination(page: number, limit: number) {
    return {
      from: (page - 1) * limit,
      to: page * limit - 1,
    };
  }
}
```

### Task Repository

```typescript
// src/repositories/task-repository.ts
import { BaseRepository } from './base-repository';
import type { Task, TaskFilters, CreateTaskInput, UpdateTaskInput } from '@/types';

const TABLE = 'tasks';

class TaskRepository extends BaseRepository {
  // 获取列表
  async findAll(filters: TaskFilters = {}): Promise<Task[]> {
    let query = this.supabase
      .from(TABLE)
      .select(`
        *,
        publisher:users(*),
        category:task_categories(*),
        skills:task_skills(skill:skills(*))
      `)
      .order('created_at', { ascending: false });
    
    // 筛选
    if (filters.category) {
      query = query.eq('category_id', filters.category);
    }
    
    if (filters.budgetMin) {
      query = query.gte('budget', filters.budgetMin);
    }
    
    if (filters.budgetMax) {
      query = query.lte('budget', filters.budgetMax);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    // 技能筛选
    if (filters.skills?.length) {
      query = query.contains('required_skills', filters.skills);
    }
    
    // 搜索
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    // 分页
    if (filters.page && filters.limit) {
      const { from, to } = this.getPagination(filters.page, filters.limit);
      query = query.range(from, to);
    }
    
    const { data, error } = await query;
    
    if (error) throw this.handleError(error);
    return data || [];
  }
  
  // 获取单个
  async findById(id: string): Promise<Task | null> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select(`
        *,
        publisher:users(*),
        category:task_categories(*),
        skills:task_skills(skill:skills(*)),
        applications:task_applications(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw this.handleError(error);
    }
    
    return data;
  }
  
  // 创建
  async create(input: CreateTaskInput): Promise<Task> {
    const { data: user } = await this.supabase.auth.getUser();
    
    if (!user.user) throw new Error('未登录');
    
    const { data, error } = await this.supabase
      .from(TABLE)
      .insert({
        ...input,
        publisher_id: user.user.id,
        status: 'pending_review',
      })
      .select()
      .single();
    
    if (error) throw this.handleError(error);
    if (!data) throw new Error('创建失败');
    
    return data;
  }
  
  // 更新
  async update(id: string, updates: UpdateTaskInput): Promise<Task> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw this.handleError(error);
    if (!data) throw new Error('更新失败');
    
    return data;
  }
  
  // 删除
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(TABLE)
      .delete()
      .eq('id', id);
    
    if (error) throw this.handleError(error);
  }
  
  // 申请任务
  async apply(taskId: string, message?: string): Promise<void> {
    const { data: user } = await this.supabase.auth.getUser();
    
    const { error } = await this.supabase
      .from('task_applications')
      .insert({
        task_id: taskId,
        applicant_id: user.user!.id,
        message,
        status: 'pending',
      });
    
    if (error) throw this.handleError(error);
  }
  
  // 获取我的任务
  async findMyTasks(userId: string, role: 'publisher' | 'applicant'): Promise<Task[]> {
    if (role === 'publisher') {
      const { data, error } = await this.supabase
        .from(TABLE)
        .select('*')
        .eq('publisher_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw this.handleError(error);
      return data || [];
    } else {
      const { data, error } = await this.supabase
        .from('task_applications')
        .select('task:tasks(*)')
        .eq('applicant_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw this.handleError(error);
      return data?.map(d => d.task) || [];
    }
  }
}

export const taskRepository = new TaskRepository();
```

---

## API命名规范

### Repository方法命名

| 操作 | 方法名 | 返回类型 |
|-----|--------|---------|
| 获取多个 | `findAll`, `findMany` | `Promise<T[]>` |
| 获取单个 | `findById`, `findOne` | `Promise<T \| null>` |
| 创建 | `create`, `insert` | `Promise<T>` |
| 更新 | `update`, `modify` | `Promise<T>` |
| 删除 | `delete`, `remove` | `Promise<void>` |
| 计数 | `count` | `Promise<number>` |
| 存在检查 | `exists` | `Promise<boolean>` |

### 示例

```typescript
// 用户相关
userRepository.findAll(filters)
userRepository.findById(id)
userRepository.findByEmail(email)
userRepository.create(data)
userRepository.update(id, data)
userRepository.updateProfile(userId, data)
userRepository.delete(id)
userRepository.verifyEmail(userId)

// 任务相关
taskRepository.findAll(filters)
taskRepository.findById(id)
taskRepository.findFeatured(limit)
taskRepository.create(data)
taskRepository.update(id, data)
taskRepository.updateStatus(id, status)
taskRepository.delete(id)
taskRepository.apply(taskId, message)
taskRepository.approveApplicant(taskId, userId)

// 课程相关
courseRepository.findAll(filters)
courseRepository.findById(id)
courseRepository.findByCategory(categoryId)
courseRepository.create(data)
courseRepository.update(id, data)
courseRepository.publish(id)
courseRepository.unpublish(id)

// 消息相关
messageRepository.findConversation(userId1, userId2)
messageRepository.findUnread(userId)
messageRepository.send(senderId, receiverId, content)
messageRepository.markAsRead(messageIds)
messageRepository.deleteConversation(userId1, userId2)
```

---

## 响应格式

### 标准响应

```typescript
// 成功响应
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 错误响应
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// 统一返回类型
type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
```

### Repository层包装

```typescript
// src/repositories/base-repository.ts
export interface RepositoryResponse<T> {
  data: T | null;
  error: RepositoryError | null;
}

async function wrapResponse<T>(
  promise: Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<RepositoryResponse<T>> {
  try {
    const { data, error } = await promise;
    
    if (error) {
      return {
        data: null,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      };
    }
    
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: {
        code: 'UNKNOWN',
        message: err instanceof Error ? err.message : '未知错误',
      },
    };
  }
}
```

---

## 错误处理

### HTTP状态码映射

| Supabase Code | HTTP状态码 | 含义 |
|--------------|-----------|------|
| 200 | 200 | 成功 |
| 201 | 201 | 创建成功 |
| 204 | 204 | 删除成功 |
| 400 | 400 | 请求错误 |
| 401 | 401 | 未认证 |
| 403 | 403 | 权限不足 (42501) |
| 404 | 404 | 不存在 (PGRST116) |
| 409 | 409 | 冲突 (23505) |
| 422 | 422 | 验证失败 |
| 500 | 500 | 服务器错误 |

### 错误分类

```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 422, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource}不存在`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = '请先登录') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = '权限不足') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message = '数据已存在') {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}
```

---

## 实时订阅

### 消息实时更新

```typescript
// src/repositories/message-repository.ts
class MessageRepository extends BaseRepository {
  subscribeToMessages(
    userId: string,
    onMessage: (message: Message) => void
  ) {
    return this.supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          onMessage(payload.new as Message);
        }
      )
      .subscribe();
  }
  
  unsubscribe(channel: ReturnType<typeof this.supabase.channel>) {
    this.supabase.removeChannel(channel);
  }
}
```

### 任务状态实时更新

```typescript
// src/hooks/use-task-realtime.ts
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export function useTaskRealtime(taskId: string) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel(`task:${taskId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `id=eq.${taskId}`,
        },
        () => {
          // 刷新任务详情
          queryClient.invalidateQueries({
            queryKey: ['task', taskId],
          });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId, queryClient]);
}
```

---

## 分页规范

### 分页参数

```typescript
interface PaginationParams {
  page: number;      // 当前页，从1开始
  limit: number;     // 每页数量，默认20，最大100
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
```

### 分页实现

```typescript
async function findPaginated<T>(
  table: string,
  params: PaginationParams,
  filters?: Record<string, unknown>
): Promise<PaginatedResponse<T>> {
  const { page, limit } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  let query = supabase
    .from(table)
    .select('*', { count: 'exact' });
  
  // 应用筛选
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
  }
  
  // 分页
  query = query.range(from, to).order('created_at', { ascending: false });
  
  const { data, error, count } = await query;
  
  if (error) throw error;
  
  const total = count || 0;
  const totalPages = Math.ceil(total / limit);
  
  return {
    data: data || [],
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
```

---

## Edge Functions (复杂业务)

### 使用场景

| 场景 | 说明 | 示例 |
|-----|------|------|
| 支付处理 | 敏感操作，需服务端验证 | 微信支付回调 |
| 复杂查询 | 多表关联，性能优化 | 推荐算法 |
| 外部API | 调用第三方服务 | 发送短信 |
| 定时任务 | 定时执行的业务逻辑 | 自动结算 |

### 示例：支付回调

```typescript
// supabase/functions/payment-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const signature = req.headers.get('x-signature');
  const body = await req.json();
  
  // 验证签名
  if (!verifySignature(body, signature)) {
    return new Response('Invalid signature', { status: 401 });
  }
  
  // 处理支付结果
  const { orderId, status, amount } = body;
  
  await supabase.rpc('handle_payment', {
    p_order_id: orderId,
    p_status: status,
    p_amount: amount,
  });
  
  return new Response('OK', { status: 200 });
});

function verifySignature(body: unknown, signature: string | null): boolean {
  // 签名验证逻辑
  return true;
}
```

---

## 性能优化

### 查询优化

```typescript
// ✅ 使用select精简字段
const { data } = await supabase
  .from('tasks')
  .select('id, title, budget, status') // 只选需要的
  .limit(20);

// ❌ 不要select全部
const { data } = await supabase
  .from('tasks')
  .select('*')
  .limit(20);
```

### 索引提示

```sql
-- 常用查询字段加索引
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_category ON tasks(category_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- 复合索引
CREATE INDEX idx_tasks_status_created ON tasks(status, created_at DESC);

-- 全文搜索索引
CREATE INDEX idx_tasks_search ON tasks USING gin(to_tsvector('chinese', title || ' ' || description));
```

### 缓存策略

```typescript
// React Query缓存配置
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 任务列表缓存5分钟
      staleTime: 5 * 60 * 1000,
      
      // 用户资料缓存30分钟
      gcTime: 30 * 60 * 1000,
      
      // 错误重试
      retry: (failureCount, error: any) => {
        // 404不重试
        if (error?.status === 404) return false;
        return failureCount < 3;
      },
    },
  },
});

// 预取数据
function prefetchTask(taskId: string) {
  queryClient.prefetchQuery({
    queryKey: ['task', taskId],
    queryFn: () => taskRepository.findById(taskId),
    staleTime: 10 * 60 * 1000,
  });
}
```

---

## 安全最佳实践

### Row Level Security (RLS)

```sql
-- 任务表RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 所有人可查看已审核的任务
CREATE POLICY "Public tasks are viewable by everyone"
ON tasks FOR SELECT
USING (status = 'approved');

-- 发布者可查看自己的所有任务
CREATE POLICY "Users can view own tasks"
ON tasks FOR SELECT
USING (auth.uid() = publisher_id);

-- 发布者可创建任务
CREATE POLICY "Users can create tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = publisher_id);

-- 发布者可更新自己的任务
CREATE POLICY "Users can update own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = publisher_id);
```

### API请求验证

```typescript
// 服务端验证 (Edge Function)
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(5000),
  budget: z.number().min(100),
  deadline: z.date().min(new Date()),
});

export async function createTask(req: Request) {
  const body = await req.json();
  
  // 验证输入
  const result = createTaskSchema.safeParse(body);
  if (!result.success) {
    return new Response(JSON.stringify({
      error: '验证失败',
      details: result.error.issues,
    }), { status: 422 });
  }
  
  // 执行业务逻辑
  // ...
}
```

---

*API设计规范版本: 1.0*
