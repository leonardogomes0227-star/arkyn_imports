// Recortes sem fundo (public/hero). Produto fora da lista usa a foto original sobre painel prateado.
const CUT = new Set([
  'al-wataniah-attar-al-wesal-gold-100ml',
  'ard-al-zaafaran-sahebat-al-jamal-70ml',
  'armaf-club-de-nuit-maleka-105ml',
  'celimax-the-vita-a-retinal-shot-15ml',
  'french-avenue-vulcan-feu-100ml',
  'lattafa-afeef-100ml',
  'lattafa-al-noble-wazeer-100ml',
  'lattafa-asad-elixir-100ml',
  'lattafa-atheeri-100ml',
  'lattafa-body-splash-fakhar',
  'lattafa-body-splash-mayar',
  'lattafa-body-splash-noble-blush',
  'lattafa-body-splash-yara-tous',
  'lattafa-dalal-100ml',
  'lattafa-eclaire-100ml',
  'lattafa-fakhar-extrait-gold-100ml',
  'lattafa-tharwah-gold-100ml',
  'lattafa-yara-rose-100ml',
  'maison-alhambra-pink-eclipse-100ml',
  'maison-alhambra-salvo-elixir-60ml',
  'maison-alhambra-victorioso-nero-100ml',
  'paris-corner-marshmallow-blush-100ml',
])

export const cutoutOf = (id: string) => (CUT.has(id) ? `/hero/${id}.webp` : undefined)
