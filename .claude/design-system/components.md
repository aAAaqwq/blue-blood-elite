# 蓝血精英 - 组件库

## 基础组件

### 按钮 Button

#### 主按钮 (Primary)
```
背景: Gold 500 (#D4A853)
文字: Blue 900 (#0A1628), 15px, font-weight: 600
内边距: 12px 24px
圆角: 12px
悬停: Gold 400 (#E0BC6E)
按下: Gold 600 (#B8923F)
禁用: Gold 500/50% 透明度
```

#### 次按钮 (Secondary)
```
背景: transparent
边框: 1px solid Blue 400 (#3D5A80)
文字: Blue 200 (#98B4D4)
悬停: 背景 Blue 700 (#152238)
```

#### 幽灵按钮 (Ghost)
```
背景: transparent
文字: Blue 200 (#98B4D4)
悬停: 背景 Blue 700 (#152238)
```

#### 危险按钮 (Danger)
```
背景: Error (#EF4444)
文字: white
悬停: #DC2626
```

### 输入框 Input

```
背景: Blue 800 (#0F1D32)
边框: 1px solid Blue 600 (#1C2A40)
圆角: 12px
内边距: 12px 16px
文字: Text Primary (#F0F4F8)
占位符: Text Tertiary (#64748B)

聚焦状态:
- 边框: Blue 400 (#3D5A80)
- 阴影: 0 0 0 3px rgba(61,90,128,0.2)

错误状态:
- 边框: Error (#EF4444)
- 文字: Error
```

### 卡片 Card

#### 标准卡片
```
背景: Blue 800 (#0F1D32)
边框: 0.5px solid Blue 600 (#1C2A40)
圆角: 16px
内边距: 20px
阴影: Shadow MD

悬停状态:
- 边框: Blue 500 (#243549)
- 阴影: Shadow LG
- transform: translateY(-2px)
```

#### 可点击卡片
```
同标准卡片 + cursor: pointer
悬停: 边框变亮 + 微微上浮
```

#### 选中卡片
```
边框: Gold 500 (#D4A853)
阴影: Shadow Glow
```

### 标签 Tag

```
背景: Blue 700 (#152238)
文字: Blue 200 (#98B4D4), 12px, font-weight: 500
内边距: 4px 10px
圆角: 6px

可关闭标签: 右侧带 × 图标
```

### 徽章 Badge

```
背景（根据状态）:
- 默认: Blue 600
- 成功: Success/20% 透明度, 边框 Success
- 警告: Warning/20% 透明度, 边框 Warning
- 错误: Error/20% 透明度, 边框 Error

文字: 对应颜色, 11px, font-weight: 600
内边距: 2px 8px
圆角: 9999px (pill)
```

### 头像 Avatar

```
尺寸:
- XS: 24px
- SM: 32px
- MD: 40px (默认)
- LG: 56px
- XL: 80px

圆角: 9999px
边框: 2px solid Blue 600
在线状态: 右下角 8px 绿点
```

## 导航组件

### 顶部导航 (客户端)

```
高度: 56px
背景: Blue 900 (#0A1628) + backdrop-blur
底部边框: 0.5px solid Blue 600

Logo区: 左侧
标签栏: 中间，图标+文字
个人区: 右侧，通知图标+头像
```

### 底部导航 (客户端-移动端)

```
高度: 64px
背景: Blue 800 (#0F1D32)
上边框: 0.5px solid Blue 600

5个标签:
- 发现 (compass)
- 任务 (briefcase)
- 发布 (plus-circle, 突出)
- 消息 (message-circle)
- 我的 (user)

选中状态:
- 图标: Gold 500
- 文字: Gold 500
- 上方小圆点指示器
```

### 侧边栏 (管理端)

```
宽度: 260px
背景: Blue 800 (#0F1D32)
右边框: 0.5px solid Blue 600

Logo区: 高度 64px, 底部边框
导航区: 16px 间距
- 一级菜单: 14px, 左对齐
- 二级菜单: 缩进 24px

选中项:
- 背景: Blue 700
- 左边框: 3px solid Gold 500
- 文字: Gold 400
```

## 内容组件

### 列表项 List Item

```
高度: 72px
内边距: 16px 20px
背景: transparent
边框底部: 0.5px solid Blue 600

悬停: 背景 Blue 700/50%

布局:
[头像] [主内容区] [右侧操作]
      [标题]
      [描述]
```

### 任务卡片 (Task Card)

```
背景: Blue 800
圆角: 16px
内边距: 20px

头部:
- 分类标签 (左上角)
- 金额 (右上角, Gold 500, 20px, bold)

内容:
- 标题: Title 3, 1行截断
- 描述: Body, 2行截断
- 技术标签: 最多3个

底部:
- 发布者信息 (头像+名字)
- 截止时间
- 申请人数
```

### 课程卡片 (Course Card)

```
背景: Blue 800
圆角: 16px

封面图:
- 宽高比: 16:10
- 圆角: 16px 16px 0 0
- 渐变遮罩: 底部 30%

内容区:
- 标题: Title 3
- 讲师: 头像+名字
- 价格: Gold 500, 18px, bold
- 原价: Text Tertiary, 删除线
- 评分: 星星图标 + 数字
```

### 用户卡片 (User Card)

```
背景: Blue 800
圆角: 16px
内边距: 20px
居中布局

头像: 64px, 居中
匹配度: 顶部 (绿色/金色数字)
姓名: Title 3, 居中
领域: Body, 居中
技能标签: 居中, 最多3个
操作按钮: 底部
```

## 反馈组件

### 模态框 Modal

```
遮罩: Blue 900/80% + backdrop-blur
对话框:
  - 背景: Blue 800
  - 圆角: 20px
  - 最大宽度: 480px (移动端 90vw)
  - 内边距: 24px
  - 阴影: Shadow LG

动画:
  - 遮罩: fadeIn 200ms
  - 对话框: slideUp 300ms, spring easing
```

### Toast 通知

```
位置: 顶部居中, 距顶 20px
背景: Blue 800
边框: 根据类型
圆角: 12px
内边距: 16px 20px
阴影: Shadow LG

类型:
- 成功: 左边框 Success
- 错误: 左边框 Error
- 警告: 左边框 Warning
- 信息: 左边框 Info

动画:
  - 进入: slideDown + fadeIn 300ms
  - 离开: slideUp + fadeOut 200ms
  - 自动消失: 3000ms
```

### 加载状态

#### 骨架屏 Skeleton
```
背景: linear-gradient(90deg, Blue 700 25%, Blue 600 50%, Blue 700 75%)
背景大小: 200% 100%
动画: shimmer 1.5s infinite
圆角: 6px
```

#### 加载 Spinner
```
尺寸: 24px (默认), 32px (大)
颜色: Gold 500
动画: rotate 1s linear infinite
```

#### 按钮加载
```
文字变为 "加载中..."
左侧添加 Spinner
禁用点击
```

## 数据展示

### 数据卡片 (Stats Card)

```
背景: Blue 800
圆角: 16px
内边距: 20px

布局:
[标题]              [趋势图标]
[大数字]            [百分比变化]
[副标题]

数字: Display 字号, font-mono
趋势: 上升绿色, 下降红色
```

### 图表样式

```
折线图:
- 线条: Gold 500, 2px
- 填充: Gold 500/10% 渐变
- 点: Gold 400, 悬停放大
- 网格线: Blue 600/30%
- 坐标轴文字: Caption, Text Tertiary

柱状图:
- 柱子: Blue 400
- 悬停: Gold 500
- 圆角: 顶部 4px
```

### 表格 Table

```
表头:
- 背景: Blue 700
- 文字: Text Secondary, 12px, font-weight: 600, uppercase
- 内边距: 12px 16px

行:
- 背景: transparent
- 悬停: Blue 700/30%
- 边框底部: 0.5px solid Blue 600

单元格:
- 内边距: 16px
- 文字: Body

选中行:
- 背景: Blue 700/50%
```

## 表单组件

### 选择器 Select

```
触发器: 同 Input 样式
下拉框:
  - 背景: Blue 800
  - 边框: Blue 600
  - 圆角: 12px
  - 阴影: Shadow LG

选项:
  - 内边距: 12px 16px
  - 悬停: Blue 700
  - 选中: Gold 500 文字 + Gold 500/10% 背景
```

### 开关 Switch

```
尺寸: 44px × 24px
圆角: 9999px

关闭状态:
- 背景: Blue 600
- 圆点: 20px, 白色, 左侧

开启状态:
- 背景: Gold 500
- 圆点: 右侧

动画: 200ms ease
```

### 单选/复选

```
尺寸: 20px × 20px
边框: 2px solid Blue 400
圆角: 4px (复选), 9999px (单选)

选中状态:
- 背景: Gold 500
- 边框: Gold 500
- 图标: 白色

动画: 150ms ease
```

### 日期选择器

```
输入框: 同 Input
日历面板:
  - 背景: Blue 800
  - 圆角: 16px
  - 阴影: Shadow LG

日期单元格:
  - 悬停: Blue 700
  - 选中: Gold 500 背景
  - 今天: Gold 500 边框
```

## 特殊组件

### 搜索栏

```
背景: Blue 700
圆角: 9999px (pill)
内边距: 12px 20px

图标: 左侧, Text Tertiary
输入框: 透明背景, Text Primary
清除按钮: 右侧, 悬停显示

聚焦:
- 背景: Blue 600
- 阴影: 0 0 0 3px rgba(61,90,128,0.2)
```

### 步骤条 Stepper

```
已完成:
- 圆点: Gold 500 背景, 白色 ✓ 图标
- 线条: Gold 500

进行中:
- 圆点: Gold 500/20% 背景, Gold 500 边框
- 数字/图标: Gold 500

待完成:
- 圆点: Blue 600 背景
- 数字: Text Tertiary
- 线条: Blue 600
```

### 富文本编辑器

```
工具栏:
- 背景: Blue 700
- 圆角: 12px 12px 0 0
- 按钮: Ghost 样式

编辑区:
- 背景: Blue 800
- 圆角: 0 0 12px 12px
- 最小高度: 200px
- 占位符: Text Tertiary
```

### 文件上传

```
拖拽区:
- 边框: 2px dashed Blue 400
- 背景: Blue 800
- 圆角: 16px
- 内边距: 40px

拖拽中:
- 边框: Gold 500
- 背景: Gold 500/5%

文件列表:
- 每项: 缩略图 + 文件名 + 大小 + 删除按钮
- 进度条: Gold 500 填充
```
