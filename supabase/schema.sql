-- Rode no Supabase: SQL Editor > New query > Run.
create table if not exists products (
  id text primary key, name text not null, brand text not null, price numeric not null,
  stock int not null default 0, category text not null, gender text not null,
  family text, notes text[], tags text[], image text
);
create table if not exists settings (id int primary key default 1, value jsonb not null);
create table if not exists orders (
  id bigint generated always as identity primary key, customer_name text, phone text,
  delivery text, items jsonb, total numeric, status text default 'pending', created_at timestamptz default now()
);
alter table products add column if not exists tags text[];

alter table products enable row level security;
alter table settings enable row level security;
alter table orders enable row level security;

-- Público lê catálogo e configurações
drop policy if exists "leitura publica produtos" on products;
drop policy if exists "leitura publica settings" on settings;
create policy "leitura publica produtos" on products for select using (true);
create policy "leitura publica settings" on settings for select using (true);

-- Admin (usuário autenticado) escreve produtos/configurações e gerencia pedidos
drop policy if exists "admin produtos" on products;
drop policy if exists "admin settings" on settings;
drop policy if exists "admin pedidos" on orders;
create policy "admin produtos" on products for all to authenticated using (true) with check (true);
create policy "admin settings" on settings for all to authenticated using (true) with check (true);
create policy "admin pedidos" on orders for all to authenticated using (true) with check (true);

-- Fotos: bucket público, só o admin envia
insert into storage.buckets (id, name, public) values ('produtos', 'produtos', true) on conflict do nothing;
drop policy if exists "fotos leitura" on storage.objects;
drop policy if exists "fotos admin" on storage.objects;
create policy "fotos leitura" on storage.objects for select using (bucket_id = 'produtos');
create policy "fotos admin" on storage.objects for all to authenticated using (bucket_id = 'produtos') with check (bucket_id = 'produtos');
-- Importante: em Authentication > Providers > Email, desative "Allow new users to sign up"
-- e crie o usuário admin em Authentication > Users > Add user.
