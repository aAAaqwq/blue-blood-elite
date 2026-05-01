# 蓝血精英 - 技术栈详细规范

## 核心依赖

### 构建与开发
```json
{
  "vite": "^5.4.0",
  "vite-plugin-pwa": "^0.20.0",
  "typescript": "^5.5.0",
  "@types/react": "^19.0.0",
  "@types/react-dom": "^19.0.0"
}
```

### UI框架与样式
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "tailwindcss": "^4.0.0",
  "@tailwindcss/vite": "^4.0.0",
  "lucide-react": "^0.400.0",
  "framer-motion": "^11.0.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.3.0"
}
```

### 路由与数据
```json
{
  "react-router": "^7.0.0",
  "@tanstack/react-query": "^5.40.0",
  "@supabase/supabase-js": "^2.43.0"
}
```

### 状态管理与表单
```json
{
  "zustand": "^4.5.0",
  "react-hook-form": "^7.51.0",
  "@hookform/resolvers": "^3.4.0",
  "zod": "^3.23.0"
}
```

### 工具库
```json
{
  "date-fns": "^3.6.0",
  "nanoid": "^5.0.0"
}
```

## 开发工具

```json
{
  "eslint": "^8.57.0",
  "@typescript-eslint/eslint-plugin": "^7.0.0",
  "prettier": "^3.2.0",
  "vitest": "^1.6.0",
  "@testing-library/react": "^15.0.0",
  "playwright": "^1.44.0"
}
```

## 安装命令

```bash
# 核心依赖
npm install react react-dom react-router @tanstack/react-query @supabase/supabase-js

# UI相关
npm install tailwindcss @tailwindcss/vite lucide-react framer-motion clsx tailwind-merge

# 状态管理
npm install zustand react-hook-form @hookform/resolvers zod

# 工具库
npm install date-fns nanoid

# 字体
npm install @fontsource/inter @fontsource/jetbrains-mono

# 开发依赖
npm install -D typescript @types/react @types/react-dom vite vite-plugin-pwa
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D @playwright/test
```

## shadcn/ui 配置

```bash
# 初始化 shadcn/ui
npx shadcn-ui@latest init

# 配置选项
# - Style: New York
# - Base color: Slate
# - CSS variables: Yes
```

### 安装组件
```bash
# 基础组件
npx shadcn-ui@latest add button input card badge avatar dialog dropdown-menu
npx shadcn-ui@latest add tabs select textarea label
npx shadcn-ui@latest add table skeleton scroll-area separator
npx shadcn-ui@latest add toast tooltip popover sheet

# 表单组件
npx shadcn-ui@latest add form checkbox switch radio-group

# 数据展示
npx shadcn-ui@latest add pagination data-table
```

## Tailwind 配置

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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
          50: 'rgba(212, 168, 83, 0.1)',
        },
        // shadcn 语义化颜色
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        display: ['48px', { lineHeight: '56px', fontWeight: '700' }],
        'title-1': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'title-2': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'title-3': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        headline: ['17px', { lineHeight: '24px', fontWeight: '600' }],
        body: ['15px', { lineHeight: '24px', fontWeight: '400' }],
        callout: ['14px', { lineHeight: '20px', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      spacing: {
        '4xs': '4px',
        '3xs': '8px',
        '2xs': '12px',
        xs: '16px',
        sm: '20px',
        md: '24px',
        lg: '32px',
        xl: '40px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '80px',
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        full: '9999px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'fade-out': 'fade-out 200ms ease-out',
        'slide-up': 'slide-up 300ms ease-out',
        'slide-down': 'slide-down 300ms ease-out',
        shake: 'shake 300ms ease',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

## CSS变量配置

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 导入设计Token */
@import '../design-system/tokens.css';

@layer base {
  :root {
    --background: 222 47% 6%;
    --foreground: 210 40% 96%;
    --card: 220 40% 10%;
    --card-foreground: 210 40% 96%;
    --popover: 220 40% 10%;
    --popover-foreground: 210 40% 96%;
    --primary: 43 55% 57%;
    --primary-foreground: 220 40% 10%;
    --secondary: 220 30% 18%;
    --secondary-foreground: 210 40% 96%;
    --muted: 220 30% 15%;
    --muted-foreground: 215 20% 55%;
    --accent: 220 30% 18%;
    --accent-foreground: 210 40% 96%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 210 40% 98%;
    --border: 220 30% 18%;
    --input: 220 30% 15%;
    --ring: 43 55% 57%;
    --radius: 0.75rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground font-sans antialiased;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  }
  html {
    scroll-behavior: smooth;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

## TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"],
      "@/features/*": ["./src/features/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

## ESLint 配置

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
};
```

## 环境变量

```bash
# .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```typescript
// src/lib/env.ts
export const env = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

// 校验
if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  throw new Error('Missing required environment variables');
}
```

---

*技术栈版本: 2026.04*
*Node.js要求: >=18.0.0*
