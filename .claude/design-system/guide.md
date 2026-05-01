# 蓝血精英 - 设计系统使用指南

## 快速开始

### 1. 安装依赖

```bash
# 图标库
npm install lucide-react

# 字体
npm install @fontsource/inter @fontsource/jetbrains-mono
```

### 2. 导入设计Token

```tsx
// main.tsx 或 App.tsx
import './design-system/tokens.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/jetbrains-mono/400.css';
```

### 3. Tailwind 配置

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        // 品牌色
        blue: {
          900: '#0A1628',
          800: '#0F1D32',
          700: '#152238',
          600: '#1C2A40',
          500: '#243549',
          400: '#3D5A80',
          300: '#6B8DB5',
          200: '#98B4D4',
          100: '#C5D6E8',
          50: '#E8EFF7',
        },
        gold: {
          600: '#B8923F',
          500: '#D4A853',
          400: '#E0BC6E',
          300: '#ECD08A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'slide-down': 'slideDown 300ms ease-out',
        'shake': 'shake 300ms ease',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
      },
    },
  },
};
```

---

## 基础用法

### 颜色使用

```tsx
// ❌ 错误 - 硬编码颜色
<div className="bg-[#0A1628] text-[#D4A853]">

// ✅ 正确 - 使用设计Token
<div className="bg-blue-900 text-gold-500">

// ✅ 也可使用CSS变量
<div className="bg-[var(--color-blue-900)] text-[var(--color-gold-500)]">
```

### 文字样式

```tsx
// 页面标题
<h1 className="text-[32px] font-semibold text-text-primary">
  页面标题
</h1>

// 区块标题
<h2 className="text-[24px] font-semibold text-text-primary">
  区块标题
</h2>

// 正文
<p className="text-[15px] leading-6 text-text-secondary">
  正文内容
</p>

// 说明文字
<span className="text-[14px] text-text-tertiary">
  说明文字
</span>
```

### 间距使用

```tsx
// 使用设计Token的间距
<div className="p-4 gap-3">
  {/* 16px padding, 12px gap */}
</div>

// 或使用CSS变量
<div style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
  {/* 同上 */}
</div>
```

---

## 组件使用

### 按钮

```tsx
import { Loader2 } from 'lucide-react';

// 主按钮
<button className="
  h-10 px-5 rounded-xl
  bg-gold-500 text-blue-900
  font-semibold text-[15px]
  hover:bg-gold-400
  active:bg-gold-600 active:scale-[0.98]
  transition-all duration-150
  disabled:opacity-50 disabled:cursor-not-allowed
">
  主按钮
</button>

// 次按钮
<button className="
  h-10 px-5 rounded-xl
  border border-blue-400 text-blue-200
  font-semibold text-[15px]
  hover:bg-blue-700
  active:scale-[0.98]
  transition-all duration-150
">
  次按钮
</button>

// 加载状态
<button disabled className="
  h-10 px-5 rounded-xl
  bg-gold-500 text-blue-900
  font-semibold text-[15px]
  opacity-50 cursor-not-allowed
  flex items-center gap-2
">
  <Loader2 className="w-4 h-4 animate-spin" />
  加载中...
</button>
```

### 输入框

```tsx
import { Search, X } from 'lucide-react';

// 基础输入框
<input
  type="text"
  placeholder="请输入..."
  className="
    w-full h-12 px-4
    bg-blue-800 border border-blue-600
    rounded-xl text-text-primary
    placeholder:text-text-tertiary
    focus:border-blue-400 focus:outline-none
    focus:ring-[3px] focus:ring-blue-400/20
    transition-all duration-150
  "
/>

// 带图标的输入框
<div className="relative">
  <Search className="
    absolute left-4 top-1/2 -translate-y-1/2
    w-5 h-5 text-text-tertiary
  " />
  <input
    type="text"
    placeholder="搜索..."
    className="
      w-full h-12 pl-11 pr-10
      bg-blue-800 border border-blue-600
      rounded-xl text-text-primary
      placeholder:text-text-tertiary
      focus:border-blue-400 focus:outline-none
      transition-all duration-150
    "
  />
  <button className="
    absolute right-3 top-1/2 -translate-y-1/2
    p-1 rounded-lg
    hover:bg-blue-700
    text-text-tertiary
  ">
    <X className="w-4 h-4" />
  </button>
</div>

// 错误状态
<input
  type="text"
  className="
    w-full h-12 px-4
    bg-blue-800 border border-error
    rounded-xl text-text-primary
    focus:outline-none
    animate-shake
  "
/>
<p className="mt-1 text-sm text-error">错误提示信息</p>
```

### 卡片

```tsx
// 基础卡片
<div className="
  bg-blue-800 rounded-2xl p-5
  border border-blue-600/50
">
  卡片内容
</div>

// 可点击卡片
<div className="
  bg-blue-800 rounded-2xl p-5
  border border-blue-600/50
  cursor-pointer
  hover:border-blue-500
  hover:shadow-lg
  hover:-translate-y-0.5
  transition-all duration-200
">
  可点击卡片内容
</div>

// 选中卡片
<div className="
  bg-blue-800 rounded-2xl p-5
  border-2 border-gold-500
  shadow-[0_0_20px_rgba(212,168,83,0.15)]
">
  选中状态卡片
</div>
```

### 标签

```tsx
// 基础标签
<span className="
  inline-flex items-center
  px-2.5 py-1
  bg-blue-700 rounded-md
  text-xs font-medium text-blue-200
">
  标签
</span>

// 可关闭标签
<span className="
  inline-flex items-center gap-1
  px-2.5 py-1
  bg-blue-700 rounded-md
  text-xs font-medium text-blue-200
">
  标签
  <button className="hover:text-text-primary">
    <X className="w-3 h-3" />
  </button>
</span>

// 状态标签
<span className="
  inline-flex items-center
  px-2 py-0.5
  rounded-full
  text-[11px] font-semibold
  bg-success/20 text-success
  border border-success
">
  成功
</span>
```

---

## 布局模式

### 客户端布局

```tsx
// 主布局组件
function ClientLayout({ children }) {
  return (
    <div className="min-h-screen bg-blue-900">
      {/* 顶部导航 */}
      <header className="
        fixed top-0 left-0 right-0 z-50
        h-14 bg-blue-900/80 backdrop-blur
        border-b border-blue-600/50
      ">
        <div className="max-w-[1200px] mx-auto px-4 h-full flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            {/* 导航链接 */}
          </nav>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <UserAvatar />
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="pt-14 pb-16 md:pb-0">
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* 底部导航 - 仅移动端 */}
      <nav className="
        fixed bottom-0 left-0 right-0 z-50
        h-16 bg-blue-800
        border-t border-blue-600/50
        md:hidden
      ">
        {/* 底部Tab */}
      </nav>
    </div>
  );
}
```

### 管理端布局

```tsx
function AdminLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-blue-900">
      {/* 顶部栏 */}
      <header className="
        fixed top-0 left-0 right-0 z-50
        h-14 bg-blue-900
        border-b border-blue-600/50
      ">
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="lg:hidden p-2 hover:bg-blue-800 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Logo />
            <span className="text-text-secondary">管理后台</span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* 侧边栏 */}
      <aside className={`
        fixed left-0 top-14 bottom-0 z-40
        bg-blue-800 border-r border-blue-600/50
        transition-all duration-300
        ${sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}
        hidden lg:block
      `}>
        {/* 导航菜单 */}
      </aside>

      {/* 主内容 */}
      <main className={`
        pt-14 min-h-screen
        transition-all duration-300
        lg:ml-[260px]
        ${sidebarCollapsed ? 'lg:ml-[72px]' : ''}
      `}>
        <div className="p-6 max-w-[1440px]">
          {children}
        </div>
      </main>
    </div>
  );
}
```

---

## 页面示例

### 发现页

```tsx
function DiscoverPage() {
  return (
    <div className="space-y-8">
      {/* 搜索栏 */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
        <input
          type="text"
          placeholder="搜索精英、技能、任务..."
          className="
            w-full h-12 pl-12 pr-4
            bg-blue-800 rounded-full
            border border-blue-600/50
            text-text-primary
            placeholder:text-text-tertiary
            focus:border-blue-400 focus:outline-none
            transition-all duration-150
          "
        />
      </div>

      {/* 兴趣小组 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-primary">兴趣小组</h2>
          <button className="text-gold-500 hover:text-gold-400 text-sm">
            查看全部
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {groups.map(group => (
            <div
              key={group.id}
              className="
                bg-blue-800 rounded-2xl p-4
                border border-blue-600/50
                cursor-pointer
                hover:border-gold-500/50
                hover:shadow-lg
                transition-all duration-200
              "
            >
              <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center mb-3">
                <group.icon className="w-6 h-6 text-gold-500" />
              </div>
              <h3 className="font-semibold text-text-primary">{group.name}</h3>
              <p className="text-sm text-text-tertiary">{group.memberCount}人</p>
            </div>
          ))}
        </div>
      </section>

      {/* 智能匹配 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-primary">智能匹配</h2>
          <button className="p-2 hover:bg-blue-800 rounded-lg">
            <RefreshCw className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
        {/* 匹配卡片轮播 */}
      </section>
    </div>
  );
}
```

### 任务卡片

```tsx
function TaskCard({ task }) {
  return (
    <div className="
      bg-blue-800 rounded-2xl p-5
      border border-blue-600/50
      hover:border-blue-500
      hover:shadow-lg
      hover:-translate-y-0.5
      transition-all duration-200
    ">
      {/* 头部 */}
      <div className="flex items-start justify-between mb-3">
        <span className="
          px-2 py-1
          bg-blue-700 rounded-md
          text-xs font-medium text-blue-200
        ">
          {task.category}
        </span>
        <span className="text-xl font-bold text-gold-500">
          ¥{task.budget.toLocaleString()}
        </span>
      </div>

      {/* 标题和描述 */}
      <h3 className="font-semibold text-text-primary mb-2 line-clamp-1">
        {task.title}
      </h3>
      <p className="text-sm text-text-secondary line-clamp-2 mb-4">
        {task.description}
      </p>

      {/* 技能标签 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {task.skills.slice(0, 3).map(skill => (
          <span key={skill} className="
            px-2 py-0.5
            bg-blue-700/50 rounded
            text-xs text-blue-200
          ">
            {skill}
          </span>
        ))}
      </div>

      {/* 底部信息 */}
      <div className="flex items-center justify-between pt-4 border-t border-blue-600/50">
        <div className="flex items-center gap-2">
          <img
            src={task.publisher.avatar}
            alt={task.publisher.name}
            className="w-6 h-6 rounded-full border border-blue-600"
          />
          <span className="text-sm text-text-secondary">{task.publisher.name}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-text-tertiary">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {task.deadline}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {task.applicants}人申请
          </span>
        </div>
      </div>
    </div>
  );
}
```

---

## 最佳实践

### 1. 颜色使用

```tsx
// ✅ 使用语义化颜色
<div className="text-text-primary">
<div className="text-text-secondary">
<div className="text-success">
<div className="text-error">

// ❌ 避免直接使用十六进制（除非特殊情况）
<div className="text-[#F0F4F8]">
```

### 2. 间距一致性

```tsx
// ✅ 使用设计系统的间距
<div className="p-4 gap-3">
<div className="m-6">

// ❌ 避免随意数值
<div className="p-[15px] gap-[11px]">
```

### 3. 响应式设计

```tsx
// ✅ 移动优先
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ✅ 响应式字体
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// ✅ 响应式间距
<div className="p-4 md:p-6 lg:p-8">
```

### 4. 动画使用

```tsx
// ✅ 使用预设动画类
<div className="animate-fade-in">
<div className="animate-slide-up">

// ✅ 过渡效果
<button className="transition-all duration-150">

// ❌ 避免过长动画
<button className="transition-all duration-500">
```

### 5. 可访问性

```tsx
// ✅ 正确的按钮语义
<button onClick={handleClick} aria-label="关闭">
  <X className="w-5 h-5" />
</button>

// ✅ 表单标签关联
<label htmlFor="email">邮箱</label>
<input id="email" type="email" aria-describedby="email-error" />
<span id="email-error" role="alert">错误信息</span>

// ✅ 焦点可见
<button className="focus:outline-none focus:ring-2 focus:ring-gold-500">
```

---

## 常见错误

### 错误1: 颜色不一致
```tsx
// ❌ 错误
<div className="bg-[#0A1628]">
<div className="bg-[#0a1526]">
<div className="bg-[#0b1729]">

// ✅ 正确
<div className="bg-blue-900">
```

### 错误2: 间距不一致
```tsx
// ❌ 错误
<div className="p-3">  {/* 12px */}
<div className="p-4">  {/* 16px */}
<div className="p-[14px]">  {/* 14px - 不要 */}

// ✅ 正确
<div className="p-3">  {/* 12px */}
<div className="p-4">  {/* 16px */}
<div className="p-5">  {/* 20px */}
```

### 错误3: 缺少过渡
```tsx
// ❌ 错误
<button className="bg-gold-500 hover:bg-gold-400">

// ✅ 正确
<button className="bg-gold-500 hover:bg-gold-400 transition-colors duration-150">
```

### 错误4: 响应式断点混乱
```tsx
// ❌ 错误 - 断点跳跃
<div className="sm:grid md:flex lg:grid">

// ✅ 正确 - 逻辑一致
<div className="flex flex-col md:flex-row">
```

---

## 工具函数

### 类名合并

```ts
// utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
import { cn } from '@/utils/cn';

function Button({ variant, className, children }) {
  return (
    <button
      className={cn(
        // 基础样式
        'h-10 px-5 rounded-xl font-semibold text-[15px]',
        'transition-all duration-150',

        // 变体样式
        variant === 'primary' && 'bg-gold-500 text-blue-900 hover:bg-gold-400',
        variant === 'secondary' && 'border border-blue-400 text-blue-200 hover:bg-blue-700',

        // 外部传入的类名
        className
      )}
    >
      {children}
    </button>
  );
}
```

### 响应式钩子

```ts
// hooks/useBreakpoint.ts
import { useEffect, useState } from 'react';

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1440,
};

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState('');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= breakpoints['2xl']) setBreakpoint('2xl');
      else if (width >= breakpoints.xl) setBreakpoint('xl');
      else if (width >= breakpoints.lg) setBreakpoint('lg');
      else if (width >= breakpoints.md) setBreakpoint('md');
      else if (width >= breakpoints.sm) setBreakpoint('sm');
      else setBreakpoint('xs');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}
```

---

## 设计系统文档索引

| 文档 | 路径 | 内容 |
|-----|------|------|
| 设计原则 | `design-system/design-principles.md` | 色彩、字体、间距、动效 |
| 组件库 | `design-system/components.md` | 按钮、卡片、输入框等 |
| 交互规范 | `design-system/interactions.md` | 动画、转场、反馈 |
| 响应式设计 | `design-system/responsive.md` | 断点、布局、适配规则 |
| 图标系统 | `design-system/icons.md` | 图标风格、尺寸、使用 |
| 客户端UI | `design-system/client-ui.md` | 客户端页面设计 |
| 管理端UI | `design-system/admin-ui.md` | 管理端页面设计 |
| 设计Token | `design-system/tokens.css` | CSS变量定义 |
| 使用指南 | `design-system/guide.md` | 本文档 |

---

*如有疑问或需要新增组件，请参考设计原则文档或联系设计团队。*

