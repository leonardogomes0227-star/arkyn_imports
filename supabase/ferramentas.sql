-- Ferramentas do painel (custo/lucro e venda manual). Pode rodar mais de uma vez.
alter table products add column if not exists cost numeric;
alter table orders add column if not exists payment text;
alter table orders add column if not exists source text default 'site';
