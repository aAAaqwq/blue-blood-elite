create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) unique,
  phone varchar(20) unique,
  password_hash varchar(255),
  nickname varchar(50) not null,
  avatar_url text,
  bio text,
  school varchar(100),
  company varchar(100),
  direction varchar(50),
  github_url varchar(255),
  linkedin_url varchar(255),
  privy_wallet_address varchar(42),
  is_verified boolean default false,
  verified_at timestamptz,
  level smallint default 1,
  points int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists user_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  skill_name varchar(50) not null,
  proficiency smallint default 50,
  created_at timestamptz default now(),
  unique(user_id, skill_name)
);

create table if not exists connections (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references users(id) on delete cascade,
  to_user_id uuid references users(id) on delete cascade,
  status varchar(20) default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(from_user_id, to_user_id)
);

create table if not exists verify_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  verify_type varchar(30),
  evidence_url text,
  status varchar(20) default 'pending',
  reviewer_id uuid references users(id),
  review_note text,
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

create table if not exists bounties (
  id uuid primary key default gen_random_uuid(),
  publisher_id uuid references users(id) on delete set null,
  title varchar(100) not null,
  description text not null,
  category varchar(50),
  tech_tags text[] default '{}',
  reward_usdc decimal(12, 6) not null,
  deadline timestamptz not null,
  delivery_standard text,
  escrow_contract varchar(42),
  escrow_tx_hash varchar(66),
  status varchar(20) default 'open',
  claimed_by uuid references users(id),
  claimed_at timestamptz,
  delivered_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  bounty_id uuid references bounties(id) on delete cascade,
  applicant_id uuid references users(id) on delete cascade,
  message text not null,
  status varchar(20) default 'pending',
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

create table if not exists deliveries (
  id uuid primary key default gen_random_uuid(),
  bounty_id uuid references bounties(id) on delete cascade,
  content text not null,
  links text[] default '{}',
  status varchar(20) default 'submitted',
  review_note text,
  submitted_at timestamptz default now(),
  reviewed_at timestamptz
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  bounty_id uuid references bounties(id) on delete cascade,
  reviewer_id uuid references users(id),
  reviewee_id uuid references users(id),
  rating smallint check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

create table if not exists reputation (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade unique,
  onchain_score decimal(5, 2) default 0,
  tasks_completed int default 0,
  avg_satisfaction decimal(3, 2) default 0,
  reputation_level varchar(20) default '新手',
  last_updated timestamptz default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  type varchar(30) not null,
  amount_usdc decimal(12, 6) not null,
  bounty_id uuid references bounties(id),
  tx_hash varchar(66),
  created_at timestamptz default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type varchar(30) not null,
  title varchar(100) not null,
  content text,
  related_id uuid,
  is_read boolean default false,
  created_at timestamptz default now()
);
