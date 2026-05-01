# 蓝血精英 - 图标系统设计

## 图标风格

### 设计原则
- **风格**: 线性图标 (Outline)
- **线条粗细**: 1.5px (默认), 2px (强调)
- **端点**: 圆角
- **拐角**: 圆角 (2px)
- **视觉大小**: 20x20px (在24px画布中居中)

### 风格特点
```
┌─────────────────────┐
│  ┌─────────────┐    │
│  │             │    │  ← 1.5px 线条
│  │    ┌───┐    │    │  ← 圆角拐角
│  │    │   │    │    │
│  │    └───┘    │    │  ← 20px 视觉区
│  │             │    │
│  └─────────────┘    │
│   24px 画布          │
└─────────────────────┘
```

---

## 图标尺寸

| 名称 | 尺寸 | 线条粗细 | 使用场景 |
|-----|------|---------|---------|
| XS | 12px | 1.5px | 紧凑按钮、标签内 |
| SM | 16px | 1.5px | 按钮、表单 |
| MD | 20px | 1.5px | 导航、列表项 |
| LG | 24px | 2px | 大按钮、空状态 |
| XL | 32px | 2px | 功能入口、强调 |
| XXL | 48px | 2.5px | 空状态、引导页 |

---

## 图标库

### 导航图标

| 图标 | 名称 | 用途 |
|-----|------|------|
| 🧭 | compass | 发现页 |
| 💼 | briefcase | 任务/工作 |
| 🎓 | graduation-cap | 课程/成长 |
| 💬 | message-circle | 消息 |
| 👤 | user | 个人中心 |
| ➕ | plus-circle | 发布/新建 |
| 🔔 | bell | 通知 |
| ⚙️ | settings | 设置 |

### 操作图标

| 图标 | 名称 | 用途 |
|-----|------|------|
| 🔍 | search | 搜索 |
| ✕ | x | 关闭/删除 |
| ← | arrow-left | 返回 |
| → | arrow-right | 前进 |
| ↑ | arrow-up | 向上/展开 |
| ↓ | arrow-down | 向下/收起 |
| ✓ | check | 确认/选中 |
| ⋯ | more-horizontal | 更多 |
| ⋮ | more-vertical | 更多(垂直) |
| ✏️ | edit | 编辑 |
| 🗑️ | trash | 删除 |
| 📋 | copy | 复制 |
| 📤 | share | 分享 |
| ⭐ | star | 收藏/评分 |
| ♥ | heart | 喜欢 |
| 👁️ | eye | 查看 |
| 🔄 | refresh | 刷新 |
| ⬇️ | download | 下载 |
| ⬆️ | upload | 上传 |

### 功能图标

| 图标 | 名称 | 用途 |
|-----|------|------|
| 🏠 | home | 首页 |
| 📊 | bar-chart | 统计/数据 |
| 📁 | folder | 文件夹 |
| 📄 | file | 文件 |
| 🖼️ | image | 图片 |
| 🎬 | video | 视频 |
| 🔗 | link | 链接 |
| 🔒 | lock | 锁定/安全 |
| 🔓 | unlock | 解锁 |
| 👥 | users | 团队/多人 |
| 🏷️ | tag | 标签 |
| 📍 | map-pin | 位置 |
| 🕐 | clock | 时间/历史 |
| 📅 | calendar | 日历 |
| 📧 | mail | 邮件 |
| 📞 | phone | 电话 |
| 💰 | dollar-sign | 金钱/支付 |
| 🎁 | gift | 礼物/奖励 |
| 🏆 | award | 成就 |
| 🔥 | flame | 热门 |
| 📢 | megaphone | 公告 |

### AI/技术图标

| 图标 | 名称 | 用途 |
|-----|------|------|
| 🤖 | bot | AI/机器人 |
| 🧠 | brain | 智能 |
| ⚡ | zap | 快速/高效 |
| 🔮 | sparkle | AI魔法 |
| 🔧 | tool | 工具 |
| 💻 | code | 代码 |
| 🌐 | globe | 网络/在线 |
| 📡 | wifi | 连接 |
| 🔋 | battery | 电量 |
| 💾 | database | 数据库 |
| ☁️ | cloud | 云 |
| 🔌 | plug | 插件 |

### 状态图标

| 图标 | 名称 | 用途 |
|-----|------|------|
| ✓ | check-circle | 成功 |
| ✕ | x-circle | 错误 |
| ⚠️ | alert-triangle | 警告 |
| ℹ️ | info | 信息 |
| ⏳ | loader | 加载中 |
| ⏸️ | pause | 暂停 |
| ▶️ | play | 播放 |
| ⏹️ | stop | 停止 |
| 🚫 | ban | 禁止 |
| ❓ | help-circle | 帮助 |

### 社交图标

| 图标 | 名称 | 用途 |
|-----|------|------|
| 👍 | thumbs-up | 赞 |
| 👎 | thumbs-down | 踩 |
| 💬 | message-square | 评论 |
| 🔄 | repeat | 转发 |
| 📤 | send | 发送 |
| ✉️ | mail | 私信 |
| 📱 | smartphone | 手机 |
| 💻 | monitor | 电脑 |

---

## 图标颜色

### 默认颜色
```css
.icon {
  color: var(--color-text-secondary); /* #94A3B8 */
}
```

### 状态颜色
```css
.icon-primary   { color: var(--color-text-primary); }   /* #F0F4F8 */
.icon-secondary { color: var(--color-text-secondary); } /* #94A3B8 */
.icon-tertiary  { color: var(--color-text-tertiary); }  /* #64748B */

.icon-success { color: var(--color-success); } /* #10B981 */
.icon-warning { color: var(--color-warning); } /* #F59E0B */
.icon-error   { color: var(--color-error); }   /* #EF4444 */
.icon-info    { color: var(--color-info); }    /* #3B82F6 */

.icon-gold { color: var(--color-gold-500); } /* #D4A853 */
.icon-blue { color: var(--color-blue-400); } /* #3D5A80 */
```

### 背景图标
```css
.icon-bg-success {
  background: var(--color-success-light);
  color: var(--color-success);
  padding: 8px;
  border-radius: 8px;
}

.icon-bg-warning {
  background: var(--color-warning-light);
  color: var(--color-warning);
  padding: 8px;
  border-radius: 8px;
}

.icon-bg-error {
  background: var(--color-error-light);
  color: var(--color-error);
  padding: 8px;
  border-radius: 8px;
}

.icon-bg-gold {
  background: var(--color-gold-50);
  color: var(--color-gold-500);
  padding: 8px;
  border-radius: 8px;
}
```

---

## 图标使用规范

### 图标按钮
```
┌─────────────────────────┐
│                         │
│    [图标]               │  ← 仅图标按钮
│                         │
└─────────────────────────┘
尺寸: 40x40px (MD)
圆角: 10px
背景: transparent → Blue 700 (hover)
```

```
┌─────────────────────────┐
│                         │
│    [图标]  文字         │  ← 图标+文字按钮
│                         │
└─────────────────────────┘
图标: 20px
间距: 8px
内边距: 12px 20px
```

### 图标在输入框中
```
┌─────────────────────────────┐
│ [图标]  输入内容...     [图标]│
└─────────────────────────────┘
左图标: 搜索、邮件、锁
右图标: 清除、眼睛(密码)
颜色: Text Tertiary (#64748B)
```

### 图标在导航中
```
底部导航:
┌────────┬────────┬────────┬────────┬────────┐
│  🧭    │  💼    │   ➕   │  💬    │  👤    │
│  发现  │  任务  │  发布  │  消息  │  我的  │
│ 12px   │ 12px   │ 12px   │ 12px   │ 12px   │
└────────┴────────┴────────┴────────┴────────┘

选中状态:
- 图标: Gold 500
- 文字: Gold 500
- 上方小圆点指示
```

---

## 空状态插图

### 空状态图标尺寸
- 图标: 64x64px 或 80x80px
- 线条: 2px
- 颜色: Blue 300 (#6B8DB5)

### 空状态类型
| 场景 | 图标 | 标题 | 描述 |
|-----|------|------|------|
| 无搜索结果 | 🔍 | 未找到结果 | 试试其他关键词 |
| 无任务 | 📋 | 暂无任务 | 去发布一个任务吧 |
| 无消息 | 💬 | 暂无消息 | 开始与人交流吧 |
| 无通知 | 🔔 | 暂无通知 | 有新消息会通知你 |
| 无网络 | 📡 | 网络断开 | 请检查网络连接 |
| 加载失败 | ⚠️ | 加载失败 | 点击重试 |
| 空列表 | 📄 | 暂无内容 | 敬请期待 |

---

## 图标实现方案

### 方案一: Lucide Icons (推荐)
```bash
npm install lucide-react
```

```tsx
import { Search, Bell, User } from 'lucide-react';

function App() {
  return (
    <>
      <Search size={20} strokeWidth={1.5} />
      <Bell size={20} strokeWidth={1.5} className="text-gold-500" />
      <User size={20} strokeWidth={1.5} />
    </>
  );
}
```

### 方案二: SVG Sprite
```tsx
// icons/sprite.svg
<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
  <symbol id="search" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </symbol>
</svg>

// 使用
<svg className="icon">
  <use href="/icons/sprite.svg#search" />
</svg>
```

### 方案三: 内联SVG
```tsx
const SearchIcon = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);
```

---

## 图标命名规范

```
kebab-case
├── 基础图标: {name}
│   ├── search
│   ├── bell
│   └── user
│
├── 变体图标: {name}-{variant}
│   ├── user-circle (圆形背景)
│   ├── user-square (方形背景)
│   ├── user-check (选中状态)
│   └── user-x (删除状态)
│
├── 填充图标: {name}-fill (如有需要)
│   ├── star-fill
│   └── heart-fill
│
└── 方向变体: {direction}-{name}
    ├── arrow-left
    ├── arrow-right
    ├── chevron-up
    └── chevron-down
```

---

## 图标网格规范

```
┌──────────────────────────────────────┐
│                                      │
│         1px 边距 (光学对齐)          │
│      ┌─────────────────────┐         │
│      │                     │         │
│      │    20px 视觉区域    │         │
│      │                     │         │
│      └─────────────────────┘         │
│         1px 边距                     │
│                                      │
│      总尺寸: 24x24px                 │
│                                      │
└──────────────────────────────────────┘
```

### 关键线
- 基础形状: 20x20px
- 圆形: 18px 直径 (留光学边距)
- 方形: 18x18px
- 水平线: 居中
- 垂直线: 居中

---

## 图标贡献指南

### 新增图标流程
1. 检查现有图标库，避免重复
2. 使用 Figma 模板设计
3. 导出 SVG (24x24px 视图框)
4. 优化 SVG 代码 (删除无用属性)
5. 添加至图标库
6. 更新文档

### SVG 优化要求
```svg
<!-- 优化前 -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="10" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- 优化后 -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
  <circle cx="12" cy="12" r="10"/>
</svg>
```

---

*图标是界面语言的重要组成部分，保持一致性和清晰度是关键。*

