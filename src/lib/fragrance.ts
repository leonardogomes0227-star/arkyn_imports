import type { Product } from './types'

/** Marcas do catálogo tratadas como perfumaria árabe na navegação. Inclua aqui se entrar marca nova. */
export const ARAB_BRANDS = new Set([
  'Lattafa',
  'Armaf',
  'Maison Alhambra',
  'Al Wataniah',
  'Ard Al Zaafaran',
  'Paris Corner',
  'French Avenue',
  'Arabic',
])

export const FAMILIES = ['doce', 'amadeirado', 'fresco', 'floral', 'especiado'] as const

export function isArab(p: Product) {
  return !!p.tags?.includes('arabe') || ARAB_BRANDS.has(p.brand)
}

export function volumeMl(p: Pick<Product, 'name' | 'id'>): number | null {
  const m = `${p.name} ${p.id}`.match(/(\d+)\s?ml/i)
  return m ? Number(m[1]) : null
}

/** Mesma fragrância em volumes diferentes (marca + nome sem o ml). */
export function fragranceKey(p: Product) {
  return `${p.brand} ${p.name}`.replace(/\d+\s?ml/gi, '').replace(/\s+/g, ' ').trim().toLowerCase()
}

export function sizeOptions(products: Product[], p: Product) {
  const key = fragranceKey(p)
  const list = products.filter(x => fragranceKey(x) === key)
  return (list.length ? list : [p]).slice().sort((a, b) => (volumeMl(a) ?? 0) - (volumeMl(b) ?? 0))
}

/** A lista de notas do cadastro já vem na ordem topo → fundo. Divide em três camadas. */
export function notePyramid(notes?: string[]) {
  const list = (notes ?? []).map(n => n.trim()).filter(Boolean)
  if (!list.length) return null
  if (list.length === 1) return { topo: list, coracao: [] as string[], fundo: [] as string[] }
  if (list.length === 2) return { topo: [list[0]], coracao: [] as string[], fundo: [list[1]] }
  const topN = Math.ceil(list.length / 3)
  const midN = Math.ceil((list.length - topN) / 2)
  return {
    topo: list.slice(0, topN),
    coracao: list.slice(topN, topN + midN),
    fundo: list.slice(topN + midN),
  }
}

export function primaryFamily(p: Product) {
  return p.family || p.tags?.find(t => (FAMILIES as readonly string[]).includes(t)) || ''
}
