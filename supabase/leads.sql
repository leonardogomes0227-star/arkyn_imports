-- Carrinhos abandonados (rode uma vez no SQL Editor do Supabase)
create table if not exists leads (
  phone text primary key, name text, items jsonb, total numeric,
  contacted boolean default false, updated_at timestamptz default now()
);
alter table leads enable row level security;
drop policy if exists "admin leads" on leads;
create policy "admin leads" on leads for all to authenticated using (true) with check (true);
