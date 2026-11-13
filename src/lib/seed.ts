import type { Category, Gender, Product, Settings } from './types'

// Catálogo espelhado da vitrine https://www.pedidos10.com.br/produtos/arkym-imports (preços, textos e fotos).
// Fotos em public/produtos-net/<id>.webp (+ versões reduzidas em s160/ e s480/).

const TAGS: Record<string, string[]> = {
  'lattafa-yara-rose-100ml': ['doce', 'floral', 'dia'],
  'maison-alhambra-victorioso-nero-100ml': ['doce', 'especiado', 'noite'],
  'lattafa-fakhar-extrait-gold-100ml': ['doce', 'amadeirado', 'intenso', 'noite'],
  'lattafa-al-noble-wazeer-100ml': ['amadeirado', 'especiado', 'intenso', 'noite'],
  'al-wataniah-attar-al-wesal-gold-100ml': ['doce', 'intenso', 'noite'],
  'lattafa-asad-elixir-100ml': ['amadeirado', 'especiado', 'intenso', 'noite'],
  'maison-alhambra-salvo-elixir-60ml': ['amadeirado', 'especiado', 'intenso', 'noite'],
  'french-avenue-vulcan-feu-100ml': ['especiado', 'amadeirado', 'noite'],
  'maison-alhambra-pink-eclipse-100ml': ['doce', 'floral', 'noite'],
  'paris-corner-marshmallow-blush-100ml': ['doce', 'floral', 'dia'],
  'lattafa-dalal-100ml': ['doce', 'floral', 'intenso', 'noite'],
  'armaf-club-de-nuit-maleka-105ml': ['doce', 'floral', 'noite'],
  'lattafa-tharwah-gold-100ml': ['doce', 'intenso', 'noite'],
  'lattafa-atheeri-100ml': ['doce', 'intenso', 'noite'],
  'lattafa-eclaire-100ml': ['doce', 'dia'],
  'lattafa-afeef-100ml': ['doce', 'intenso', 'noite'],
  'ard-al-zaafaran-sahebat-al-jamal-70ml': ['doce', 'floral', 'dia'],
}

// Notas olfativas (resumo dos anúncios dos revendedores); produtos sem lista clara ficam de fora
const NOTES: Record<string, string[]> = {
  'maison-alhambra-victorioso-nero-100ml': ['Limão', 'Pimenta rosa', 'Lavanda', 'Incenso', 'Baunilha', 'Âmbar'],
  'lattafa-fakhar-extrait-gold-100ml': ['Maçã', 'Gengibre', 'Bergamota', 'Lavanda', 'Fava tonka', 'Vetiver'],
  'lattafa-al-noble-wazeer-100ml': ['Hortelã', 'Bergamota', 'Íris', 'Chocolate amargo', 'Baunilha', 'Sândalo'],
  'lattafa-asad-elixir-100ml': ['Pimenta rosa', 'Açafrão', 'Toranja', 'Tabaco', 'Baunilha', 'Patchouli'],
  'maison-alhambra-salvo-elixir-60ml': ['Canela', 'Noz-moscada', 'Cardamomo', 'Toranja', 'Lavanda', 'Âmbar'],
  'french-avenue-vulcan-feu-100ml': ['Manga', 'Limão', 'Gengibre', 'Jasmim', 'Fava tonka', 'Cedro'],
  'maison-alhambra-pink-eclipse-100ml': ['Bergamota', 'Tangerina', 'Pera', 'Jasmim', 'Baunilha', 'Almíscar'],
  'lattafa-dalal-100ml': ['Tangerina', 'Maçã', 'Jasmim', 'Baunilha', 'Almíscar'],
  'al-wataniah-attar-al-wesal-gold-100ml': ['Toranja', 'Bergamota', 'Lavanda', 'Canela', 'Baunilha', 'Âmbar'],
  'armaf-club-de-nuit-maleka-105ml': ['Lichia', 'Bergamota', 'Pimenta rosa', 'Praliné', 'Sândalo', 'Âmbar'],
  'lattafa-atheeri-100ml': ['Maracujá', 'Orquídea', 'Jasmim', 'Baunilha', 'Madeira âmbar'],
  'lattafa-eclaire-100ml': ['Caramelo', 'Leite', 'Mel', 'Baunilha', 'Praliné', 'Almíscar'],
  'lattafa-afeef-100ml': ['Bergamota', 'Pimenta rosa', 'Pêssego', 'Jasmim', 'Sândalo', 'Âmbar'],
}

const p = (id: string, brand: string, name: string, price: number, category: Category, gender: Gender, description: string): Product =>
  ({ id, brand, name, price, stock: 5, category, gender, family: '', notes: NOTES[id] ?? [], tags: TAGS[id] ?? [], description, image: `/produtos-net/${id}.webp` })

export const SEED_PRODUCTS: Product[] = [
  p('al-wataniah-attar-al-wesal-gold-100ml', 'Al Wataniah', 'Attar Al Wesal Gold 100ml', 233.90, 'masculino', 'masculino', 'Frescor aromático, especiarias quentes e baunilha'),
  p('lattafa-asad-elixir-100ml', 'Lattafa', 'Asad Elixir 100ml', 255.90, 'masculino', 'masculino', 'Especiado, ambarado e amadeirado. Intenso e marcante.'),
  p('maison-alhambra-salvo-elixir-60ml', 'Maison Alhambra', 'Salvo Elixir 60ml', 233.90, 'masculino', 'masculino', 'Especiarias, lavanda e madeiras. Quente e envolvente.'),
  p('lattafa-al-noble-wazeer-100ml', 'Lattafa', 'Al Noble Wazeer 100ml', 211.90, 'masculino', 'masculino', 'Frutado e amadeirado, com nuances quentes e adocicadas.'),
  p('french-avenue-vulcan-feu-100ml', 'French Avenue', 'Vulcan Feu 100ml', 339.90, 'masculino', 'masculino', 'Manga, gengibre e madeiras. Tropical, vibrante e sofisticado.'),
  p('maison-alhambra-victorioso-nero-100ml', 'Maison Alhambra', 'Victorioso Nero 100ml', 199.90, 'masculino', 'masculino', 'Fresco e aromático, com uma doçura suave e fundo amadeirado.'),
  p('lattafa-fakhar-extrait-gold-100ml', 'Lattafa', 'Fakhar Extrait Gold 100ml', 311.90, 'masculino', 'masculino', 'Quente, especiado e amadeirado, com nuances florais.'),
  p('maison-alhambra-pink-eclipse-100ml', 'Maison Alhambra', 'Pink Eclipse 100ml', 322.90, 'feminino', 'feminino', 'Frutado e floral, com pera, flores brancas e baunilha.'),
  p('lattafa-eclaire-100ml', 'Lattafa', 'Eclaire 100ml', 333.90, 'feminino', 'feminino', 'Caramelo, leite, baunilha e pralinê. Doce e cremoso.'),
  p('lattafa-tharwah-gold-100ml', 'Lattafa', 'Tharwah Gold 100ml', 488.90, 'feminino', 'feminino', 'Lavanda, flor de laranjeira, jasmim e baunilha. Elegante e envolvente.'),
  p('armaf-club-de-nuit-maleka-105ml', 'Armaf', 'Club de Nuit Maleka 105ml', 366.90, 'feminino', 'feminino', 'Lichia, íris e pralinê. Frutado, floral e sofisticado.'),
  p('lattafa-afeef-100ml', 'Lattafa', 'Afeef 100ml', 688.90, 'feminino', 'feminino', 'Pêssego, bergamota, flores brancas e pralinê. Frutado e elegante.'),
  p('ard-al-zaafaran-sahebat-al-jamal-70ml', 'Ard Al Zaafaran', 'Sahebat Al Jamal 70ml', 177.90, 'feminino', 'feminino', 'Oriental, elegante e envolvente. Uma fragrância de personalidade, para quem aprecia aromas marcantes.'),
  p('lattafa-yara-rose-100ml', 'Lattafa', 'Yara Rose 100ml', 255.90, 'feminino', 'feminino', 'Doce, cremoso e floral.'),
  p('paris-corner-marshmallow-blush-100ml', 'Paris Corner', 'Marshmallow Blush 100ml', 311.90, 'feminino', 'feminino', 'Morango, framboesa, chantilly e marshmallow. Doce e cremoso.'),
  p('lattafa-dalal-100ml', 'Lattafa', 'Dalal 100ml', 522.90, 'feminino', 'feminino', 'Oriental, envolvente e sofisticado. Uma fragrância marcante para quem gosta de perfumes elegantes.'),
  p('lattafa-atheeri-100ml', 'Lattafa', 'Atheeri 100ml', 588.90, 'feminino', 'feminino', 'Floral delicado, com orquídea, jasmim e baunilha suave.'),
  p('lattafa-body-splash-mayar', 'Lattafa', 'Body Splash Mayar', 122.90, 'splash', 'unissex', 'Frutado, floral e levemente adocicado.'),
  p('lattafa-body-splash-yara-tous', 'Lattafa', 'Body Splash Yara Tous', 122.90, 'splash', 'unissex', 'Tropical e cremoso, com manga, coco e flores brancas.'),
  p('lattafa-body-splash-noble-blush', 'Lattafa', 'Body Splash Noble Blush', 122.90, 'splash', 'unissex', 'Cremoso, delicado e adocicado.'),
  p('lattafa-body-splash-fakhar', 'Lattafa', 'Body Splash Fakhar', 122.90, 'splash', 'unissex', 'Floral elegante e levemente adocicado.'),
  p('celimax-the-vita-a-retinal-shot-15ml', 'Celimax', 'The Vita-A Retinal Shot 15ml', 166.90, 'skincare', 'unissex', 'Tratamento facial com retinal, desenvolvido para cuidados com a textura e aparência da pele.'),
]

export const DEFAULT_SETTINGS: Settings = {
  whatsapp: '5567996277503',
  pickupAddress: 'Coxim - MS (combinar endereço pelo WhatsApp)',
  installments: 1, // ex.: 3 para exibir/permitir até 3x no cartão
  freeShippingFrom: 0, // 0 = sem frete grátis. Ajuste quando definir o valor.
  shipping: [{ city: 'Coxim', price: 0 }], // TODO: confirmar cidades e valores
}
