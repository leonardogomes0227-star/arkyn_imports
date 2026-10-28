import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = (req.body?.data?.id || req.query['data.id']) as string | undefined
  const token = process.env.MP_ACCESS_TOKEN
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!id || !token || !url || !key) return res.status(200).end()

  const pay = await (await fetch(`https://api.mercadopago.com/v1/payments/${id}`, { headers: { Authorization: `Bearer ${token}` } })).json()
  if (pay.status === 'approved' && pay.external_reference) {
    const h = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }
    const ref = encodeURIComponent(pay.external_reference)
    const [order] = await (await fetch(`${url}/rest/v1/orders?id=eq.${ref}&select=items,coupon,status`, { headers: h })).json()
    // idempotência: o Mercado Pago pode notificar várias vezes; só processa se ainda estiver pendente
    if (!order || order.status !== 'pending') return res.status(200).end()

    await fetch(`${url}/rest/v1/orders?id=eq.${ref}`, { method: 'PATCH', headers: h, body: JSON.stringify({ status: 'paid' }) })
    if (order.coupon) {
      const [c] = await (await fetch(`${url}/rest/v1/coupons?code=eq.${encodeURIComponent(order.coupon)}&select=uses`, { headers: h })).json()
      if (c) await fetch(`${url}/rest/v1/coupons?code=eq.${encodeURIComponent(order.coupon)}`, { method: 'PATCH', headers: h, body: JSON.stringify({ uses: c.uses + 1 }) })
    }
    for (const i of order.items ?? []) {
      const pid = encodeURIComponent(i.id)
      const [p] = await (await fetch(`${url}/rest/v1/products?id=eq.${pid}&select=stock`, { headers: h })).json()
      if (p) await fetch(`${url}/rest/v1/products?id=eq.${pid}`, { method: 'PATCH', headers: h, body: JSON.stringify({ stock: Math.max(0, p.stock - i.qty) }) })
    }
  }
  res.status(200).end()
}
