# Produto novo com a mesma estética da loja

Objetivo: quando o dono cadastrar um perfume novo no banco de dados (painel), ele aparece no site igual aos outros: frasco sem fundo, no bilhete creme, com sombra leve.

## Como funciona (já está no site)

1. **No painel, ao enviar a foto**, vem marcada a opção **"Tirar o fundo automaticamente"**. O próprio navegador do dono tira o fundo da foto, sem custo e sem serviço pago.
2. O painel **corta as sobras em volta**, padroniza o tamanho (máx. 1200 px) e salva em `webp` na pasta `recortes/` do banco de imagens.
3. Antes de salvar o produto, o painel mostra **"Como vai aparecer na loja"**: a foto já no fundo creme do bilhete.
4. **No site**, foto vinda de `recortes/` é tratada igual às fotos feitas à mão: entra no leque do começo, no "Descubra o seu perfume", na vitrine, na sacola e na página do produto.
5. **Se a remoção de fundo falhar** (internet fraca, foto estranha), o painel envia a foto original e avisa. No site, foto com **fundo branco** se mistura ao papel creme e não aparece quadrado branco.

## Regras para a foto (para o dono)

- Foto do **frasco de frente**, com ou sem a caixa, **fundo branco ou liso**.
- Produto **inteiro na foto**, sem cortar a tampa nem a base.
- Sem marca d'água, texto ou outros produtos junto.
- Tamanho bom: a partir de 800 px.
- Foto de fornecedor (site oficial da marca) costuma dar o melhor resultado.

## Para o produto aparecer em todos os lugares

- **Categoria** (masculino, feminino, body splash, skincare).
- **Perfil** (doce, amadeirado, floral, especiado, fresco; dia ou noite): é o que alimenta as famílias, o "Descubra o seu perfume" e o quiz.
- **Notas** separadas por vírgula: aparecem no bilhete e na pirâmide olfativa.
- **Estoque** maior que zero, e **Visível na loja** marcado.
- **Destaque na Home**: marca o produto como destaque, e ele aparece primeiro no leque do começo.

## O que falta testar quando o banco estiver criado

- Enviar uma foto de teste pelo painel com o banco ligado (bucket `produtos` público) e conferir o recorte.
- A primeira remoção de fundo baixa o modelo de recorte (alguns MB) no navegador do dono. Depois fica guardado e é mais rápido.
