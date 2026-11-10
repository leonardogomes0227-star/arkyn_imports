# Prompt para o ChatGPT — Remasterização do site Arkyn Imports

> Copie TUDO abaixo da linha e cole no ChatGPT.

---

## PAPEL

Você é um diretor de arte sênior + estrategista de e-commerce de perfumaria, especialista em lojas de alta conversão no Brasil. Vou te passar o briefing de uma remasterização COMPLETA de uma loja de perfumes. Sua missão é **analisar criticamente o briefing, apontar o que está fraco, e devolver uma versão melhorada e ampliada**, com ideias novas de visual, conteúdo, animação e ferramentas. Seja direto, opinativo e específico. Nada de resposta genérica.

## CONTEXTO

- **Loja:** Arkyn Imports — perfumes importados, foco em árabes (Lattafa, Armaf, Maison Alhambra, French Avenue, Ard Al Zaafaran, Al Wataniah) e alguns nicho/internacionais. Vende no Brasil, pagamento Pix/cartão (Mercado Pago), pedido também por WhatsApp.
- **Stack atual:** React 18 + Vite + TypeScript, react-router, Supabase (opcional) para pedidos/clientes/cupons, painel admin em `/admin`, deploy na Vercel. Fontes atuais: Cormorant Garamond + DM Sans. Paleta atual: fundo bege `#f5f2ec`, preto `#0f0f10`, dourado `#a8822c`.
- **Páginas existentes:** Home (hero slider, seções, faixa), Catálogo, Produto, Carrinho/Checkout, Quiz de perfume, Admin, 404.

## O PROBLEMA (palavras do cliente)

1. O site parece **feito por IA**: genérico, limpo demais, "template".
2. Está **morto / estático**: pouca vida, pouco movimento, nada que prenda.
3. As **fotos dos perfumes estão sem graça** (frasco em fundo liso, sem clima, sem desejo).
4. É **simples demais**. Quando o visitante bate o olho, não sente imediatamente "aqui se vende perfume árabe, e é desejável".
5. O cliente quer um site **vivo, impactante, que prenda a atenção**, com banners fortes.

## REFERÊNCIAS (o cliente pediu algo na linha destes dois)

**1) rfparfums.com.br** (WooCommerce) — o que observei:
- Faixa de topo com cupom `PRIMEIRACOMPRA`, 6x sem juros e 5% no Pix.
- Banner principal grande; 3 cards de benefício logo abaixo (parcelamento, cupom, Pix).
- Menu por categoria bem claro (Árabes, Originais, Decants, Caixa Tester, Inspirações Fem/Masc, Coreanos, Maquiagem).
- Muitas prateleiras de produto seguidas: **Decants, Novidades, Promoções, Mais vendidos**, cada uma com 6 cards.
- Cards com **badge de desconto (-22%)**, preço "de/por", preço no Pix, parcelas, seletor de tamanho, favoritos, botão Comprar; "fora de estoque" sinalizado.
- Bloco "Sobre nós" curto e emocional ("Perfumar vidas…").
- Login/conta, favoritos, drawer de carrinho, selos de pagamento e segurança no rodapé.

**2) lattafabrasil.com** (VTEX) — o que observei:
- Barra de topo rotativa: **frete grátis acima de R$ 499**, 5% no Pix, cupom `primeiracompra`, até 12x.
- **Carrossel de banners em tela cheia** (lançamentos e campanhas sazonais).
- **"Comprar por categorias"** com cards de imagem (Kits, Feminino, Masculino, Compartilhável, Body Splash, linhas da marca).
- Menu enxuto: Novidades, Mais Vendidos, Feminino, Masculino, Compartilhável, Kits.
- Sacola lateral, favoritos, conta.

⚠️ Eu só consegui ler o texto/estrutura dessas páginas, **não o visual** (cores, tipografia, estilo de foto, animações). Não invente detalhes visuais delas como se fossem fatos; trate-as como direção de estrutura e use sua própria criatividade para o visual.

## O QUE EU QUERO QUE VOCÊ ENTREGUE

### 1. Diagnóstico (curto)
Em até 10 linhas: por que um site de perfume vira "cara de IA" e "morto" (ex.: simetria excessiva, cards todos iguais, tipografia genérica, dourado+bege clichê, fotos de catálogo, ausência de textura/movimento). Diga o que **você** apostaria para fugir disso.

### 2. Direção de arte (escolha UMA e defenda)
Proponha 3 direções visuais distintas e **recomende uma**. Para cada uma: conceito, paleta (hex), par de fontes (Google Fonts), tipo de textura/ruído/grão, estilo de ícones, estilo de botão, tom de voz. Sugestões de território (pode propor outros): *noite árabe luxuosa (preto profundo, âmbar, cobre, fumaça)*, *deserto quente editorial (terracota, areia, sol)*, *joalheria moderna (esmeralda, ouro velho, mármore)*. Evite o combo bege + dourado fino + serifa, que é o que temos hoje.

### 3. Hero / banners (prioridade máxima)
- Carrossel de banners em tela cheia, **3 a 5 slides**, com: campanha, lançamento, kit/presente, frete grátis/Pix.
- Para cada slide: composição, texto (headline curta + sub + CTA), e **como anima** (parallax, zoom lento, fumaça/partículas, revelação de texto, troca de frasco).
- Versão mobile separada (vertical), não só o desktop encolhido.
- Sugira como produzir as imagens: prompts de imagem (para Midjourney/Gemini/GPT image) para banners e para as fotos de produto em clima (frasco sobre pedra/seda/areia, luz lateral quente, fumaça, gotas, reflexos, especiarias, flores), mantendo o frasco **fiel ao real** (não deformar rótulo). Diga também o que fazer com foto de fornecedor que já temos (remover fundo, sombra, reflexo no chão, fundo gradiente por perfume).

### 4. Estrutura da Home (de cima para baixo)
Monte o mapa completo, seção por seção, com objetivo de cada uma. Deve cobrir no mínimo:
- Barra de topo rotativa (frete grátis a partir de R$ X, Pix 5%, cupom, 6x).
- Cabeçalho (busca visível, conta, favoritos, sacola com contador; fixo e que reduz ao rolar).
- Hero/banners.
- Faixa de benefícios.
- Categorias com cards de imagem (Árabes, Masculino, Feminino, Compartilhável, Kits, Decants/Miniaturas, Mais vendidos).
- Prateleiras: Lançamentos, Mais vendidos, Promoções, Decants (carrossel com setas e swipe).
- "Compre por família olfativa / ocasião / clima" (amadeirado, doce, fresco, oud, gourmand).
- Quiz "Qual perfume é o seu?" em destaque (já existe, deve ficar chamativo).
- Seção de marcas (logos Lattafa, Armaf, Alhambra…).
- Prova social: avaliações, fotos de clientes, contador de pedidos, Instagram.
- Bloco "Por que comprar com a gente" (original, lacrado, envio, troca) + selos.
- Kits/presentes (Dia dos Namorados, Natal, Dia dos Pais).
- Newsletter/WhatsApp VIP com cupom.
- Rodapé completo.
Diga o que **cortar** se estiver demais.

### 5. Cartão de produto e página de produto
- Cartão: badge de desconto, "de/por", preço no Pix, parcelas, tamanhos (ml), favorito, **troca de imagem no hover**, compra rápida, selo "últimas unidades", notas olfativas em ícones.
- Página de produto: galeria com zoom, **pirâmide olfativa visual (topo/coração/fundo)**, medidores de fixação/projeção/estação/ocasião, "inspirado em/semelhante a" (se for legal e permitido), frete por CEP, comprar no WhatsApp, produtos relacionados, "compre junto", avaliações, FAQ, barra de compra fixa no mobile.

### 6. Movimento e interação (para ficar "vivo")
Liste animações concretas e **onde** entram, com critério de desempenho: revelação ao rolar, parallax leve, marquee de marcas, hover com elevação/zoom, contador animado, transição de página, microinterações no botão de comprar, sacola que "recebe" o produto voando até ela, skeletons de carregamento. Regras: respeitar `prefers-reduced-motion`, não prejudicar LCP/CLS, funcionar bem em celular de entrada. Diga o que **não** fazer (excesso que deixa pesado/brega).

### 7. Ferramentas e funcionalidades novas (traga ideias que eu não pedi)
Avalie e priorize (impacto × esforço), por exemplo:
- Barra de progresso "faltam R$ X para frete grátis" na sacola.
- Cupom de primeira compra automático/pop-up de saída (sem ser invasivo).
- Compare perfumes lado a lado; lista de desejos; "avise quando voltar ao estoque".
- Busca com sugestão e filtros (marca, família, gênero, faixa de preço, ml).
- Kits montáveis ("monte seu kit de 3 decants").
- Programa de pontos/indicação; assinatura mensal de decants.
- Prova social ao vivo ("alguém de SP comprou há 12 min") — avalie se é honesto, senão proponha alternativa.
- Rastreio de pedido, recompra em 1 clique, carrinho abandonado por WhatsApp/e-mail.
- Pixel/GA4/Meta CAPI, SEO (schema de produto), páginas de coleção indexáveis.
- Painel admin: gerar banners/ofertas por campanha, destaque de produtos, estoque baixo, relatório de vendas, etiqueta/frete.
Marque o que cabe no **MVP** e o que fica para a fase 2.

### 8. Copy
Escreva, para a home: 5 headlines de banner, microcopy de CTA, textos da faixa de benefícios, "Sobre nós", chamada do quiz e 3 textos de categoria. Tom brasileiro, desejo e confiança, **sem clichê de IA** ("eleve sua experiência", "descubra a essência", "mergulhe", "jornada sensorial"). Frases curtas, concretas, com personalidade.

### 9. Plano de execução
Divida em **etapas pequenas** (cada uma cabe em um prompt para uma ferramenta de código com limite diário de créditos): 1) identidade visual e tokens, 2) header + topbar, 3) hero/banners, 4) categorias e prateleiras, 5) card e página de produto, 6) sacola/checkout, 7) seções de prova social/quiz/newsletter, 8) animações e performance, 9) SEO/analytics, 10) revisão final. Para cada etapa: objetivo, arquivos prováveis, critério de pronto.

### 10. Checklist anti-"cara de IA"
Uma lista de 15 itens verificáveis que eu possa usar para reprovar uma tela (ex.: "há ao menos uma seção que quebra a grade", "nenhuma seção repete o mesmo layout da anterior", "imagens têm clima, não só fundo branco", "tipografia tem um momento de ousadia", "nenhum texto genérico").

## REGRAS

- Responda em **português do Brasil**.
- Seja específico: valores, hex, nomes de fonte, tamanhos, tempos de animação (ms), breakpoints.
- Quando discordar de algo do briefing, diga e proponha a alternativa.
- Priorize **conversão + desejo** acima de "ficar bonito".
- Mobile primeiro: a maior parte do tráfego é celular.
- Não invente dados (avaliações, números de vendas, depoimentos). Se sugerir prova social, que seja real/coletável.
- Cuidado com direitos: não copiar imagens nem texto dos sites de referência; usar só como inspiração estrutural.
- No final, devolva **uma versão consolidada do prompt de construção** (pronta para eu colar em outra IA, o Gemini, para executar), já incorporando as suas melhorias.

Antes de começar, se faltar alguma informação crítica, faça no máximo 5 perguntas objetivas; senão, comece direto.
