import { BLURBS } from './blurbs'
import { ARAB_BRANDS, FAMILIES } from './fragrance'
import { FEATURED_IDS, GIFT_IDS, PROMO_PRICE } from './merch'
import type { Category, Gender, Product, Settings } from './types'

// Fotos de embalagem (frasco + caixa, fundo branco) em public/produtos-net/<id>.webp; as demais usam a foto original
const PACKSHOT = new Set([
  'celimax-the-vita-a-retinal-shot-15ml',
  'lattafa-fakhar-rose-100ml',
  'al-wataniah-attar-al-wesal-gold-100ml',
  'lattafa-fakhar-black-100ml',
  'jacques-bogart-silver-scent-intense-100ml',
  'lattafa-tharwah-gold-100ml',
  'ard-al-zaafaran-sahebat-al-jamal-70ml',
  'armaf-club-de-nuit-intense-man-edt-105ml',
  'armaf-club-de-nuit-maleka-105ml',
  'french-avenue-liquid-brun-100ml',
  'french-avenue-vulcan-feu-100ml',
  'lattafa-afeef-100ml',
  'lattafa-al-noble-wazeer-100ml',
  'lattafa-asad-elixir-100ml',
  'lattafa-atheeri-100ml',
  'lattafa-dalal-100ml',
  'lattafa-eclaire-100ml',
  'lattafa-fakhar-extrait-gold-100ml',
  'lattafa-the-kingdom-masculino-100ml',
  'maison-alhambra-no-2-men-80ml',
  'maison-alhambra-pink-eclipse-100ml',
  'maison-alhambra-salvo-elixir-60ml',
  'maison-alhambra-victorioso-nero-100ml',
  'paris-corner-marshmallow-blush-100ml',
])

const TAGS: Record<string, string[]> = {
  'armaf-club-de-nuit-intense-man-edt-105ml': ['amadeirado', 'intenso', 'noite'],
  'jacques-bogart-silver-scent-intense-100ml': ['fresco', 'amadeirado', 'dia'],
  'lattafa-the-kingdom-masculino-100ml': ['fresco', 'amadeirado', 'dia'],
  'maison-alhambra-victorioso-nero-100ml': ['doce', 'especiado', 'noite'],
  'lattafa-fakhar-extrait-gold-100ml': ['doce', 'amadeirado', 'intenso', 'noite'],
  'lattafa-al-noble-wazeer-100ml': ['amadeirado', 'especiado', 'intenso', 'noite'],
  'al-wataniah-attar-al-wesal-gold-100ml': ['doce', 'intenso', 'noite'],
  'lattafa-fakhar-black-100ml': ['fresco', 'amadeirado', 'dia'],
  'french-avenue-liquid-brun-100ml': ['doce', 'amadeirado', 'intenso', 'noite'],
  'lattafa-asad-elixir-100ml': ['amadeirado', 'especiado', 'intenso', 'noite'],
  'maison-alhambra-no-2-men-80ml': ['fresco', 'dia'],
  'maison-alhambra-salvo-elixir-60ml': ['amadeirado', 'especiado', 'intenso', 'noite'],
  'french-avenue-vulcan-feu-100ml': ['especiado', 'amadeirado', 'noite'],
  'lattafa-yara-rosa-100ml': ['doce', 'floral', 'dia'],
  'maison-alhambra-pink-eclipse-100ml': ['doce', 'floral', 'noite'],
  'paris-corner-marshmallow-blush-100ml': ['doce', 'floral', 'dia'],
  'lattafa-dalal-100ml': ['doce', 'floral', 'intenso', 'noite'],
  'lattafa-fakhar-rose-100ml': ['floral', 'doce', 'dia'],
  'armaf-club-de-nuit-maleka-105ml': ['doce', 'floral', 'noite'],
  'lattafa-tharwah-gold-100ml': ['doce', 'intenso', 'noite'],
  'lattafa-atheeri-100ml': ['doce', 'intenso', 'noite'],
  'lattafa-eclaire-100ml': ['doce', 'dia'],
  'lattafa-afeef-100ml': ['doce', 'intenso', 'noite'],
  'ard-al-zaafaran-sahebat-al-jamal-70ml': ['doce', 'floral', 'dia'],
}

// Notas olfativas (resumo dos anúncios dos revendedores); produtos sem lista clara ficam de fora
const NOTES: Record<string, string[]> = {
  'armaf-club-de-nuit-intense-man-edt-105ml': ['Limão', 'Abacaxi', 'Bergamota', 'Jasmim', 'Almíscar', 'Baunilha'],
  'jacques-bogart-silver-scent-intense-100ml': ['Flor de laranjeira', 'Limão siciliano', 'Lavanda', 'Cardamomo', 'Fava tonka', 'Oud'],
  'lattafa-the-kingdom-masculino-100ml': ['Lavanda', 'Hortelã', 'Sálvia', 'Baunilha', 'Tabaco', 'Fava tonka'],
  'maison-alhambra-victorioso-nero-100ml': ['Limão', 'Pimenta rosa', 'Lavanda', 'Incenso', 'Baunilha', 'Âmbar'],
  'lattafa-fakhar-extrait-gold-100ml': ['Maçã', 'Gengibre', 'Bergamota', 'Lavanda', 'Fava tonka', 'Vetiver'],
  'lattafa-al-noble-wazeer-100ml': ['Hortelã', 'Bergamota', 'Íris', 'Chocolate amargo', 'Baunilha', 'Sândalo'],
  'french-avenue-liquid-brun-100ml': ['Canela', 'Bergamota', 'Cardamomo', 'Baunilha', 'Praliné', 'Almíscar'],
  'lattafa-asad-elixir-100ml': ['Pimenta rosa', 'Açafrão', 'Toranja', 'Tabaco', 'Baunilha', 'Patchouli'],
  'maison-alhambra-salvo-elixir-60ml': ['Canela', 'Noz-moscada', 'Cardamomo', 'Toranja', 'Lavanda', 'Âmbar'],
  'french-avenue-vulcan-feu-100ml': ['Manga', 'Limão', 'Gengibre', 'Jasmim', 'Fava tonka', 'Cedro'],
  'maison-alhambra-pink-eclipse-100ml': ['Bergamota', 'Tangerina', 'Pera', 'Jasmim', 'Baunilha', 'Almíscar'],
  'lattafa-dalal-100ml': ['Tangerina', 'Maçã', 'Jasmim', 'Baunilha', 'Almíscar'],
  'lattafa-fakhar-rose-100ml': ['Romã', 'Tuberosa', 'Jasmim', 'Rosa', 'Baunilha', 'Almíscar'],
  'al-wataniah-attar-al-wesal-gold-100ml': ['Toranja', 'Bergamota', 'Lavanda', 'Canela', 'Baunilha', 'Âmbar'],
  'lattafa-fakhar-black-100ml': ['Maçã', 'Bergamota', 'Gengibre', 'Lavanda', 'Fava tonka', 'Vetiver'],
  'armaf-club-de-nuit-maleka-105ml': ['Lichia', 'Bergamota', 'Pimenta rosa', 'Praliné', 'Sândalo', 'Âmbar'],
  'lattafa-atheeri-100ml': ['Maracujá', 'Orquídea', 'Jasmim', 'Baunilha', 'Madeira âmbar'],
  'lattafa-eclaire-100ml': ['Caramelo', 'Leite', 'Mel', 'Baunilha', 'Praliné', 'Almíscar'],
  'lattafa-afeef-100ml': ['Bergamota', 'Pimenta rosa', 'Pêssego', 'Jasmim', 'Sândalo', 'Âmbar'],
}

const p = (id: string, brand: string, name: string, price: number, category: Category, gender: Gender): Product =>
  ({ id, brand, name, price, stock: 5, category, gender, family: '', notes: NOTES[id] ?? [], tags: TAGS[id] ?? [], image: PACKSHOT.has(id) ? `/produtos-net/${id}.webp` : '' })

const RAW_PRODUCTS: Product[] = [
  p('armaf-club-de-nuit-intense-man-edt-105ml', 'Armaf', 'Club de Nuit Intense Man EDT 105ml', 259.90, 'masculino', 'masculino'),
  p('jacques-bogart-silver-scent-intense-100ml', 'Jacques Bogart', 'Silver Scent Intense 100ml', 229.90, 'masculino', 'masculino'),
  p('lattafa-the-kingdom-masculino-100ml', 'Lattafa', 'The Kingdom Masculino 100ml', 229.90, 'masculino', 'masculino'),
  p('maison-alhambra-victorioso-nero-100ml', 'Maison Alhambra', 'Victorioso Nero 100ml', 179.90, 'masculino', 'masculino'),
  p('lattafa-fakhar-extrait-gold-100ml', 'Lattafa', 'Fakhar Extrait Gold 100ml', 279.90, 'masculino', 'masculino'),
  p('lattafa-al-noble-wazeer-100ml', 'Lattafa', 'Al Noble Wazeer 100ml', 189.90, 'masculino', 'masculino'),
  p('al-wataniah-attar-al-wesal-gold-100ml', 'Al Wataniah', 'Attar Al Wesal Gold 100ml', 209.90, 'masculino', 'masculino'),
  p('lattafa-fakhar-black-100ml', 'Lattafa', 'Fakhar Black 100ml', 239.90, 'masculino', 'masculino'),
  p('french-avenue-liquid-brun-100ml', 'French Avenue', 'Liquid Brun 100ml', 399.90, 'masculino', 'masculino'),
  p('lattafa-asad-elixir-100ml', 'Lattafa', 'Asad Elixir 100ml', 229.90, 'masculino', 'masculino'),
  p('maison-alhambra-no-2-men-80ml', 'Maison Alhambra', 'No. 2 Men 80ml', 169.90, 'masculino', 'masculino'),
  p('maison-alhambra-salvo-elixir-60ml', 'Maison Alhambra', 'Salvo Elixir 60ml', 209.90, 'masculino', 'masculino'),
  p('french-avenue-vulcan-feu-100ml', 'French Avenue', 'Vulcan Feu 100ml', 339.90, 'masculino', 'masculino'),
  p('lattafa-yara-rosa-100ml', 'Lattafa', 'Yara Rosa 100ml', 229.90, 'feminino', 'feminino'),
  p('maison-alhambra-pink-eclipse-100ml', 'Maison Alhambra', 'Pink Eclipse 100ml', 289.90, 'feminino', 'feminino'),
  p('paris-corner-marshmallow-blush-100ml', 'Paris Corner', 'Marshmallow Blush 100ml', 279.90, 'feminino', 'feminino'),
  p('lattafa-dalal-100ml', 'Lattafa', 'Dalal 100ml', 469.90, 'feminino', 'feminino'),
  p('lattafa-fakhar-rose-100ml', 'Lattafa', 'Fakhar Rose 100ml', 289.90, 'feminino', 'feminino'),
  p('armaf-club-de-nuit-maleka-105ml', 'Armaf', 'Club de Nuit Maleka 105ml', 329.90, 'feminino', 'feminino'),
  p('lattafa-tharwah-gold-100ml', 'Lattafa', 'Tharwah Gold 100ml', 439.90, 'feminino', 'feminino'),
  p('lattafa-atheeri-100ml', 'Lattafa', 'Atheeri 100ml', 529.90, 'feminino', 'feminino'),
  p('lattafa-eclaire-100ml', 'Lattafa', 'Eclaire 100ml', 299.90, 'feminino', 'feminino'),
  p('lattafa-afeef-100ml', 'Lattafa', 'Afeef 100ml', 619.90, 'feminino', 'feminino'),
  p('ard-al-zaafaran-sahebat-al-jamal-70ml', 'Ard Al Zaafaran', 'Sahebat Al Jamal 70ml', 159.90, 'feminino', 'feminino'),
  p('lattafa-body-splash-200ml', 'Lattafa', 'Body Splash 200ml', 109.90, 'splash', 'unissex'),
  p('arabic-miniatura-25ml', 'Arabic', 'Miniatura 25ml', 69.90, 'splash', 'unissex'),
  p('celimax-the-vita-a-retinal-shot-15ml', 'Celimax', 'The Vita-A Retinal Shot 15ml', 149.90, 'skincare', 'unissex'),
]

const scentOf = (tags?: string[]) => tags?.find(t => (FAMILIES as readonly string[]).includes(t)) ?? ''

export const SEED_PRODUCTS: Product[] = RAW_PRODUCTS.map(p => {
  const tags = [...(p.tags ?? [])]
  if (ARAB_BRANDS.has(p.brand) && !tags.includes('arabe')) tags.push('arabe')
  if (GIFT_IDS.includes(p.id) && !tags.includes('presente')) tags.push('presente')
  return {
    ...p,
    tags,
    family: p.family || scentOf(tags),
    featured: FEATURED_IDS.includes(p.id),
    old_price: PROMO_PRICE[p.id] ?? null,
    description: BLURBS[p.id] ?? p.description ?? null,
  }
})

export const DEFAULT_SETTINGS: Settings = {
  whatsapp: '5567996277503',
  pickupAddress: 'Coxim - MS (combinar endereço pelo WhatsApp)',
  // Vitrine: ajuste no painel (ou aqui) quando o lojista fechar parcelamento, Pix e frete.
  installments: 12,
  pixDiscount: 5,
  freeShippingFrom: 399,
  shipping: [{ city: 'todo o Brasil', price: 29.9 }],
}
