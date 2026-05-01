# 蓝血精英 - 后端设计文档

## 1. 数据库Schema设计

### 核心表结构

#### 1.1 用户系统

```sql
-- 用户主表 (扩展)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 认证信息
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),
    
    -- 基础资料
    nickname VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    bio TEXT, -- 个人简介
    
    -- 身份背景
    school VARCHAR(100), -- 学校
    company VARCHAR(100), -- 公司
    direction VARCHAR(50), -- 方向：AI开发/AI设计/AI写作等
    job_title VARCHAR(50), -- 职位
    location VARCHAR(50), -- 所在地
    
    -- 社交链接
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    website_url VARCHAR(255),
    wechat_id VARCHAR(50), -- 微信号（隐私字段）
    
    -- 平台身份
    role VARCHAR(20) DEFAULT 'user', -- user/admin/moderator
    is_verified BOOLEAN DEFAULT FALSE, -- 是否蓝V认证
    verified_at TIMESTAMPTZ,
    verification_type VARCHAR(20), -- alumni/expert/enterprise
    
    -- 等级系统
    level SMALLINT DEFAULT 1,
    points INT DEFAULT 0,
    reputation_score DECIMAL(5,2) DEFAULT 0, -- 0-100
    
    -- 钱包（支持人民币和积分）
    balance_rmb DECIMAL(10,2) DEFAULT 0, -- 人民币余额（分）
    balance_points INT DEFAULT 0, -- 积分余额
    
    -- 统计数据
    tasks_completed INT DEFAULT 0,
    tasks_published INT DEFAULT 0,
    courses_published INT DEFAULT 0,
    courses_sold INT DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    
    -- 偏好设置
    notification_settings JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    
    -- 状态
    status VARCHAR(20) DEFAULT 'active', -- active/inactive/banned
    last_login_at TIMESTAMPTZ,
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户技能标签
CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(50) NOT NULL,
    proficiency SMALLINT DEFAULT 50 CHECK (proficiency BETWEEN 0 AND 100),
    is_core BOOLEAN DEFAULT FALSE, -- 是否核心技能
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, skill_name)
);

-- 用户作品集
CREATE TABLE user_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    cover_url TEXT,
    link_url TEXT,
    attachments JSONB DEFAULT '[]', -- 附件列表
    category VARCHAR(50),
    tags TEXT[],
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 认证申请
CREATE TABLE verify_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    apply_type VARCHAR(20) NOT NULL, -- alumni/expert/enterprise
    
    -- 提交材料
    id_card_front TEXT, -- 身份证正面
    id_card_back TEXT, -- 身份证反面
    diploma_url TEXT, -- 学历证明
    work_cert_url TEXT, -- 工作证明
    portfolio_urls TEXT[], -- 作品集
    
    -- 申请信息
    real_name VARCHAR(50),
    id_number VARCHAR(18), -- 身份证号（加密存储）
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    apply_reason TEXT,
    
    -- 审核状态
    status VARCHAR(20) DEFAULT 'pending', -- pending/approved/rejected
    reviewer_id UUID REFERENCES users(id),
    review_note TEXT,
    reviewed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 1.2 任务系统

```sql
-- 任务表
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publisher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- 任务基本信息
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 开发/设计/写作/咨询等
    subcategory VARCHAR(50), -- 细分类型：RAG/Agent/模型微调等
    tech_tags TEXT[], -- 技术标签
    difficulty VARCHAR(20) DEFAULT 'medium', -- easy/medium/hard
    
    -- 预算与报酬
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    budget_type VARCHAR(20) DEFAULT 'fixed', -- fixed/hourly/project
    currency VARCHAR(10) DEFAULT 'CNY',
    
    -- 时间安排
    deadline TIMESTAMPTZ, -- 投标截止
    expected_duration INT, -- 预计工期（天）
    milestone_count INT DEFAULT 1, -- 里程碑数量
    
    -- 交付要求
    deliverables JSONB DEFAULT '[]', -- 交付物清单
    delivery_standard TEXT, -- 验收标准
    attachments JSONB DEFAULT '[]', -- 附件
    
    -- 投标设置
    apply_mode VARCHAR(20) DEFAULT 'public', -- public/invite/private
    require_verified BOOLEAN DEFAULT FALSE, -- 是否要求认证
    min_level SMALLINT DEFAULT 1, -- 最低等级要求
    max_applicants INT, -- 最大申请人数
    
    -- 统计
    view_count INT DEFAULT 0,
    apply_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    
    -- 状态
    status VARCHAR(20) DEFAULT 'open', -- open/choosing/in_progress/completed/cancelled
    
    -- 合作方
    assigned_to UUID REFERENCES users(id),
    assigned_at TIMESTAMPTZ,
    contract_price DECIMAL(10,2), -- 最终合同价
    
    -- 时间戳
    published_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancel_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 任务申请
CREATE TABLE task_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 申请内容
    cover_letter TEXT NOT NULL, -- 申请信
    proposed_price DECIMAL(10,2), -- 报价
    proposed_duration INT, -- 预计工期
    portfolio_links TEXT[], -- 相关作品
    
    -- 状态
    status VARCHAR(20) DEFAULT 'pending', -- pending/viewed/shortlisted/rejected/accepted
    
    -- 沟通记录
    messages JSONB DEFAULT '[]', -- 沟通消息
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(task_id, applicant_id)
);

-- 里程碑
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    
    order_index INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL, -- 该里程碑金额
    
    -- 交付物
    deliverables TEXT[],
    submitted_content TEXT,
    submitted_attachments JSONB DEFAULT '[]',
    submitted_at TIMESTAMPTZ,
    
    -- 状态
    status VARCHAR(20) DEFAULT 'pending', -- pending/in_progress/submitted/approved/rejected
    
    -- 审核
    review_note TEXT,
    reviewed_at TIMESTAMPTZ,
    
    -- 支付
    is_paid BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMPTZ,
    payment_id UUID, -- 关联支付记录
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 任务评价
CREATE TABLE task_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id),
    reviewee_id UUID REFERENCES users(id),
    
    review_type VARCHAR(20) NOT NULL, -- to_freelancer/to_client
    
    -- 评分维度
    overall_rating SMALLINT CHECK (overall_rating BETWEEN 1 AND 5),
    quality_rating SMALLINT CHECK (quality_rating BETWEEN 1 AND 5),
    communication_rating SMALLINT CHECK (communication_rating BETWEEN 1 AND 5),
    timeliness_rating SMALLINT CHECK (timeliness_rating BETWEEN 1 AND 5),
    
    comment TEXT,
    
    -- 是否公开
    is_public BOOLEAN DEFAULT TRUE,
    
    -- 回复
    reply TEXT,
    replied_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(task_id, review_type)
);
```

#### 1.3 课程系统

```sql
-- 课程表
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- 基本信息
    title VARCHAR(100) NOT NULL,
    subtitle VARCHAR(200),
    description TEXT NOT NULL,
    cover_url TEXT,
    promo_video_url TEXT, -- 宣传视频
    
    -- 分类
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),
    tags TEXT[],
    
    -- 价格
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'CNY',
    
    -- 内容
    total_lessons INT DEFAULT 0,
    total_duration INT DEFAULT 0, -- 总时长（分钟）
    
    -- 难度与目标
    difficulty VARCHAR(20) DEFAULT 'beginner', -- beginner/intermediate/advanced
    target_audience TEXT[],
    prerequisites TEXT[],
    learning_goals TEXT[],
    
    -- 统计
    enroll_count INT DEFAULT 0,
    complete_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    rating_avg DECIMAL(3,2) DEFAULT 0,
    rating_count INT DEFAULT 0,
    
    -- 状态
    status VARCHAR(20) DEFAULT 'draft', -- draft/reviewing/published/archived
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- 时间
    submitted_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 课程章节
CREATE TABLE course_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    
    order_index INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 课时
CREATE TABLE course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID REFERENCES course_chapters(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    
    order_index INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    
    -- 内容
    content_type VARCHAR(20) NOT NULL, -- video/article/quiz
    content TEXT, -- 文章内容或视频URL
    duration INT, -- 时长（秒）
    attachments JSONB DEFAULT '[]',
    
    -- 设置
    is_preview BOOLEAN DEFAULT FALSE, -- 是否可试看
    is_free BOOLEAN DEFAULT FALSE, -- 是否免费
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户课程学习进度
CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 支付
    price_paid DECIMAL(10,2),
    payment_id UUID,
    
    -- 进度
    progress_percent DECIMAL(5,2) DEFAULT 0,
    completed_lessons UUID[],
    last_lesson_id UUID,
    last_position INT DEFAULT 0, -- 视频最后观看位置
    
    -- 状态
    status VARCHAR(20) DEFAULT 'learning', -- learning/completed
    
    -- 时间
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ, -- 有效期
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, user_id)
);

-- 课程评价
CREATE TABLE course_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
    content TEXT,
    
    -- 点赞
    helpful_count INT DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, user_id)
);
```

#### 1.4 招聘/岗位系统

```sql
-- 岗位表
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publisher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id), -- 如果有企业认证
    
    -- 基本信息
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[],
    responsibilities TEXT[],
    
    -- 公司信息
    company_name VARCHAR(100),
    company_logo_url TEXT,
    company_size VARCHAR(20), -- 1-10/11-50/51-200/200+
    company_stage VARCHAR(20), -- startup/growth/enterprise
    
    -- 职位详情
    job_type VARCHAR(20) NOT NULL, -- full_time/part_time/contract/freelance
    work_mode VARCHAR(20), -- remote/hybrid/onsite
    location VARCHAR(100),
    
    -- 薪资
    salary_min INT, -- 单位：千
    salary_max INT,
    salary_months INT DEFAULT 12, -- 几个月
    is_salary_negotiable BOOLEAN DEFAULT FALSE,
    
    -- 技能要求
    required_skills TEXT[],
    nice_to_have_skills TEXT[],
    min_experience VARCHAR(20), -- 0-1/1-3/3-5/5+
    
    -- 福利
    benefits TEXT[],
    
    -- 统计
    view_count INT DEFAULT 0,
    apply_count INT DEFAULT 0,
    
    -- 状态
    status VARCHAR(20) DEFAULT 'active', -- active/paused/closed
    is_featured BOOLEAN DEFAULT FALSE,
    is_urgent BOOLEAN DEFAULT FALSE,
    
    -- 时间
    expire_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 岗位申请
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 申请材料
    resume_url TEXT,
    cover_letter TEXT,
    portfolio_urls TEXT[],
    expected_salary INT,
    
    -- 状态
    status VARCHAR(20) DEFAULT 'pending', -- pending/viewed/shortlisted/interviewed/offered/hired/rejected
    
    -- 沟通记录
    notes JSONB DEFAULT '[]',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 企业信息表（可选）
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    logo_url TEXT,
    website VARCHAR(255),
    description TEXT,
    industry VARCHAR(50),
    size VARCHAR(20),
    stage VARCHAR(20),
    location VARCHAR(100),
    
    -- 认证
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- 联系
    contact_name VARCHAR(50),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 1.5 消息与通知系统

```sql
-- 会话表
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 会话类型
    type VARCHAR(20) DEFAULT 'direct', -- direct/group/system
    
    -- 标题（群组用）
    title VARCHAR(100),
    avatar_url TEXT,
    
    -- 关联业务
    related_type VARCHAR(30), -- task/course/job
    related_id UUID,
    
    -- 最后消息
    last_message_id UUID,
    last_message_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 会话成员
CREATE TABLE conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    role VARCHAR(20) DEFAULT 'member', -- owner/admin/member
    
    -- 未读数
    unread_count INT DEFAULT 0,
    
    -- 免打扰
    is_muted BOOLEAN DEFAULT FALSE,
    
    -- 最后阅读
    last_read_at TIMESTAMPTZ,
    
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(conversation_id, user_id)
);

-- 消息表
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- 消息类型
    type VARCHAR(20) DEFAULT 'text', -- text/image/file/system
    
    -- 内容
    content TEXT,
    attachments JSONB DEFAULT '[]', -- 附件
    
    -- 引用
    reply_to_id UUID REFERENCES messages(id),
    
    -- 状态
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 通知表
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 通知类型
    type VARCHAR(30) NOT NULL,
    -- system/task/course/job/message/review/payment
    
    -- 内容
    title VARCHAR(100) NOT NULL,
    content TEXT,
    
    -- 关联
    related_type VARCHAR(30),
    related_id UUID,
    
    -- 操作按钮
    action_url TEXT,
    action_text VARCHAR(50),
    
    -- 状态
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    -- 推送状态
    push_sent BOOLEAN DEFAULT FALSE,
    push_sent_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 1.6 支付系统

```sql
-- 支付订单
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 订单信息
    order_no VARCHAR(32) UNIQUE NOT NULL, -- 系统订单号
    order_type VARCHAR(20) NOT NULL, -- task/course/deposit/withdrawal
    order_id UUID, -- 关联业务ID
    
    -- 用户
    payer_id UUID REFERENCES users(id),
    payee_id UUID REFERENCES users(id), -- 收款方（平台或其他用户）
    
    -- 金额
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'CNY',
    
    -- 平台服务费
    platform_fee DECIMAL(10,2) DEFAULT 0,
    platform_fee_rate DECIMAL(5,4) DEFAULT 0, -- 费率 0.0500 = 5%
    
    -- 实际支付
    actual_amount DECIMAL(10,2), -- 扣除服务费后的金额
    
    -- 支付方式
    payment_method VARCHAR(20), -- wechat/alipay/balance
    
    -- 第三方流水
    third_party_no VARCHAR(100), -- 微信/支付宝订单号
    third_party_data JSONB,
    
    -- 状态
    status VARCHAR(20) DEFAULT 'pending', -- pending/paid/failed/refunded/closed
    
    -- 时间
    paid_at TIMESTAMPTZ,
    expired_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 钱包流水
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 交易类型
    type VARCHAR(30) NOT NULL,
    -- recharge/withdrawal/task_income/task_pay/course_income/course_pay/refund/fee/platform_reward
    
    -- 金额
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'CNY',
    
    -- 方向
    direction VARCHAR(10) NOT NULL, -- credit/debit
    
    -- 余额
    balance_before DECIMAL(10,2),
    balance_after DECIMAL(10,2),
    
    -- 关联
    related_type VARCHAR(30),
    related_id UUID,
    payment_id UUID REFERENCES payments(id),
    
    -- 描述
    description TEXT,
    
    -- 状态
    status VARCHAR(20) DEFAULT 'success', -- pending/success/failed
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 提现申请
CREATE TABLE withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 金额
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'CNY',
    
    -- 到账账户
    account_type VARCHAR(20) NOT NULL, -- bank/alipay/wechat
    account_name VARCHAR(50),
    account_number VARCHAR(100), -- 加密存储
    bank_name VARCHAR(50),
    
    -- 状态
    status VARCHAR(20) DEFAULT 'pending', -- pending/processing/completed/rejected
    
    -- 处理
    processed_at TIMESTAMPTZ,
    processor_id UUID REFERENCES users(id),
    process_note TEXT,
    
    -- 第三方流水
    third_party_no VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 索引设计

```sql
-- 用户相关索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_is_verified ON users(is_verified);
CREATE INDEX idx_users_direction ON users(direction);
CREATE INDEX idx_users_reputation ON users(reputation_score DESC);

-- 任务相关索引
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_publisher ON tasks(publisher_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_tasks_status_created ON tasks(status, created_at DESC);

-- 课程相关索引
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_price ON courses(price);
CREATE INDEX idx_courses_rating ON courses(rating_avg DESC);

-- 消息相关索引
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- 通知相关索引
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- 支付相关索引
CREATE INDEX idx_payments_payer ON payments(payer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_order_no ON payments(order_no);
```

---

## 2. API设计规范

### 2.1 RESTful API 规范

#### 基础规范

```yaml
Base URL: https://api.lanxuejingying.com/v1

Headers:
  Authorization: Bearer {jwt_token}
  Content-Type: application/json
  X-Request-ID: {uuid}  # 用于追踪请求

Response Format:
  {
    "code": 200,
    "message": "success",
    "data": {},
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 100,
      "total_pages": 5
    },
    "request_id": "uuid"
  }

Error Format:
  {
    "code": 400,
    "message": "Invalid parameters",
    "error": "VALIDATION_ERROR",
    "details": {},
    "request_id": "uuid"
  }

HTTP Status Codes:
  200: OK
  201: Created
  204: No Content
  400: Bad Request
  401: Unauthorized
  403: Forbidden
  404: Not Found
  409: Conflict
  422: Unprocessable Entity
  429: Too Many Requests
  500: Internal Server Error
```

#### 用户API

```yaml
# 用户认证
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password

# 用户资料
GET    /users/me
PUT    /users/me
GET    /users/:id
GET    /users/:id/portfolio
GET    /users/:id/reviews

# 用户列表（搜索）
GET    /users
  Query:
    - direction: string
    - skills: string[]
    - is_verified: boolean
    - min_reputation: number
    - sort: relevance|rating|newest
    - page: number
    - page_size: number

# 技能管理
GET    /users/me/skills
POST   /users/me/skills
PUT    /users/me/skills/:id
DELETE /users/me/skills/:id

# 作品集
GET    /users/me/portfolios
POST   /users/me/portfolios
PUT    /users/me/portfolios/:id
DELETE /users/me/portfolios/:id

# 认证申请
POST   /verify-applications
GET    /verify-applications/me
GET    /verify-applications/:id
```

#### 任务API

```yaml
# 任务CRUD
GET    /tasks
  Query:
    - category: string
    - skills: string[]
    - budget_min: number
    - budget_max: number
    - status: string
    - sort: newest|budget_high|budget_low|deadline
    - page: number
    - page_size: number

POST   /tasks
GET    /tasks/:id
PUT    /tasks/:id
DELETE /tasks/:id
POST   /tasks/:id/publish
POST   /tasks/:id/cancel

# 申请
GET    /tasks/:id/applications
POST   /tasks/:id/applications
GET    /tasks/:id/applications/:application_id
PUT    /tasks/:id/applications/:application_id/accept
PUT    /tasks/:id/applications/:application_id/reject

# 我的任务
GET    /me/tasks/published
GET    /me/tasks/working
GET    /me/tasks/completed

# 里程碑
GET    /tasks/:id/milestones
POST   /tasks/:id/milestones/:milestone_id/submit
PUT    /tasks/:id/milestones/:milestone_id/approve
PUT    /tasks/:id/milestones/:milestone_id/reject

# 评价
POST   /tasks/:id/reviews
GET    /tasks/:id/reviews
```

#### 课程API

```yaml
# 课程CRUD
GET    /courses
  Query:
    - category: string
    - difficulty: string
    - price_min: number
    - price_max: number
    - rating: number
    - sort: popular|newest|rating|price_low|price_high
    - page: number
    - page_size: number

POST   /courses
GET    /courses/:id
PUT    /courses/:id
DELETE /courses/:id

# 课程内容
GET    /courses/:id/chapters
POST   /courses/:id/chapters
PUT    /courses/:id/chapters/:chapter_id
DELETE /courses/:id/chapters/:chapter_id

GET    /courses/:id/lessons
POST   /courses/:id/lessons
PUT    /courses/:id/lessons/:lesson_id
DELETE /courses/:id/lessons/:lesson_id

# 学习
POST   /courses/:id/enroll
GET    /courses/:id/progress
PUT    /courses/:id/progress
  Body:
    - lesson_id: uuid
    - position: number
    - completed: boolean

# 评价
GET    /courses/:id/reviews
POST   /courses/:id/reviews
PUT    /courses/:id/reviews/:review_id
DELETE /courses/:id/reviews/:review_id

# 我的课程
GET    /me/courses/learning
GET    /me/courses/teaching
GET    /me/courses/completed
```

#### 岗位API

```yaml
GET    /jobs
  Query:
    - category: string
    - job_type: string
    - location: string
    - salary_min: number
    - salary_max: number
    - is_remote: boolean
    - sort: newest|salary_high|hot
    - page: number
    - page_size: number

POST   /jobs
GET    /jobs/:id
PUT    /jobs/:id
DELETE /jobs/:id

# 申请
POST   /jobs/:id/apply
GET    /jobs/:id/applications
PUT    /jobs/:id/applications/:application_id/status

# 我的岗位
GET    /me/jobs/published
GET    /me/jobs/applications
```

#### 消息API

```yaml
# 会话
GET    /conversations
POST   /conversations
GET    /conversations/:id
PUT    /conversations/:id/read
PUT    /conversations/:id/mute
DELETE /conversations/:id

# 消息
GET    /conversations/:id/messages
POST   /conversations/:id/messages
DELETE /conversations/:id/messages/:message_id

# 文件上传
POST   /upload/message-file
```

#### 支付API

```yaml
# 支付
POST   /payments
  Body:
    - order_type: string
    - order_id: uuid
    - payment_method: wechat|alipay

GET    /payments/:id
GET    /payments/:id/status

# 退款
POST   /payments/:id/refund

# 钱包
GET    /wallet
GET    /wallet/transactions
POST   /wallet/withdrawals

# 提现
POST   /withdrawals
GET    /withdrawals
```

### 2.2 WebSocket API (实时消息)

```yaml
Connection: wss://ws.lanxuejingying.com

Authentication:
  Query: ?token={jwt_token}

Events:

# 客户端发送
- subscribe_conversation: { conversation_id }
- unsubscribe_conversation: { conversation_id }
- send_message: { conversation_id, content, type, attachments }
- typing: { conversation_id }
- read_messages: { conversation_id, last_message_id }

# 服务端推送
- message_received: { message }
- message_delivered: { message_id }
- typing_indicator: { user_id, conversation_id }
- notification: { notification }
- user_online: { user_id }
- user_offline: { user_id }
```

### 2.3 Webhook 设计

```yaml
# 配置
POST /webhooks
GET  /webhooks
PUT  /webhooks/:id
DELETE /webhooks/:id

# 事件类型
events:
  - task.created
  - task.assigned
  - task.completed
  - task.cancelled
  - payment.paid
  - payment.refunded
  - course.published
  - course.enrolled
  - review.created

# Payload 格式
{
  "event": "task.assigned",
  "timestamp": "2026-01-01T00:00:00Z",
  "data": { ... },
  "signature": "sha256=..."
}
```

---

## 3. 服务端架构

### 3.1 技术栈

```yaml
Runtime: Node.js 20+
Framework: Express.js / Fastify
Language: TypeScript

Database:
  Primary: PostgreSQL (Supabase)
  Cache: Redis (Upstash)
  Search: Meilisearch / Algolia

Storage:
  Files: Supabase Storage / Aliyun OSS
  CDN: Cloudflare / Aliyun CDN

Message Queue: BullMQ (Redis)
Real-time: Supabase Realtime / Socket.io

Authentication: JWT + Supabase Auth
Payment: Wechat Pay + Alipay SDK
```

### 3.2 项目结构

```
backend/
├── src/
│   ├── config/           # 配置文件
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── payment.ts
│   ├── controllers/      # 控制器
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── task.controller.ts
│   │   ├── course.controller.ts
│   │   ├── job.controller.ts
│   │   ├── message.controller.ts
│   │   └── payment.controller.ts
│   ├── services/         # 业务逻辑
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── task.service.ts
│   │   ├── course.service.ts
│   │   ├── job.service.ts
│   │   ├── message.service.ts
│   │   ├── payment.service.ts
│   │   └── notification.service.ts
│   ├── repositories/     # 数据访问
│   │   ├── user.repository.ts
│   │   ├── task.repository.ts
│   │   └── ...
│   ├── models/           # 类型定义
│   │   ├── user.model.ts
│   │   ├── task.model.ts
│   │   └── ...
│   ├── middleware/       # 中间件
│   │   ├── auth.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── jobs/             # 后台任务
│   │   ├── email.job.ts
│   │   ├── notification.job.ts
│   │   └── payment.job.ts
│   ├── utils/            # 工具函数
│   │   ├── logger.ts
│   │   ├── crypto.ts
│   │   └── helpers.ts
│   └── app.ts            # 应用入口
├── tests/                # 测试
├── prisma/               # 数据库schema
│   └── schema.prisma
├── supabase/             # Supabase配置
│   ├── functions/        # Edge Functions
│   └── migrations/
├── docker-compose.yml
└── package.json
```

### 3.3 核心服务设计

#### 任务服务

```typescript
interface TaskService {
  // 创建任务
  createTask(data: CreateTaskDTO): Promise<Task>;
  
  // 发布任务
  publishTask(taskId: string): Promise<void>;
  
  // 申请任务
  applyToTask(taskId: string, data: ApplicationDTO): Promise<Application>;
  
  // 接受申请
  acceptApplication(taskId: string, applicationId: string): Promise<void>;
  
  // 提交里程碑
  submitMilestone(taskId: string, milestoneId: string, data: SubmitDTO): Promise<void>;
  
  // 审核里程碑
  reviewMilestone(taskId: string, milestoneId: string, data: ReviewDTO): Promise<void>;
  
  // 完成任务
  completeTask(taskId: string): Promise<void>;
  
  // 取消任务
  cancelTask(taskId: string, reason: string): Promise<void>;
  
  // 搜索任务
  searchTasks(filters: TaskFilters): Promise<PaginatedResult<Task>>;
}
```

#### 支付服务

```typescript
interface PaymentService {
  // 创建支付订单
  createPayment(data: CreatePaymentDTO): Promise<Payment>;
  
  // 处理支付回调
  handleWebhook(provider: string, payload: unknown): Promise<void>;
  
  // 确认支付
  confirmPayment(paymentId: string, thirdPartyData: unknown): Promise<void>;
  
  // 申请退款
  requestRefund(paymentId: string, reason: string): Promise<void>;
  
  // 处理提现
  processWithdrawal(withdrawalId: string): Promise<void>;
  
  // 计算服务费
  calculateFee(amount: number, type: string): FeeResult;
}
```

#### 通知服务

```typescript
interface NotificationService {
  // 发送通知
  sendNotification(userId: string, notification: NotificationDTO): Promise<void>;
  
  // 批量发送
  sendBulkNotifications(userIds: string[], notification: NotificationDTO): Promise<void>;
  
  // 推送消息
  pushMessage(userId: string, message: MessageDTO): Promise<void>;
  
  // 邮件通知
  sendEmail(to: string, template: string, data: unknown): Promise<void>;
  
  // 短信通知
  sendSMS(phone: string, template: string, data: unknown): Promise<void>;
}
```

### 3.4 后台任务

```typescript
// 任务队列配置
const queues = {
  email: new Queue('email'),
  notification: new Queue('notification'),
  payment: new Queue('payment'),
  search: new Queue('search-index'),
  report: new Queue('report-generation'),
};

// 任务处理器
queue.email.process(async (job) => {
  const { to, template, data } = job.data;
  await emailService.send(to, template, data);
});

queue.notification.process(async (job) => {
  const { userId, notification } = job.data;
  await notificationService.send(userId, notification);
});

queue.payment.process(async (job) => {
  const { paymentId } = job.data;
  await paymentService.processPayment(paymentId);
});
```

### 3.5 缓存策略

```typescript
// Redis Key 设计
const cacheKeys = {
  // 用户
  user: (id: string) => `user:${id}`,
  userProfile: (id: string) => `user:profile:${id}`,
  userSkills: (id: string) => `user:skills:${id}`,
  
  // 任务
  task: (id: string) => `task:${id}`,
  taskList: (filters: string) => `tasks:list:${filters}`,
  
  // 课程
  course: (id: string) => `course:${id}`,
  courseList: (filters: string) => `courses:list:${filters}`,
  
  // 会话
  conversation: (id: string) => `conversation:${id}`,
  conversationMessages: (id: string) => `conversation:${id}:messages`,
  
  // 排行榜
  leaderboard: (type: string) => `leaderboard:${type}`,
  
  // 统计
  stats: (type: string) => `stats:${type}`,
};

// 缓存时间
const cacheTTL = {
  user: 3600, // 1小时
  task: 1800, // 30分钟
  course: 3600,
  list: 300,  // 5分钟
  stats: 60,  // 1分钟
};
```

---

## 4. 安全规范

### 4.1 认证与授权

```yaml
JWT配置:
  Algorithm: RS256
  Access Token TTL: 15分钟
  Refresh Token TTL: 7天
  Issuer: lanxuejingying.com
  Audience: api.lanxuejingying.com

刷新策略:
  - 每次请求返回新的access token
  - refresh token使用rotation策略
  - 检测到异常时撤销所有token

权限模型 (RBAC):
  Roles:
    - user: 普通用户
    - verified: 认证用户
    - instructor: 讲师
    - moderator: 版主
    - admin: 管理员
    - superadmin: 超级管理员

  Permissions:
    - task:create, task:edit, task:delete
    - course:create, course:edit, course:delete
    - job:create, job:edit, job:delete
    - user:manage, user:ban
    - content:moderate
    - finance:manage
```

### 4.2 数据安全

```yaml
敏感字段加密:
  - 身份证号: AES-256-GCM
  - 银行卡号: AES-256-GCM
  - 手机号: 脱敏存储
  - 密码: Argon2id哈希

数据传输:
  - 强制HTTPS
  - HSTS头
  - 证书固定 (可选)

SQL注入防护:
  - 使用参数化查询
  - ORM框架 (Prisma)
  - 输入验证

XSS防护:
  - 输出编码
  - CSP策略
  - X-XSS-Protection头

CSRF防护:
  - SameSite Cookie
  - CSRF Token (敏感操作)
```

### 4.3 API安全

```yaml
限流策略:
  - 匿名用户: 30请求/分钟
  - 认证用户: 100请求/分钟
  - 敏感操作: 5次/分钟

IP限制:
  - 异常IP加入黑名单
  - 登录失败锁定

输入验证:
  - 参数类型检查
  - 长度限制
  - 特殊字符过滤
  - SQL关键字检测

审计日志:
  - 记录所有敏感操作
  - 保留90天
  - 包括: 用户ID, IP, 时间, 操作, 结果
```

### 4.4 支付安全

```yaml
订单安全:
  - 订单号防重放
  - 金额防篡改
  - 签名校验

回调验证:
  - IP白名单
  - 签名验证
  - 订单状态校验

资金保护:
  - 托管模式
  - 延迟结算
  - 争议冻结

风控策略:
  - 异常交易检测
  - 频繁操作限制
  - 大额交易人工审核
```

---

## 5. 性能优化

### 5.1 数据库优化

```yaml
查询优化:
  - 覆盖索引
  - 避免SELECT *
  - 分页查询 (cursor-based)
  - 复杂查询使用物化视图

连接池:
  - 最小连接: 5
  - 最大连接: 20
  - 连接超时: 30秒

读写分离:
  - 读操作: 只读副本
  - 写操作: 主库

归档策略:
  - 3个月前数据归档
  - 使用分区表
```

### 5.2 缓存策略

```yaml
多级缓存:
  L1: 内存缓存 (Node.js进程)
  L2: Redis
  L3: CDN

缓存更新:
  - Cache-Aside模式
  - 写后删除
  - 延迟双删

热点数据:
  - 预加载
  - 永不过期
  - 后台更新
```

### 5.3 监控指标

```yaml
业务指标:
  - 日活用户 (DAU)
  - 任务发布量
  - 任务完成量
  - 课程销售额
  - 用户留存率

技术指标:
  - API响应时间 (P50, P95, P99)
  - 错误率
  - 数据库查询时间
  - 缓存命中率
  - 队列积压

告警阈值:
  - API错误率 > 1%
  - P95响应时间 > 500ms
  - 数据库连接池使用率 > 80%
  - 队列积压 > 1000
```

---

## 6. 部署与运维

### 6.1 容器化

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

USER node

CMD ["node", "dist/app.js"]
```

### 6.2 Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - redis
    restart: always

  worker:
    build: .
    command: npm run worker
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - redis
    restart: always

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    restart: always

volumes:
  redis-data:
```

### 6.3 CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run typecheck

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to production
        run: |
          # 部署脚本
```

---

*文档版本: v1.0*
*最后更新: 2026-04-29*
