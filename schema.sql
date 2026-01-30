-- CLEAN RESET & FIX FOR MIGRATION
-- This script drops existing tables and recreates them with 'text' IDs to support legacy migration.
-- WARNING: This will clear any data currently in your Supabase tables.

-- Drop existing tables (in order of dependencies)
drop table if exists public.exam_deadlines;
drop table if exists public.daily_stats;
drop table if exists public.study_sessions;
drop table if exists public.todos;
drop table if exists public.tasks;
drop table if exists public.subjects;
drop table if exists public.profiles;

-- 1. Profiles (User Preferences)
create table public.profiles (
  id uuid references auth.users not null primary key,
  onboarding_complete boolean default false,
  full_name text,
  username text unique,
  academic_level text,
  daily_goal_minutes integer default 60,
  accent_color text,
  selected_subject_ids text[], -- Array of strings
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Subjects
create table public.subjects (
  id text primary key, -- Text to support legacy IDs
  user_id uuid references auth.users not null,
  name text not null,
  color text not null,
  icon text,
  total_study_time integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Tasks
create table public.tasks (
  id text primary key,
  user_id uuid references auth.users not null,
  subject_id text references public.subjects(id),
  topic text not null,
  planned_duration integer default 0,
  is_completed boolean default false,
  date text not null, -- YYYY-MM-DD
  priority text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Todos (Quick Goals)
create table public.todos (
  id text primary key,
  user_id uuid references auth.users not null,
  text text not null,
  is_completed boolean default false,
  date text not null, -- YYYY-MM-DD or Period ID
  period text not null, -- 'daily', 'weekly', 'monthly'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Study Sessions
create table public.study_sessions (
  id text primary key,
  user_id uuid references auth.users not null,
  subject_id text references public.subjects(id),
  start_time bigint not null,
  end_time bigint,
  duration integer default 0,
  notes text,
  is_paused boolean default false,
  paused_at bigint,
  total_paused_time integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. Daily Stats
create table public.daily_stats (
  user_id uuid references auth.users not null,
  date text not null, -- YYYY-MM-DD
  total_study_time integer default 0,
  sessions_count integer default 0,
  subjects_studied text[], -- Array of subject IDs
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (user_id, date)
);

-- 7. Exam Deadlines
create table public.exam_deadlines (
  id text primary key,
  user_id uuid references auth.users not null,
  name text not null,
  date text not null, -- YYYY-MM-DD
  preparation_level integer default 0, -- 0-100
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.tasks enable row level security;
alter table public.todos enable row level security;
alter table public.study_sessions enable row level security;
alter table public.daily_stats enable row level security;
alter table public.exam_deadlines enable row level security;

-- Policies

-- Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Subjects
create policy "Users can view own subjects" on public.subjects for select using (auth.uid() = user_id);
create policy "Users can insert own subjects" on public.subjects for insert with check (auth.uid() = user_id);
create policy "Users can update own subjects" on public.subjects for update using (auth.uid() = user_id);
create policy "Users can delete own subjects" on public.subjects for delete using (auth.uid() = user_id);

-- Tasks
create policy "Users can view own tasks" on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on public.tasks for delete using (auth.uid() = user_id);

-- Todos
create policy "Users can view own todos" on public.todos for select using (auth.uid() = user_id);
create policy "Users can insert own todos" on public.todos for insert with check (auth.uid() = user_id);
create policy "Users can update own todos" on public.todos for update using (auth.uid() = user_id);
create policy "Users can delete own todos" on public.todos for delete using (auth.uid() = user_id);

-- Study Sessions
create policy "Users can view own sessions" on public.study_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions" on public.study_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own sessions" on public.study_sessions for update using (auth.uid() = user_id);
create policy "Users can delete own sessions" on public.study_sessions for delete using (auth.uid() = user_id);

-- Daily Stats
create policy "Users can view own daily stats" on public.daily_stats for select using (auth.uid() = user_id);
create policy "Users can insert own daily stats" on public.daily_stats for insert with check (auth.uid() = user_id);
create policy "Users can update own daily stats" on public.daily_stats for update using (auth.uid() = user_id);

-- Deadlines
create policy "Users can view own deadlines" on public.exam_deadlines for select using (auth.uid() = user_id);
create policy "Users can insert own deadlines" on public.exam_deadlines for insert with check (auth.uid() = user_id);
create policy "Users can update own deadlines" on public.exam_deadlines for update using (auth.uid() = user_id);
create policy "Users can delete own deadlines" on public.exam_deadlines for delete using (auth.uid() = user_id);

-- Handle Profile Creation on Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, onboarding_complete)
  values (new.id, false)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile On Signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
