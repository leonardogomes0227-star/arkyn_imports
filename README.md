# Arkyn Imports

E-commerce de perfumes (React + Vite + TS, Supabase opcional, Mercado Pago via funções Vercel em `/api`).

- `src/lib/seed.ts`: produtos e configurações (frete, WhatsApp). Funciona sem Supabase.
- `public/logo.jpg`: logo (se ausente, só o texto é exibido). Fotos em `public/produtos/` + campo `image`.
- `supabase/schema.sql`: tabelas. Para usar o banco, insira os produtos na tabela `products` e uma linha em `settings` (`id=1`, `value` = objeto Settings).
- Variáveis: veja `.env.example` (configurar na Vercel).
- `npm install && npm run dev`

## Painel admin (/admin)
1. Crie o projeto no Supabase e rode `supabase/schema.sql` no SQL Editor.
2. Authentication > Providers > Email: desative "Allow new users to sign up"; em Users, crie o usuário admin.
3. Na Vercel, cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (e as variáveis do `.env.example`) e faça Redeploy.
4. Entre em `/admin`, aba Produtos > "Importar produtos de exemplo"; depois edite preço, estoque e fotos.

## Sem banco (modo vitrine)

Sem `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`, o site abre com os produtos de exemplo de `src/lib/seed.ts`. Pedidos, clientes e admin só salvam dados quando o Supabase está configurado.
