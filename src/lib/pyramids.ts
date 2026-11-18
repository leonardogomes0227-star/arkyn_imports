// Pirâmide olfativa (saída, coração, fundo) só para perfumes com a divisão confirmada pela marca.
// Os demais mostram a lista de notas sem separar por camada, para não afirmar o que não sabemos.
export interface Pyramid { top: string[]; heart: string[]; base: string[]; lines: [string, string, string] }

export const PYRAMIDS: Record<string, Pyramid> = {
  // Peça de campanha aprovada do Pink Eclipse
  'maison-alhambra-pink-eclipse-100ml': {
    top: ['Pera', 'Bergamota', 'Tangerina'],
    heart: ['Flor de laranjeira', 'Jasmim', 'Neroli'],
    base: ['Baunilha', 'Benjoim', 'Almíscar', 'Âmbar'],
    lines: ['A pera abre a fragrância.', 'O jasmim floresce no coração.', 'O âmbar aquece o fundo.'],
  },
}
