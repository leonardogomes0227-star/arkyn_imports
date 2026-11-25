import type { VercelRequest, VercelResponse } from '@vercel/node'
import { loadCatalog } from './shipping.js'
import { tooMany } from './_rate.js'

const SB = process.env.SUPABASE_URL
const SK = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

// Consulta do pedido pelo cliente: número + final do telefone. Não devolve endereço nem telefone completo.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método inválido' })
  if (tooMany(req, 'order')) return res.status(429).json({ ok: false, error: 'Muitas tentativas. Aguarde alguns minutos ou fale pelo WhatsApp.' })
  if (!SB || !SK) return res.json({ ok: false, error: 'A consulta de pedidos ainda não está disponível. Fale com a gente pelo WhatsApp.' })
  const id = String(req.body?.id ?? '').replace(/\D/g, '').slice(0, 12)
  const last4 = String(req.body?.phone ?? '').replace(/\D/g, '').slice(-4)
  if (!id || last4.length < 4) return res.json({ ok: false, error: 'Informe o número do pedido e o seu telefone.' })

  const r = await fetch(`${SB}/rest/v1/orders?id=eq.${id}&select=id,phone,phone_last4,status,tracking,items,total,shipping,shipping_service,delivery,created_at`, { headers: { apikey: SK, Authorization: `Bearer ${SK}` } })
  const rows = r.ok ? await r.json().catch(() => []) : []
  const o = Array.isArray(rows) ? rows[0] : null
  // mesma mensagem para "não existe" e "telefone errado": não deixa descobrir pedidos de outras pessoas
  if (!o || String(o.phone_last4 || o.phone || '').replace(/\D/g, '').slice(-4) !== last4) return res.json({ ok: false, error: 'Não encontramos um pedido com esses dados. Confira o número e o telefone.' })

  const { products } = await loadCatalog()
  res.json({
    ok: true,
    order: {
      id: o.id, status: o.status, tracking: o.tracking || null, total: Number(o.total), shipping: Number(o.shipping || 0),
      service: o.shipping_service || (o.delivery === 'pickup' ? 'Retirada na loja' : `Entrega em ${o.delivery}`), created_at: o.created_at,
      items: (o.items ?? []).map((i: { id: string; qty: number }) => { const p = products.find(x => x.id === i.id); return { name: p ? `${p.brand} ${p.name}` : i.id, qty: i.qty } }),
    },
  })
}
