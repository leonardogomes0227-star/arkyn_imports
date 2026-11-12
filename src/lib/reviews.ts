/**
 * AVALIAÇÕES DE EXEMPLO.
 * Não são depoimentos coletados de clientes. Substitua este arquivo
 * pelos relatos reais (nome, cidade, texto e, se quiser, o id do produto).
 */
export interface Review {
  id: string
  name: string
  city: string
  stars: number
  text: string
  productId?: string
}

export const REVIEWS: Review[] = [
  { id: 'r1', name: 'Camila', city: 'Campo Grande', stars: 5, productId: 'lattafa-eclaire-100ml', text: 'O Eclaire chegou lacrado e o cheiro é exatamente aquele doce de baunilha que eu queria. Fixou o dia inteiro na roupa.' },
  { id: 'r2', name: 'Rafael', city: 'São Paulo', stars: 5, productId: 'lattafa-asad-elixir-100ml', text: 'Asad Elixir para a noite. Abre especiado e fica quente, com baunilha. Pedi pelo WhatsApp e o atendimento foi rápido.' },
  { id: 'r3', name: 'Juliana', city: 'Curitiba', stars: 5, productId: 'lattafa-yara-rosa-100ml', text: 'Comprei o Yara Rosa de presente. Veio bem embalado e o Pix saiu na hora. Ela amou.' },
  { id: 'r4', name: 'Diego', city: 'Goiânia', stars: 4, productId: 'armaf-club-de-nuit-intense-man-edt-105ml', text: 'Club de Nuit Intense é potente. Duas borrifadas bastam. O frasco de 105 ml vale mais do que parece.' },
  { id: 'r5', name: 'Ana', city: 'Recife', stars: 5, productId: 'french-avenue-liquid-brun-100ml', text: 'Liquid Brun é o gourmand de canela que eu procurava. Chegou para o Nordeste bem protegido, sem vazamento.' },
  { id: 'r6', name: 'Bruno', city: 'Coxim', stars: 5, text: 'Retirei na loja no mesmo dia. Dá para sentir o perfume antes de levar, e o pessoal indica sem empurrar o mais caro.' },
  { id: 'r7', name: 'Larissa', city: 'Belo Horizonte', stars: 5, productId: 'maison-alhambra-pink-eclipse-100ml', text: 'Pink Eclipse é floral doce na medida. Parcelei no cartão e o código de rastreio veio no WhatsApp.' },
  { id: 'r8', name: 'Mateus', city: 'Manaus', stars: 4, text: 'Primeira compra com a Arkyn. Perfume original, lacrado, e o preço no Pix ficou melhor que o do cartão.' },
]
