# 蓝血精英 - 测试策略

## 测试金字塔

```
        /\
       /  \
      / E2E \          5% - 关键用户流程
     /________\
    /          \
   / Integration \     20% - API、数据库、组件
  /______________\
 /                \
/     Unit         \   75% - 工具、Hooks、工具函数
/____________________\
```

## 测试分层

| 层级 | 工具 | 覆盖目标 | 时间 |
|-----|------|---------|------|
| **单元测试** | Vitest | 工具函数、Hooks、纯组件 | < 100ms |
| **集成测试** | Vitest + RTL | 组件交互、API集成 | < 1s |
| **E2E测试** | Playwright | 关键用户流程 | < 30s |
| **视觉回归** | Playwright | UI一致性 | 手动 |
| **性能测试** | Lighthouse | 性能指标 | CI |

---

## 单元测试

### 配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 测试工具函数

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatDate } from './utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
    expect(cn('foo', { bar: true })).toBe('foo bar');
    expect(cn('foo', { bar: false })).toBe('foo');
  });
  
  it('handles conditional classes', () => {
    const isActive = true;
    expect(cn('base', isActive && 'active')).toBe('base active');
  });
});

describe('formatCurrency', () => {
  it('formats number to currency', () => {
    expect(formatCurrency(1000)).toBe('¥1,000');
    expect(formatCurrency(1000.5)).toBe('¥1,001');
    expect(formatCurrency(0)).toBe('¥0');
  });
});

describe('formatDate', () => {
  it('formats date string', () => {
    expect(formatDate('2024-01-15')).toBe('2024年1月15日');
  });
  
  it('formats Date object', () => {
    expect(formatDate(new Date('2024-01-15'))).toBe('2024年1月15日');
  });
  
  it('handles relative dates', () => {
    const today = new Date();
    expect(formatDate(today, { relative: true })).toBe('今天');
  });
});
```

### 测试 Hooks

```typescript
// src/hooks/use-task-apply.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTaskApply } from './use-task-apply';
import { taskRepository } from '@/repositories/task-repository';

// Mock repository
vi.mock('@/repositories/task-repository', () => ({
  taskRepository: {
    apply: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useTaskApply', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('applies successfully', async () => {
    vi.mocked(taskRepository.apply).mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useTaskApply('task-1'), { wrapper });
    
    result.current.apply();
    
    await waitFor(() => {
      expect(result.current.isApplying).toBe(false);
    });
    
    expect(taskRepository.apply).toHaveBeenCalledWith('task-1');
  });
  
  it('handles error', async () => {
    const error = new Error('申请失败');
    vi.mocked(taskRepository.apply).mockRejectedValue(error);
    
    const { result } = renderHook(() => useTaskApply('task-1'), { wrapper });
    
    result.current.apply();
    
    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});
```

### 测试 Repository

```typescript
// src/repositories/task-repository.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskRepository } from './task-repository';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

describe('TaskRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('findById', () => {
    it('returns task when found', async () => {
      const mockTask = { id: '1', title: 'Test Task' };
      const single = vi.fn().mockResolvedValue({
        data: mockTask,
        error: null,
      });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single,
      } as any);
      
      const result = await taskRepository.findById('1');
      expect(result).toEqual(mockTask);
    });
    
    it('returns null when not found', async () => {
      const single = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single,
      } as any);
      
      const result = await taskRepository.findById('999');
      expect(result).toBeNull();
    });
  });
});
```

---

## 集成测试

### 组件测试

```typescript
// src/components/ui/button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('handles click', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('is disabled when loading', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
  
  it('applies variant styles', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gold-500');
    
    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('border');
  });
});
```

### 表单测试

```typescript
// src/features/auth/components/login-form.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './login-form';
import { authService } from '@/features/auth/services/auth-service';

vi.mock('@/features/auth/services/auth-service');

describe('LoginForm', () => {
  it('submits form with valid data', async () => {
    const login = vi.fn().mockResolvedValue({ user: { id: '1' } });
    vi.mocked(authService.login).mockImplementation(login);
    
    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText('邮箱'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('密码'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByText('登录'));
    
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
  
  it('shows validation errors', async () => {
    render(<LoginForm />);
    
    fireEvent.click(screen.getByText('登录'));
    
    await waitFor(() => {
      expect(screen.getByText('请输入邮箱')).toBeInTheDocument();
      expect(screen.getByText('请输入密码')).toBeInTheDocument();
    });
  });
  
  it('shows error on failed login', async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new Error('邮箱或密码错误')
    );
    
    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText('邮箱'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('密码'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByText('登录'));
    
    await waitFor(() => {
      expect(screen.getByText('邮箱或密码错误')).toBeInTheDocument();
    });
  });
});
```

---

## E2E测试

### Playwright配置

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 关键流程测试

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('认证流程', () => {
  test('用户可注册并登录', async ({ page }) => {
    // 注册
    await page.goto('/register');
    await page.fill('[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'password123');
    await page.fill('[name="confirmPassword"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/discover/);
    
    // 登出
    await page.click('[aria-label="用户菜单"]');
    await page.click('text=退出登录');
    
    await expect(page).toHaveURL('/login');
    
    // 登录
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/discover/);
  });
});

// e2e/tasks.spec.ts
import { test, expect } from '@playwright/test';

test.describe('任务流程', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
  });
  
  test('浏览任务列表并查看详情', async ({ page }) => {
    await page.goto('/tasks');
    
    // 等待任务加载
    await page.waitForSelector('[data-testid="task-card"]');
    
    // 点击第一个任务
    await page.click('[data-testid="task-card"]:first-child');
    
    // 验证详情页
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=预算')).toBeVisible();
  });
  
  test('发布任务完整流程', async ({ page }) => {
    await page.goto('/tasks/new');
    
    // 填写表单
    await page.fill('[name="title"]', '测试任务标题');
    await page.fill('[name="description"]', '这是一个测试任务描述，需要超过20个字符');
    await page.fill('[name="budget"]', '5000');
    
    // 选择分类
    await page.click('[data-testid="category-select"]');
    await page.click('text=AI开发');
    
    // 提交
    await page.click('button[type="submit"]');
    
    // 验证跳转
    await expect(page).toHaveURL(/\/tasks\/.+/);
    await expect(page.locator('text=测试任务标题')).toBeVisible();
  });
});

// e2e/responsive.spec.ts
import { test, expect } from '@playwright/test';

test.describe('响应式设计', () => {
  test('移动端底部导航可见', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/discover');
    
    await expect(page.locator('nav[aria-label="底部导航"]')).toBeVisible();
  });
  
  test('桌面端侧边栏可见', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/discover');
    
    await expect(page.locator('aside[aria-label="侧边栏"]')).toBeVisible();
  });
});
```

---

## 视觉回归测试

### Playwright视觉测试

```typescript
// e2e/visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('视觉回归', () => {
  test('首页截图', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
    });
  });
  
  test('任务卡片截图', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForSelector('[data-testid="task-card"]');
    
    const card = page.locator('[data-testid="task-card"]:first-child');
    await expect(card).toHaveScreenshot('task-card.png');
  });
  
  test('响应式截图', async ({ page }) => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 900 },
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto('/discover');
      
      await expect(page).toHaveScreenshot(`discover-${viewport.name}.png`, {
        fullPage: true,
      });
    }
  });
});
```

---

## 性能测试

### Lighthouse CI

```yaml
# lighthouserc.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      url: ['http://localhost:4173/', 'http://localhost:4173/tasks'],
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
  },
};
```

### Web Vitals监控

```typescript
// src/lib/vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB, type Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  // 发送到分析服务
  console.log(metric);
}

export function reportWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}
```

---

## 测试数据管理

### Mock数据

```typescript
// src/test/factories/task-factory.ts
import { faker } from '@faker-js/faker';
import type { Task } from '@/types';

export function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.sentence(5),
    description: faker.lorem.paragraphs(2),
    budget: faker.number.int({ min: 1000, max: 50000 }),
    status: 'open',
    categoryId: faker.string.uuid(),
    publisherId: faker.string.uuid(),
    createdAt: faker.date.past().toISOString(),
    deadline: faker.date.future().toISOString(),
    ...overrides,
  };
}

export function createTaskList(count: number): Task[] {
  return Array.from({ length: count }, () => createTask());
}
```

### MSW (Mock Service Worker)

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { createTaskList } from '../factories/task-factory';

export const handlers = [
  http.get('/api/tasks', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    
    return HttpResponse.json({
      data: createTaskList(20),
      meta: {
        page,
        total: 100,
        totalPages: 5,
      },
    });
  }),
  
  http.get('/api/tasks/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: 'Mock Task',
      budget: 5000,
    });
  }),
];
```

---

## CI/CD集成

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload report
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 测试检查清单

### 单元测试
- [ ] 工具函数有完整测试
- [ ] Hooks有测试
- [ ] Repository有测试
- [ ] 覆盖率 > 80%

### 集成测试
- [ ] 关键组件有交互测试
- [ ] 表单有完整测试
- [ ] API错误处理有测试

### E2E测试
- [ ] 认证流程
- [ ] 核心业务流程
- [ ] 关键用户旅程
- [ ] 响应式适配

### 其他
- [ ] 可访问性测试
- [ ] 性能测试
- [ ] 视觉回归测试

---

*测试策略版本: 1.0*
