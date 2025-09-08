-- Initial schema (stub). Adapt for Supabase/Postgres.

-- Supabase Auth integration
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  gender text check (gender in ('male', 'female')),
  email text,
  personality_type text,
  test_completed boolean default false,
  last_result_mbti text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS (Row Level Security)
alter table profiles enable row level security;

-- Create policies for profiles
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a more permissive policy for signup
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (true);

-- Legacy users table (keeping for backward compatibility)
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

-- ==========================================
-- Backend additions for chat, traits, events, recommendations
-- Keeps existing tables intact and avoids name collisions
-- ==========================================

-- Ensure pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- 1) CHAT HISTORY
create table if not exists chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  message text not null,
  role text check (role in ('user', 'system', 'assistant')),
  created_at timestamp with time zone default now()
);
create index if not exists idx_chat_history_user_id on chat_history(user_id);
create index if not exists idx_chat_history_created_at on chat_history(created_at);

-- 2) GENERATED QUESTIONS (per-user)
create table if not exists generated_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  question text not null,
  created_at timestamp with time zone default now()
);
create index if not exists idx_generated_questions_user_id on generated_questions(user_id);

-- 3) USER ANSWERS (map to generated questions)
create table if not exists user_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  question_id uuid references generated_questions(id) on delete cascade,
  answer text not null,
  created_at timestamp with time zone default now()
);
create index if not exists idx_user_answers_user_id on user_answers(user_id);
create index if not exists idx_user_answers_question_id on user_answers(question_id);

-- 4) PERSONALITY TRAITS (aggregated from answers)
create table if not exists traits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  trait text not null,
  score int default 0,
  created_at timestamp with time zone default now()
);
create unique index if not exists uniq_trait_per_user on traits(user_id, trait);

-- 5) EVENTS (distractions, streaks, etc.)
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  event_type text not null,
  details jsonb,
  created_at timestamp with time zone default now()
);
create index if not exists idx_events_user_id on events(user_id);
create index if not exists idx_events_type on events(event_type);
create index if not exists idx_events_created_at on events(created_at);

-- 6) RECOMMENDATIONS (generated from traits & events)
create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  recommendation text not null,
  source text default 'system',
  created_at timestamp with time zone default now()
);
create index if not exists idx_recommendations_user_id on recommendations(user_id);
create index if not exists idx_recommendations_created_at on recommendations(created_at);
