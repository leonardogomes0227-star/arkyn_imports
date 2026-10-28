-- Desfaz o modo sem senha: só usuários logados editam.
drop policy if exists "demo produtos" on products;
drop policy if exists "demo settings" on settings;
drop policy if exists "demo fotos" on storage.objects;
