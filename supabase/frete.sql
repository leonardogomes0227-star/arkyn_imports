-- Endereço de entrega e serviço de frete nos pedidos (rode uma vez no SQL Editor do Supabase)
alter table orders add column if not exists address jsonb;
alter table orders add column if not exists shipping_service text;
