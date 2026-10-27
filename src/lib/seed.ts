import type { Category, Gender, Product, Settings } from './types'

const p = (id: string, brand: string, name: string, price: number, category: Category, gender: Gender): Product =>
  ({ id, brand, name, price, stock: 5, category, gender, family: '', notes: [], image: '' })

// Fotos: salve em public/produtos/ e preencha `image` (ex.: '/produtos/club-de-nuit.jpg'). Ajuste estoque/família/notas conforme necessário.
export const SEED_PRODUCTS: Product[] = [
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

export const DEFAULT_SETTINGS: Settings = {
  whatsapp: '5567996277503',
  pickupAddress: 'Coxim - MS (combinar endereço pelo WhatsApp)',
  freeShippingFrom: 0, // 0 = sem frete grátis. Ajuste quando definir o valor.
  shipping: [{ city: 'Coxim', price: 0 }], // TODO: confirmar cidades e valores
}
