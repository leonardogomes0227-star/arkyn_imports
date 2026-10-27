import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = (req.body?.data?.id || req.query['data.id']) as string | undefined
  const token = process.env.MP_ACCESS_TOKEN
  const { SUPABASE_URL: url, SUPABASE_SERVICE_KEY: key } = process.env
  if (!id || !token || !url || !key) return res.status(200).end()

  const pay = await (await fetch(`https://api.mercadopago.com/v1/payments/${id}`, { headers: { Authorization: `Bearer ${token}` } })).json()
  if (pay.status === 'approved' && pay.external_reference) {
    const h = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }
    const ref = encodeURIComponent(pay.external_reference)
    await fetch(`${url}/rest/v1/orders?id=eq.${ref}`, { method: 'PATCH', headers: h, body: JSON.stringify({ status: 'paid' }) })
    const [order] = await (await fetch(`${url}/rest/v1/orders?id=eq.${ref}&select=items`, { headers: h })).json()
    for (const i of order?.items ?? []) {
      const [p] = await (await fetch(`${url}/rest/v1/products?id=eq.${encodeURIComponent(i.id)}&select=stock`, { headers: h })).json()
      if (p) await fetch(`${url}/rest/v1/products?id=eq.${encodeURIComponent(i.id)}`, { method: 'PATCH', headers: h, body: JSON.stringify({ stock: Math.max(0, p.stock - i.qty) }) })
    }
  }
  res.status(200).end()
}
