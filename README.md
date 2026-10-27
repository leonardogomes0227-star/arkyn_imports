# Arkyn Imports

E-commerce de perfumes (React + Vite + TS, Supabase opcional, Mercado Pago via funções Vercel em `/api`).

- `src/lib/seed.ts`: produtos e configurações (frete, WhatsApp). Funciona sem Supabase.
- `public/logo.jpg`: logo (se ausente, só o texto é exibido). Fotos em `public/produtos/` + campo `image`.
- `supabase/schema.sql`: tabelas. Para usar o banco, insira os produtos na tabela `products` e uma linha em `settings` (`id=1`, `value` = objeto Settings).
- Variáveis: veja `.env.example` (configurar na Vercel).
- `npm install && npm run dev`
