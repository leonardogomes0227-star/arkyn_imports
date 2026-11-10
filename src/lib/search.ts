import type { Category, Product } from './types'

export const CAT_LABEL: Record<Category, string> = {
  masculino: 'Perfumes masculinos', feminino: 'Perfumes femininos', splash: 'Splash e miniaturas', skincare: 'Skincare',
}
export const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const text = (p: Product) => norm([p.brand, p.name, p.family, CAT_LABEL[p.category], ...(p.notes ?? []), ...(p.tags ?? [])].filter(Boolean).join(' '))

/** Todas as palavras da busca precisam aparecer (marca, nome, categoria, família, notas ou perfil), sem acento e sem maiúsculas. */
export function matchProduct(p: Product, q: string) {
  const words = norm(q).split(/\s+/).filter(Boolean)
  if (!words.length) return true
  const t = text(p)
  return words.every(w => t.includes(w))
}

/** Resultados ordenados: nome começa com o termo > marca > demais. */
export function searchProducts(products: Product[], q: string, limit = 6) {
  const nq = norm(q)
  if (!nq) return []
  return products
    .filter(p => matchProduct(p, q))
    .map(p => ({ p, s: norm(p.name).startsWith(nq) ? 0 : norm(p.brand).startsWith(nq) ? 1 : norm(p.name).includes(nq) ? 2 : 3 }))
    .sort((a, b) => a.s - b.s || Number(b.p.stock > 0) - Number(a.p.stock > 0))
    .slice(0, limit).map(x => x.p)
}
