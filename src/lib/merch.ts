import type { Product } from './types'

/**
 * Curadoria da vitrine. Os ids são produtos reais de `seed.ts`.
 * Para destacar outro frasco, troque o id nesta lista.
 */
export const BESTSELLER_IDS = [
  'armaf-club-de-nuit-intense-man-edt-105ml',
  'lattafa-asad-elixir-100ml',
  'lattafa-yara-rosa-100ml',
  'lattafa-eclaire-100ml',
  'french-avenue-liquid-brun-100ml',
  'lattafa-fakhar-black-100ml',
  'maison-alhambra-pink-eclipse-100ml',
  'armaf-club-de-nuit-maleka-105ml',
]

export const LAUNCH_IDS = [
  'lattafa-afeef-100ml',
  'lattafa-atheeri-100ml',
  'french-avenue-vulcan-feu-100ml',
  'lattafa-dalal-100ml',
  'lattafa-tharwah-gold-100ml',
  'lattafa-fakhar-extrait-gold-100ml',
  'maison-alhambra-salvo-elixir-60ml',
  'al-wataniah-attar-al-wesal-gold-100ml',
]

/** Preço “de” (riscado). Ajuste quando a promoção mudar. */
export const PROMO_PRICE: Record<string, number> = {
  'lattafa-yara-rosa-100ml': 279.9,
  'armaf-club-de-nuit-intense-man-edt-105ml': 319.9,
  'lattafa-eclaire-100ml': 359.9,
  'lattafa-fakhar-black-100ml': 289.9,
  'maison-alhambra-pink-eclipse-100ml': 349.9,
  'maison-alhambra-victorioso-nero-100ml': 229.9,
  'paris-corner-marshmallow-blush-100ml': 329.9,
  'jacques-bogart-silver-scent-intense-100ml': 269.9,
}

export const FEATURED_IDS = [
  'lattafa-asad-elixir-100ml',
  'lattafa-yara-rosa-100ml',
  'lattafa-afeef-100ml',
  'french-avenue-liquid-brun-100ml',
  'armaf-club-de-nuit-maleka-105ml',
]

/** Ideias de presente com produtos reais — não são kits físicos separados. */
export const GIFT_IDS = [
  'lattafa-yara-rosa-100ml',
  'lattafa-eclaire-100ml',
  'lattafa-afeef-100ml',
  'armaf-club-de-nuit-maleka-105ml',
  'maison-alhambra-pink-eclipse-100ml',
  'lattafa-dalal-100ml',
  'paris-corner-marshmallow-blush-100ml',
  'lattafa-tharwah-gold-100ml',
  'lattafa-asad-elixir-100ml',
  'french-avenue-liquid-brun-100ml',
]

export function pickByIds(products: Product[], ids: string[]) {
  const map = new Map(products.map(p => [p.id, p]))
  return ids.flatMap(id => {
    const p = map.get(id)
    return p ? [p] : []
  })
}
