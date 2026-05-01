-- Seed users
insert into users (nickname, email, school, company, direction, privy_wallet_address, is_verified)
values
  ('张云飞', 'zhangyunfei@example.com', '清华大学', '独立开发者', 'AI模型', '0x1111111111111111111111111111111111111111', true),
  ('李艾米', 'liam@example.com', '北京理工大学', '量化咨询', '数据分析', '0x2222222222222222222222222222222222222222', true),
  ('王浩然', 'wanghaoran@example.com', '复旦大学', '全栈工作室', 'Agent开发', '0x3333333333333333333333333333333333333333', true),
  ('赵静怡', 'zhaojingyi@example.com', '浙江大学', 'AI产品设计', '其他', '0x4444444444444444444444444444444444444444', false),
  ('陈明远', 'chenmingyuan@example.com', '中科院', '云原生团队', '本地化部署', '0x5555555555555555555555555555555555555555', true)
on conflict do nothing;

-- Seed bounty samples
insert into bounties (publisher_id, title, description, category, tech_tags, reward_usdc, deadline, delivery_standard, status)
select id, '企业知识库本地化部署', '完成私有化模型部署与知识库对接。', '本地化部署', array['Llama-3', 'RAG', 'Docker'], 120.000000, now() + interval '7 days', '交付部署文档、代码仓库和演示环境', 'open'
from users where email = 'zhangyunfei@example.com'
on conflict do nothing;
