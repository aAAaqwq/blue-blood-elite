# 蓝血菁英（Blue Blood Elite）产品需求说明书 v3.0 Final

> **产品定位：** AI超级个体的精英社交 + 技能变现 + 链上信任一站式平台
> **文档版本：** v3.0 Final（综合 v1 原始版 + v2.0 MVP版 + 技术可行性 + 风险评估）
> **定稿日期：** 2026-04-02
> **编写人：** OPENCAIO 产品团队
> **状态：** ✅ 可交付开发

---

## 目录

1. [产品概述](#1-产品概述)
2. [用户画像](#2-用户画像)
3. [核心功能模块](#3-核心功能模块)
4. [非功能需求](#4-非功能需求)
5. [信息架构与页面结构](#5-信息架构与页面结构)
6. [MVP定义](#6-mvp定义phase-1)
7. [数据模型](#7-数据模型)
8. [技术架构](#8-技术架构)
9. [开放问题与风险](#9-开放问题与风险)
10. [附录](#10-附录)

---

## 1. 产品概述

### 1.1 一句话定位

**蓝血菁英 = AI超级个体的任务悬赏平台 + 精英社交网络 + 链上信誉系统**

对标融合：LinkedIn（职业社交）× Toptal（精英人才匹配）× Coursera（成长学习），但垂直于AI超级个体领域，并通过链上智能合约建立不可篡改的信任体系。

### 1.2 市场背景

- **AI人才缺口巨大：** 2025年全球AI人才缺口超过400万（Gartner），中国AI岗位需求同比增长67%（脉脉数据）
- **AI超级个体崛起：** 个人借助AI工具独立完成企业级项目，自由职业+远程办公趋势加速
- **市场空白：** 现有平台各管一段——招聘平台无社区、自由职业平台无技能认证、技术社区无变现闭环、职业社交平台AI精英密度低

**目标市场规模：**

| 层级 | 市场 | 规模估算 |
|------|------|---------|
| TAM | AI人才服务总市场（招聘+培训+外包） | ¥5,000亿/年 |
| SAM | AI精英人才社区+技能变现 | ¥500亿/年 |
| SOM | 首年目标（1万活跃用户 × ¥3,000 ARPU） | ¥3,000万/年 |

### 1.3 目标用户分层

| 层级 | 定价 | 核心权益 | 目标人群 |
|------|------|---------|---------|
| **Free** | ¥0 | 浏览精英/任务、基础搜索、个人资料 | 所有注册用户 |
| **Pro** | ¥29/月 或 ¥199/年 | 发布任务、发起连接、高级筛选、课程折扣 | AI工程师、自由咨询师 |
| **Enterprise** | ¥999/月 起 | 批量发布任务、优先匹配、企业认证、数据分析 | 企业AI负责人、CAIO |

### 1.4 核心价值主张 vs 竞品

| 竞品 | 定位 | 我们的优势 |
|------|------|----------|
| **知识星球** | 知识付费社群 | 我们有任务变现闭环，不只是内容消费 |
| **即刻** | 兴趣社区 | 我们有技能认证+链上信誉，不只是社交 |
| **小红书** | 生活方式分享 | 我们垂直AI精英，有Escrow资金托管 |
| **Boss直聘** | 招聘匹配 | 我们有社区+成长+自由职业变现，不只是雇佣 |
| **Toptal** | 精英自由职业 | 我们本土化+更低门槛+链上信誉体系 |
| **Upwork/猪八戒** | 自由职业市场 | 我们不是竞价压价模式，是悬赏制+AI精准匹配 |

**五大差异化壁垒：**
1. **Escrow链上托管** — 资金安全透明，解决自由职业最大信任痛点
2. **链上信誉SBT** — 不可篡改的实战履历，形成"区块链简历"
3. **AI精英垂直** — 只做AI超级个体，精准匹配高密度
4. **无感上链** — Privy MPC钱包，用户无需懂区块链
5. **CAIO生态** — 与OPENCAIO品牌绑定，岗位内推+黑客松+认证

### 1.5 商业模式

| 收入来源 | 模式 | 预估占比 | 说明 |
|---------|------|---------|------|
| **交易抽佣** | 每笔任务10%服务费 | 50% | 核心收入，随GMV增长 |
| **会员订阅** | Pro ¥29/月, Enterprise ¥999/月 | 20% | 稳定现金流 |
| **课程分成** | 单课¥99-999，平台分30% | 15% | Post-MVP |
| **企业服务** | 黑客松赞助+岗位对接 | 10% | Post-MVP |
| **增值服务** | 加急任务、高级筛选、API | 5% | 长期 |

**财务预测：**

| 指标 | M3 | M6 | M12 |
|------|-----|-----|------|
| 注册用户 | 2,000 | 8,000 | 30,000 |
| MAU | 500 | 2,500 | 10,000 |
| 任务池GMV | ¥50万 | ¥300万 | ¥1,500万 |
| 平台收入 | ¥8万 | ¥55万 | ¥320万 |

---

## 2. 用户画像

### 2.1 核心5类用户

#### 画像A：AI独立开发者（占比40%）

| 维度 | 描述 |
|------|------|
| **年龄** | 22-35岁 |
| **背景** | CS相关专业，大厂AI方向2年+经验或独立开发者 |
| **典型场景** | 擅长Prompt工程/Agent开发/RAG，想用空闲时间接项目变现 |
| **核心痛点** | ① 技术强但缺乏变现渠道 ② 找不到靠谱的需求方 ③ 自由职业缺乏信任积累 ④ 无法证明自己的实战能力 |
| **核心需求** | 高薪悬赏任务 + 链上信誉积累 + 精英人脉拓展 |
| **使用路径** | 注册→完善资料→浏览任务→认领→交付→积累信誉→获得更多机会 |

#### 画像B：自由AI咨询师（占比20%）

| 维度 | 描述 |
|------|------|
| **年龄** | 28-40岁 |
| **背景** | 前大厂AI团队负责人/技术总监，转型独立咨询 |
| **典型场景** | 为企业提供AI战略规划、本地化部署方案设计 |
| **核心痛点** | ① 个人品牌缺乏背书 ② 客户担心付款安全 ③ 缺少同行交流圈 |
| **核心需求** | VERIFIED认证 + Escrow资金保障 + 精英圈子 |
| **使用路径** | 注册→VERIFIED认证→发布咨询服务→接受任务→建立口碑 |

#### 画像C：AI内容创作者（占比15%）

| 维度 | 描述 |
|------|------|
| **年龄** | 20-30岁 |
| **背景** | AI教程博主、课程讲师、Prompt模板创作者 |
| **典型场景** | 产出AI教程/课程/模板，希望通过平台直接变现 |
| **核心痛点** | ① 内容变现渠道单一 ② 缺乏实战项目背书 ③ 受众分散 |
| **核心需求** | 课程发布 + 技能市场 + 社区影响力 |
| **使用路径** | 注册→发布课程/模板→积累学员→承接定制任务 |

#### 画像D：企业AI负责人/CAIO（占比15%）

| 维度 | 描述 |
|------|------|
| **年龄** | 30-45岁 |
| **背景** | 企业数字化转型负责人、CAIO、技术VP |
| **典型场景** | 需要快速找到靠谱的AI人才落地具体项目 |
| **核心痛点** | ① AI人才鱼龙混杂，难以筛选 ② 外包质量不可控 ③ 资金安全无保障 |
| **核心需求** | 发布悬赏任务 + Escrow托管 + VERIFIED人才筛选 |
| **使用路径** | 注册→发布任务+存入USDC→审核申请者→验收→评价 |

#### 画像E：AI学习者/转行者（占比10%）

| 维度 | 描述 |
|------|------|
| **年龄** | 20-30岁 |
| **背景** | 在校学生或传统行业转AI方向 |
| **典型场景** | 学了AI理论但缺乏实战经验，需要项目练手和行业导师 |
| **核心需求** | 精品课程 + 学习路径 + 实战任务练手 + 导师指引 |

### 2.2 用户等级体系

| 等级 | 名称 | 积分要求 | 核心权益 | 对应层级 |
|------|------|---------|---------|---------|
| Lv.1 | 新锐 | 0 | 基础社交、浏览课程、浏览任务 | Free |
| Lv.2 | 精英 | 500 | 加入兴趣小组、发起连接、认领任务 | Free |
| Lv.3 | 菁英 | 1,500 | 发布简历、认领高薪任务 | Pro |
| Lv.4 | 钻石 | 3,000 | 发布任务、免提现手续费 | Pro |
| Lv.5 | 蓝血 | 8,000 | VIP特权、优先内推、导师资格 | Enterprise |

> **MVP说明：** MVP阶段仅实现Free层级，积分等级和Pro/Enterprise为Post-MVP功能。

---

## 3. 核心功能模块

### 功能全景图

```
蓝血菁英平台
├── 3.1 精英社区
│   ├── 3.1.1 动态流
│   ├── 3.1.2 圈子/兴趣小组
│   ├── 3.1.3 话题/标签
│   ├── 3.1.4 智能匹配推荐
│   ├── 3.1.5 精英列表与搜索
│   └── 3.1.6 连接与私信
├── 3.2 技能市场 ⭐核心
│   ├── 3.2.1 任务发布
│   ├── 3.2.2 任务浏览与筛选
│   ├── 3.2.3 认领与申请
│   ├── 3.2.4 交付与验收
│   └── 3.2.5 评价与结算
├── 3.3 AI成长引擎
│   ├── 3.3.1 学习路径
│   ├── 3.3.2 技能评估
│   ├── 3.3.3 AI导师
│   └── 3.3.4 课程与黑客松
└── 3.4 智能合约模块
    ├── 3.4.1 Escrow资金托管
    ├── 3.4.2 信誉SBT
    ├── 3.4.3 NFT成就徽章
    └── 3.4.4 争议仲裁
```

---

### 3.1 精英社区

#### 3.1.1 动态流

> **优先级：** P2（Post-MVP） | **模块：** 社区

**描述：** 类即刻/微博的动态信息流，用户可发布AI相关的技术分享、项目进展、行业观点。

**功能要点：**
- 支持发布图文动态（≤9张图 + 文字）
- 动态流按时间/热度/关注排序
- 点赞、评论、转发、收藏
- Markdown格式支持（代码块高亮）

**验收标准：**
- [ ] 可发布含图文的动态，实时出现在信息流
- [ ] 支持Markdown渲染（代码块语法高亮）
- [ ] 点赞/评论数实时更新

#### 3.1.2 圈子/兴趣小组

> **优先级：** P2（Post-MVP） | **模块：** 社区

**描述：** 按AI垂直方向划分的兴趣小组，支持系统预设和用户自建。

**功能要点：**
- 系统预设：#Quant量化交易、#AIGC开发、#IOT智能硬件、#Web3区块链、#Agent开发
- 钻石等级以上可发起小组
- 小组内：公告、讨论帖、资源分享、线上活动
- 成员数展示 + 加入/退出

**验收标准：**
- [ ] 可浏览、加入、退出兴趣小组
- [ ] 小组内可发帖、评论
- [ ] 小组列表按活跃度排序

#### 3.1.3 话题/标签

> **优先级：** P2（Post-MVP） | **模块：** 社区

**描述：** 话题标签聚合系统，类似微博话题。

**功能要点：**
- 预设话题：#RAG实战、#本地化部署、#PromptEngineering、#AI商业化
- 用户可创建新话题
- 话题页聚合所有相关动态/任务/课程

#### 3.1.4 智能匹配推荐

> **优先级：** P1（MVP简化版：基础筛选） | **模块：** 社区

**描述：** 基于用户技能向量的AI匹配算法，推荐可能感兴趣的精英和任务。

**MVP版：**
- 基于技术方向标签的基础筛选
- 按注册时间/活跃度排序

**完整版（Post-MVP）：**
- 基于技能向量化（768维）的AI精准匹配
- 匹配度百分比显示（如 98% MATCH）
- 横向滑动推荐卡片

**验收标准（MVP）：**
- [ ] 精英列表支持按技术方向筛选
- [ ] 搜索支持姓名、技能标签、学校、公司

#### 3.1.5 精英列表与搜索

> **优先级：** P0（MVP） | **模块：** 社区

**描述：** 平台精英用户的核心浏览和搜索入口。

**US-201: 精英列表浏览**

> **作为** 企业方/工程师，**我想要** 浏览平台上所有精英用户，**以便** 寻找合作对象。

- 卡片列表：头像 + 姓名 + 技能标签 + VERIFIED标识
- 按技术方向筛选（下拉选择）
- 按姓名/技能文本搜索
- 分页加载，每页20人
- 排序：最新注册 / 活跃度

**验收标准：**
- [ ] 列表按最新注册时间排序
- [ ] 筛选后结果实时更新
- [ ] 搜索支持中英文关键词

**US-202: 精英详情页**

> **作为** 用户，**我想要** 查看某个精英的完整资料，**以便** 评估是否合作。

- 封面图 + 头像 + 基本信息（姓名、学校、公司、方向）
- 技能列表（标签式展示）
- 个人简介（富文本）
- 链上信誉分（如有）
- 已完成任务数和历史
- "发消息"按钮（互相连接后可用）

**验收标准：**
- [ ] 点击列表卡片进入详情页，返回按钮正常
- [ ] 链上信誉分从合约实时读取
- [ ] 已完成任务列表可点击查看

#### 3.1.6 连接与私信

> **优先级：** P1（MVP：连接功能）/ P2（Post-MVP：私信） | **模块：** 社区

**MVP版：**
- 发送/接受/拒绝连接请求
- 互相连接后可查看联系方式

**Post-MVP版：**
- 站内私信IM系统
- 支持文本/图片/文件
- 消息推送通知

---

### 3.2 技能市场 ⭐核心模块

#### 3.2.1 任务发布

> **优先级：** P0（MVP） | **用户故事：** US-301

> **作为** 企业方/CAIO，**我想要** 发布一个悬赏任务并存入奖金，**以便** 吸引精英来接单。

**功能要点：**
- 填写表单：
  - 标题（必填，≤50字）
  - 详细描述（Markdown，必填）
  - 技术栈标签（多选预设 + 自定义，必填）
  - 交付标准（必填）
  - 截止日期（必填，≥发布后3天）
  - 悬赏金额（USDC，必填，≥$50）
  - 分类标签（本地化部署 / AI模型 / Agent开发 / Web3 / 数据分析 / 其他）
- 发布时选择"链上托管"：通过Privy钱包存入USDC到Escrow合约
- 发布成功：任务出现在任务池，状态为"Open"

**验收标准：**
- [ ] 必填字段校验完整，空字段提示明确
- [ ] 悬赏金额 > 0 且 ≤ 钱包余额，否则禁止发布
- [ ] USDC存入成功后，Escrow合约状态变为 Open
- [ ] Base链上可通过BaseScan查看到对应交易
- [ ] 发布成功后任务立即出现在列表中

#### 3.2.2 任务浏览与筛选

> **优先级：** P0（MVP） | **用户故事：** US-302

> **作为** 工程师，**我想要** 浏览所有悬赏任务，**以便** 找到适合我的项目。

**功能要点：**
- 任务卡片：标题 + 技术标签 + 悬赏金额 + 截止日期 + 发布方 + 状态标签
- 筛选Pills：全部 / 本地化部署 / AI模型 / Agent开发 / Web3 / 高悬赏 / 短期实战
- 排序：最新发布 / 最高悬赏 / 截止日期
- 分页加载

**验收标准：**
- [ ] 任务列表按发布时间倒序
- [ ] 筛选标签点击后列表实时过滤
- [ ] 已被认领的任务显示"已接单"标记但仍可见
- [ ] 列表滚动加载无卡顿

#### 3.2.3 任务详情与认领

> **优先级：** P0（MVP） | **用户故事：** US-303 + US-304

**US-303: 任务详情页**

> **作为** 工程师，**我想要** 查看任务的完整信息，**以便** 决定是否接单。

- 完整描述（Markdown渲染，支持代码块、列表、粗体等）
- 需求清单 / 交付标准
- 截止日期 + 悬赏金额（大字突出）
- 发布方信息（头像、名称、信誉分、已发布任务数）
- 链上Escrow状态（已锁定金额、合约地址）
- "申请认领"按钮

**US-304: 认领任务**

> **作为** 工程师，**我想要** 申请认领一个任务，**以便** 开始工作并赚取悬赏。

- 点击"申请认领" → 填写申请说明（为什么适合我 + 计划方案，≤500字）
- 发布方收到通知 → 查看申请者列表（资料 + 信誉分 + 历史评价）
- 发布方选择一个工程师 → 任务状态变为 InProgress
- 认领后Escrow合约记录 executor 地址

**验收标准：**
- [ ] 只有VERIFIED用户可以申请认领（非VERIFIED用户按钮置灰并提示认证）
- [ ] 发布方可查看所有申请者的资料和信誉分
- [ ] 确认认领后，合约状态 Open → InProgress
- [ ] 双方收到站内通知
- [ ] 已被认领的任务"申请认领"按钮变为"已接单"

#### 3.2.4 交付与验收

> **优先级：** P0（MVP） | **用户故事：** US-305

> **作为** 工程师，**我想要** 提交交付物并获得付款；**作为** 发布方，**我想要** 验收交付物并释放资金。

**任务流程：**

```
发布任务 → 精英浏览 → 认领申请 → 发布方审核 → 开发执行 → 提交交付 → 验收确认 → 平台结算
   ↓           ↓          ↓           ↓           ↓          ↓          ↓          ↓
 Open      Open       Applied    InProgress   InProgress  Delivered  Completed  资金释放
```

**功能要点：**
- 工程师点击"提交交付" → 填写交付说明 + 附带链接（GitHub/文档等）
- 发布方收到通知 → 查看交付物 → 操作选择：
  - ✅ **确认验收** → Escrow合约自动释放USDC（90%给工程师，10%平台佣金）→ 状态 Completed
  - 🔄 **要求修改** → 附修改意见 → 状态保持 InProgress，工程师可再次提交
- 完成后自动铸造信誉SBT给双方

**验收标准：**
- [ ] 交付物支持文本 + 链接（MVP不做文件上传）
- [ ] 确认验收后合约自动执行 approve()，资金释放
- [ ] 工程师钱包余额实时更新
- [ ] 交易完成后30秒内铸造信誉SBT
- [ ] "要求修改"不触发资金释放，工程师收到修改意见通知

#### 3.2.5 任务超时与取消

> **优先级：** P0（MVP） | **用户故事：** US-306

> **作为** 发布方，**我想要** 在工程师超时未交付时取回资金。

**规则：**
- 超过截止日期 + 7天宽限期 → 发布方可申请退款
- 退款释放Escrow中的USDC回到发布方钱包
- 工程师信誉分下降

**验收标准：**
- [ ] 宽限期内退款按钮不可用
- [ ] 宽限期后发布方可一键退款
- [ ] 退款后合约状态变为 Cancelled
- [ ] 工程师信誉SBT记录一次"超时未交付"

---

### 3.3 AI成长引擎

> **说明：** 此模块为Post-MVP功能（Phase 2），以下为完整设计，MVP不实现。

#### 3.3.1 学习路径

- 系统预设学习路径：AI本地化部署、RAG实战、Agent开发、多模态AI、CAIO商业
- 基于用户技能评估推荐个性化路径
- 路径进度追踪 + 里程碑徽章

#### 3.3.2 技能评估

- AI驱动的技能测试（选择题 + 编程题）
- 技能雷达图可视化（前端/后端/AI/DevOps/产品）
- 评估结果影响任务匹配推荐权重

#### 3.3.3 AI导师

- 集成大语言模型（DeepSeek API）作为AI导师
- 根据用户当前技能和学习目标提供个性化学习建议
- 代码审查和项目指导

#### 3.3.4 精品课程

- Banner轮播推荐 + Tab切换（精品课程/黑客松/AI岗位）
- 课程详情：封面 + 大纲 + 讲师 + 评价 + 免费/锁定章节
- 预设5门首发课程：本地化部署 / RAG / CAIO商业 / Agent / 多模态
- 课程完成获得积分和徽章

#### 3.3.5 黑客松

- 赛事Banner + 奖金池 + 名额限制
- 赛事日程时间轴
- 组队 + 提交作品 + 评审
- 获奖铸造NFT成就徽章

#### 3.3.6 CAIO岗位对接

- 岗位列表：标题 + 薪资 + 标签（CAIO需求/企业需求/远程岗位）
- 来源标记 + 一键投递
- 入职后平台抽佣

---

### 3.4 智能合约模块

#### 3.4.1 Escrow资金托管

> **优先级：** P0（MVP） | **合约：** EscrowFactory + BountyEscrow

**核心理念：** 用区块链智能合约解决自由职业市场的信任问题——资金托管透明、交付验收自动化。

**合约状态机：**

```
┌──────┐   claim()   ┌───────────┐   deliver()  ┌──────────┐   approve()  ┌───────────┐
│ Open │──────────→ │ InProgress │──────────→ │ Delivered │──────────→ │ Completed │
└──┬───┘            └───────────┘            └──────────┘            └───────────┘
   │                    │                         │
   │  cancel()          │  dispute()              │  dispute()
   ↓                    ↓                         ↓
┌───────────┐     ┌──────────┐              ┌──────────┐
│ Cancelled │     │ Disputed │              │ Disputed │
└───────────┘     └──────────┘              └──────────┘
```

**资金流向：**

```
发布方钱包 ──USDC──→ Escrow合约（锁定）
                              │
                        验收通过
                              │
                 ┌────────────┴────────────┐
                 ↓                         ↓
          工程师钱包(90%)           平台钱包(10%)
```

**验收标准：**
- [ ] 发布任务时USDC自动锁入Escrow合约
- [ ] 验收通过后资金自动释放，无需人工干预
- [ ] 超时后发布方可申请退款，资金原路返回
- [ ] 合约经过Slither静态分析 + 内部审计
- [ ] 单笔任务金额上限 $10,000（MVP安全控制）

#### 3.4.2 信誉SBT（Soul-Bound Token）

> **优先级：** P0（MVP） | **合约：** ReputationSBT (ERC-5192)

**功能要点：**
- 每完成一个任务，自动铸造不可转让的信誉Token
- SBT属性：任务ID、完成时间、满意度评分、发布方签名
- 信誉分算法：`score = (完成任务数 × 0.3 + 满意度均值 × 0.7) × 100`
- 信誉等级：新手(0-30) / 可靠(31-60) / 精英(61-90) / 传说(91-100)

**验收标准：**
- [ ] 任务完成后30秒内SBT铸造成功
- [ ] SBT在BaseScan上可查看，不可转让（transfer always revert）
- [ ] 信誉分在个人主页实时显示
- [ ] 信誉分计算公式公开透明

#### 3.4.3 NFT成就徽章

> **优先级：** P2（Post-MVP） | **合约：** ERC-721

- 黑客松获奖 → 铸造NFT
- 完成首个任务 → 铸造NFT
- 累计收入里程碑（$1K/$10K/$50K）→ 铸造NFT
- 徽章在个人主页展示

#### 3.4.4 争议仲裁

> **优先级：** P2（Post-MVP） | **合约：** 多签合约 (3/5)

- 任何一方可发起争议 → 资金锁定
- 5人仲裁委员会（平台 + 社区代表）
- 3/5多数投票决定资金归属
- 仲裁结果链上记录

#### 3.4.5 用户侧体验（无感上链）

**原则：** 用户无需持有钱包、无需懂区块链。

**实现方案：**
- 注册时平台内置创建Privy MPC钱包（后台静默创建）
- 发布任务选择"链上托管"，支付USDC或引导从CEX转入
- 链上状态可通过BaseScan公开验证
- 信誉分和NFT徽章在个人主页自动展示

---

## 4. 非功能需求

### 4.1 性能要求

| 指标 | 目标 | 说明 |
|------|------|------|
| 首屏加载时间 | < 3秒 | H5移动端 |
| API响应时间 | < 500ms | P95 |
| 任务列表滚动 | 无明显卡顿 | 虚拟滚动 + 分页 |
| 链上交易确认 | 2-5秒 | Base L2出块时间 |
| 并发用户 | 500+ | MVP阶段 |
| 搜索响应 | < 1秒 | 本地筛选（MVP）/ ES（后期） |

### 4.2 安全要求

| 维度 | 要求 |
|------|------|
| **用户认证** | JWT + Refresh Token，7天有效期 |
| **API防护** | 速率限制 60次/分钟/IP |
| **合约安全** | OpenZeppelin标准库 + Slither扫描 + 内部审计 + 上线前专业审计 |
| **资金安全** | Escrow合约单笔上限$10,000；Pausable可暂停机制 |
| **数据加密** | HTTPS全站；敏感字段加密存储 |
| **XSS防护** | 输入过滤 + CSP策略 |
| **SQL注入** | ORM参数化查询（Supabase客户端） |

### 4.3 兼容性

| 平台 | 最低版本 |
|------|---------|
| iOS Safari | 最近2个主版本 |
| Android Chrome | 最近2个主版本 |
| Desktop Chrome/Firefox/Safari/Edge | 最近2个主版本 |
| 屏幕尺寸 | 最小320px，最大自适应 |
| **首发形态** | **H5 Web应用（移动优先）** |

### 4.4 可用性

- 新用户注册→首次接单全流程 ≤ 5步操作
- 非Web3用户无需理解区块链概念即可使用
- 提供详细的新手引导（注册→认证→充值→接单→交付→收款）
- 错误信息用户友好，不暴露技术细节

### 4.5 合规要求（MVP最低标准）

- [ ] 用户协议 + 隐私政策页面上线前完成
- [ ] 数据收集最小化原则
- [ ] 用户可删除账户和相关数据
- [ ] 不对中国大陆用户提供服务（服务器海外部署）
- [ ] 不做法币直接支付（USDC链上交易，降低合规复杂度）

### 4.6 可观测性

- 前端错误监控（Sentry）
- API日志（Vercel自带）
- 链上交易监控（自定义webhook监听合约事件）
- 关键指标看板：注册数、活跃用户、任务发布数、完成率、GMV

---

## 5. 信息架构与页面结构

### 5.1 导航结构（底部Tab栏，4个主Tab）

```
┌─────────────────────────────────────────┐
│                 内容区域                  │
│                                         │
│                                         │
│                                         │
├────────┬────────┬────────┬──────────────┤
│  发现   │  任务池  │  成长   │     我的      │
│  🔍    │  ⭐    │  📚    │     👤      │
└────────┴────────┴────────┴──────────────┘
```

### 5.2 页面清单与优先级

| 页面 | 路径 | MVP | 优先级 | 说明 |
|------|------|-----|--------|------|
| 注册 | /register | ✅ | P0 | 邮箱/手机号 + 自动创建Privy钱包 |
| 登录 | /login | ✅ | P0 | 邮箱/手机号登录 |
| 资料编辑 | /profile/edit | ✅ | P0 | 头像/技能/简介/学校/公司 |
| **发现页（精英列表）** | /discover | ✅ | P0 | 搜索 + 筛选 + 卡片列表 |
| 精英详情 | /profile/[id] | ✅ | P0 | 完整资料 + 信誉分 + 历史 |
| **任务池（列表）** | /tasks | ✅ | P0 | 筛选Pills + 任务卡片列表 |
| 任务详情 | /tasks/[id] | ✅ | P0 | 完整信息 + 链上状态 + 认领 |
| 发布任务 | /tasks/create | ✅ | P0 | 表单 + Escrow存入 |
| 我的任务 | /my/tasks | ✅ | P0 | 我发布的 / 我认领的 Tab切换 |
| 我的钱包 | /wallet | ✅ | P0 | USDC余额 + 交易记录 |
| 个人主页 | /me | ✅ | P0 | 封面 + 信誉 + 等级 + 成果 |
| 认证申请 | /verify | ✅ | P0 | VERIFIED认证申请 |
| 通知中心 | /notifications | ✅ | P1 | 站内通知列表 |
| 动态流 | /feed | ❌ | P2 | Post-MVP |
| 兴趣小组 | /groups | ❌ | P2 | Post-MVP |
| 小组详情 | /groups/[id] | ❌ | P2 | Post-MVP |
| 课程列表 | /courses | ❌ | P2 | Post-MVP |
| 课程详情 | /courses/[id] | ❌ | P2 | Post-MVP |
| 黑客松 | /hackathons | ❌ | P3 | Post-MVP |
| CAIO岗位 | /jobs | ❌ | P3 | Post-MVP |
| 私信 | /messages | ❌ | P2 | Post-MVP |

### 5.3 核心用户旅程

**旅程1：工程师接单变现**
```
注册 → 完善资料 → 申请VERIFIED认证
  → 浏览任务池 → 查看任务详情 → 申请认领
  → 被选中 → 开发执行 → 提交交付
  → 验收通过 → 收到USDC → 信誉SBT铸造 → 获得更多机会
```

**旅程2：企业发布任务找人**
```
注册 → 充值USDC到Privy钱包
  → 发布任务（填写信息 + Escrow托管）
  → 收到认领申请 → 审核申请者资料/信誉
  → 确认认领 → 等待交付 → 验收确认
  → 资金自动释放 → 评价工程师
```

---

## 6. MVP定义（Phase 1）

### 6.1 MVP核心原则

**一句话：** 完成一条任务交易闭环（发布→接单→Escrow托管→交付→验收→链上结算）+ 精英浏览。

### 6.2 MVP功能范围（In Scope）

| 模块 | MVP包含 |
|------|---------|
| 用户系统 | 注册/登录（邮箱+手机号）、个人资料管理、VERIFIED认证 |
| 精英社区 | 精英列表浏览、精英详情页、基础搜索和筛选、连接请求 |
| 技能市场 | 任务发布/浏览/筛选、任务详情、认领申请、交付提交、验收确认、超时取消 |
| 智能合约 | Escrow托管合约、信誉SBT铸造、USDC(Base链)支付 |
| 钱包 | Privy MPC钱包自动创建、USDC余额查看、交易记录、充值/提现引导 |
| 前端形态 | H5 Web应用（移动优先，430px设计） |

### 6.3 MVP明确不包含（Out of Scope）

| 不包含 | 原因 | 计划版本 |
|--------|------|---------|
| 积分等级体系 | 非核心闭环 | v1.1 |
| 智能匹配AI推荐 | 算法需要数据积累 | v1.1 |
| 兴趣小组/动态流 | 非核心闭环 | v1.1 |
| 课程系统 | 非核心闭环 | v1.2 |
| 黑客松 | 运营资源密集 | v1.3 |
| CAIO岗位对接 | 需要企业BD | v1.3 |
| NFT成就徽章 | 优先级低 | v2.0 |
| 多签仲裁 | 复杂度高，MVP阶段争议少 | v2.0 |
| 里程碑分批释放 | 非核心流程 | v2.0 |
| 法币支付通道 | 合规复杂度高 | v2.0 |
| 微信小程序/App | H5先验证需求 | v3.0 |
| 私信IM | 非核心闭环 | v1.1 |

### 6.4 MVP交付排期（4-6周）

| 周 | 交付内容 | 里程碑 |
|----|---------|--------|
| **W1** | 项目初始化 + 数据库Schema + 用户注册/登录 + Privy钱包集成 | 🏗️ 基础框架 |
| **W2** | 个人资料 + 精英列表/详情/搜索 + VERIFIED认证 | 👤 用户体系 |
| **W3** | 任务发布/浏览/详情 + Escrow合约开发部署 | ⭐ 核心任务流 |
| **W4** | 认领/交付/验收全流程 + 信誉SBT合约 | 🔄 交易闭环 |
| **W5** | 钱包 + 通知 + 个人中心 + Bug修复 | 💰 钱包体验 |
| **W6** | 端到端测试 + 安全审计 + 种子数据 + 上线 | 🚀 正式上线 |

### 6.5 MVP验收标准（整体）

**必须通过的验收场景：**

1. ✅ 新用户用邮箱注册 → 自动创建Privy钱包 → 完善资料 → 全流程≤3分钟
2. ✅ 企业发布任务并存入$100 USDC → 任务出现在列表 → BaseScan可见交易
3. ✅ VERIFIED工程师浏览任务 → 申请认领 → 被选中 → 合约记录executor
4. ✅ 工程师提交交付 → 企业确认验收 → 90% USDC到工程师钱包 → 10%到平台
5. ✅ 信誉SBT自动铸造 → 个人主页显示信誉分
6. ✅ 超时任务 → 发布方可退款 → 资金原路返回
7. ✅ 非Web3用户完成全流程无需理解区块链概念

### 6.6 Post-MVP路线图

| 版本 | 功能 | 预计时间 |
|------|------|---------|
| **v1.1** | 兴趣小组、动态流、智能匹配推荐、私信IM | MVP后4周 |
| **v1.2** | 课程系统、学习路径、技能评估 | MVP后6周 |
| **v1.3** | 黑客松、AI岗位对接、CAIO岗位 | MVP后8周 |
| **v2.0** | 法币支付、NFT徽章、多签仲裁、里程碑释放 | MVP后12周 |
| **v3.0** | 微信小程序、积分等级体系、App | MVP后16周 |

---

## 7. 数据模型

### 7.1 核心表结构

```sql
-- ==================== 用户系统 ====================

-- 用户表
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE,
    phone           VARCHAR(20) UNIQUE,
    password_hash   VARCHAR(255),          -- 仅邮箱注册
    nickname        VARCHAR(50) NOT NULL,
    avatar_url      TEXT,
    bio             TEXT,                   -- 个人简介
    school          VARCHAR(100),
    company         VARCHAR(100),
    direction       VARCHAR(50),            -- 技术方向（下拉选择）
    github_url      VARCHAR(255),
    linkedin_url    VARCHAR(255),
    privy_wallet_address VARCHAR(42),       -- Base链钱包地址
    is_verified     BOOLEAN DEFAULT FALSE,
    verified_at     TIMESTAMPTZ,
    level           SMALLINT DEFAULT 1,     -- 等级 1-5
    points          INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 技能标签
CREATE TABLE user_skills (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_name      VARCHAR(50) NOT NULL,
    proficiency     SMALLINT DEFAULT 50,    -- 0-100
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, skill_name)
);

-- 连接关系
CREATE TABLE connections (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    to_user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
    status          VARCHAR(20) DEFAULT 'pending',  -- pending/accepted/rejected
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(from_user_id, to_user_id)
);

-- VERIFIED认证申请
CREATE TABLE verify_applications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    verify_type     VARCHAR(30),            -- github_500stars / company_proof / platform_tasks
    evidence_url    TEXT,                    -- GitHub链接 或 证明材料URL
    status          VARCHAR(20) DEFAULT 'pending',  -- pending/approved/rejected
    reviewer_id     UUID REFERENCES users(id),
    review_note     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at     TIMESTAMPTZ
);

-- ==================== 任务系统 ====================

-- 任务表
CREATE TABLE bounties (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publisher_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    title               VARCHAR(100) NOT NULL,
    description         TEXT NOT NULL,              -- Markdown格式
    category            VARCHAR(50),                -- 分类标签
    tech_tags           TEXT[],                     -- 技术栈标签数组
    reward_usdc         DECIMAL(12,6) NOT NULL,     -- USDC金额（6位小数）
    deadline            TIMESTAMPTZ NOT NULL,
    delivery_standard   TEXT,                       -- 交付标准
    escrow_contract     VARCHAR(42),                -- Escrow合约地址
    escrow_tx_hash      VARCHAR(66),                -- 存入交易hash
    status              VARCHAR(20) DEFAULT 'open',  -- open/in_progress/delivered/completed/cancelled/disputed
    claimed_by          UUID REFERENCES users(id),
    claimed_at          TIMESTAMPTZ,
    delivered_at        TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    cancelled_at        TIMESTAMPTZ,
    cancel_reason       TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 认领申请
CREATE TABLE applications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bounty_id       UUID REFERENCES bounties(id) ON DELETE CASCADE,
    applicant_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    message         TEXT NOT NULL,            -- 申请说明
    status          VARCHAR(20) DEFAULT 'pending',  -- pending/accepted/rejected
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at     TIMESTAMPTZ
);

-- 交付物
CREATE TABLE deliveries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bounty_id       UUID REFERENCES bounties(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,             -- 交付说明（Markdown）
    links           TEXT[],                    -- 外部链接（GitHub/文档等）
    status          VARCHAR(20) DEFAULT 'submitted',  -- submitted/revision_requested
    review_note     TEXT,                      -- 修改意见
    submitted_at    TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at     TIMESTAMPTZ
);

-- 评价
CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bounty_id       UUID REFERENCES bounties(id) ON DELETE CASCADE,
    reviewer_id     UUID REFERENCES users(id),
    reviewee_id     UUID REFERENCES users(id),
    rating          SMALLINT CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 信誉系统 ====================

-- 链上信誉（缓存）
CREATE TABLE reputation (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    onchain_score       DECIMAL(5,2) DEFAULT 0,     -- 链上信誉分 0-100
    tasks_completed     INT DEFAULT 0,
    avg_satisfaction    DECIMAL(3,2) DEFAULT 0,
    reputation_level    VARCHAR(20) DEFAULT '新手',  -- 新手/可靠/精英/传说
    last_updated        TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 交易记录 ====================

CREATE TABLE transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    type            VARCHAR(30) NOT NULL,     -- deposit/escrow_lock/escrow_release/commission/withdraw
    amount_usdc     DECIMAL(12,6) NOT NULL,
    bounty_id       UUID REFERENCES bounties(id),
    tx_hash         VARCHAR(66),              -- 链上交易hash
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 通知系统 ====================

CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL,     -- application_received/application_accepted/deliver_submitted/payment_received etc.
    title           VARCHAR(100) NOT NULL,
    content         TEXT,
    related_id      UUID,                     -- 关联的bounty/application/delivery id
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.2 ER关系概览

```
users 1──N user_skills
users 1──N connections (from_user / to_user)
users 1──N verify_applications
users 1──N bounties (publisher)
users 1──N applications (applicant)
users 1──N reputation (1:1)
users 1──N transactions
users 1──N notifications

bounties 1──N applications
bounties 1──1 deliveries (latest)
bounties 1──N reviews
bounties 1──N transactions
```

---

## 8. 技术架构

> **详细评估见：** `docs/tech-feasibility.md`（结论：✅ 技术可行，MVP可在4-6周内交付）

### 8.1 架构总览

```
┌─────────────────────────────────────────────────────┐
│                    客户端层                           │
│     H5 Web (Next.js) — 移动优先 430px               │
│     Privy MPC钱包 · viem + wagmi · TailwindCSS       │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS / WebSocket
┌────────────────────▼────────────────────────────────┐
│                  应用服务层                           │
│     Next.js API Routes (BFF)                        │
│     用户认证 · 数据CRUD · 通知推送 · 合约交互        │
└────────────────────┬────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     ↓               ↓               ↓
┌─────────┐   ┌──────────┐   ┌──────────────┐
│ Supabase │   │ Base L2  │   │  Privy Auth  │
│ PostgreSQL│   │ Ethereum │   │  MPC Wallet  │
│ Storage  │   │ Escrow   │   │  Embedded    │
│ RLS      │   │ SBT      │   │  Auth        │
└─────────┘   └──────────┘   └──────────────┘
```

### 8.2 技术栈选型

| 层级 | 选型 | 理由 |
|------|------|------|
| **前端框架** | Next.js 14 (App Router) | SSR + 文件路由 + API Routes，前后端一体 |
| **样式** | TailwindCSS | 快速开发深色主题，与原型风格一致 |
| **状态管理** | Zustand | 轻量够用 |
| **链上交互** | viem + wagmi | TypeScript原生 + React hooks |
| **钱包** | Privy React SDK | MPC嵌入式钱包，用户无感上链 |
| **HTTP请求** | fetch + SWR | 缓存 + 自动重新验证 |
| **UI组件** | Radix UI | 无样式原语组件，配合Tailwind |
| **Markdown** | react-markdown | 任务描述渲染 |
| **后端** | Next.js API Routes | MVP阶段前后端一体，零额外运维 |
| **数据库** | Supabase (PostgreSQL) | 免费额度大、RLS安全、实时订阅 |
| **认证** | Privy (前端) + JWT (API) | Privy处理钱包+登录，后端验JWT |
| **文件存储** | Supabase Storage | 头像、附件 |
| **智能合约** | Solidity on Base (L2) | Gas极低、USDC原生支持、Coinbase背书 |
| **合约标准** | OpenZeppelin | 经过审计的标准库 |
| **部署** | Vercel (前端) + Supabase (数据) | 一键部署、全球CDN |
| **监控** | Sentry (前端错误) + Vercel Analytics | MVP最低可观测性 |

### 8.3 智能合约技术方案

| 组件 | 技术选型 | 说明 |
|------|---------|------|
| 主链 | Base (Ethereum L2) | Gas $0.001-$0.01、出块2秒、USDC原生支持 |
| 合约语言 | Solidity | 标准EVM兼容 |
| Escrow合约 | 自研 EscrowFactory | 每个任务独立合约实例 |
| 信誉Token | ERC-5192 (Soul-Bound) | 不可转让的灵魂绑定Token |
| 支付代币 | USDC on Base | 稳定币结算，避免波动 |
| 安全措施 | OpenZeppelin + Slither + Pausable | 标准安全实践 |

**合约复杂度评估：**

| 合约 | 代码量 | 开发时间 |
|------|--------|---------|
| EscrowFactory + BountyEscrow | ~500行 | 6天（含测试） |
| ReputationSBT (ERC-5192) | ~150行 | 3天（含测试） |
| 平台佣金管理 | ~80行 | 1天 |
| **合计** | ~730行 | **10天（约2周）** |

### 8.4 关键架构决策

| 决策 | 选择 | 理由 |
|------|------|------|
| MVP用Next.js全栈而非Python FastAPI | Next.js API Routes | 前后端一体减少运维；核心逻辑在链上，后端只做CRUD |
| MVP用Supabase而非自建PostgreSQL | Supabase | 免费额度大、RLS安全、零运维 |
| 选择Base链而非Ethereum主网 | Base L2 | Gas极低（$0.001）、Coinbase背书、USDC原生 |
| 选择Privy而非MetaMask | Privy MPC | 用户体验好（无感上链）、邮箱/手机注册即有钱包 |
| H5先行而非小程序 | H5 Web | 无需审核、迭代快、跨平台 |

---

## 9. 开放问题与风险

> **详细评估见：** `docs/risk-assessment.md`

### 9.1 🔴 高风险（MVP前必须解决）

#### R1: 智能合约安全漏洞
- **风险：** Escrow合约管理真实资金，任何漏洞可能导致资金损失
- **概率：** 30% | **影响：** 极高
- **缓解：** ① OpenZeppelin标准库 ② Slither静态分析 + 内部审计 ③ 测试网充分测试 ④ 正式上线前CertiK/Quantstamp专业审计 ⑤ Pausable可暂停 + 单笔限额$10,000

#### R2: 中国大陆加密货币监管
- **风险：** USDC交易可能触及中国监管红线
- **概率：** 25% | **影响：** 极高
- **缓解：** ① MVP面向海外用户/华人AI社区 ② 服务器海外部署（Vercel全球CDN + Supabase海外） ③ 用户协议声明不对中国大陆用户提供服务 ④ v2.0考虑法币通道并行

#### R3: Web3用户接受度低
- **风险：** AI工程师对Web3有抵触，"又要搞钱包？"
- **概率：** 40% | **影响：** 高
- **缓解：** ① Privy无感上链，注册即有钱包 ② 前端UI强调"资金安全托管"而非"区块链" ③ 详细新手引导 ④ 5人可用性测试验证流程

### 9.2 🟡 中风险（需关注）

| 编号 | 风险 | 概率 | 影响 | 缓解策略 |
|------|------|------|------|---------|
| R4 | 冷启动任务不足 | 35% | 高 | OPENCAIO首发50个种子任务（预算¥50万）；种子用户定向邀请；首月0佣金 |
| R5 | 团队执行延期 | 20% | 高 | 严格MVP范围控制；每周进度同步；预留20%缓冲；优先使用成熟方案 |
| R6 | 任务质量失控 | 25% | 中 | VERIFIED认证门槛；任务发布审核；评价系统反馈循环 |
| R7 | 竞品抢占 | 30% | 中 | 聚焦中文AI社区；链上信誉是强壁垒；快速上线MVP |
| R8 | Privy服务不可用 | 5% | 高 | MetaMask直连fallback；钱包接口抽象化便于切换 |
| R9 | 劳务/税务合规 | 20% | 中 | 用户协议明确平台定位为信息撮合；收入由用户自行申报 |

### 9.3 MVP前必完成清单

- [ ] **合约安全审计**（R1）：Slither扫描 + 内部审计完成
- [ ] **合规策略确认**（R2）：法务确认海外运营方案，用户协议+隐私政策就绪
- [ ] **无感上链可用性测试**（R3）：5名非Web3用户完成全流程测试
- [ ] **种子任务准备**（R4）：上线前至少20个OPENCAIO真实任务
- [ ] **MetaMask fallback**（R8）：传统钱包直连作为降级方案

### 9.4 开放问题

| # | 问题 | 负责人 | 截止时间 | 状态 |
|---|------|--------|---------|------|
| 1 | 合约审计选哪家（CertiK vs Quantstamp vs 其他）？ | Tech Lead | MVP上线前2周 | 待定 |
| 2 | Privy免费额度用完后定价是否可接受？ | Tech Lead | MVP上线后 | 待定 |
| 3 | 是否需要ICP备案（如果后续回国运营）？ | 法务 | v2.0前 | 待定 |
| 4 | USDC充值引导是否需要集成法币On-ramp（MoonPay等）？ | 产品 | v1.1前 | 待定 |
| 5 | 首批种子任务的具体内容和预算确认？ | 运营 | MVP上线前1周 | 待定 |
| 6 | 信誉分算法权重是否需要根据运营数据调整？ | 数据 | MVP后1个月 | 待定 |

---

## 10. 附录

### 10.1 设计规范

| 维度 | 规范 |
|------|------|
| 设计语言 | 深邃蓝黑科技风 |
| 主背景色 | `#06080F` / `#070B14` |
| 辅助背景 | `#0C1020` / `#131B2E` |
| 主色调 | 科技蓝 `#1890FF` / `#3B82F6` |
| 辅助色 | 青绿 `#00D4AA` / `#06D6A0` |
| 强调色 | 金色 `#D4A843`（VIP/等级）、紫色 `#8B5CF6`（徽章） |
| 警告色 | 红 `#EF4444` / `#FF4D6A` |
| 设计宽度 | 430px（移动优先） |
| 底部Tab | 4个：发现 / 任务池 / 成长 / 我的 |
| 原型文件 | `prototype/index.html`（v1完整版）、`prototype/index-v3.html`（v3迭代版） |

### 10.2 VERIFIED认证标准

MVP阶段满足任一即可：

1. **GitHub 500+ Stars**（提供仓库链接，平台验证）
2. **大厂AI方向3年+经验**（上传工牌/在职证明，人工审核48h内）
3. **完成2个平台任务且满意度 ≥ 4.0**（平台自动认证）

Post-MVP扩展标准：
4. 顶会论文（ACL/NeurIPS/CVPR等）
5. 黑客松获奖
6. 2名VERIFIED精英推荐

### 10.3 运营冷启动策略

1. **种子用户导入：** OPENCAIO社群首批200名AI精英定向邀请
2. **种子任务：** OPENCAIO官方发布50个¥1,000+真实任务（预算¥50万）
3. **KOL入驻：** 清北/中科院AI方向KOL首批入驻，给予VERIFIED+Lv.3初始等级
4. **首月0佣金：** 早期用户交易免平台佣金
5. **黑客松引流：** 首届黑客松¥100,000奖金池引爆传播（Post-MVP）

### 10.4 文档版本历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|---------|
| v1.0 | 2026-02-28 | Peter Q / OPENCAIO CPO | 初始版本，完整产品愿景 |
| v2.0 | 2026-04-02 | OPENCAIO CPO | MVP聚焦版，新增智能合约模块，细化用户故事 |
| v3.0 Final | 2026-04-02 | OPENCAIO 产品团队 | 综合版，整合所有文档，可交付开发 |

### 10.5 参考文档

| 文档 | 路径 |
|------|------|
| PRD v1 原始版 | `docs/PRD-v1-original.md` |
| PRD v2.0 MVP版 | `docs/PRD-v2.0.md` |
| 技术可行性评估 | `docs/tech-feasibility.md` |
| 风险评估报告 | `docs/risk-assessment.md` |
| 原型v1 | `prototype/index.html` |
| 原型v3 | `prototype/index-v3.html` |

---

*本文档为蓝血菁英项目最终版PRD，可直接交付开发团队。所有功能优先级、验收标准、MVP范围、数据模型、技术架构、风险评估均已完成定义。*

*— 蓝血菁英产品团队, 2026年4月*
