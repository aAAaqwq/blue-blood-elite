-- 蓝血菁英 Seed 数据
-- 用于测试和开发

-- ==================== 测试用户 ====================

-- 用户1: 张云飞 (VERIFIED)
INSERT INTO users (id, nickname, bio, school, company, direction, github_url, linkedin_url, is_verified, verified_at, created_at)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    '张云飞',
    '专注企业级大模型落地，RAG系统架构专家。曾在字节跳动AI Lab负责对话系统研发。',
    '清华大学',
    '独立开发者',
    'AI模型 / RAG',
    'https://github.com/zhangyunfei',
    'https://linkedin.com/in/zhangyunfei',
    true,
    NOW(),
    NOW()
);

-- 用户2: 李明 (VERIFIED)
INSERT INTO users (id, nickname, bio, school, company, direction, github_url, linkedin_url, is_verified, verified_at, created_at)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '李明',
    '前阿里云技术专家，专注于Agent开发与自动化流程。开源项目累计 2000+ Stars。',
    '浙江大学',
    '阿里云',
    'Agent开发 / 自动化',
    'https://github.com/liming',
    'https://linkedin.com/in/liming',
    true,
    NOW(),
    NOW()
);

-- 用户3: 王芳 (未认证)
INSERT INTO users (id, nickname, bio, school, company, direction, github_url, linkedin_url, is_verified, created_at)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    '王芳',
    'AI学习者，关注大模型技术发展。',
    '北京大学',
    '学生',
    'AI模型',
    'https://github.com/wangfang',
    null,
    false,
    NOW()
);

-- ==================== 技能标签 ====================

INSERT INTO user_skills (user_id, skill_name, created_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Python', NOW()),
    ('11111111-1111-1111-1111-111111111111', 'RAG', NOW()),
    ('11111111-1111-1111-1111-111111111111', 'LangChain', NOW()),
    ('11111111-1111-1111-1111-111111111111', '向量数据库', NOW()),
    ('22222222-2222-2222-2222-222222222222', 'Python', NOW()),
    ('22222222-2222-2222-2222-222222222222', 'Agent', NOW()),
    ('22222222-2222-2222-2222-222222222222', 'AutoGen', NOW()),
    ('22222222-2222-2222-2222-222222222222', 'Docker', NOW()),
    ('33333333-3333-3333-3333-333333333333', 'Python', NOW()),
    ('33333333-3333-3333-3333-333333333333', '机器学习', NOW());

-- ==================== 测试任务 ====================

-- 任务1: RAG系统开发 (开放)
INSERT INTO bounties (id, publisher_id, title, description, category, tech_tags, reward_usdc, deadline, delivery_standard, status, created_at)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333333',
    'RAG 系统开发 - 企业知识库问答',
    '需要开发一个基于 LlamaIndex 的 RAG 系统，支持企业知识库问答。\n\n## 需求\n1. 支持 PDF/Word 文档解析\n2. 实现向量检索与混合检索\n3. 支持多轮对话上下文\n4. 提供 OpenAI 兼容 API 接口\n\n## 技术栈\n- Python\n- LlamaIndex\n- ChromaDB / Qdrant\n- FastAPI',
    'AI模型',
    ARRAY['Python', 'RAG', 'LangChain', '向量数据库'],
    '500',
    NOW() + INTERVAL '14 days',
    '1. 完整的 RAG 系统代码\n2. 部署文档和 API 文档\n3. 支持至少 1000 条文档的检索测试',
    'open',
    NOW()
);

-- 任务2: Agent 自动化脚本 (进行中)
INSERT INTO bounties (id, publisher_id, title, description, category, tech_tags, reward_usdc, deadline, delivery_standard, status, claimed_by, claimed_at, created_at)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'AI Agent 自动化办公助手',
    '开发一个 AI Agent 助手，用于自动化处理日常办公任务。\n\n## 功能要求\n1. 邮件自动分类与回复建议\n2. 日程管理助手\n3. 会议纪要自动生成\n4. 任务提醒与跟踪\n\n## 交付物\n完整可运行的 Agent 系统，包括前端界面。',
    'Agent开发',
    ARRAY['Python', 'Agent', 'AutoGen', 'LangChain'],
    '800',
    NOW() + INTERVAL '21 days',
    '1. 完整代码仓库\n2. Docker 部署文件\n3. 使用文档和演示视频',
    'in_progress',
    '22222222-2222-2222-2222-222222222222',
    NOW(),
    NOW()
);

-- 任务3: 本地化部署咨询 (已完成)
INSERT INTO bounties (id, publisher_id, title, description, category, tech_tags, reward_usdc, deadline, delivery_standard, status, claimed_by, claimed_at, completed_at, created_at)
VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '22222222-2222-2222-2222-222222222222',
    'Llama3 本地化部署技术咨询',
    '需要专家指导 Llama3 模型在本地服务器的部署方案。\n\n## 咨询内容\n1. 硬件配置建议\n2. 量化方案选择\n3. API 服务封装\n4. 性能优化建议',
    '本地化部署',
    ARRAY['LLM', '量化', 'vLLM', 'API'],
    '200',
    NOW() - INTERVAL '7 days',
    '技术方案文档，包含部署脚本和配置说明',
    'completed',
    '11111111-1111-1111-1111-111111111111',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '15 days'
);

-- 任务4: Web3 数据分析 (开放)
INSERT INTO bounties (id, publisher_id, title, description, category, tech_tags, reward_usdc, deadline, delivery_standard, status, created_at)
VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '11111111-1111-1111-1111-111111111111',
    '链上数据分析 Dashboard 开发',
    '开发一个 Web3 链上数据分析 Dashboard。\n\n## 功能\n1. 实时链上数据可视化\n2. Gas 费用预测\n3. 热门 Token 分析\n4. 钱包地址追踪\n\n## 技术栈\n- React / Next.js\n- Ethers.js / viem\n- D3.js / Recharts',
    'Web3',
    ARRAY['React', 'Web3', '数据分析', 'D3.js'],
    '600',
    NOW() + INTERVAL '10 days',
    '1. 完整的 Web 应用代码\n2. 实时数据接入说明\n3. 部署文档',
    'open',
    NOW()
);

-- ==================== 信誉记录 ====================

INSERT INTO reputation (user_id, onchain_score, tasks_completed, avg_satisfaction, reputation_level, last_updated)
VALUES
    ('11111111-1111-1111-1111-111111111111', 85.5, 3, 4.8, '精英', NOW()),
    ('22222222-2222-2222-2222-222222222222', 92.0, 5, 4.9, '传说', NOW()),
    ('33333333-3333-3333-3333-333333333333', 0, 0, 0, '新手', NOW());