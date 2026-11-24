-- =====================================================================
-- ARKYN IMPORTS — BANCO COMPLETO (um arquivo só)
-- Cole no Supabase: SQL Editor > New query > Run. Pode rodar quantas vezes quiser.
-- Substitui schema.sql, painel-completo.sql, avaliacoes.sql, leads.sql, ferramentas.sql,
-- frete.sql, fechar-painel.sql e modo-sem-senha.sql.
-- =====================================================================

-- ---------- PRODUTOS ----------
create table if not exists products (
  id text primary key,
  name text not null, brand text not null, price numeric not null check (price >= 0),
  stock int not null default 0 check (stock >= 0),
  category text not null default 'feminino', gender text not null default 'unissex',
  family text, notes text[] default '{}', tags text[] default '{}',
  image text, images text[] default '{}',
  active boolean not null default true, featured boolean not null default false,
  old_price numeric, description text, cost numeric,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
alter table products add column if not exists images text[] default '{}';
alter table products add column if not exists cost numeric;
alter table products add column if not exists created_at timestamptz default now();
alter table products add column if not exists updated_at timestamptz default now();
create index if not exists products_active_idx on products (active, category);

create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists products_touch on products;
create trigger products_touch before update on products for each row execute function touch_updated_at();

-- ---------- CONFIGURAÇÕES DA LOJA ----------
create table if not exists settings (id int primary key default 1, value jsonb not null default '{}');

-- ---------- PEDIDOS ----------
create table if not exists orders (
  id bigint generated always as identity primary key,
  customer_name text, phone text, delivery text, items jsonb, total numeric,
  status text not null default 'pending',            -- pending | paid | shipped | done | cancelled
  created_at timestamptz default now(),
  notes text, tracking text, subtotal numeric, shipping numeric, discount numeric, coupon text,
  payment text, source text default 'site', address jsonb, shipping_service text
);
alter table orders add column if not exists notes text;
alter table orders add column if not exists tracking text;
alter table orders add column if not exists subtotal numeric;
alter table orders add column if not exists shipping numeric;
alter table orders add column if not exists discount numeric;
alter table orders add column if not exists coupon text;
alter table orders add column if not exists payment text;
alter table orders add column if not exists source text default 'site';
alter table orders add column if not exists address jsonb;
alter table orders add column if not exists shipping_service text;
create index if not exists orders_created_idx on orders (created_at desc);
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_phone_idx on orders (phone);

-- ---------- CUPONS ----------
create table if not exists coupons (
  code text primary key, type text not null default 'percent',   -- percent | fixed
  value numeric not null, min_total numeric not null default 0, active boolean not null default true,
  max_uses int, uses int not null default 0, expires_at timestamptz, created_at timestamptz default now()
);

-- ---------- AVALIAÇÕES ----------
create table if not exists reviews (
  id bigint generated always as identity primary key,
  product_id text not null, name text, rating int not null check (rating between 1 and 5),
  comment text, order_id bigint, approved boolean not null default false, created_at timestamptz default now()
);
create index if not exists reviews_product_idx on reviews (product_id, approved);

-- ---------- CARRINHOS ABANDONADOS ----------
create table if not exists leads (
  phone text primary key, name text, items jsonb, total numeric,
  contacted boolean default false, updated_at timestamptz default now()
);

-- ---------- SEGURANÇA (RLS) ----------
alter table products enable row level security;
alter table settings enable row level security;
alter table orders   enable row level security;
alter table coupons  enable row level security;
alter table reviews  enable row level security;
alter table leads    enable row level security;

-- limpa o que sobrou dos modos antigos (sem senha / demonstração)
drop policy if exists "demo produtos" on products;
drop policy if exists "demo settings" on settings;
drop policy if exists "leitura publica produtos" on products;
drop policy if exists "leitura publica settings" on settings;
drop policy if exists "admin produtos" on products;
drop policy if exists "admin settings" on settings;
drop policy if exists "admin pedidos" on orders;
drop policy if exists "admin cupons" on coupons;
drop policy if exists "admin leads" on leads;
drop policy if exists "leitura avaliacoes aprovadas" on reviews;
drop policy if exists "admin avaliacoes" on reviews;

-- o público só enxerga produto visível e as configurações; avaliação só depois de aprovada
create policy "leitura publica produtos" on products for select using (active is not false);
create policy "leitura publica settings"  on settings for select using (true);
create policy "leitura avaliacoes aprovadas" on reviews for select using (approved);
-- o dono (usuário logado) gerencia tudo; pedidos, cupons e carrinhos nunca são públicos
create policy "admin produtos"  on products for all to authenticated using (true) with check (true);
create policy "admin settings"  on settings for all to authenticated using (true) with check (true);
create policy "admin pedidos"   on orders   for all to authenticated using (true) with check (true);
create policy "admin cupons"    on coupons  for all to authenticated using (true) with check (true);
create policy "admin leads"     on leads    for all to authenticated using (true) with check (true);
create policy "admin avaliacoes" on reviews for all to authenticated using (true) with check (true);
-- (as rotas /api usam a chave de serviço e ignoram o RLS: pagamento, frete, cupom, avaliação, pedido)

-- ---------- FOTOS ----------
insert into storage.buckets (id, name, public) values ('produtos', 'produtos', true) on conflict (id) do update set public = true;
drop policy if exists "fotos leitura" on storage.objects;
drop policy if exists "fotos admin" on storage.objects;
drop policy if exists "demo fotos" on storage.objects;
create policy "fotos leitura" on storage.objects for select using (bucket_id = 'produtos');
create policy "fotos admin" on storage.objects for all to authenticated using (bucket_id = 'produtos') with check (bucket_id = 'produtos');

-- ---------- DADOS INICIAIS (só entram se ainda não existirem) ----------
insert into settings (id, value) values (1, '{"whatsapp": "5567996277503", "pickupAddress": "Coxim - MS (combinar endereço pelo WhatsApp)", "installments": 1, "freeShippingFrom": 0, "shipping": [{"city": "Coxim", "price": 0}], "originCep": "79400000", "freeShippingOutsideFrom": 0, "shipHandlingFee": 0, "itemWeightG": 450, "shipRegions": [{"key": "MS", "label": "Mato Grosso do Sul", "price": 22, "days": 4}, {"key": "CO", "label": "Centro-Oeste (GO, MT, DF)", "price": 28, "days": 5}, {"key": "SE", "label": "Sudeste", "price": 32, "days": 6}, {"key": "S", "label": "Sul", "price": 34, "days": 7}, {"key": "NE", "label": "Nordeste", "price": 42, "days": 9}, {"key": "N", "label": "Norte", "price": 48, "days": 11}]}'::jsonb) on conflict (id) do nothing;

insert into products (id, name, brand, price, stock, category, gender, family, notes, tags, image, active, featured, description) values
  ('al-wataniah-attar-al-wesal-gold-100ml', 'Attar Al Wesal Gold 100ml', 'Al Wataniah', 233.9, 5, 'masculino', 'masculino', '', array['Toranja','Bergamota','Lavanda','Canela','Baunilha','Âmbar']::text[], array['doce','intenso','noite']::text[], '/produtos-net/al-wataniah-attar-al-wesal-gold-100ml.webp', true, false, 'Frescor aromático, especiarias quentes e baunilha'),
  ('lattafa-asad-elixir-100ml', 'Asad Elixir 100ml', 'Lattafa', 255.9, 5, 'masculino', 'masculino', '', array['Pimenta rosa','Açafrão','Toranja','Tabaco','Baunilha','Patchouli']::text[], array['amadeirado','especiado','intenso','noite']::text[], '/produtos-net/lattafa-asad-elixir-100ml.webp', true, false, 'Especiado, ambarado e amadeirado. Intenso e marcante.'),
  ('maison-alhambra-salvo-elixir-60ml', 'Salvo Elixir 60ml', 'Maison Alhambra', 233.9, 5, 'masculino', 'masculino', '', array['Canela','Noz-moscada','Cardamomo','Toranja','Lavanda','Âmbar']::text[], array['amadeirado','especiado','intenso','noite']::text[], '/produtos-net/maison-alhambra-salvo-elixir-60ml.webp', true, false, 'Especiarias, lavanda e madeiras. Quente e envolvente.'),
  ('lattafa-al-noble-wazeer-100ml', 'Al Noble Wazeer 100ml', 'Lattafa', 211.9, 5, 'masculino', 'masculino', '', array['Hortelã','Bergamota','Íris','Chocolate amargo','Baunilha','Sândalo']::text[], array['amadeirado','especiado','intenso','noite']::text[], '/produtos-net/lattafa-al-noble-wazeer-100ml.webp', true, false, 'Frutado e amadeirado, com nuances quentes e adocicadas.'),
  ('french-avenue-vulcan-feu-100ml', 'Vulcan Feu 100ml', 'French Avenue', 339.9, 5, 'masculino', 'masculino', '', array['Manga','Limão','Gengibre','Jasmim','Fava tonka','Cedro']::text[], array['especiado','amadeirado','noite']::text[], '/produtos-net/french-avenue-vulcan-feu-100ml.webp', true, false, 'Manga, gengibre e madeiras. Tropical, vibrante e sofisticado.'),
  ('maison-alhambra-victorioso-nero-100ml', 'Victorioso Nero 100ml', 'Maison Alhambra', 199.9, 5, 'masculino', 'masculino', '', array['Limão','Pimenta rosa','Lavanda','Incenso','Baunilha','Âmbar']::text[], array['doce','especiado','noite']::text[], '/produtos-net/maison-alhambra-victorioso-nero-100ml.webp', true, false, 'Fresco e aromático, com uma doçura suave e fundo amadeirado.'),
  ('lattafa-fakhar-extrait-gold-100ml', 'Fakhar Extrait Gold 100ml', 'Lattafa', 311.9, 5, 'masculino', 'masculino', '', array['Maçã','Gengibre','Bergamota','Lavanda','Fava tonka','Vetiver']::text[], array['doce','amadeirado','intenso','noite']::text[], '/produtos-net/lattafa-fakhar-extrait-gold-100ml.webp', true, false, 'Quente, especiado e amadeirado, com nuances florais.'),
  ('maison-alhambra-pink-eclipse-100ml', 'Pink Eclipse 100ml', 'Maison Alhambra', 322.9, 5, 'feminino', 'feminino', '', array['Bergamota','Tangerina','Pera','Jasmim','Baunilha','Almíscar']::text[], array['doce','floral','noite']::text[], '/produtos-net/maison-alhambra-pink-eclipse-100ml.webp', true, false, 'Frutado e floral, com pera, flores brancas e baunilha.'),
  ('lattafa-eclaire-100ml', 'Eclaire 100ml', 'Lattafa', 333.9, 5, 'feminino', 'feminino', '', array['Caramelo','Leite','Mel','Baunilha','Praliné','Almíscar']::text[], array['doce','dia']::text[], '/produtos-net/lattafa-eclaire-100ml.webp', true, false, 'Caramelo, leite, baunilha e pralinê. Doce e cremoso.'),
  ('lattafa-tharwah-gold-100ml', 'Tharwah Gold 100ml', 'Lattafa', 488.9, 5, 'feminino', 'feminino', '', array['Lavanda','Flor de laranjeira','Jasmim','Baunilha']::text[], array['doce','intenso','noite']::text[], '/produtos-net/lattafa-tharwah-gold-100ml.webp', true, false, 'Lavanda, flor de laranjeira, jasmim e baunilha. Elegante e envolvente.'),
  ('armaf-club-de-nuit-maleka-105ml', 'Club de Nuit Maleka 105ml', 'Armaf', 366.9, 5, 'feminino', 'feminino', '', array['Lichia','Bergamota','Pimenta rosa','Praliné','Sândalo','Âmbar']::text[], array['doce','floral','noite']::text[], '/produtos-net/armaf-club-de-nuit-maleka-105ml.webp', true, false, 'Lichia, íris e pralinê. Frutado, floral e sofisticado.'),
  ('lattafa-afeef-100ml', 'Afeef 100ml', 'Lattafa', 688.9, 5, 'feminino', 'feminino', '', array['Bergamota','Pimenta rosa','Pêssego','Jasmim','Sândalo','Âmbar']::text[], array['doce','intenso','noite']::text[], '/produtos-net/lattafa-afeef-100ml.webp', true, false, 'Pêssego, bergamota, flores brancas e pralinê. Frutado e elegante.'),
  ('ard-al-zaafaran-sahebat-al-jamal-70ml', 'Sahebat Al Jamal 70ml', 'Ard Al Zaafaran', 177.9, 5, 'feminino', 'feminino', '', '{}'::text[], array['doce','floral','dia']::text[], '/produtos-net/ard-al-zaafaran-sahebat-al-jamal-70ml.webp', true, false, 'Oriental, elegante e envolvente. Uma fragrância de personalidade, para quem aprecia aromas marcantes.'),
  ('lattafa-yara-rose-100ml', 'Yara Rose 100ml', 'Lattafa', 255.9, 5, 'feminino', 'feminino', '', '{}'::text[], array['doce','floral','dia']::text[], '/produtos-net/lattafa-yara-rose-100ml.webp', true, false, 'Doce, cremoso e floral.'),
  ('paris-corner-marshmallow-blush-100ml', 'Marshmallow Blush 100ml', 'Paris Corner', 311.9, 5, 'feminino', 'feminino', '', array['Morango','Framboesa','Chantilly','Marshmallow']::text[], array['doce','floral','dia']::text[], '/produtos-net/paris-corner-marshmallow-blush-100ml.webp', true, false, 'Morango, framboesa, chantilly e marshmallow. Doce e cremoso.'),
  ('lattafa-dalal-100ml', 'Dalal 100ml', 'Lattafa', 522.9, 5, 'feminino', 'feminino', '', array['Tangerina','Maçã','Jasmim','Baunilha','Almíscar']::text[], array['doce','floral','intenso','noite']::text[], '/produtos-net/lattafa-dalal-100ml.webp', true, false, 'Oriental, envolvente e sofisticado. Uma fragrância marcante para quem gosta de perfumes elegantes.'),
  ('lattafa-atheeri-100ml', 'Atheeri 100ml', 'Lattafa', 588.9, 5, 'feminino', 'feminino', '', array['Maracujá','Orquídea','Jasmim','Baunilha','Madeira âmbar']::text[], array['doce','intenso','noite']::text[], '/produtos-net/lattafa-atheeri-100ml.webp', true, false, 'Floral delicado, com orquídea, jasmim e baunilha suave.'),
  ('lattafa-body-splash-mayar', 'Body Splash Mayar', 'Lattafa', 122.9, 5, 'splash', 'unissex', '', '{}'::text[], '{}'::text[], '/produtos-net/lattafa-body-splash-mayar.webp', true, false, 'Frutado, floral e levemente adocicado.'),
  ('lattafa-body-splash-yara-tous', 'Body Splash Yara Tous', 'Lattafa', 122.9, 5, 'splash', 'unissex', '', array['Manga','Coco','Flores brancas']::text[], '{}'::text[], '/produtos-net/lattafa-body-splash-yara-tous.webp', true, false, 'Tropical e cremoso, com manga, coco e flores brancas.'),
  ('lattafa-body-splash-noble-blush', 'Body Splash Noble Blush', 'Lattafa', 122.9, 5, 'splash', 'unissex', '', '{}'::text[], '{}'::text[], '/produtos-net/lattafa-body-splash-noble-blush.webp', true, false, 'Cremoso, delicado e adocicado.'),
  ('lattafa-body-splash-fakhar', 'Body Splash Fakhar', 'Lattafa', 122.9, 5, 'splash', 'unissex', '', '{}'::text[], '{}'::text[], '/produtos-net/lattafa-body-splash-fakhar.webp', true, false, 'Floral elegante e levemente adocicado.'),
  ('celimax-the-vita-a-retinal-shot-15ml', 'The Vita-A Retinal Shot 15ml', 'Celimax', 166.9, 5, 'skincare', 'unissex', '', '{}'::text[], '{}'::text[], '/produtos-net/celimax-the-vita-a-retinal-shot-15ml.webp', true, false, 'Tratamento facial com retinal, desenvolvido para cuidados com a textura e aparência da pele.')
on conflict (id) do nothing;
