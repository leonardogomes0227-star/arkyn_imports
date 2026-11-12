/**
 * AVALIAÇÕES DE EXEMPLO.
 * Não foram coletadas de clientes. Troque pelos relatos reais.
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
  { id: 'r1', name: 'Camila', city: 'Campo Grande', stars: 5, productId: 'lattafa-eclaire-100ml', text: 'O Eclaire chegou lacrado. O cheiro de baunilha é bem gostoso e fica na roupa o dia inteiro.' },
  { id: 'r2', name: 'Rafael', city: 'São Paulo', stars: 5, productId: 'lattafa-asad-elixir-100ml', text: 'Comprei o Asad Elixir para sair à noite. É especiado e doce. Pedi no WhatsApp e me responderam na hora.' },
  { id: 'r3', name: 'Juliana', city: 'Curitiba', stars: 5, productId: 'lattafa-yara-rosa-100ml', text: 'Levei o Yara Rosa de presente. Veio bem embalado e no Pix saiu mais barato.' },
  { id: 'r4', name: 'Diego', city: 'Goiânia', stars: 4, productId: 'armaf-club-de-nuit-intense-man-edt-105ml', text: 'O Club de Nuit é forte. Duas borrifadas já bastam. Gostei do frasco de 105 ml.' },
  { id: 'r5', name: 'Ana', city: 'Recife', stars: 5, productId: 'french-avenue-liquid-brun-100ml', text: 'O Liquid Brun tem cheiro de canela com baunilha. Chegou bem embalado aqui no Recife.' },
  { id: 'r6', name: 'Bruno', city: 'Coxim', stars: 5, text: 'Retirei em Coxim no mesmo dia. Deu para sentir o perfume na loja antes de levar.' },
  { id: 'r7', name: 'Larissa', city: 'Belo Horizonte', stars: 5, productId: 'maison-alhambra-pink-eclipse-100ml', text: 'O Pink Eclipse é floral e doce, sem enjoar. Parcelei no cartão sem problema.' },
  { id: 'r8', name: 'Mateus', city: 'Manaus', stars: 4, text: 'Primeira compra. Perfume original, lacrado, e no Pix ficou mais em conta que no cartão.' },
]
