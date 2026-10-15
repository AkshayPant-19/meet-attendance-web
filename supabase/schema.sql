-- ============================================================
-- Meet Attendance — Supabase schema
-- Run this in the Supabase dashboard: SQL Editor -> New query.
-- ============================================================

-- ---------- students (roster) ----------
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create index if not exists students_user_id_idx on public.students (user_id);

-- ---------- sessions ----------
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Untitled session',
  platform text,
  meeting_code text,
  started_at timestamptz,
  ended_at timestamptz,
  present_count int not null default 0,
  absent_count int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists sessions_user_id_idx on public.sessions (user_id);

-- ---------- attendance_records ----------
create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  student_name text not null,
  status text not null check (status in ('present', 'absent')),
  join_time timestamptz,
  leave_time timestamptz,
  duration_ms bigint,
  created_at timestamptz not null default now()
);
create index if not exists attendance_records_session_id_idx
  on public.attendance_records (session_id);

-- ---------- api_tokens (for the extension sync endpoint) ----------
create table if not exists public.api_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null default 'Default',
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
create index if not exists api_tokens_user_id_idx on public.api_tokens (user_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.students enable row level security;
alter table public.sessions enable row level security;
alter table public.attendance_records enable row level security;
alter table public.api_tokens enable row level security;

-- students: owner-only
drop policy if exists "students_select_own" on public.students;
create policy "students_select_own" on public.students
  for select using (auth.uid() = user_id);
drop policy if exists "students_modify_own" on public.students;
create policy "students_modify_own" on public.students
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- sessions: owner-only
drop policy if exists "sessions_select_own" on public.sessions;
create policy "sessions_select_own" on public.sessions
  for select using (auth.uid() = user_id);
drop policy if exists "sessions_modify_own" on public.sessions;
create policy "sessions_modify_own" on public.sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- attendance_records: owner-only, via parent session
drop policy if exists "records_select_own" on public.attendance_records;
create policy "records_select_own" on public.attendance_records
  for select using (
    exists (
      select 1 from public.sessions s
      where s.id = attendance_records.session_id and s.user_id = auth.uid()
    )
  );
drop policy if exists "records_modify_own" on public.attendance_records;
create policy "records_modify_own" on public.attendance_records
  for all using (
    exists (
      select 1 from public.sessions s
      where s.id = attendance_records.session_id and s.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.sessions s
      where s.id = attendance_records.session_id and s.user_id = auth.uid()
    )
  );

-- api_tokens: owner-only for read/manage. The sync endpoint uses the
-- service-role key (which bypasses RLS), so no public access is needed here.
drop policy if exists "tokens_select_own" on public.api_tokens;
create policy "tokens_select_own" on public.api_tokens
  for select using (auth.uid() = user_id);
drop policy if exists "tokens_modify_own" on public.api_tokens;
create policy "tokens_modify_own" on public.api_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
