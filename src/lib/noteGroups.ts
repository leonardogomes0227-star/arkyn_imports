// Grupos olfativos das notas, para mostrar as notas organizadas (quiz, produto, "Escolha pelo cheiro").
export interface NoteGroup { id: string; label: string; color: string }

export const GROUPS: NoteGroup[] = [
  { id: 'citricas', label: 'Cítricas e frescas', color: '#d6e64a' },
  { id: 'frutas', label: 'Frutas', color: '#ff8a6a' },
  { id: 'flores', label: 'Flores', color: '#e58ad0' },
  { id: 'especiarias', label: 'Especiarias', color: '#e0893a' },
  { id: 'doces', label: 'Doces', color: '#e9c27a' },
  { id: 'madeiras', label: 'Madeiras e resinas', color: '#b68a5e' },
]

const MAP: Record<string, string> = {
  'limão': 'citricas', 'limão siciliano': 'citricas', 'bergamota': 'citricas', 'tangerina': 'citricas', 'toranja': 'citricas', 'hortelã': 'citricas', 'lavanda': 'citricas', 'sálvia': 'citricas',
  'maçã': 'frutas', 'pera': 'frutas', 'pêssego': 'frutas', 'manga': 'frutas', 'maracujá': 'frutas', 'lichia': 'frutas', 'abacaxi': 'frutas', 'romã': 'frutas', 'cereja': 'frutas', 'morango': 'frutas', 'framboesa': 'frutas', 'coco': 'frutas',
  'jasmim': 'flores', 'íris': 'flores', 'orquídea': 'flores', 'rosa': 'flores', 'flor de laranjeira': 'flores', 'tuberosa': 'flores', 'neroli': 'flores', 'ylang-ylang': 'flores', 'lírio': 'flores', 'peônia': 'flores', 'gardênia': 'flores', 'flores brancas': 'flores',
  'açafrão': 'especiarias', 'canela': 'especiarias', 'cardamomo': 'especiarias', 'gengibre': 'especiarias', 'noz-moscada': 'especiarias', 'pimenta rosa': 'especiarias',
  'baunilha': 'doces', 'caramelo': 'doces', 'chocolate amargo': 'doces', 'fava tonka': 'doces', 'leite': 'doces', 'mel': 'doces', 'praliné': 'doces', 'cacau': 'doces', 'merengue': 'doces', 'amêndoa': 'doces', 'leite de rosas': 'doces', 'chantilly': 'doces', 'marshmallow': 'doces',
  'cedro': 'madeiras', 'sândalo': 'madeiras', 'vetiver': 'madeiras', 'patchouli': 'madeiras', 'tabaco': 'madeiras', 'incenso': 'madeiras', 'âmbar': 'madeiras', 'madeira âmbar': 'madeiras', 'almíscar': 'madeiras', 'oud': 'madeiras', 'benjoim': 'madeiras',
}

export const groupOf = (note: string) => GROUPS.find(g => g.id === MAP[note.toLowerCase()]) ?? GROUPS[5]

/** Agrupa uma lista de notas mantendo a ordem dos grupos; grupos vazios saem. */
export function groupNotes(notes: string[]) {
  return GROUPS.map(g => ({ ...g, notes: notes.filter(n => groupOf(n).id === g.id) })).filter(g => g.notes.length)
}
