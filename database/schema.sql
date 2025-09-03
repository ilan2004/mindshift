-- Initial schema (stub). Adapt for Supabase/Postgres.

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  personality_type text,
  created_at timestamp with time zone default now()
);

create table if not exists questions (
  id text primary key,
  text text not null,
  scale jsonb,
  options jsonb
);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  question_id text references questions(id) on delete cascade,
  value int,
  created_at timestamp with time zone default now()
);

create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text not null,
  stake numeric,
  status text,
  peer_link text,
  created_at timestamp with time zone default now()
);

create table if not exists leaderboard (
  user_id uuid references users(id) on delete cascade,
  points int default 0,
  streak int default 0,
  primary key (user_id)
);

-- Focus sessions (for timers)
create table if not exists focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  mode text not null default 'focus', -- focus | break
  status text not null default 'active', -- active | paused | ended
  duration_minutes int,
  started_at timestamp with time zone default now(),
  ends_at timestamp with time zone,
  remaining_ms int
);

create index if not exists idx_focus_sessions_user_id on focus_sessions(user_id);
create index if not exists idx_focus_sessions_status on focus_sessions(status);

-- Blocked domains per user
create table if not exists blocked_domains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  domain text not null,
  created_at timestamp with time zone default now()
);

create unique index if not exists uniq_blocked_domain_per_user on blocked_domains(user_id, domain);
