-- Migração do painel completo. Rode no SQL Editor (pode rodar mais de uma vez).
alter table products add column if not exists active boolean default true;
alter table products add column if not exists featured boolean default false;
alter table products add column if not exists old_price numeric;
alter table products add column if not exists description text;

alter table orders add column if not exists notes text;
alter table orders add column if not exists tracking text;
alter table orders add column if not exists subtotal numeric;
alter table orders add column if not exists shipping numeric;
alter table orders add column if not exists discount numeric;
alter table orders add column if not exists coupon text;

create table if not exists coupons (
  code text primary key,
  type text not null default 'percent',      -- percent | fixed
  value numeric not null,
  min_total numeric not null default 0,
  active boolean not null default true,
  max_uses int,
  uses int not null default 0,
  expires_at timestamptz,
  created_at timestamptz default now()
);
alter table coupons enable row level security;
drop policy if exists "admin cupons" on coupons;
create policy "admin cupons" on coupons for all to authenticated using (true) with check (true);
-- clientes não leem cupons direto: a validação é feita pela função /api/coupon (service key)
