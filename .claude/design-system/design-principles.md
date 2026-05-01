# 蓝血精英 - 设计原则

## 设计方向

**"深蓝工业极简"** —— 精英感与科技感的平衡

参考：Linear的精致交互 + Vercel的简洁美学 + Bloomberg终端的信息密度

## 核心理念

1. **精英血统**：深蓝主调传达专业与信任，金色点缀暗示价值与品质
2. **科技流动**：微妙的光效和渐变暗示AI与数据的流动
3. **信息优先**：克制的设计让内容成为主角，而非装饰
4. **可信专业**：清晰的层级、一致的间距、精确的对齐

## 情绪关键词

深邃 · 精致 · 克制 · 精英 · 数据 · 流动 · 可信

## 设计语言

### 形状语言
- 大圆角（12-16px）：友好但专业
- 细微边框（0.5-1px）：精致的分隔
- 微妙阴影：层次而非装饰

### 排版哲学
- 紧凑的字距：效率感
- 清晰的层级：一眼抓住重点
- 等宽数字：数据的专业呈现

### 动效原则
- 快速响应（150-200ms）：高效
- 有目的的过渡：引导注意力
- 微妙的微交互：质感反馈

## 品牌色彩

### 主色 - 深海蓝
```
Blue 900: #0A1628  (最深背景)
Blue 800: #0F1D32  (卡片背景)
Blue 700: #152238  (悬停背景)
Blue 600: #1C2A40  (边框/分隔)
Blue 500: #243549  (次级背景)
Blue 400: #3D5A80  (主强调)
Blue 300: #6B8DB5  (次级文字)
Blue 200: #98B4D4  (提示文字)
Blue 100: #C5D6E8  (禁用状态)
Blue 50:  #E8EFF7  (极浅背景)
```

### 点缀 - 精英金
```
Gold 500: #D4A853  (主点缀)
Gold 400: #E0BC6E  (悬停/高亮)
Gold 300: #ECD08A  (次要点缀)
Gold 600: #B8923F  (按下状态)
```

### 功能色
```
Success: #10B981  (成功/通过)
Warning: #F59E0B  (警告/待审)
Error:   #EF4444  (错误/拒绝)
Info:    #3B82F6  (信息/链接)
```

### 文字色
```
Text Primary:   #F0F4F8  (主文字)
Text Secondary: #94A3B8  (次级文字)
Text Tertiary:  #64748B  (提示文字)
Text Disabled:  #475569  (禁用文字)
```

## 字体系统

### 字体栈
```css
/* 标题 - 现代几何 */
--font-display: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* 正文 - 高可读性 */
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* 数据/代码 - 等宽 */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### 字号层级
```
Display:   48px/56px,  font-weight: 700  (页面大标题)
Title 1:   32px/40px,  font-weight: 600  (区块标题)
Title 2:   24px/32px,  font-weight: 600  (卡片标题)
Title 3:   20px/28px,  font-weight: 600  (小标题)
Headline:  17px/24px,  font-weight: 600  (列表标题)
Body:      15px/24px,  font-weight: 400  (正文)
Callout:   14px/20px,  font-weight: 400  (说明文字)
Caption:   12px/16px,  font-weight: 400  (辅助文字)
```

## 间距系统

### 基础单位: 4px

```
4px   - xs  (图标内边距)
8px   - sm  (紧凑间距)
12px  - md  (元素间距)
16px  - lg  (卡片内边距)
20px  - xl  (区块间距)
24px  - 2xl (大区块)
32px  - 3xl (区域分隔)
48px  - 4xl (页面间距)
```

### 圆角
```
Small:   6px  (按钮、标签)
Medium:  12px (输入框、小卡片)
Large:   16px (卡片、模态框)
Full:    9999px ( pills、头像)
```

## 阴影系统

```
Shadow SM:   0 1px 2px rgba(0,0,0,0.3)
Shadow MD:   0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -2px rgba(0,0,0,0.2)
Shadow LG:   0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -4px rgba(0,0,0,0.2)
Shadow Glow: 0 0 20px rgba(212,168,83,0.15)  (金色光晕)
```

## 布局网格

### 客户端 (移动优先)
```
容器: 100% - 32px (左右边距)
断点:
  - Mobile:  < 640px
  - Tablet:  640px - 1024px
  - Desktop: > 1024px
```

### 管理端 (桌面优先)
```
侧边栏: 260px (固定)
主内容: calc(100% - 260px)
内容区最大宽度: 1440px
断点:
  - Desktop: > 1280px
  - Tablet:  1024px - 1280px
  - Mobile:  < 1024px (侧边栏收起)
```

## 动效规范

### 过渡时间
```
Fast:    100ms  (按钮悬停、小交互)
Normal:  200ms  (状态变化、展开/收起)
Slow:    300ms  (页面切换、模态框)
```

### 缓动函数
```
Ease:       cubic-bezier(0.4, 0, 0.2, 1)   (默认)
Ease Out:   cubic-bezier(0, 0, 0.2, 1)     (进入)
Ease In:    cubic-bezier(0.4, 0, 1, 1)     (离开)
Spring:     cubic-bezier(0.34, 1.56, 0.64, 1) (弹性)
```

### 常用动画
```css
/* 淡入 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 上滑进入 */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 脉冲光晕 */
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(212,168,83,0.4); }
  50% { box-shadow: 0 0 0 4px rgba(212,168,83,0); }
}

/* 加载渐变流动 */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```
