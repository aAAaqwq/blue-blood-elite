# 蓝血精英 - 部署指南

## 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                         用户层                              │
│                   (浏览器、移动设备)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        CDN层                                │
│         (静态资源缓存、图片优化、DDoS防护)                    │
│                   Cloudflare / Vercel Edge                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       应用层                                 │
│                    Vercel / Netlify                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                Vite + React SPA                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │   客户端    │  │   管理端    │  │   API路由   │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        数据层                                │
│                         Supabase                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │    Auth      │  │   Storage    │      │
│  │              │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Realtime   │  │ Edge Functions│                       │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 环境配置

### 环境变量

```bash
# .env.local (开发)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=http://localhost:3000

# .env.production (生产)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=https://your-app.vercel.app
```

### 环境检查清单

| 环境 | 用途 | 数据库 | 支付 |
|-----|------|--------|------|
| **Development** | 本地开发 | 开发环境 | 沙箱 |
| **Staging** | 预发布测试 | 生产数据副本 | 沙箱 |
| **Production** | 生产环境 | 生产数据库 | 生产 |

---

## Vercel 部署

### 项目配置

```json
// vercel.json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### GitHub Actions 自动部署

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit

  deploy-preview:
    if: github.event_name == 'pull_request'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Supabase 配置

### 数据库迁移

```bash
# 安装 Supabase CLI
npm install -g supabase

# 初始化项目
supabase init

# 启动本地环境
supabase start

# 创建迁移
supabase migration new create_tasks_table

# 应用迁移
supabase db push

# 生成类型
supabase gen types typescript --project-id your-project-id --schema public > src/types/database.ts
```

### 生产环境配置

```sql
-- 启用 RLS (Row Level Security)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- 创建存储桶策略
CREATE POLICY "允许认证用户上传头像"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "允许公开访问头像"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

### Edge Functions 部署

```bash
# 部署 Edge Functions
supabase functions deploy payment-webhook
supabase functions deploy notification

# 设置环境变量
supabase secrets set PAYMENT_API_KEY=xxx
supabase secrets set WEBHOOK_SECRET=xxx
```

---

## 域名与 SSL

### 自定义域名配置

```bash
# Vercel CLI
vercel domains add www.lanxuejingying.com
vercel domains add lanxuejingying.com

# 配置 DNS
# A记录: @ -> 76.76.21.21
# CNAME: www -> cname.vercel-dns.com
```

### SSL/TLS 配置

```javascript
// vite.config.ts - HSTS配置
export default defineConfig({
  server: {
    headers: {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    },
  },
});
```

---

## 性能优化

### 构建优化

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['lodash-es', 'date-fns'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
```

### 图片优化

```tsx
// 使用 WebP 格式
<img
  srcSet="
    /image-400w.webp 400w,
    /image-800w.webp 800w,
    /image-1200w.webp 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  src="/image-800w.webp"
  alt="描述"
  loading="lazy"
  decoding="async"
/>
```

---

## 监控与日志

### Sentry 集成

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### 性能监控

```typescript
// src/lib/analytics.ts
export function trackPageView(path: string) {
  // Google Analytics
  gtag('config', 'GA_MEASUREMENT_ID', { page_path: path });
  
  // 自定义分析
  fetch('/api/analytics/pageview', {
    method: 'POST',
    body: JSON.stringify({ path, timestamp: Date.now() }),
  });
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  gtag('event', name, params);
}
```

---

## 备份与恢复

### 数据库备份

```bash
# 手动备份
supabase db dump -f backup.sql

# 自动化备份 (GitHub Actions)
# .github/workflows/backup.yml
name: Database Backup

on:
  schedule:
    - cron: '0 0 * * *'  # 每天凌晨

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: supabase/setup-cli@v1
      - run: supabase db dump -f backup-$(date +%Y%m%d).sql
      - uses: actions/upload-artifact@v3
        with:
          name: database-backup
          path: backup-*.sql
```

### 灾难恢复

```bash
# 恢复数据库
psql -h your-host -U postgres -d postgres -f backup.sql

# 恢复 Storage
aws s3 sync s3://backup-bucket/storage s3://production-bucket/storage
```

---

## 安全检查清单

### 部署前检查

- [ ] 环境变量已配置
- [ ] 数据库迁移已应用
- [ ] RLS 策略已启用
- [ ] CORS 配置正确
- [ ] 敏感信息未泄露
- [ ] 依赖项无安全漏洞 (`npm audit`)
- [ ] 构建无错误
- [ ] 测试全部通过

### 生产环境配置

- [ ] 启用 HTTPS
- [ ] 配置 CSP 头
- [ ] 启用 HSTS
- [ ] 配置 Rate Limiting
- [ ] 日志收集配置
- [ ] 告警规则配置

---

## 回滚策略

### Vercel 回滚

```bash
# 查看部署历史
vercel --version

# 回滚到上一版本
vercel --rollback

# 回滚到指定版本
vercel --target production [deployment-url]
```

### 数据库回滚

```bash
# 回滚迁移
supabase migration repair 20240101120000 --status reverted

# 或者使用备份恢复
supabase db reset
psql -f backup.sql
```

---

## 常见问题

### 构建失败

```bash
# 清理缓存
rm -rf node_modules dist .vercel
npm install
npm run build

# 检查 TypeScript 错误
npm run type-check

# 检查 ESLint 错误
npm run lint
```

### 环境变量问题

```bash
# Vercel CLI 设置环境变量
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### 数据库连接问题

```bash
# 检查连接
supabase status

# 重启本地服务
supabase stop
supabase start
```

---

*部署指南版本: 1.0*
*最后更新: 2026-04-30*
