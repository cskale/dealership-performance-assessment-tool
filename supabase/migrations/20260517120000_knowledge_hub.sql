-- supabase/migrations/20260517120000_knowledge_hub.sql

create table if not exists public.user_learning_progress (
  user_id            uuid not null references auth.users on delete cascade,
  resource_id        uuid not null references public.resources on delete cascade,
  modules_completed  int  not null default 0,
  total_modules      int  not null default 1,
  started_at         timestamptz not null default now(),
  last_accessed_at   timestamptz not null default now(),
  primary key (user_id, resource_id)
);

alter table public.user_learning_progress enable row level security;

create policy "users manage own progress"
  on public.user_learning_progress
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
