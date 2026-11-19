-- Avaliações de clientes (rode uma vez no SQL Editor do Supabase)
create table if not exists reviews (
  id bigint generated always as identity primary key,
  product_id text not null, name text, rating int not null check (rating between 1 and 5),
  comment text, order_id bigint, approved boolean not null default false, created_at timestamptz default now()
);
alter table reviews enable row level security;
drop policy if exists "leitura avaliacoes aprovadas" on reviews;
drop policy if exists "admin avaliacoes" on reviews;
create policy "leitura avaliacoes aprovadas" on reviews for select using (approved);
create policy "admin avaliacoes" on reviews for all to authenticated using (true) with check (true);
-- o envio é feito pela função /api/review (só quem comprou, e a avaliação espera aprovação no painel)
