// Cor de cada nota olfativa (esfera brilhante). Nota sem cor cadastrada usa o dourado da marca.
const C: Record<string, [string, string]> = {
  'limão': ['#fff27a', '#e8c600'], 'limão siciliano': ['#fff27a', '#e8c600'], 'abacaxi': ['#ffe066', '#e0a800'], 'bergamota': ['#d7ec7a', '#8fb82a'],
  'jasmim': ['#fffdf2', '#e7dca8'], 'almíscar': ['#f4ece4', '#cdb9a6'], 'baunilha': ['#fff0c4', '#e2bf6c'], 'flor de laranjeira': ['#fff6e2', '#f0c987'],
  'lavanda': ['#d9c4ff', '#8f6bd6'], 'cardamomo': ['#d9d9a0', '#8e9157'], 'fava tonka': ['#d9a96c', '#8a5a2b'], 'oud': ['#9a7452', '#3f2a1a'],
  'hortelã': ['#b8f0d0', '#3fbf86'], 'sálvia': ['#cfe3c4', '#7da36b'], 'tabaco': ['#c9964f', '#6b4219'], 'pimenta rosa': ['#ff9aa8', '#d9344f'],
  'incenso': ['#e5e0da', '#a79f95'], 'âmbar': ['#ffc266', '#d9801a'], 'madeira âmbar': ['#ffc266', '#b8651a'], 'maçã': ['#ffb3a6', '#e0392b'],
  'gengibre': ['#f2cf94', '#c7913a'], 'vetiver': ['#a9c79a', '#56794a'], 'íris': ['#d7d0ee', '#8d84c4'], 'chocolate amargo': ['#8a5a44', '#34190f'],
  'sândalo': ['#ecd0ae', '#b88a58'], 'canela': ['#d98a4e', '#8f4a1c'], 'praliné': ['#e0b27a', '#9a6330'], 'açafrão': ['#ffb347', '#e67300'],
  'toranja': ['#ffb7a1', '#f06543'], 'patchouli': ['#a58a6b', '#4d3a27'], 'noz-moscada': ['#cfa57a', '#7b5230'], 'manga': ['#ffd270', '#f08a00'],
  'cedro': ['#c9a07a', '#7a5233'], 'tangerina': ['#ffc37a', '#f08a1c'], 'pera': ['#e4efa0', '#a8c13a'], 'romã': ['#ff8fa3', '#b3122e'],
  'tuberosa': ['#fffaf0', '#ead9b8'], 'rosa': ['#ffc2d4', '#e0517a'], 'lichia': ['#ffd3de', '#e9809c'], 'maracujá': ['#ffe27a', '#e9a800'],
  'orquídea': ['#f1c8ff', '#b05bd1'], 'caramelo': ['#e9b36a', '#a8661a'], 'leite': ['#ffffff', '#e3ddd2'], 'mel': ['#ffd35c', '#d99a00'],
}
export const noteColor = (n: string) => C[n.toLowerCase()] ?? ['#f0dc9a', '#a8822c']
export const noteGradient = (n: string) => { const [a, b] = noteColor(n); return `radial-gradient(circle at 32% 28%, #fff 0, ${a} 28%, ${b} 100%)` }
