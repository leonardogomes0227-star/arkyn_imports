import type { VercelRequest, VercelResponse } from '@vercel/node'

const SB = process.env.SUPABASE_URL
const SK = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const PAID = ['paid', 'separating', 'shipped', 'delivered']

// Só quem comprou avalia: número do pedido + final do telefone, e o pedido precisa ter o produto. Fica pendente até aprovar no painel.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método inválido' })
  if (!SB || !SK) return res.json({ ok: false, error: 'Avaliações indisponíveis no momento.' })
  const b = (req.body ?? {}) as Record<string, unknown>
  const productId = String(b.productId ?? '').slice(0, 100)
  const orderId = String(b.orderId ?? '').replace(/\D/g, '').slice(0, 12)
  const last4 = String(b.phone ?? '').replace(/\D/g, '').slice(-4)
  const rating = Math.round(Number(b.rating))
  const name = String(b.name ?? '').trim().slice(0, 60)
  const comment = String(b.comment ?? '').trim().slice(0, 600)
  if (!(rating >= 1 && rating <= 5)) return res.json({ ok: false, error: 'Escolha de 1 a 5 estrelas.' })
  if (!orderId || last4.length < 4) return res.json({ ok: false, error: 'Informe o número do pedido e o seu telefone.' })

  const h = { apikey: SK, Authorization: `Bearer ${SK}`, 'Content-Type': 'application/json' }
  const o = (await (await fetch(`${SB}/rest/v1/orders?id=eq.${orderId}&select=phone,status,items`, { headers: h })).json().catch(() => []))?.[0]
  const bought = o && String(o.phone ?? '').replace(/\D/g, '').slice(-4) === last4 && PAID.includes(o.status) && (o.items ?? []).some((i: { id: string }) => i.id === productId)
  if (!bought) return res.json({ ok: false, error: 'Não encontramos uma compra paga desse perfume com esses dados.' })

  const dup = await (await fetch(`${SB}/rest/v1/reviews?order_id=eq.${orderId}&product_id=eq.${encodeURIComponent(productId)}&select=id`, { headers: h })).json().catch(() => [])
  if (Array.isArray(dup) && dup.length) return res.json({ ok: false, error: 'Você já avaliou este perfume neste pedido.' })
  const r = await fetch(`${SB}/rest/v1/reviews`, { method: 'POST', headers: h, body: JSON.stringify({ product_id: productId, name: name || 'Cliente', rating, comment, order_id: Number(orderId), approved: false }) })
  if (!r.ok) return res.json({ ok: false, error: 'Avaliações ainda não ativadas na loja.' })
  res.json({ ok: true })
}
