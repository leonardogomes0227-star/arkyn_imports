create table products (
  id text primary key, name text not null, brand text not null, price numeric not null,
  stock int not null default 0, category text not null, gender text not null,
  family text, notes text[], image text
);
create table settings (id int primary key default 1, value jsonb not null);
create table orders (
  id bigint generated always as identity primary key, customer_name text, phone text,
  delivery text, items jsonb, total numeric, status text default 'pending', created_at timestamptz default now()
);
alter table products enable row level security;
alter table settings enable row level security;
alter table orders enable row level security;
create policy "leitura publica produtos" on products for select using (true);
create policy "leitura publica settings" on settings for select using (true);
-- pedidos: só a service key (funções /api) escreve/lê.
