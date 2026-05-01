# 蓝血精英 - 交互规范

## 全局交互原则

### 响应时间标准
| 操作类型 | 目标时间 | 最大时间 | 处理方式 |
|---------|---------|---------|---------|
| 即时反馈 | < 100ms | 200ms | 本地状态更新 |
| 快速操作 | < 300ms | 500ms | 轻量加载状态 |
| 网络请求 | < 1s | 3s | Loading 指示器 |
| 复杂操作 | < 2s | 5s | 进度条/骨架屏 |

### 反馈层级
1. **视觉反馈**: 状态变化、颜色变化、图标动画
2. **触觉反馈**: 按钮点击、操作成功 (移动端)
3. **声音反馈**: 重要通知、消息提醒 (可选)
4. **Toast 通知**: 操作结果、系统消息

---

## 页面转场

### 路由切换
```css
/* 页面进入 */
@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 页面离开 */
@keyframes pageLeave {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-20px);
  }
}
```
- **持续时间**: 300ms
- **缓动函数**: cubic-bezier(0.4, 0, 0.2, 1)
- **移动端**: 支持滑动手势返回

### 模态框/抽屉
```css
/* 遮罩层 */
@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 对话框 - 居中 */
@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 抽屉 - 右侧 */
@keyframes drawerSlideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
```
- **遮罩**: fadeIn 200ms
- **对话框**: slideUp + scale 300ms
- **抽屉**: slideIn 300ms

---

## 按钮交互

### 状态变化
| 状态 | 视觉表现 | 过渡时间 |
|-----|---------|---------|
| 默认 | 基础样式 | - |
| 悬停 | 背景变亮/暗 | 150ms |
| 按下 | scale(0.98) | 100ms |
| 加载 | Spinner + 文字 | 即时 |
| 禁用 | 50% 透明度 | 即时 |
| 成功 | ✓ 图标 + 颜色变化 | 200ms |

### 主按钮点击效果
```css
.btn-primary {
  transition: all 150ms ease;
}

.btn-primary:hover {
  background: var(--gold-400);
  transform: translateY(-1px);
}

.btn-primary:active {
  background: var(--gold-600);
  transform: translateY(0) scale(0.98);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

### 按钮加载状态
- 文字变为 "加载中..."
- 左侧显示旋转 Spinner
- 禁用点击
- 宽度保持不变 (避免布局抖动)

---

## 卡片交互

### 悬停效果
```css
.card {
  transition: all 200ms ease;
}

.card:hover {
  border-color: var(--blue-500);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card:active {
  transform: translateY(-1px);
}
```

### 选中状态
- 边框变为 Gold 500
- 添加金色阴影: 0 0 20px rgba(212,168,83,0.15)
- 复选框显示在左上角

### 长按效果 (移动端)
- 200ms 后触发触觉反馈
- 显示操作菜单
- 背景轻微放大

---

## 列表交互

### 下拉刷新 (移动端)
```css
@keyframes pullToRefresh {
  0% { transform: translateY(0); }
  50% { transform: translateY(60px); }
  100% { transform: translateY(0); }
}
```
- 下拉距离: 60px
- 触发阈值: 50px
- 刷新图标旋转动画

### 无限滚动
- 距离底部 200px 时触发加载
- 显示骨架屏或加载指示器
- 加载失败时可重试

### 滑动操作 (移动端)
- 左滑显示操作按钮
- 最大滑动距离: 120px
- 弹性回弹效果

---

## 表单交互

### 输入框
```css
.input {
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.input:focus {
  border-color: var(--blue-400);
  box-shadow: 0 0 0 3px rgba(61, 90, 128, 0.2);
}

.input.error {
  border-color: var(--error);
  animation: shake 300ms ease;
}
```

### 错误抖动动画
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
```

### 字符计数
- 显示在输入框右下角
- 接近限制时变橙色
- 超出限制时变红色 + 抖动

### 自动保存
- 停止输入 2 秒后自动保存
- 显示 "已保存" 提示
- 支持草稿恢复

---

## Toast 通知系统

### 位置
- **客户端**: 顶部居中, 距顶 20px
- **管理端**: 右上角, 距顶 20px, 距右 20px

### 动画
```css
/* 进入 */
@keyframes toastEnter {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 离开 */
@keyframes toastLeave {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}
```

### 类型与样式
| 类型 | 左边框 | 图标 | 自动消失 |
|-----|-------|------|---------|
| 成功 | Success | ✓ | 3s |
| 错误 | Error | ✕ | 手动关闭 |
| 警告 | Warning | ⚠ | 5s |
| 信息 | Info | ℹ | 3s |

### 堆叠行为
- 最多显示 3 个
- 新 Toast 从顶部推入
- 旧 Toast 向下移动

---

## 加载状态

### 骨架屏
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--blue-700) 25%,
    var(--blue-600) 50%,
    var(--blue-700) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### 使用场景
| 场景 | 加载方式 | 持续时间 |
|-----|---------|---------|
| 页面首屏 | 骨架屏 | 数据加载完成 |
| 列表数据 | 骨架屏卡片 | 数据加载完成 |
| 图片加载 | 模糊占位 + 淡入 | 图片加载完成 |
| 按钮操作 | Spinner | 操作完成 |
| 表单提交 | 按钮 Loading | 提交完成 |

### 加载进度条
- 顶部固定, 2px 高度
- 颜色: Gold 500
- 模拟进度 + 真实进度

---

## 搜索交互

### 搜索框
```css
.search-box:focus-within {
  background: var(--blue-600);
  box-shadow: 0 0 0 3px rgba(61, 90, 128, 0.2);
}
```

### 搜索建议
- 输入 2 个字符后显示
- 延迟 200ms (防抖)
- 方向键导航, Enter 选中
- ESC 关闭

### 搜索结果
- 高亮匹配关键词 (Gold 500 背景)
- 分类显示: 用户/任务/课程
- 空状态提示

---

## 图片交互

### 懒加载
- 使用 Intersection Observer
- 占位图: 模糊缩略图或骨架屏
- 加载完成: 淡入 300ms

### 点击预览
- 点击放大查看
- 支持缩放和拖拽
- 双指缩放 (移动端)

### 上传交互
```css
.upload-zone {
  border: 2px dashed var(--blue-400);
  transition: all 200ms ease;
}

.upload-zone.drag-over {
  border-color: var(--gold-500);
  background: rgba(212, 168, 83, 0.05);
}
```

---

## 聊天交互

### 消息气泡
- 发送中: 透明度 50%
- 发送失败: 红色边框 + 重试按钮
- 已读: 对勾图标变蓝色

### 输入框
- 自动增高 (多行)
- 输入 "@" 显示用户选择器
- 粘贴图片直接上传

### 新消息
- 对方消息: 轻微振动 + 声音 (可选)
- 未读标记: 红点 + 数字
- 滚动到底部按钮

---

## 手势操作 (移动端)

### 全局手势
| 手势 | 操作 | 响应 |
|-----|------|------|
| 左滑 | 返回上一页 | 页面转场 |
| 下拉 | 刷新页面 | 刷新动画 |
| 双指捏合 | 图片缩放 | 缩放变换 |
| 长按 | 显示菜单 | 菜单弹出 |

### 列表手势
| 手势 | 操作 |
|-----|------|
| 左滑 | 显示删除/编辑 |
| 右滑 | 标记已读/收藏 |
| 快速滑动 | 直接执行默认操作 |

---

## 键盘快捷键 (管理端)

### 全局
| 快捷键 | 功能 |
|-------|------|
| / 或 Cmd+K | 打开搜索 |
| Esc | 关闭弹窗/抽屉 |
| ? | 显示快捷键帮助 |

### 列表页
| 快捷键 | 功能 |
|-------|------|
| j / ↓ | 下一行 |
| k / ↑ | 上一行 |
| x | 选中/取消选中 |
| Enter | 打开详情 |
| r | 刷新数据 |

### 表单页
| 快捷键 | 功能 |
|-------|------|
| Cmd+Enter | 提交表单 |
| Cmd+S | 保存草稿 |

---

## 微交互细节

### 复选框
```css
.checkbox {
  transition: all 150ms ease;
}

.checkbox:checked {
  background: var(--gold-500);
  border-color: var(--gold-500);
  animation: check-pop 200ms ease;
}

@keyframes check-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```

### 开关
```css
.switch {
  transition: background 200ms ease;
}

.switch-knob {
  transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.switch.on .switch-knob {
  transform: translateX(20px);
}
```

### 标签切换
```css
.tab-indicator {
  transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 徽章脉冲
```css
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(212, 168, 83, 0.4); }
  50% { box-shadow: 0 0 0 4px rgba(212, 168, 83, 0); }
}

.badge-new {
  animation: pulse 2s infinite;
}
```

---

## 无障碍交互

### 焦点管理
- 所有交互元素有可见焦点环
- 焦点环颜色: Gold 500
- Tab 顺序符合视觉顺序

### 屏幕阅读器
- 重要操作有 aria-live 提示
- 状态变化播报
- 跳过导航链接

### 减少动画
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 错误处理交互

### 网络错误
- 显示 "网络连接失败" 提示
- 提供 "重试" 按钮
- 自动重试 3 次

### 操作失败
- Toast 显示错误原因
- 保留用户输入
- 提供解决建议

### 空状态
- 友好插图
- 明确说明
- 引导操作按钮

---

*交互设计遵循"快速响应、明确反馈、流畅过渡"的原则，让每一次操作都有愉悦的回应。*

