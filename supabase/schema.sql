-- Run this in the Supabase SQL editor.
-- Users live in Supabase's built-in auth.users table.

create table if not exists public.conversions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  tone        text not null,
  input_text  text not null,
  output_text text not null,
  created_at  timestamptz not null default now()
);

create index if not exists conversions_user_created_idx
  on public.conversions (user_id, created_at desc);

alter table public.conversions enable row level security;

drop policy if exists "own rows: select" on public.conversions;
create policy "own rows: select" on public.conversions
  for select using (auth.uid() = user_id);

drop policy if exists "own rows: insert" on public.conversions;
create policy "own rows: insert" on public.conversions
  for insert with check (auth.uid() = user_id);

drop policy if exists "own rows: delete" on public.conversions;
create policy "own rows: delete" on public.conversions
  for delete using (auth.uid() = user_id);
