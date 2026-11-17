-- 萌寵食堂：Supabase 雲端存檔資料表與 RLS 安全規則
-- 請在 Supabase Dashboard -> SQL Editor 貼上並執行此腳本

create table if not exists public.pet_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  save_data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.pet_saves enable row level security;

-- 使用者只能讀取自己的雲端存檔
create policy "Users can read own pet save"
  on public.pet_saves
  for select
  to authenticated
  using (auth.uid() = user_id);

-- 使用者只能新增自己的雲端存檔
create policy "Users can insert own pet save"
  on public.pet_saves
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 使用者只能更新自己的雲端存檔
create policy "Users can update own pet save"
  on public.pet_saves
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 使用者只能刪除自己的雲端存檔
create policy "Users can delete own pet save"
  on public.pet_saves
  for delete
  to authenticated
  using (auth.uid() = user_id);
