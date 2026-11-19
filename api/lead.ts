import type { VercelRequest, VercelResponse } from '@vercel/node'
import { loadCatalog } from './shipping.js'

const SB = process.env.SUPABASE_URL
const SK = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

// Guarda o carrinho de quem já informou o telefone, para a loja chamar no WhatsApp se não finalizar. Falha em silêncio.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' || !SB || !SK) return res.status(204).end()
  const phone = String(req.body?.phone ?? '').replace(/\D/g, '').slice(0, 13)
  const name = String(req.body?.name ?? '').trim().slice(0, 80)
  const raw = Array.isArray(req.body?.items) ? req.body.items.slice(0, 30) : []
  if (phone.length < 10) return res.status(204).end()
  const { products } = await loadCatalog()
  const items = raw.flatMap((i: { id: string; qty: number }) => products.some(p => p.id === i.id) && Number.isInteger(i.qty) && i.qty > 0 ? [{ id: i.id, qty: i.qty }] : [])
  const h = { apikey: SK, Authorization: `Bearer ${SK}`, 'Content-Type': 'application/json' }
  if (!items.length) { await fetch(`${SB}/rest/v1/leads?phone=eq.${phone}`, { method: 'DELETE', headers: h }).catch(() => null); return res.status(204).end() }
  const total = items.reduce((s: number, i: { id: string; qty: number }) => s + (products.find(p => p.id === i.id)?.price ?? 0) * i.qty, 0)
  await fetch(`${SB}/rest/v1/leads?on_conflict=phone`, {
    method: 'POST', headers: { ...h, Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ phone, name, items, total, updated_at: new Date().toISOString(), contacted: false }),
  }).catch(() => null)
  res.status(204).end()
}
