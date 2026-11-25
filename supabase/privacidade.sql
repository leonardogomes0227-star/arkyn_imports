-- PRIVACIDADE E SEGURANÇA — rode uma vez (já aplicado no projeto da Arkyn).
-- 1) Só o(s) e-mail(s) de administrador mexem nos dados (mesmo que alguém consiga criar conta).
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(auth.jwt() ->> 'email', '') = any (array['admin@arkyn.com'])
$$;
-- 2) Consulta/avaliação de pedido usa só os 4 últimos dígitos (o telefone inteiro some depois de 30 dias).
alter table orders add column if not exists phone_last4 text;
update orders set phone_last4 = right(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), 4) where phone_last4 is null;
-- 3) Sem cadastro de clientes nem carrinhos abandonados.
drop table if exists leads;
-- 4) Limpeza automática de dados pessoais.
create or replace function public.purge_pessoais() returns void language plpgsql security definer set search_path = public as $$
begin
  delete from orders where status = 'pending' and created_at < now() - interval '3 days';
  update orders set customer_name = 'Cliente', phone = null, address = null, notes = null
    where created_at < now() - interval '30 days' and (phone is not null or address is not null or notes is not null or customer_name <> 'Cliente');
end $$;
revoke all on function public.purge_pessoais() from public, anon, authenticated;
create extension if not exists pg_cron;
select cron.unschedule(jobid) from cron.job where jobname = 'purge-pessoais';
select cron.schedule('purge-pessoais', '0 6 * * *', 'select public.purge_pessoais()');
-- 5) Políticas: só administrador.
do $$ declare t text; begin
  foreach t in array array['products','settings','orders','coupons','reviews'] loop
    execute format('drop policy if exists "admin %s" on %I', t, t);
  end loop;
end $$;
drop policy if exists "admin produtos" on products; drop policy if exists "admin settings" on settings;
drop policy if exists "admin pedidos" on orders; drop policy if exists "admin cupons" on coupons; drop policy if exists "admin avaliacoes" on reviews;
create policy "admin produtos" on products for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin settings" on settings for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin pedidos" on orders for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin cupons" on coupons for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin avaliacoes" on reviews for all to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "fotos admin" on storage.objects;
create policy "fotos admin" on storage.objects for all to authenticated using (bucket_id = 'produtos' and is_admin()) with check (bucket_id = 'produtos' and is_admin());
