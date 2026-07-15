-- 在 Supabase Dashboard → SQL Editor 執行一次即可
create table if not exists boards (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table boards enable row level security;

-- 純前端、無登入:anon 可讀寫。
-- 取捨:拿到 anon key(在 JS bundle 裡)的人技術上可讀寫整張表,
-- 這張表只放這個家庭看板、內容不含敏感個資,可接受。
create policy "anon select boards" on boards for select using (true);
create policy "anon insert boards" on boards for insert with check (true);
create policy "anon update boards" on boards for update using (true);
