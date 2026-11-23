import type { Product } from '../../lib/types'

// Vocabulário de embarque usado no visual da loja: cada perfume é um "voo" que sai do Oriente para o Brasil.
const FAMS = ['doce', 'amadeirado', 'floral', 'especiado', 'fresco']
export const famOf = (p: Pick<Product, 'tags'>) => {
  const f = (p.tags ?? []).find(t => FAMS.includes(t))
  return f ? f[0].toUpperCase() + f.slice(1) : ''
}

/** Código de voo estável para cada perfume (ex.: AX 027). */
export const flightOf = (id: string) => {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 997
  return `AX ${String(h).padStart(3, '0')}`
}

const GATE: Record<string, string> = { masculino: 'M', feminino: 'F', splash: 'S', skincare: 'K' }
export const gateOf = (p: Pick<Product, 'category'>) => GATE[p.category] ?? 'A'

export type Status = 'go' | 'last' | 'promo' | 'off'
export function statusOf(p: Pick<Product, 'stock' | 'price' | 'old_price'>): [Status, string] {
  if (p.stock <= 0) return ['off', 'Esgotado']
  if (p.old_price && p.old_price > p.price) return ['promo', 'Promoção']
  if (p.stock <= 3) return ['last', p.stock === 1 ? 'Última unidade' : 'Últimas unidades']
  return ['go', 'Embarque']
}

export const shortName = (name: string) => name.replace(/\s?\d+\s?ml$/i, '')
export const volumeOf = (name: string) => name.match(/(\d+)\s?ml/i)?.[1]
