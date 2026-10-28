import type { VercelRequest, VercelResponse } from '@vercel/node'

const SB = process.env.SUPABASE_URL
const SK = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

export interface CouponResult { ok: boolean; discount: number; label?: string; error?: string }

export async function validateCoupon(codeRaw: string, subtotal: number): Promise<CouponResult> {
  const code = (codeRaw || '').trim().toUpperCase()
  if (!code) return { ok: false, discount: 0, error: 'Informe o cupom' }
  if (!SB || !SK) return { ok: false, discount: 0, error: 'Cupons indisponíveis no momento' }
  const r = await fetch(`${SB}/rest/v1/coupons?code=eq.${encodeURIComponent(code)}&select=*`, { headers: { apikey: SK, Authorization: `Bearer ${SK}` } })
  const [c] = await r.json().catch(() => [])
  if (!c || !c.active) return { ok: false, discount: 0, error: 'Cupom inválido' }
  if (c.expires_at && new Date(c.expires_at) < new Date()) return { ok: false, discount: 0, error: 'Cupom expirado' }
  if (c.max_uses != null && c.uses >= c.max_uses) return { ok: false, discount: 0, error: 'Cupom esgotado' }
  if (subtotal < Number(c.min_total || 0)) return { ok: false, discount: 0, error: `Válido para compras acima de R$ ${Number(c.min_total).toFixed(2).replace('.', ',')}` }
  const raw = c.type === 'percent' ? subtotal * (Number(c.value) / 100) : Number(c.value)
  const discount = Math.min(subtotal, Math.round(raw * 100) / 100)
  return { ok: true, discount, label: c.type === 'percent' ? `${Number(c.value)}% de desconto` : 'Desconto' }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método inválido' })
  const { code, subtotal } = req.body as { code: string; subtotal: number }
  res.json(await validateCoupon(code, Number(subtotal) || 0))
}
