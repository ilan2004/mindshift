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
