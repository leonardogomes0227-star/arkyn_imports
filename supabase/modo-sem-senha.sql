-- TEMPORÁRIO: libera editar produtos, configurações e fotos sem login.
-- Pedidos continuam protegidos (exigem login). Para fechar de novo, rode fechar-painel.sql.
drop policy if exists "demo produtos" on products;
drop policy if exists "demo settings" on settings;
drop policy if exists "demo fotos" on storage.objects;
create policy "demo produtos" on products for all to anon using (true) with check (true);
create policy "demo settings" on settings for all to anon using (true) with check (true);
create policy "demo fotos" on storage.objects for all to anon using (bucket_id = 'produtos') with check (bucket_id = 'produtos');
