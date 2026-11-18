import type { VercelRequest, VercelResponse } from '@vercel/node'
import { DEFAULT_SETTINGS, SEED_PRODUCTS } from '../src/lib/seed.js'
import type { Product, Settings } from '../src/lib/types'
import { quoteShipping } from './_shipping.js'

const SB = process.env.SUPABASE_URL
const SK = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

export async function loadCatalog(): Promise<{ products: Product[]; settings: Settings }> {
  let products: Product[] = SEED_PRODUCTS
  let settings: Settings = DEFAULT_SETTINGS
  if (SB && SK) {
    const h = { apikey: SK, Authorization: `Bearer ${SK}` }
    const p = await (await fetch(`${SB}/rest/v1/products?select=*`, { headers: h })).json().catch(() => null)
    if (Array.isArray(p) && p.length) products = p
    const s = await (await fetch(`${SB}/rest/v1/settings?id=eq.1&select=value`, { headers: h })).json().catch(() => null)
    if (s?.[0]?.value) settings = { ...DEFAULT_SETTINGS, ...s[0].value }
  }
  return { products, settings }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método inválido' })
  const { cep, items } = req.body as { cep: string; items: { id: string; qty: number }[] }
  const { products, settings } = await loadCatalog()
  const lines = (items || []).flatMap(i => {
    const p = products.find(x => x.id === i.id)
    return p && i.qty > 0 ? [{ p, qty: Math.min(i.qty, p.stock || i.qty) }] : []
  })
  res.json(await quoteShipping(cep, lines, settings))
}
