# Redesign Arkyn Imports: prompt em etapas

Referência visual: `docs/mockup/home-desktop.png`, `home-completa.png`, `home-celular.png` (código em `docs/mockup/html/index.html`).
Regra de ouro: **uma etapa por vez**. Só começa a próxima depois de você conferir o critério de "pronto" e dar OK.

## Prompt-base (cole no início de CADA etapa)

```
Você está redesenhando a loja Arkyn Imports (React + Vite + TS, Supabase, Mercado Pago em /api).
NÃO mexer em: checkout, api/*, supabase/*, painel /admin, lógica de store.tsx, cupom, frete.
Mexer só no visual e na estrutura das páginas públicas.

DIREÇÃO VISUAL "Obsidiana com rota verde-lima"
- Fundo: preto #000002, camadas #0b0b0c e #161617, grafite #424242.
- Cor-assinatura: verde-lima #C7F401 (claro #DEFF78). Usar SÓ em: botão principal, preço em destaque, selo, linha da rota. Nunca em blocos grandes nem texto corrido.
- Metal: prata #C6C6C6 e branco #FFFFFF. Sem dourado (era do tema de Natal).
- Tipografia: Cormorant Garamond 600 grande nos títulos e nomes de perfume; Manrope no corpo; rótulos pequenos em caixa-alta com letter-spacing .2em.
- Ideia própria da marca: o avião e a trajetória verde da logo viram elemento de layout. Uma linha-rota verde cruza o hero atrás do frasco e termina em um avião prateado. Cartões de produto lembram cartão de embarque (picote tracejado, "Arkyn Air · Embarque 01", Origem → Coxim – MS).
- Produto é o centro: frasco grande, palavra gigante em contorno cinza atrás (ex.: NERO), reflexo/luz verde sutil no chão.
- Botão principal: lima, texto preto, canto inferior direito cortado.
- Logo: usar SEMPRE os arquivos aprovados (ARKYN-Imports/07-logo-transparente-2508.png ou SVG 11 branco). Não redesenhar, não adicionar adornos, não esticar. Margem livre ao redor.
- Mobile-first. Conferir em 390px, 768px e 1440px.

PROIBIDO (cara de IA): fileira de 3 cards com ícone em quadrado colorido, gradientes decorativos, brilhos aleatórios, linhas finas em todo canto, depoimentos ou números inventados, travessão em frase curta, "não é X, é Y".
TEXTOS: usar só fatos do catálogo (seed.ts). Onde faltar dado, deixar [FALTA: ...] visível no código e me avisar. Não inventar origem, lote, prazo, avaliação.
Ao terminar: rodar `npm run build`, abrir a página, tirar captura em 390 e 1440 e me mostrar. Não dizer "pronto" sem isso.
```

---

## ETAPA 1: Fundação (sem mudança visível grande)

```
Objetivo: unificar o CSS e trocar os tokens para a paleta nova.
1. Criar src/theme.css com todos os tokens (cores, tipografia, espaço, movimento) da direção acima.
2. Migrar os componentes base (botões, campos, header, footer, toasts, skeleton) de design.css para usar os tokens novos.
3. Colocar o tema de Natal (natal.css, Festive.tsx, ChristmasBand) atrás de uma chave `SEASON = 'none' | 'natal'` em um arquivo de config, padrão 'none'. Não apagar o código.
4. Trocar a logo do cabeçalho e do rodapé pela aprovada (sem aro dourado, sem gorro). Copiar para public/ e usar webp otimizado.
5. Não mexer nas páginas ainda.
Pronto quando: build passa, site abre preto com texto branco, logo verde-lima correta no topo, nada quebrado nas páginas existentes.
```

## ETAPA 2: Cabeçalho, rodapé, intro

```
1. Cabeçalho escuro, logo à esquerda, menu central em caixa-alta (Início, Masculinos, Femininos, Coleções, Quiz), à direita Buscar, Favoritos, Sacola com contador em lima. Sublinhado lima no item ativo. Fixo ao rolar, encolhe a logo.
2. Faixa de topo fina com "Retirada grátis em Coxim – MS" (dado que já existe no site).
3. Rodapé: logo, links, WhatsApp e Instagram que já existem no settings, formas de pagamento (Pix e cartão via Mercado Pago). Sem texto inventado.
4. Intro de abertura (já existe Intro.tsx): refazer com o avião cruzando e a trajetória lima desenhando a logo. Máx. 2,5 s, botão "Pular", aparece só na primeira visita da sessão, respeita prefers-reduced-motion.
Pronto quando: cabeçalho e rodapé corretos em 390px e 1440px, menu mobile abre e fecha, intro pula com um toque.
```

## ETAPA 3: Hero da home

```
Recriar BannerHero/CampaignHero conforme docs/mockup/home-desktop.png.
- Tela cheia. Um perfume por vez (carrossel com 4 itens: os recortes de /public/hero), troca automática lenta com pausa ao passar o mouse e setas.
- Palavra gigante em contorno atrás (ex.: NERO), frasco grande com leve rotação, sombra, luz lima no chão.
- Linha-rota lima SVG atrás do frasco terminando em avião prateado. Animar o desenho da linha na entrada (stroke-dashoffset).
- Esquerda: marca, nome (Cormorant grande), 1 linha de descrição, botão "Comprar agora" + preço. Direita: saída, coração e fundo com as notas de seed.ts.
- Faixa inferior: Pix ou cartão, retirada grátis, atendimento no WhatsApp.
- Mobile: frasco no topo, texto embaixo, notas escondidas.
- Dados vêm do store (nome, preço, notas). Sem preço fixo no código.
Pronto quando: troca de slide funciona, botão leva à página do produto, nenhum texto sobrepõe o frasco em 390px.
```

## ETAPA 4: Coleção em cartões de embarque + seção de notas

```
1. Substituir "faixa de categorias", "Os mais queridos" e os 3 banners por UMA vitrine de 4 a 5 cartões estilo embarque (docs/mockup/home-completa.png): fundo #0b0b0c, picote tracejado, "Arkyn Air · Embarque 0X", marca, nome, preço Cormorant, "Adicionar".
2. Título da seção: "Importados com pronta entrega em Coxim". Texto de apoio marcado [FALTA] até o lojista aprovar.
3. Seção de notas (pirâmide) com um perfume em destaque: saída, coração, fundo.
4. Manter "Escolha pelo cheiro" e o quiz, só com o visual novo.
Pronto quando: cartões alinhados em 390 (2 colunas) e 1440 (4 colunas), produto sem foto não quebra, adicionar à sacola funciona.
```

## ETAPA 5: Página de produto

```
Frasco grande com zoom, nome em Cormorant, notas em 3 níveis, Pix e parcelamento visíveis (dados do settings), botão de compra fixo no rodapé em mobile, "combina com" usando tags/notas já existentes.
Pronto quando: comprar funciona de ponta a ponta no celular, produto esgotado mostra aviso e não deixa comprar.
```

## ETAPA 6: Catálogo, sacola, checkout (só visual)

```
Aplicar tema nos filtros, cartões do catálogo, CartDrawer e Cart. Barra de progresso até frete grátis na sacola (usa settings.freeShippingFrom). NÃO alterar fluxo de pagamento.
Pronto quando: pedido de teste chega ao Mercado Pago como antes.
```

## ETAPA 7: Acabamento e lançamento

```
Performance (LCP < 2,5 s no celular), imagens webp responsivas, foco visível, contraste, SEO local, meta e og com a identidade nova, 404 no tema. Rodar o checklist de lançamento, publicar em preview na Vercel e só depois no domínio.
Pronto quando: Lighthouse mobile >= 85 em performance, tudo conferido em 390/768/1440, plano de volta atrás definido (branch anterior mantida).
```

---

## Pendências que dependem de você

- [FALTA] Texto de apoio da vitrine ("Importados com pronta entrega em Coxim") e qualquer menção a origem dos perfumes: confirmar com o lojista.
- [ATENÇÃO] O recorte `public/hero/lattafa-asad-elixir-100ml.webp` mostra o **Fakhar Lattafa (prata)**, não o Asad Elixir. O produto "Asad Elixir" está com a foto errada no catálogo.
- Fotos de campanha (estilo Pink Eclipse) só existem para alguns perfumes; os recortes atuais têm borda irregular embaixo. Idealmente regerar os recortes limpos.
